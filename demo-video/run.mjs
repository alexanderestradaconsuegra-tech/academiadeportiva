// One command for everything:  cd demo-video && npm install && npm run record
//
// 1. starts the fake Supabase (fictional data, in memory, nothing real is touched)
// 2. builds and starts the unmodified app pointing at it (env vars only)
// 3. records each clip, resetting the data before every take
// 4. encodes MP4/WebM/posters, the contact sheet and a file list in out/
//
// Options: --skip-build (reuse the last demo build), --record-only (no encoding), --encode-only (reuse the last recordings), clip ids to record only some.
import fs from "node:fs"
import path from "node:path"
import { spawn, spawnSync } from "node:child_process"
import { startMock } from "./mock-supabase.mjs"
import { recordClips } from "./record.mjs"
import { CLIPS } from "./clips.mjs"
import { encodeClip, contactSheet, probeSeconds, widthsFor } from "./encode.mjs"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const APP = path.resolve(ROOT, "..")
const OUT = path.join(ROOT, "out")
const MOCK_PORT = 54321
const APP_PORT = Number(process.env.DEMO_APP_PORT || 3410)
const WEB_PORT = Number(process.env.DEMO_WEB_PORT || 3620)
// The marketing site (separate repo, already built) — only the "cuenta demo" clip needs it.
const WEB_DIR = path.resolve(process.env.DEMO_WEB_DIR || path.join(APP, "..", "web-metrikas"))
const args = process.argv.slice(2)
const ids = args.filter((a) => !a.startsWith("--"))

// Only local, fake values. No real keys exist anywhere in this folder.
const DEMO_ENV = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "demo.anon.key",
  NEXT_TELEMETRY_DISABLED: "1",
}

async function waitForHttp(url, ms = 60000) {
  const until = Date.now() + ms
  while (Date.now() < until) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error("app did not start: " + url)
}

const encodeOnly = args.includes("--encode-only")
const mock = encodeOnly ? { server: { close() {} } } : await startMock(MOCK_PORT)
if (!encodeOnly) console.log("fake Supabase on", mock.url)
let app, web
try {
  if (encodeOnly) throw Object.assign(new Error("skip"), { skip: true })
  if (!args.includes("--skip-build")) {
    console.log("building the app against the fake Supabase…")
    const b = spawnSync("npx", ["next", "build"], { cwd: APP, env: DEMO_ENV, stdio: "inherit" })
    if (b.status !== 0) throw new Error("next build failed")
  }
  app = spawn("npx", ["next", "start", "-p", String(APP_PORT), "-H", "127.0.0.1"], { cwd: APP, env: DEMO_ENV, stdio: "ignore", detached: true })
  const appUrl = `http://127.0.0.1:${APP_PORT}`
  await waitForHttp(appUrl + "/login")
  console.log("app on", appUrl)

  const wanted = CLIPS.filter((c) => !ids.length || ids.includes(c.id))
  let webUrl
  if (wanted.some((c) => c.web)) {
    if (!fs.existsSync(path.join(WEB_DIR, "dist"))) throw new Error(`the website is not built at ${WEB_DIR} (run "npx vinext build" there, or set DEMO_WEB_DIR)`)
    web = spawn("npx", ["vinext", "start", "--port", String(WEB_PORT)], { cwd: WEB_DIR, stdio: "ignore", detached: true })
    webUrl = `http://127.0.0.1:${WEB_PORT}`
    await waitForHttp(webUrl + "/")
    console.log("website on", webUrl)
  }

  console.log("recording…")
  await recordClips({ appUrl, webUrl, ids, mock, beforeEach: () => mock.reset() })
} catch (e) {
  if (!e.skip) throw e
} finally {
  if (app) try { process.kill(-app.pid) } catch {}
  if (web) try { process.kill(-web.pid) } catch {}
  mock.server.close()
}

if (args.includes("--record-only")) process.exit(0)

console.log("encoding…")
const done = CLIPS.filter((c) => !ids.length || ids.includes(c.id))
for (const c of done) { encodeClip(c); console.log("  ✓", c.id) }
const sheet = contactSheet(CLIPS.filter((c) => fs.existsSync(path.join(ROOT, "work", c.id, "master.mp4"))))

// File list with duration, weight and path, for every clip in out/ (not only
// the ones encoded in this run).
const rows = []
for (const c of CLIPS) for (const width of widthsFor(c)) for (const kind of ["mp4", "webm", "jpg"]) {
  const file = path.join(OUT, c.id, `${c.id}-${width}.${kind}`)
  if (!fs.existsSync(file)) continue
  rows.push({ clip: c.id, width, kind, seconds: kind === "jpg" ? null : Number(probeSeconds(file).toFixed(2)), kb: Math.round(fs.statSync(file).size / 1024), path: path.relative(ROOT, file) })
}
fs.writeFileSync(path.join(OUT, "files.json"), JSON.stringify(rows, null, 2))
const md = ["| Clip | Ancho | Tipo | Duración | Peso | Ruta |", "|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.clip} | ${r.width} | ${r.kind} | ${r.seconds == null ? "—" : r.seconds.toFixed(2) + " s"} | ${r.kb} KB | \`${r.path}\` |`)]
fs.writeFileSync(path.join(OUT, "FILES.md"), md.join("\n") + "\n")
const capOf = (id) => CLIPS.find((c) => c.id === id)?.capBytes ?? 1_200_000
const over = rows.filter((r) => r.width === 1280 && r.kind !== "jpg" && r.kb * 1024 > capOf(r.clip))
console.log(md.join("\n"))
console.log("contact sheet:", path.relative(ROOT, sheet))
if (over.length) { console.error("Over the size cap at 1280:", over.map((r) => r.path)); process.exitCode = 1 }
