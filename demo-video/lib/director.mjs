// Helpers that make an automated browser look like a person using it:
// a visible soft cursor, curved mouse paths, key-by-key typing, eased scrolling,
// and a CDP screencast that keeps every frame with its timestamp.
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Deterministic randomness so every run moves the same way.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Injected into every page. It only draws: it never touches the app's DOM tree
// (the cursor is appended to <html> after load, outside React's root).
function cursorOverlay({ size, x, y }) {
  if (window.__demoCursor) return
  window.__demoCursor = true
  let cx = Number(sessionStorage.getItem("__demo_cx") ?? x)
  let cy = Number(sessionStorage.getItem("__demo_cy") ?? y)
  let dot = null
  const place = () => { if (dot) dot.style.transform = `translate(${cx}px, ${cy}px)` }
  const mount = () => {
    if (dot) return
    dot = document.createElement("div")
    dot.setAttribute("aria-hidden", "true")
    dot.style.cssText = [
      "position:fixed", "left:0", "top:0", `width:${size}px`, `height:${size}px`,
      `margin:${-size / 2}px 0 0 ${-size / 2}px`, "border-radius:50%",
      "background:rgba(15,23,42,.24)", "border:2px solid rgba(255,255,255,.96)",
      "box-shadow:0 0 0 1px rgba(15,23,42,.22),0 6px 18px rgba(2,6,23,.28)",
      "z-index:2147483647", "pointer-events:none", "will-change:transform",
    ].join(";")
    place()
    document.documentElement.appendChild(dot)
  }
  addEventListener("mousemove", (e) => {
    cx = e.clientX; cy = e.clientY
    sessionStorage.setItem("__demo_cx", cx); sessionStorage.setItem("__demo_cy", cy)
    place()
  }, true)
  addEventListener("mousedown", () => {
    if (!dot) return
    dot.animate([{ scale: 1 }, { scale: 0.82 }], { duration: 90, fill: "forwards" })
    const ring = document.createElement("div")
    ring.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;border:3px solid rgba(132,204,22,.95);background:rgba(163,230,53,.18);z-index:2147483646;pointer-events:none;transform:translate(${cx}px,${cy}px)`
    document.documentElement.appendChild(ring)
    ring.animate([{ scale: 0.5, opacity: 0.9 }, { scale: 2.3, opacity: 0 }], { duration: 520, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => ring.remove()
  }, true)
  addEventListener("mouseup", () => { dot?.animate([{ scale: 0.82 }, { scale: 1 }], { duration: 140, fill: "forwards" }) }, true)
  if (document.readyState === "complete") setTimeout(mount, 0)
  else addEventListener("load", () => setTimeout(mount, 30))
}

// Google Fonts requests (if any) are answered with the local @fontsource/inter
// files, so the recording never depends on the network.
export async function routeFonts(context) {
  const dir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files"
  const weights = [400, 500, 600, 700, 800, 900]
  await context.route(/fonts\.googleapis\.com/, (route) => route.fulfill({
    contentType: "text/css",
    body: weights.map((w) => `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};font-display:block;src:url(https://fonts.gstatic.com/demo/inter-${w}.woff2) format('woff2')}`).join("\n"),
  }))
  await context.route(/fonts\.gstatic\.com/, (route) => {
    const w = (route.request().url().match(/inter-(\d+)/) || [])[1] || "400"
    route.fulfill({ contentType: "font/woff2", body: fs.readFileSync(`${dir}/inter-latin-${w}-normal.woff2`) })
  })
}

export async function installCursor(context, { size, rest }) {
  await context.addInitScript(cursorOverlay, { size, x: rest.x, y: rest.y })
}

/** Waits until the page is fully painted: network idle, fonts and images ready. */
export async function settle(page, extra = 400) {
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r })))
  })
  await wait(extra)
}

export class Director {
  constructor(page, { rest, seed = 7 }) {
    this.page = page
    this.rest = rest
    this.x = rest.x
    this.y = rest.y
    this.rand = mulberry32(seed)
  }

  /** Puts the cursor at its resting spot without animating (before recording). */
  async park() {
    this.x = this.rest.x; this.y = this.rest.y
    await this.page.mouse.move(this.x, this.y)
  }

  async pause(ms = 800) { await wait(ms) }

  /** Moves along a gently curved, eased path. Speed > 1 means quicker. */
  async moveTo(x, y, { speed = 1 } = {}) {
    const x0 = this.x, y0 = this.y
    const dx = x - x0, dy = y - y0
    const dist = Math.hypot(dx, dy)
    if (dist < 2) return
    const duration = Math.min(1050, Math.max(360, 300 + dist * 0.55)) / speed
    const nx = -dy / dist, ny = dx / dist
    const bend = (this.rand() < 0.5 ? -1 : 1) * (0.08 + this.rand() * 0.12) * dist
    const p1 = { x: x0 + dx * 0.3 + nx * bend, y: y0 + dy * 0.3 + ny * bend }
    const p2 = { x: x0 + dx * 0.72 + nx * bend * 0.5, y: y0 + dy * 0.72 + ny * bend * 0.5 }
    const steps = Math.max(12, Math.round(duration / 16))
    const start = Date.now()
    for (let i = 1; i <= steps; i++) {
      const t = easeInOut(i / steps), u = 1 - t
      const px = u * u * u * x0 + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * x
      const py = u * u * u * y0 + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * y
      await this.page.mouse.move(px, py)
      const due = start + (i * duration) / steps
      const lag = due - Date.now()
      if (lag > 0) await wait(lag)
    }
    this.x = x; this.y = y
  }

  async pointOf(locator, { ax = 0.5, ay = 0.5, dx = 0, dy = 0 } = {}) {
    await locator.waitFor({ state: "visible" })
    const b = await locator.boundingBox()
    if (!b) throw new Error("element has no box: " + locator)
    return { x: b.x + b.width * ax + dx, y: b.y + b.height * ay + dy }
  }

  async hover(locator, opts = {}) {
    const p = await this.pointOf(locator, opts)
    await this.moveTo(p.x, p.y, opts)
  }

  async click(locator, opts = {}) {
    await this.hover(locator, opts)
    await wait(opts.settle ?? 120)
    await this.page.mouse.down()
    await wait(85)
    await this.page.mouse.up()
  }

  /** Clicks where the cursor already is (repeated taps on the same control). */
  async tap(gap = 260) {
    await this.page.mouse.down(); await wait(80); await this.page.mouse.up(); await wait(gap)
  }

  async goHome(opts) { await this.moveTo(this.rest.x, this.rest.y, opts) }

  /** Types key by key at a human pace (about 8–12 characters per second). */
  async type(text) {
    for (const ch of text) {
      await this.page.keyboard.type(ch)
      await wait(55 + this.rand() * 65 + (/[\s@.]/.test(ch) ? 45 : 0))
    }
  }

  async replaceValue(text) {
    await this.page.keyboard.press("ControlOrMeta+A")
    await wait(70)
    await this.type(text)
  }

  /** Scrolls the window to `top` with an eased animation. */
  async scrollTo(top, ms = 1000) {
    await this.page.evaluate(([to, dur]) => new Promise((resolve) => {
      const from = scrollY, t0 = performance.now()
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur)
        scrollTo(0, from + (to - from) * ease(k))
        k < 1 ? requestAnimationFrame(step) : resolve()
      }
      requestAnimationFrame(step)
    }), [top, ms])
  }
}

/** Starts a CDP screencast that stores every frame with its timestamp. */
export async function startCapture(page, dir, { width, height }) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const cdp = await page.context().newCDPSession(page)
  const frames = []
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = `f${String(frames.length).padStart(5, "0")}.jpg`
    fs.writeFileSync(path.join(dir, file), Buffer.from(data, "base64"))
    frames.push({ file, t: metadata.timestamp, arrived: Date.now() / 1000 })
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {})
  })
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: width, maxHeight: height, everyNthFrame: 1 })
  // Nudge one repaint so the very first frame is emitted right away.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  await wait(150)
  return {
    async stop() {
      const end = Date.now() / 1000
      await cdp.send("Page.stopScreencast").catch(() => {})
      await wait(100)
      if (frames.length < 2) throw new Error("screencast produced too few frames")
      // Frame i lasts until frame i+1 arrives; the last one lasts until stop().
      const lines = ["ffconcat version 1.0"]
      frames.forEach((f, i) => {
        const next = frames[i + 1]
        const d = next ? next.t - f.t : end - f.arrived
        lines.push(`file '${f.file}'`, `duration ${Math.max(0.001, d).toFixed(4)}`)
      })
      lines.push(`file '${frames.at(-1).file}'`)
      fs.writeFileSync(path.join(dir, "frames.ffconcat"), lines.join("\n") + "\n")
      const total = frames.at(-1).t - frames[0].t + (end - frames.at(-1).arrived)
      return { dir, count: frames.length, seconds: total, fps: frames.length / total }
    },
  }
}
