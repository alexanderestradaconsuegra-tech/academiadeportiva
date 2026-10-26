// A tiny in-memory stand-in for Supabase (Auth + PostgREST), good enough for the
// app to sign in, read its tables and accept writes during the recording.
// It never talks to the real project and keeps nothing on disk.
import http from "node:http"
import { buildSeed, COACH_ID, COACH_EMAIL, COACH_PASSWORD, PLAYER_USER_ID, PLAYER_EMAIL, PLAYER_PASSWORD } from "./seed.mjs"

const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url")
function fakeJwt(sub, email) {
  const now = Math.floor(Date.now() / 1000)
  // Unsigned-looking demo token: the app never verifies it client-side, and
  // nothing real accepts it. Valid for 12 hours so it never expires mid-take.
  return [b64u({ alg: "HS256", typ: "JWT" }), b64u({ sub, email, role: "authenticated", aud: "authenticated", iat: now, exp: now + 43200, session_id: "demo" }), b64u("demo-signature")].join(".")
}
// Two fictional accounts: the coach and one player.
const ACCOUNTS = [
  { id: COACH_ID, email: COACH_EMAIL, password: COACH_PASSWORD },
  { id: PLAYER_USER_ID, email: PLAYER_EMAIL, password: PLAYER_PASSWORD },
]
const userOf = (a) => ({ id: a.id, aud: "authenticated", role: "authenticated", email: a.email, email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { provider: "email" }, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" })
function session(a) {
  const access_token = fakeJwt(a.id, a.email)
  return { access_token, token_type: "bearer", expires_in: 43200, expires_at: Math.floor(Date.now() / 1000) + 43200, refresh_token: "demo-refresh." + a.id, user: userOf(a) }
}
// The account behind a request: from the bearer token, or the refresh token.
function accountFrom(req, body) {
  const refresh = body?.refresh_token?.split(".")[1]
  if (refresh) return ACCOUNTS.find((a) => a.id === refresh)
  const token = (req.headers.authorization || "").replace(/^Bearer /, "").split(".")[1]
  try { const sub = JSON.parse(Buffer.from(token, "base64url").toString()).sub; return ACCOUNTS.find((a) => a.id === sub) } catch { return undefined }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "Content-Range, Range, X-Total-Count",
}

function send(res, status, body, extra = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body)
  res.writeHead(status, { "Content-Type": "application/json", ...CORS, ...extra })
  res.end(payload)
}

function parseValue(v) {
  if (v === "null") return null
  if (v === "true") return true
  if (v === "false") return false
  return v
}
function matches(row, col, expr) {
  const dot = expr.indexOf(".")
  let op = expr.slice(0, dot), val = expr.slice(dot + 1)
  let not = false
  if (op === "not") { not = true; const d2 = val.indexOf("."); op = val.slice(0, d2); val = val.slice(d2 + 1) }
  const cell = row[col]
  let ok
  switch (op) {
    case "eq": ok = String(cell) === String(parseValue(val)) || cell === parseValue(val); break
    case "neq": ok = String(cell) !== String(val); break
    case "gt": ok = cell > val; break
    case "gte": ok = cell >= val; break
    case "lt": ok = cell < val; break
    case "lte": ok = cell <= val; break
    case "is": ok = val === "null" ? cell == null : cell === parseValue(val); break
    case "in": ok = val.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/^"|"$/g, "")).includes(String(cell)); break
    case "like": case "ilike": ok = new RegExp("^" + val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", op === "ilike" ? "i" : "").test(String(cell ?? "")); break
    default: ok = true
  }
  return not ? !ok : ok
}
const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"])

export function startMock(port = 54321) {
  const db = buildSeed()
  let idSeq = 1
  const newId = () => `0d3e7a10-0000-4000-8000-9${String(idSeq++).padStart(11, "0")}`
  const log = []

  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end() }
    const url = new URL(req.url, "http://x")
    const chunks = []
    for await (const c of req) chunks.push(c)
    const raw = Buffer.concat(chunks).toString()
    const body = raw ? (() => { try { return JSON.parse(raw) } catch { return raw } })() : undefined

    // ── Auth ──
    if (url.pathname === "/auth/v1/token") {
      const grant = url.searchParams.get("grant_type")
      const account = grant === "password" ? ACCOUNTS.find((a) => a.email === body?.email && a.password === body?.password) : accountFrom(req, body)
      if (!account) return send(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials" })
      return send(res, 200, session(account))
    }
    if (url.pathname === "/auth/v1/user") {
      const account = accountFrom(req)
      return account ? send(res, 200, userOf(account)) : send(res, 401, { message: "invalid token" })
    }
    if (url.pathname === "/auth/v1/logout") return send(res, 204)
    if (url.pathname.startsWith("/auth/v1/")) return send(res, 200, {})
    if (url.pathname.startsWith("/storage/v1/")) return send(res, 200, [])
    if (url.pathname.startsWith("/realtime/")) return send(res, 404, {})

    // ── PostgREST ──
    const m = url.pathname.match(/^\/rest\/v1\/(rpc\/)?([a-z_]+)$/)
    if (!m) return send(res, 404, { message: "not found" })
    if (m[1]) { log.push(`RPC ${m[2]}`); return send(res, 200, null) }
    const table = m[2]
    const rows = (db[table] ??= [])
    const filters = [...url.searchParams.entries()].filter(([k]) => !RESERVED.has(k))
    const pick = () => rows.filter((r) => filters.every(([k, v]) => matches(r, k, v)))
    const wantsObject = (req.headers.accept || "").includes("vnd.pgrst.object")
    const prefer = req.headers.prefer || ""

    if (req.method === "GET" || req.method === "HEAD") {
      let out = pick()
      const order = url.searchParams.get("order")
      if (order) {
        const [col, dir] = order.split(",")[0].split(".")
        out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === "desc" ? -1 : 1))
      }
      const limit = url.searchParams.get("limit")
      if (limit !== null) out = out.slice(0, Number(limit))
      // Embedded children, e.g. select=*,convocatoria_players(*): rows of that
      // table whose "<parent>_id" points at each row (convocatorias → convocatoria_id).
      const embeds = [...(url.searchParams.get("select") || "").matchAll(/([a-z_]+)\(\*\)/g)].map((m) => m[1])
      if (embeds.length) {
        const fk = table.replace(/s$/, "") + "_id"
        out = out.map((r) => ({ ...r, ...Object.fromEntries(embeds.map((e) => [e, (db[e] ?? []).filter((c) => c[fk] === r.id)])) }))
      }
      if (wantsObject) return out.length === 1 ? send(res, 200, out[0]) : send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" })
      return send(res, 200, out, { "Content-Range": `0-${Math.max(out.length - 1, 0)}/${out.length}` })
    }

    if (req.method === "POST") {
      const list = Array.isArray(body) ? body : [body]
      const conflict = url.searchParams.get("on_conflict")
      const written = list.map((item) => {
        if (conflict) {
          const keys = conflict.split(",")
          const existing = rows.find((r) => keys.every((k) => String(r[k]) === String(item[k])))
          if (existing) { Object.assign(existing, item); return existing }
        }
        const row = { id: newId(), created_at: new Date().toISOString(), ...item }
        rows.push(row)
        return row
      })
      log.push(`POST ${table} x${written.length}`)
      if (prefer.includes("return=representation")) return send(res, 201, wantsObject ? written[0] : written)
      return send(res, 201)
    }
    if (req.method === "PATCH") {
      const hit = pick()
      hit.forEach((r) => Object.assign(r, body))
      log.push(`PATCH ${table} x${hit.length}`)
      if (prefer.includes("return=representation")) return send(res, 200, wantsObject ? hit[0] : hit)
      return send(res, 204)
    }
    if (req.method === "DELETE") {
      const hit = new Set(pick())
      db[table] = rows.filter((r) => !hit.has(r))
      log.push(`DELETE ${table} x${hit.size}`)
      return send(res, 204)
    }
    return send(res, 405, {})
  })
  // What the server does when a coach redeems a demo code: a brand-new, empty
  // academy with a 14-day trial, and a login for the new coach. Everything the
  // clip then shows (empty dashboard, "14 días restantes") comes from this.
  const registerAcademy = ({ email, password, coachName, academyName, language = "es" }) => {
    const id = `0d3e7a10-0000-4000-8000-b${String(idSeq++).padStart(11, "0")}`
    const academyId = `0d3e7a10-0000-4000-8000-a${String(idSeq++).padStart(11, "0")}`
    ACCOUNTS.push({ id, email, password })
    const now = new Date()
    for (const k of Object.keys(db)) db[k] = []
    db.team_settings = [{
      id: academyId, name: academyName, logo_url: null, city: "", founded_year: null, description: "", language,
      updated_at: now.toISOString(), monthly_fee: 0, subscription_status: null, subscription_current_period_end: null,
      trial_expires_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), activation_code: null,
      mp_payment_id: null, mp_plan: null, mp_preapproval_id: null,
      calib_p0_lat: null, calib_p0_lng: null, calib_p1_lat: null, calib_p1_lng: null, calib_p2_lat: null, calib_p2_lng: null,
    }]
    db.profiles = [{ id, academy_id: academyId, full_name: coachName, role: "coach", category: null, player_id: null, created_at: now.toISOString() }]
    return { userId: id, academyId }
  }
  // Put every table back to the seed state, so each clip starts from the same data.
  const reset = () => { for (const k of Object.keys(db)) delete db[k]; Object.assign(db, buildSeed()); log.length = 0; ACCOUNTS.length = 2 }
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, db, log, reset, registerAcademy, url: `http://127.0.0.1:${port}` })))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMock(Number(process.env.PORT || 54321)).then(({ url }) => console.log("fake supabase on", url))
}
