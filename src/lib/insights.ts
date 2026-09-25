import type { Activity, ActivityUnit, Evaluation, Injury, Player, SessionLoad, Training, TrainingExercise, ActivityCategory } from "./types"
import { workloadSummary } from "./workload"
import { SCORE_TO_CATEGORY } from "./recommendations"

/**
 * Turns data the academy already has into a short list of things worth
 * acting on today.
 *
 * Físico and Actividades were tools that only ever asked for input: a coach
 * opened them and found forms, never an answer. The data to answer was
 * already there — evaluations, loads, injuries, measurements — just spread
 * across screens that never cross-reference each other. Every finding here
 * comes from crossing at least two of those, which is the part no single
 * screen could show.
 *
 * Read-only on purpose: nothing here writes, so it can't damage anything.
 */

export type InsightTone = "alert" | "warning" | "good" | "info"

export interface Insight {
  id: string
  tone: InsightTone
  title: string
  detail: string
  playerId?: string
  href?: string
  action?: string
}

const TONE_ORDER: Record<InsightTone, number> = { alert: 0, warning: 1, good: 2, info: 3 }

/** Plain YYYY-MM-DD dates, compared in UTC so a timezone behind UTC can't shift a day. */
function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO.slice(0, 10) + "T00:00:00Z").getTime()
  const to = new Date(toISO.slice(0, 10) + "T00:00:00Z").getTime()
  return Math.round((to - from) / 86_400_000)
}

function byTone(a: Insight, b: Insight) {
  return TONE_ORDER[a.tone] - TONE_ORDER[b.tone]
}

const CATEGORY_WORD: Record<ActivityCategory, string> = {
  Velocidad: "velocidad", Fuerza: "fuerza", "Técnica": "técnica", Resistencia: "resistencia",
  Potencia: "potencia", "Pliometría": "pliometría", Agilidad: "agilidad",
}

// ── Físico ──────────────────────────────────────────────────────────────────

export interface PhysicalInput {
  players: Player[]
  sessionLoads: SessionLoad[]
  injuries: Injury[]
  evaluations: Evaluation[]
  trainings: Training[]
}

/** Recently back from injury — the window in which a load spike is most likely to cause a relapse. */
export const RETURN_WINDOW_DAYS = 21
/** A drop this large between two evaluations is worth a coach's attention, not noise. */
export const EVAL_DROP_POINTS = 10
/**
 * Only drops found in a recent evaluation count. Run against a real academy,
 * the first version surfaced a 10-point fall from November 2024 as something
 * to know "today" — true, and useless two years on.
 */
export const EVAL_RECENT_DAYS = 60

function isActiveInjury(inj: Injury, todayISO: string): boolean {
  if (inj.is_recovered) return false
  if (daysBetween(inj.date_start, todayISO) < 0) return false
  return !inj.date_return || daysBetween(todayISO, inj.date_return) >= 0
}

export function physicalInsights(input: PhysicalInput, todayISO: string): Insight[] {
  const { players, sessionLoads, injuries, evaluations, trainings } = input
  const out: Insight[] = []
  const reported = new Set<string>()

  const loadsFor = (pid: string) => sessionLoads.filter(l => l.player_id === pid)

  for (const p of players) {
    const loads = loadsFor(p.id)
    const summary = workloadSummary(loads, todayISO)
    const playerInjuries = injuries.filter(i => i.player_id === p.id)

    // 1. Injured and still training: the one combination that should never happen quietly.
    const active = playerInjuries.find(i => isActiveInjury(i, todayISO))
    const loggedThisWeek = loads.some(l => {
      const age = daysBetween(l.date, todayISO)
      return age >= 0 && age < 7
    })
    if (active && loggedThisWeek) {
      out.push({
        id: `injured-load-${p.id}`,
        tone: "alert",
        title: `${p.name} está lesionado y sigue entrenando`,
        detail: `Tiene una lesión activa (${active.body_part}) y registró carga esta semana.`,
        playerId: p.id,
        href: `/players/${p.id}`,
        action: "Ver jugador",
      })
      reported.add(p.id)
      continue
    }

    // 2. Back from injury recently and already loading hard — the relapse pattern.
    const recentReturn = playerInjuries
      .filter(i => i.date_return && (i.is_recovered || daysBetween(i.date_return, todayISO) >= 0))
      .map(i => ({ inj: i, days: daysBetween(i.date_return as string, todayISO) }))
      .filter(r => r.days >= 0 && r.days <= RETURN_WINDOW_DAYS)
      .sort((a, b) => a.days - b.days)[0]
    if (recentReturn && (summary.zone === "riesgo" || summary.zone === "precaucion")) {
      out.push({
        id: `return-load-${p.id}`,
        tone: "alert",
        title: `${p.name} volvió de lesión y ya está en carga alta`,
        detail: `Volvió hace ${recentReturn.days} días (${recentReturn.inj.body_part}). Subir la carga tan rápido es el patrón típico de una recaída.`,
        playerId: p.id,
        href: `/players/${p.id}`,
        action: "Ver jugador",
      })
      reported.add(p.id)
      continue
    }

    // 3. Load spike against the player's own baseline.
    if (summary.zone === "riesgo" || summary.zone === "precaucion") {
      const pct = summary.ratio !== null ? Math.round((summary.ratio - 1) * 100) : null
      out.push({
        id: `load-${p.id}`,
        tone: summary.zone === "riesgo" ? "alert" : "warning",
        title: pct !== null
          ? `${p.name} cargó ${pct}% más que su promedio`
          : `${p.name} subió mucho su carga`,
        detail: summary.zone === "riesgo"
          ? "Salto grande respecto a su último mes. Es el momento de moderar antes de que aparezca una lesión."
          : "Subió la exigencia más rápido de lo aconsejable esta semana.",
        playerId: p.id,
        href: `/players/${p.id}`,
        action: "Ver carga",
      })
      reported.add(p.id)
    }
  }

  // 4. Evaluation drops — the biggest single-attribute fall per player.
  for (const p of players) {
    if (reported.has(p.id)) continue
    const evs = evaluations
      .filter(e => e.player_id === p.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    if (evs.length < 2) continue
    const [latest, previous] = evs
    const latestAge = daysBetween(latest.date, todayISO)
    if (latestAge < 0 || latestAge > EVAL_RECENT_DAYS) continue
    let worst: { category: ActivityCategory; drop: number } | null = null
    for (const { field, category } of SCORE_TO_CATEGORY) {
      const drop = Number(previous[field]) - Number(latest[field])
      if (drop >= EVAL_DROP_POINTS && (!worst || drop > worst.drop)) worst = { category, drop }
    }
    if (worst) {
      out.push({
        id: `eval-drop-${p.id}`,
        tone: "warning",
        title: `${p.name} bajó ${worst.drop} puntos en ${CATEGORY_WORD[worst.category]}`,
        detail: "Comparado con su evaluación anterior. Vale revisar si hay cansancio, una molestia o falta de trabajo específico.",
        playerId: p.id,
        href: `/players/${p.id}`,
        action: "Asignar ejercicios",
      })
    }
  }

  // 5. Missing effort ratings — only once the academy actually uses load
  // tracking, otherwise this would nag every academy that hasn't started.
  const usesLoad = sessionLoads.some(l => {
    const age = daysBetween(l.date, todayISO)
    return age >= 0 && age < 28
  })
  if (usesLoad) {
    // Logging has started but nobody has a month of history yet, so no zone
    // can be computed and the panel would otherwise just say "all clear" —
    // which reads as the feature doing nothing. Say what's needed instead.
    const anyBaseline = players.some(p => workloadSummary(loadsFor(p.id), todayISO).zone !== "sin_datos")
    if (!anyBaseline) {
      out.push({
        id: "load-building",
        tone: "info",
        title: "La carga todavía está juntando historial",
        detail: "Se necesitan unas 2 semanas de registros por jugador para comparar su carga contra su propio promedio. Seguí registrando el esfuerzo después de cada sesión: ahí empiezan las alertas de riesgo de lesión.",
      })
    }

    const recentTrainings = trainings.filter(t => {
      const age = daysBetween(t.date, todayISO)
      return age >= 0 && age < 7
    })
    const missing = players.filter(p => {
      const hadTraining = recentTrainings.some(t => !t.category || t.category === p.category)
      if (!hadTraining) return false
      return !sessionLoads.some(l => {
        const age = daysBetween(l.date, todayISO)
        return l.player_id === p.id && age >= 0 && age < 7
      })
    })
    if (missing.length > 0) {
      out.push({
        id: "missing-rpe",
        tone: "info",
        title: missing.length === 1
          ? `${missing[0].name} no registró su esfuerzo esta semana`
          : `${missing.length} jugadores sin registrar esfuerzo esta semana`,
        detail: "Sin ese dato su carga queda incompleta y una alerta real puede pasar desapercibida. Podés cargarlo por el grupo desde \"Carga del plantel\".",
      })
    }
  }

  return out.sort(byTone)
}

// ── Actividades ─────────────────────────────────────────────────────────────

export interface ActivityInput {
  players: Player[]
  activities: Activity[]
  trainingExercises: TrainingExercise[]
  trainings: Training[]
}

/** For a timed drill a smaller number is the improvement; for everything else, bigger is. */
export function lowerIsBetter(unit: ActivityUnit): boolean {
  return unit === "segundos"
}

/** Smaller moves than this are within the noise of a group average. */
export const MIN_TREND_PCT = 3
export const PB_WINDOW_DAYS = 14
export const NEGLECT_DAYS = 21

function avg(values: number[]) {
  return values.reduce((s, v) => s + v, 0) / values.length
}

function fmt(n: number) {
  return (Math.round(n * 100) / 100).toLocaleString("es-CL")
}

export function activityInsights(input: ActivityInput, todayISO: string): Insight[] {
  const { players, activities, trainingExercises, trainings } = input
  const out: Insight[] = []
  const nameOf = (pid: string) => players.find(p => p.id === pid)?.name ?? "Un jugador"

  // 1. Group trend per drill: last 30 days against the 30 before.
  const byDrill = new Map<string, Activity[]>()
  for (const a of activities) {
    const key = `${a.exercise}::${a.unit}`
    const list = byDrill.get(key) ?? []
    list.push(a)
    byDrill.set(key, list)
  }

  const trends: { exercise: string; unit: ActivityUnit; prev: number; recent: number; gainPct: number }[] = []
  byDrill.forEach(list => {
    const recent = list.filter(a => { const d = daysBetween(a.date, todayISO); return d >= 0 && d < 30 }).map(a => a.value)
    const prev = list.filter(a => { const d = daysBetween(a.date, todayISO); return d >= 30 && d < 60 }).map(a => a.value)
    // One kid's mark is not a group trend.
    if (recent.length < 2 || prev.length < 2) return
    const r = avg(recent), p = avg(prev)
    if (p === 0) return
    const change = ((r - p) / p) * 100
    const unit = list[0].unit
    trends.push({ exercise: list[0].exercise, unit, prev: p, recent: r, gainPct: lowerIsBetter(unit) ? -change : change })
  })

  const best = [...trends].sort((a, b) => b.gainPct - a.gainPct)[0]
  if (best && best.gainPct >= MIN_TREND_PCT) {
    out.push({
      id: `trend-up-${best.exercise}`,
      tone: "good",
      title: `El grupo mejoró ${Math.round(best.gainPct)}% en ${best.exercise}`,
      detail: `Pasó de ${fmt(best.prev)} a ${fmt(best.recent)} ${best.unit} de promedio en el último mes.`,
    })
  }
  const worst = [...trends].sort((a, b) => a.gainPct - b.gainPct)[0]
  if (worst && worst.gainPct <= -MIN_TREND_PCT && worst !== best) {
    out.push({
      id: `trend-down-${worst.exercise}`,
      tone: "warning",
      title: `El grupo empeoró ${Math.round(-worst.gainPct)}% en ${worst.exercise}`,
      detail: `Pasó de ${fmt(worst.prev)} a ${fmt(worst.recent)} ${worst.unit} de promedio en el último mes.`,
    })
  }

  // 2. Personal bests set recently — the thing a kid and their parents want to hear.
  const pbs: { a: Activity; previousBest: number }[] = []
  for (const a of activities) {
    const age = daysBetween(a.date, todayISO)
    if (age < 0 || age > PB_WINDOW_DAYS) continue
    const earlier = activities.filter(o =>
      o.player_id === a.player_id && o.exercise === a.exercise && o.unit === a.unit &&
      (o.date < a.date || (o.date === a.date && o.created_at < a.created_at))
    )
    if (earlier.length === 0) continue // a first mark isn't a record
    const values = earlier.map(o => o.value)
    const previousBest = lowerIsBetter(a.unit) ? Math.min(...values) : Math.max(...values)
    const beats = lowerIsBetter(a.unit) ? a.value < previousBest : a.value > previousBest
    if (beats) pbs.push({ a, previousBest })
  }
  pbs
    .sort((x, y) => y.a.date.localeCompare(x.a.date))
    .slice(0, 2)
    .forEach(({ a, previousBest }) => {
      out.push({
        id: `pb-${a.id}`,
        tone: "good",
        title: `Récord personal de ${nameOf(a.player_id)} en ${a.exercise}`,
        detail: `${fmt(a.value)} ${a.unit}, superando su mejor marca anterior de ${fmt(previousBest)}.`,
        playerId: a.player_id,
        href: `/players/${a.player_id}`,
        action: "Ver jugador",
      })
    })

  // 3. Categories nobody has worked lately — only when the academy is active,
  // otherwise every category is "neglected" and the finding means nothing.
  const recentCats = new Set<ActivityCategory>()
  let activeRecently = false
  for (const a of activities) {
    const d = daysBetween(a.date, todayISO)
    if (d >= 0 && d < NEGLECT_DAYS) { recentCats.add(a.category); activeRecently = true }
  }
  const trainingDate = new Map(trainings.map(t => [t.id, t.date]))
  for (const te of trainingExercises) {
    const date = trainingDate.get(te.training_id)
    if (!date) continue
    const d = daysBetween(date, todayISO)
    if (d >= 0 && d < NEGLECT_DAYS) { recentCats.add(te.category); activeRecently = true }
  }
  if (activeRecently) {
    const all: ActivityCategory[] = ["Velocidad", "Fuerza", "Técnica", "Resistencia", "Potencia", "Pliometría", "Agilidad"]
    const neglected = all.filter(c => !recentCats.has(c))
    if (neglected.length > 0 && neglected.length < all.length) {
      out.push({
        id: "neglected",
        tone: "info",
        title: neglected.length === 1
          ? `3 semanas sin trabajar ${CATEGORY_WORD[neglected[0]]}`
          : `3 semanas sin trabajar: ${neglected.map(c => CATEGORY_WORD[c]).join(", ")}`,
        detail: "Ningún ejercicio ni medición de esas áreas en las últimas tres semanas.",
      })
    }
  }

  return out.sort(byTone)
}
