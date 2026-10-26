// Fictional data for the demo recording. Every name, e-mail and number here is
// invented. No real academy, player, guardian or photo is used: avatars are
// generated SVGs with initials. Dates are computed relative to "today" so the
// app's "today", "overdue" and "this month" logic behaves naturally.

export const ACADEMY_ID = "0d3e7a10-0000-4000-8000-00000000a001"
export const COACH_ID = "0d3e7a10-0000-4000-8000-00000000c001"
export const COACH_EMAIL = "entrenador@losaromos.example"
export const COACH_PASSWORD = "demo-2026"
// A player account (fictional student) for the "what the player sees" clips.
export const PLAYER_USER_ID = "0d3e7a10-0000-4000-8000-00000000c002"
export const PLAYER_EMAIL = "agustin@losaromos.example"
export const PLAYER_PASSWORD = "demo-2026"

const pad = (n) => String(n).padStart(2, "0")
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const uuid = (prefix, n) => `0d3e7a10-0000-4000-8000-${prefix}${String(n).padStart(12 - prefix.length, "0")}`

const COLORS = ["#0b5cff", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#dc2626", "#65a30d", "#db2777", "#0f766e", "#9333ea"]
function initialsAvatar(name, i) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  const c = COLORS[i % COLORS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#05122f"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><text x="60" y="61" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="46" font-weight="700" fill="#fff">${initials}</text></svg>`
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg)
}

// [name, position, category, age, [speed, strength, technique, resistance, power, agility] at the latest evaluation]
const ROSTER = [
  ["Martín Ossandón", "Delantero Centro", "Sub-12", 12, [88, 80, 84, 82, 83, 86]],
  ["Benjamín Lagos", "Portero", "Sub-12", 12, [72, 78, 76, 80, 79, 74]],
  ["Lucas Ferrada", "Mediocampista Central", "Sub-12", 11, [76, 70, 74, 72, 70, 75]],
  ["Agustín Pavez", "Extremo Derecho", "Sub-12", 12, [91, 76, 82, 84, 80, 90]],
  ["Vicente Moya", "Defensa Central", "Sub-12", 12, [74, 86, 72, 83, 84, 73]],
  ["Joaquín Aedo", "Lateral Izquierdo", "Sub-12", 11, [82, 75, 77, 85, 74, 81]],
  ["Maximiliano Tapia", "Mediocampista Ofensivo", "Sub-12", 12, [80, 72, 88, 78, 75, 83]],
  ["Felipe Urrutia", "Lateral Derecho", "Sub-12", 11, [79, 74, 73, 81, 72, 78]],
  ["Cristóbal Henríquez", "Defensa Central", "Sub-12", 12, [70, 84, 70, 79, 82, 69]],
  ["Diego Salgado", "Extremo Izquierdo", "Sub-12", 11, [86, 70, 80, 77, 76, 85]],
  ["Emilio Cortés", "Mediocampista Defensivo", "Sub-12", 12, [75, 81, 78, 84, 79, 76]],
  ["Renato Sepúlveda", "Segundo Delantero", "Sub-12", 11, [83, 73, 81, 76, 78, 82]],
  ["Tomás Villagra", "Delantero Centro", "Sub-10", 10, [78, 66, 72, 70, 68, 77]],
  ["Gaspar Olivares", "Portero", "Sub-10", 9, [65, 68, 70, 72, 66, 67]],
  ["Simón Carrasco", "Mediocampista Central", "Sub-10", 10, [74, 64, 76, 71, 65, 75]],
  ["Bruno Espinoza", "Defensa Central", "Sub-10", 10, [70, 72, 66, 74, 70, 69]],
  ["León Arancibia", "Extremo Derecho", "Sub-10", 9, [80, 62, 71, 70, 64, 79]],
  ["Alonso Fuenzalida", "Lateral Izquierdo", "Sub-10", 10, [73, 67, 69, 75, 66, 72]],
]
const FEET = ["Derecha", "Izquierda", "Derecha", "Derecha", "Ambidiestro"]

export function buildSeed(today = new Date()) {
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const created = iso(addDays(today, -200)) + "T12:00:00Z"
  const t = {}

  t.team_settings = [{
    id: ACADEMY_ID, name: "Club Deportivo Los Aromos", logo_url: null, city: "Santiago",
    founded_year: 2019, description: "Academia de fútbol formativo", language: "es",
    updated_at: created, monthly_fee: 35000, subscription_status: "active",
    subscription_current_period_end: null, trial_expires_at: null, activation_code: null,
    mp_payment_id: null, mp_plan: "annual", mp_preapproval_id: null,
    calib_p0_lat: null, calib_p0_lng: null, calib_p1_lat: null, calib_p1_lng: null, calib_p2_lat: null, calib_p2_lng: null,
  }]
  t.profiles = [{ id: COACH_ID, academy_id: ACADEMY_ID, full_name: "Profe Andrés Vera", role: "coach", category: null, player_id: null, created_at: created }]

  t.players = ROSTER.map(([name, position, category, age], i) => ({
    id: uuid("1", i + 1), academy_id: ACADEMY_ID, name, position, category, age,
    birth_date: `${today.getFullYear() - age}-${pad((i % 12) + 1)}-${pad((i * 7) % 27 + 1)}`,
    dominant_foot: FEET[i % FEET.length], height: 132 + age * 2 + (i % 5), weight: 30 + age + (i % 4),
    club: "Club Deportivo Los Aromos", objective: "Mejorar su toma de decisiones con balón",
    notes: "", photo_url: initialsAvatar(name, i), created_at: created,
  }))

  // Three past evaluations per player (about 5, 3 and 1 month ago), improving.
  t.evaluations = []
  ROSTER.forEach(([, , , , base], i) => {
    // Lucas Ferrada (index 2) stays a little behind: step 3 records his improvement.
    const latest = base.map((v) => Math.min(96, v + (i === 2 ? 0 : 6)))
    ;[[-150, -9], [-90, -5], [-30, 0]].forEach(([days, delta], k) => {
      const s = latest.map((v) => Math.max(50, v + delta - (i % 3)))
      const general = Math.round(s.reduce((a, b) => a + b, 0) / s.length)
      t.evaluations.push({
        id: uuid("2", i * 10 + k + 1), player_id: t.players[i].id, date: iso(addDays(today, days)),
        speed_score: s[0], strength_score: s[1], technique_score: s[2], resistance_score: s[3], power_score: s[4], agility_score: s[5],
        general_score: general, notes: "", created_at: iso(addDays(today, days)) + "T20:00:00Z",
      })
    })
  })

  // Sub-12 trains Tue/Thu at 18:00, Sub-10 Mon/Wed at 17:00, for the last 8 weeks; plus today's Sub-12 session.
  t.trainings = []
  t.attendance = []
  let tn = 0
  for (let d = -56; d <= 14; d++) {
    const day = addDays(today, d)
    const wd = day.getDay()
    const plan = [[2, "Sub-12", "18:00", "Técnica y pase"], [4, "Sub-12", "18:00", "Juego reducido"], [1, "Sub-10", "17:00", "Coordinación"], [3, "Sub-10", "17:00", "Conducción"]]
    for (const [w, cat, time, title] of plan) {
      if (wd !== w) continue
      tn++
      const tr = { id: uuid("3", tn), academy_id: ACADEMY_ID, title: `${cat} · ${title}`, date: iso(day), time, category: cat, location: "Cancha 2", notes: "", schedule_id: null, created_at: iso(day) + "T09:00:00Z" }
      t.trainings.push(tr)
      if (d < 0) {
        t.players.filter((p) => p.category === cat).forEach((p, pi) => {
          const absent = (pi + tn) % 9 === 0
          t.attendance.push({ id: uuid("4", tn * 100 + pi), training_id: tr.id, player_id: p.id, status: absent ? "absent" : "present", rsvp: "confirmed", notes: null, created_at: tr.created_at })
        })
      }
    }
  }
  // Make sure there is a Sub-12 session today with no attendance taken yet (step 2).
  if (!t.trainings.some((x) => x.date === iso(today) && x.category === "Sub-12")) {
    tn++
    t.trainings.push({ id: uuid("3", tn), academy_id: ACADEMY_ID, title: "Sub-12 · Técnica y pase", date: iso(today), time: "18:00", category: "Sub-12", location: "Cancha 2", notes: "", schedule_id: null, created_at: iso(today) + "T09:00:00Z" })
  }

  // Monthly fees: previous two months paid; this month paid except four players (overdue after the 5th).
  t.payments = []
  let pn = 0
  const monthStart = (offset) => new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const overdueIdx = new Set([2, 6, 9, 14])
  ;[-2, -1, 0].forEach((m) => {
    const ms = monthStart(m)
    const due = iso(new Date(ms.getFullYear(), ms.getMonth(), 5))
    t.players.forEach((p, i) => {
      pn++
      const unpaid = m === 0 && overdueIdx.has(i)
      t.payments.push({
        id: uuid("5", pn), player_id: p.id, academy_id: ACADEMY_ID, concept: "monthly_fee", amount: 35000,
        due_date: due, paid_date: unpaid ? null : iso(new Date(ms.getFullYear(), ms.getMonth(), 3 + (i % 4))),
        status: unpaid ? "pending" : "paid", notes: null, created_at: iso(ms) + "T08:00:00Z",
        receipt_path: null, receipt_note: null, receipt_uploaded_at: null, rejection_note: null,
      })
    })
  })

  t.expenses = [
    { id: uuid("6", 1), academy_id: ACADEMY_ID, concept: "Arriendo de cancha", category: "Instalaciones", amount: 180000, date: iso(monthStart(0)), is_recurring: true, notes: null, created_at: created },
    { id: uuid("6", 2), academy_id: ACADEMY_ID, concept: "Balones y conos", category: "Material", amount: 64000, date: iso(addDays(today, -12)), is_recurring: false, notes: null, created_at: created },
  ]
  t.activities = t.players.slice(0, 8).map((p, i) => ({
    id: uuid("7", i + 1), player_id: p.id, date: iso(addDays(today, -1 - i)), category: ["Velocidad", "Técnica", "Resistencia", "Agilidad"][i % 4],
    exercise: ["Sprint 20 m", "Pase a dos toques", "Test de Cooper", "Circuito de conos"][i % 4], value: [3.4, 18, 2350, 11.2][i % 4],
    unit: ["s", "reps", "m", "s"][i % 4], intensity: "Media", notes: "", created_at: iso(addDays(today, -1 - i)) + "T19:00:00Z",
  }))
  t.matches = [{ id: uuid("8", 1), academy_id: ACADEMY_ID, opponent: "Club Ejemplo Norte", competition: "Liga formativa", date: iso(addDays(today, 5)), time: "10:00", location: "Cancha 2", is_home: true, category: "Sub-12", our_score: null, opponent_score: null, video_url: "", notes: "", created_at: created }]

  // The player account belongs to Agustín Pavez (Sub-12, right winger).
  const agustin = t.players[3]
  t.profiles.push({ id: PLAYER_USER_ID, academy_id: ACADEMY_ID, full_name: agustin.name, role: "player", category: "Sub-12", player_id: agustin.id, created_at: created })

  // Call-up for the upcoming Sub-12 match, laid out with the app's "F8 · 2-2-3" formation.
  const convId = uuid("9", 1)
  t.convocatorias = [{ id: convId, match_id: t.matches[0].id, academy_id: ACADEMY_ID, formation: "F8 · 2-2-3", notes: "Llegar 45 minutos antes con canilleras.\nVamos con camiseta blanca.", created_at: iso(addDays(today, -1)) + "T19:00:00Z" }]
  const lineup = [
    [1, "POR", 50, 8, true], [4, "DFC", 65, 28, true], [8, "DFC", 35, 28, null], [10, "MC", 65, 50, true],
    [6, "MC", 35, 50, true], [3, "EXD", 78, 74, null], [0, "DC", 50, 78, true], [9, "EXI", 22, 74, null],
  ]
  t.convocatoria_players = lineup.map(([pi, label, x, y, confirmed], k) => ({
    id: uuid("9", 100 + k), convocatoria_id: convId, player_id: t.players[pi].id, position_label: label, x, y,
    instruction: pi === 3 ? "Abre la cancha por la derecha y busca el centro atrás." : "",
    confirmed, created_at: t.convocatorias[0].created_at,
  }))

  // Two plays saved on the tactics board (fútbol 7, 64×42 pitch, attacking to the right).
  const sub12 = (i) => t.players[i].id
  t.tactic_plays = [
    {
      id: uuid("a", 1), academy_id: ACADEMY_ID, name: "Salida por la derecha", format: "7", category: "Sub-12",
      markers: [
        { id: "gk", x: 6, y: 21, team: "home", label: "P", player_id: sub12(1) },
        { id: "d1", x: 18, y: 8, team: "home", label: "1", player_id: sub12(8) },
        { id: "d2", x: 18, y: 21, team: "home", label: "2", player_id: sub12(4) },
        { id: "d3", x: 18, y: 34, team: "home", label: "3", player_id: sub12(10) },
        { id: "m1", x: 34, y: 13, team: "home", label: "4", player_id: sub12(6) },
        { id: "m2", x: 34, y: 30, team: "home", label: "5", player_id: sub12(3) },
        { id: "st", x: 48, y: 21, team: "home", label: "6", player_id: sub12(0) },
        { id: "r1", x: 28, y: 24, team: "away" }, { id: "r2", x: 42, y: 30, team: "away" },
        { id: "r3", x: 46, y: 14, team: "away" }, { id: "r4", x: 58, y: 21, team: "away" },
        { id: "ball", x: 8.5, y: 21, team: "ball" },
      ],
      lines: [
        { id: "l1", type: "pass", pts: [[18, 32.5]] },
        { id: "l2", type: "run", pts: [[34, 30], [42, 36], [50, 37]] },
        { id: "l3", type: "pass", pts: [[34, 36], [49, 36.5]] },
        { id: "l4", type: "run", pts: [[48, 21], [54, 25], [57, 26]] },
        { id: "l5", type: "pass", pts: [[56.5, 25.5]] },
      ],
      created_at: created, updated_at: iso(addDays(today, -2)) + "T21:00:00Z",
    },
    {
      id: uuid("a", 2), academy_id: ACADEMY_ID, name: "Córner corto", format: "7", category: "Sub-12",
      markers: [
        { id: "a", x: 63, y: 41, team: "home", label: "4" }, { id: "b", x: 57, y: 37, team: "home", label: "5" },
        { id: "c", x: 55, y: 22, team: "home", label: "6" }, { id: "k", x: 61, y: 21, team: "away" },
        { id: "ball", x: 63, y: 40, team: "ball" },
      ],
      lines: [{ id: "l1", type: "pass", pts: [[57, 36.5]] }, { id: "l2", type: "pass", pts: [[55.5, 23]] }],
      created_at: created, updated_at: iso(addDays(today, -9)) + "T21:00:00Z",
    },
  ]

  // Everything else the app reads starts empty.
  for (const name of ["exercises", "exercise_assignments", "session_loads", "training_schedules", "training_exercises", "training_schedule_skips", "health_profiles", "live_sessions", "position_samples", "match_player_stats", "physical_tests", "injuries", "push_subscriptions", "activation_codes", "academy_payment_credentials"]) t[name] = t[name] ?? []

  return t
}

export const DEMO = { today: () => new Date(), iso }
