// Renders the demo e-mail exactly as the app builds it. The HTML is read from
// the route's own source (src/app/api/demo/request/route.ts), so if that
// template changes the video follows. Only the values are fictional.
import fs from "node:fs"
import path from "node:path"

const ROUTE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../src/app/api/demo/request/route.ts")

export const SUBJECT = "🎁 Tu código de demo está listo — 14 días gratis en Metrikas"

export function emailBody({ academy, code, appUrl = "https://app.metrikas.pro", expires }) {
  const src = fs.readFileSync(ROUTE, "utf8")
  const m = src.match(/const demoEmailHtml = `([\s\S]*?)`\n\n\s*await sendEmail/)
  if (!m) throw new Error("demo e-mail template not found in the route")
  return m[1]
    .replaceAll("${escapeHtml(academy_name)}", academy)
    .replaceAll("${escapeHtml(code)}", code)
    .replaceAll('${expiresAt.toLocaleDateString("es-CL")}', expires)
    .replaceAll("${appUrl}", appUrl)
}

/** A plain, neutral message view around the e-mail (no real mail client is imitated). */
export function emailPage({ to, academy, code, expires }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Correo</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700">
<style>
  *{box-sizing:border-box} body{margin:0;background:#eef2f6;font-family:Inter,system-ui,sans-serif;color:#0f172a}
  .bar{height:56px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;padding:0 28px;font-weight:700;color:#475569}
  .wrap{max-width:760px;margin:0 auto;padding:22px 16px 40px}
  h1{font-size:19px;line-height:1.3;margin:0 0 14px;font-weight:700}
  .meta{display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:14px;color:#475569}
  .av{width:40px;height:40px;border-radius:50%;background:#05122f;color:#a3e635;display:grid;place-items:center;font-weight:800}
  .meta b{color:#0f172a}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:22px 12px}
  ::selection{background:#fde047;color:#05122f}
</style></head><body>
<div class="bar">Bandeja de entrada</div>
<div class="wrap">
  <h1>${SUBJECT}</h1>
  <div class="meta"><div class="av">M</div><div><b>Metrikas</b> &lt;info@metrikas.pro&gt;<br>Para: ${to}</div></div>
  <div class="card">${emailBody({ academy, code, expires })}</div>
</div></body></html>`
}
