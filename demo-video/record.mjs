// Records every clip in CLIPS (or the ids given as arguments) into work/<id>/.
// Expects the app on APP_URL and the fake Supabase already running; run.mjs
// takes care of both.
import path from "node:path"
import { chromium } from "playwright-core"
import { CLIPS } from "./clips.mjs"
import { COACH_EMAIL, COACH_PASSWORD } from "./seed.mjs"
import { Director, installCursor, routeFonts, settle, startCapture } from "./lib/director.mjs"

const ROOT = path.dirname(new URL(import.meta.url).pathname)

export function chromiumPath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers"
  return `${base}/chromium-1194/chrome-linux/chrome`
}

async function signIn(page, appUrl) {
  await page.goto(appUrl + "/login", { waitUntil: "networkidle" })
  await page.getByLabel("Correo electrónico").fill(COACH_EMAIL)
  await page.getByRole("textbox", { name: "Contraseña" }).fill(COACH_PASSWORD)
  await page.getByRole("button", { name: "Ingresar al panel" }).click()
  await page.waitForURL("**/dashboard")
}

export async function recordClips({ appUrl, ids, beforeEach }) {
  // The UI language and LANG make native controls (date inputs) use dd/mm/aaaa.
  const browser = await chromium.launch({ executablePath: chromiumPath(), args: ["--lang=es-CL"], env: { ...process.env, LANG: "es_CL.UTF-8" } })
  const results = []
  try {
    for (const clip of CLIPS.filter((c) => !ids?.length || ids.includes(c.id))) {
      await beforeEach?.(clip)
      const context = await browser.newContext(clip.device)
      await routeFonts(context)
      await installCursor(context, { size: clip.cursorSize ?? 26, rest: clip.rest })
      const page = await context.newPage()
      const errors = []
      page.on("pageerror", (e) => errors.push(e.message))
      if (clip.loggedIn !== false) await signIn(page, appUrl)

      // Preload the starting screen fully before the camera rolls.
      await page.goto(appUrl + clip.start, { waitUntil: "networkidle" })
      await settle(page, 900)
      const fontOk = await page.evaluate(() => document.fonts.check("600 16px Inter") && getComputedStyle(document.body).fontFamily.includes("Inter"))
      if (!fontOk) throw new Error(`${clip.id}: Inter is not the active font`)
      const d = new Director(page, { rest: clip.rest, seed: clip.id.length * 97 })
      await d.park()
      await settle(page, 300)

      const { width, height } = clip.device.viewport
      const scale = clip.device.deviceScaleFactor
      const cap = await startCapture(page, path.join(ROOT, "work", clip.id), { width: width * scale, height: height * scale })
      const t0 = Date.now()
      await clip.run(d, page)
      const info = await cap.stop()
      if (errors.length) console.warn(`  ! ${clip.id} page errors:`, errors)
      console.log(`  ● ${clip.id}: ${info.seconds.toFixed(1)} s, ${info.count} frames (~${info.fps.toFixed(0)} fps), script ${(Date.now() - t0) / 1000} s`)
      results.push({ clip, ...info })
      await context.close()
    }
  } finally {
    await browser.close()
  }
  return results
}
