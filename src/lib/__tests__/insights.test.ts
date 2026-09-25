import { describe, it, expect } from "vitest"
import { physicalInsights, activityInsights, lowerIsBetter } from "../insights"
import type { Activity, Evaluation, Injury, Player, SessionLoad, Training, ActivityUnit } from "../types"

const TODAY = "2026-09-25"

function daysAgo(n: number): string {
  const d = new Date(TODAY + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().split("T")[0]
}

function player(id: string, name = id): Player {
  return {
    id, name, photo_url: "", age: 12, birth_date: "2014-01-01", position: "Delantero Centro",
    dominant_foot: "Derecha", height: 150, weight: 40, club: "", category: "Sub-12",
    objective: "", notes: "", created_at: "2026-01-01",
  } as Player
}

function load(pid: string, ago: number, value: number): SessionLoad {
  return {
    id: `l-${pid}-${ago}-${value}`, player_id: pid, training_id: null, date: daysAgo(ago),
    rpe: 5, duration_min: value / 5, load: value, notes: null, logged_by_coach: false, created_at: "2026-01-01",
  }
}

/** A steady month, then a hard current week — the classic spike. */
function spike(pid: string): SessionLoad[] {
  return [load(pid, 0, 1400), load(pid, 7, 400), load(pid, 14, 400), load(pid, 21, 400)]
}

/** The same load every week: nothing to report. */
function steady(pid: string): SessionLoad[] {
  return [load(pid, 0, 400), load(pid, 7, 400), load(pid, 14, 400), load(pid, 21, 400)]
}

function injury(pid: string, over: Partial<Injury> = {}): Injury {
  return {
    id: `i-${pid}`, player_id: pid, body_part: "rodilla", injury_type: "esguince", severity: "moderate",
    date_start: daysAgo(40), date_return: null, is_recovered: false, notes: null, created_at: "2026-01-01",
    ...over,
  }
}

function evaluation(pid: string, date: string, over: Partial<Evaluation> = {}): Evaluation {
  return {
    id: `e-${pid}-${date}`, player_id: pid, date,
    speed_score: 70, strength_score: 70, technique_score: 70, resistance_score: 70,
    power_score: 70, agility_score: 70, general_score: 70, ...over,
  }
}

function training(ago: number): Training {
  return {
    id: `t-${ago}`, title: "Entreno", date: daysAgo(ago), time: "18:00", category: "Sub-12",
    location: "", notes: "", schedule_id: null, created_at: "2026-01-01",
  }
}

const empty = { players: [], sessionLoads: [], injuries: [], evaluations: [], trainings: [] }

// These tell a coach what's wrong with real children. A false alarm teaches
// them to ignore the panel; a missed one is the whole point failing.
describe("physicalInsights", () => {
  it("says nothing when there is nothing to say", () => {
    expect(physicalInsights({ ...empty, players: [player("a")], sessionLoads: steady("a") }, TODAY)).toEqual([])
  })

  it("flags a load spike against the player's own baseline", () => {
    const out = physicalInsights({ ...empty, players: [player("a", "Thiago")], sessionLoads: spike("a") }, TODAY)
    expect(out).toHaveLength(1)
    expect(out[0].tone).toBe("alert")
    expect(out[0].title).toContain("Thiago")
  })

  it("flags an injured player who is still logging training load", () => {
    const out = physicalInsights({
      ...empty, players: [player("a", "Bastian")], sessionLoads: steady("a"), injuries: [injury("a")],
    }, TODAY)
    expect(out[0].id).toBe("injured-load-a")
    expect(out[0].tone).toBe("alert")
  })

  it("does not call a player injured once the injury is marked recovered", () => {
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: steady("a"),
      injuries: [injury("a", { is_recovered: true, date_return: daysAgo(60) })],
    }, TODAY)
    expect(out.find(i => i.id === "injured-load-a")).toBeUndefined()
  })

  it("flags a recent return from injury combined with a load spike", () => {
    // The relapse pattern: back ten days ago and already loading hard.
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: spike("a"),
      injuries: [injury("a", { is_recovered: true, date_return: daysAgo(10) })],
    }, TODAY)
    expect(out[0].id).toBe("return-load-a")
    expect(out[0].detail).toContain("10 días")
  })

  it("does not treat an old return as a recent one", () => {
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: spike("a"),
      injuries: [injury("a", { is_recovered: true, date_return: daysAgo(90) })],
    }, TODAY)
    expect(out.find(i => i.id === "return-load-a")).toBeUndefined()
    // ...it's still a plain load spike though.
    expect(out.find(i => i.id === "load-a")).toBeDefined()
  })

  it("reports each player once, with their most serious finding", () => {
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: spike("a"), injuries: [injury("a")],
      evaluations: [evaluation("a", daysAgo(5), { speed_score: 40 }), evaluation("a", daysAgo(40))],
    }, TODAY)
    expect(out.filter(i => i.playerId === "a")).toHaveLength(1)
  })

  it("flags a real drop between two evaluations, naming the attribute", () => {
    const out = physicalInsights({
      ...empty, players: [player("a", "Juan")],
      evaluations: [evaluation("a", daysAgo(5), { resistance_score: 55 }), evaluation("a", daysAgo(40))],
    }, TODAY)
    expect(out[0].title).toBe("Juan bajó 15 puntos en resistencia")
  })

  it("ignores a small wobble between evaluations", () => {
    const out = physicalInsights({
      ...empty, players: [player("a")],
      evaluations: [evaluation("a", daysAgo(5), { speed_score: 63 }), evaluation("a", daysAgo(40))],
    }, TODAY)
    expect(out).toEqual([])
  })

  it("nags about missing effort ratings only for academies that use load tracking", () => {
    const players = [player("a"), player("b")]
    // Nobody has ever logged load: saying "you're missing ratings" would be noise.
    expect(physicalInsights({ ...empty, players, trainings: [training(2)] }, TODAY)).toEqual([])
    // One player logs, the other doesn't, and there was a session this week.
    const out = physicalInsights({ ...empty, players, sessionLoads: steady("a"), trainings: [training(2)] }, TODAY)
    expect(out.find(i => i.id === "missing-rpe")?.title).toContain("b")
  })

  it("orders alerts before everything else", () => {
    const out = physicalInsights({
      ...empty, players: [player("a"), player("b")], sessionLoads: spike("b"),
      evaluations: [evaluation("a", daysAgo(5), { speed_score: 40 }), evaluation("a", daysAgo(40))],
    }, TODAY)
    expect(out[0].tone).toBe("alert")
  })
})

function activity(pid: string, ago: number, value: number, exercise = "Sprint 30m", unit: ActivityUnit = "segundos"): Activity {
  return {
    id: `a-${pid}-${ago}-${value}-${exercise}`, player_id: pid, date: daysAgo(ago), category: "Velocidad",
    exercise, value, unit, intensity: "Media", notes: "", created_at: `${daysAgo(ago)}T10:00:00Z`,
  }
}

const noActs = { players: [player("a", "Thiago"), player("b")], activities: [], trainingExercises: [], trainings: [] }

describe("activityInsights", () => {
  it("knows which direction counts as better", () => {
    expect(lowerIsBetter("segundos")).toBe(true)
    expect(lowerIsBetter("metros")).toBe(false)
    expect(lowerIsBetter("repeticiones")).toBe(false)
  })

  it("reports a group getting faster as an improvement, not a decline", () => {
    // Sprint times dropping from 5.1 to 4.8 seconds is the group improving.
    const out = activityInsights({
      ...noActs,
      activities: [activity("a", 45, 5.1), activity("b", 45, 5.1), activity("a", 5, 4.8), activity("b", 5, 4.8)],
    }, TODAY)
    const trend = out.find(i => i.id.startsWith("trend-"))
    expect(trend?.tone).toBe("good")
    expect(trend?.title).toContain("mejoró")
  })

  it("does not call a single kid's mark a group trend", () => {
    const out = activityInsights({
      ...noActs, activities: [activity("a", 45, 5.1), activity("a", 5, 4.2)],
    }, TODAY)
    expect(out.find(i => i.id.startsWith("trend-"))).toBeUndefined()
  })

  it("celebrates a recent personal best", () => {
    const out = activityInsights({
      ...noActs, activities: [activity("a", 30, 5.0), activity("a", 3, 4.7)],
    }, TODAY)
    const pb = out.find(i => i.id.startsWith("pb-"))
    expect(pb?.title).toBe("Récord personal de Thiago en Sprint 30m")
  })

  it("does not treat a first-ever mark as a record", () => {
    const out = activityInsights({ ...noActs, activities: [activity("a", 3, 4.7)] }, TODAY)
    expect(out.find(i => i.id.startsWith("pb-"))).toBeUndefined()
  })

  it("does not call a slower time a personal best", () => {
    const out = activityInsights({
      ...noActs, activities: [activity("a", 30, 4.7), activity("a", 3, 5.0)],
    }, TODAY)
    expect(out.find(i => i.id.startsWith("pb-"))).toBeUndefined()
  })

  it("lists categories nobody has worked lately", () => {
    const out = activityInsights({ ...noActs, activities: [activity("a", 3, 4.7)] }, TODAY)
    const neglected = out.find(i => i.id === "neglected")
    expect(neglected?.title).toContain("agilidad")
    expect(neglected?.title).not.toContain("velocidad")
  })

  it("stays silent about neglect for an academy with no recent activity at all", () => {
    // Everything would be "neglected" — that's not a finding, it's an empty app.
    expect(activityInsights({ ...noActs, activities: [activity("a", 60, 5.0)] }, TODAY)
      .find(i => i.id === "neglected")).toBeUndefined()
  })
})

describe("physicalInsights on stale or thin data", () => {
  it("ignores an evaluation drop from long ago", () => {
    // Found running against real data: a fall from two years back is not news.
    const out = physicalInsights({
      ...empty, players: [player("a")],
      evaluations: [evaluation("a", daysAgo(700), { technique_score: 50 }), evaluation("a", daysAgo(730))],
    }, TODAY)
    expect(out.find(i => i.id === "eval-drop-a")).toBeUndefined()
  })

  it("explains that load needs history instead of silently saying all clear", () => {
    // Logging has just started: too little to compute a zone for anyone.
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: [load("a", 0, 300)], trainings: [training(0)],
    }, TODAY)
    expect(out.find(i => i.id === "load-building")).toBeDefined()
  })

  it("stops explaining once any player has a baseline", () => {
    const out = physicalInsights({
      ...empty, players: [player("a")], sessionLoads: steady("a"),
    }, TODAY)
    expect(out.find(i => i.id === "load-building")).toBeUndefined()
  })
})
