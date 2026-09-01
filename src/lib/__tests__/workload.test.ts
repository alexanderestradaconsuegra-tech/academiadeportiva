import { describe, it, expect } from "vitest"
import { workloadSummary, weeklyLoads, zoneForRatio, ACUTE_DAYS } from "../workload"
import type { SessionLoad } from "../types"

/** Builds a session `daysAgo` before the reference date, with a given load. */
function session(daysAgo: number, load: number, todayISO = "2026-09-01"): SessionLoad {
  const d = new Date(todayISO + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return {
    id: `s-${daysAgo}-${load}`,
    player_id: "p1",
    training_id: null,
    date: d.toISOString().split("T")[0],
    rpe: 5,
    duration_min: load / 5,
    load,
    notes: null,
    logged_by_coach: false,
    created_at: "2026-01-01",
  }
}

const TODAY = "2026-09-01"

// This drives an injury-risk flag shown to a coach about a child. A wrong
// zone either cries wolf until the flag is ignored, or stays quiet through
// exactly the load spike it exists to catch.
describe("workloadSummary", () => {
  it("reports sin_datos when there is no history to compare against", () => {
    const summary = workloadSummary([], TODAY)
    expect(summary.ratio).toBeNull()
    expect(summary.zone).toBe("sin_datos")
  })

  it("does not flag risk off a single session with no baseline month", () => {
    // One hard session in an empty month is not evidence of anything, and a
    // false "riesgo alto" here trains the coach to ignore the real one.
    const summary = workloadSummary([session(0, 600)], TODAY)
    expect(summary.zone).toBe("sin_datos")
  })

  it("stays quiet until there is a real month of history behind the ratio", () => {
    // Two sessions three days apart is not a baseline, however hard they were.
    const summary = workloadSummary([session(0, 900), session(3, 900)], TODAY)
    expect(summary.zone).toBe("sin_datos")
    // ...but the raw load is still reported, so the coach sees the sessions.
    expect(summary.acute).toBe(1800)
  })

  it("starts rating once enough history has accumulated", () => {
    const loads = [session(0, 400), session(7, 400), session(14, 400), session(21, 400)]
    expect(workloadSummary(loads, TODAY).zone).toBe("optimo")
  })

  it("reads as optimal when this week matches the monthly baseline", () => {
    // Same load every week for four weeks: acute equals the weekly average.
    const loads = [0, 7, 14, 21].map(d => session(d, 400))
    const summary = workloadSummary(loads, TODAY)
    expect(summary.acute).toBe(400)
    expect(summary.chronic).toBe(400)
    expect(summary.ratio).toBe(1)
    expect(summary.zone).toBe("optimo")
  })

  it("flags a sharp jump above the player's own baseline as high risk", () => {
    const loads = [session(0, 1200), session(7, 300), session(14, 300), session(21, 300)]
    const summary = workloadSummary(loads, TODAY)
    // Acute 1200 against a weekly baseline of 525 → 2.29
    expect(summary.ratio).toBeGreaterThan(1.5)
    expect(summary.zone).toBe("riesgo")
  })

  it("flags an undertrained week as low rather than fine", () => {
    const loads = [session(0, 100), session(7, 500), session(14, 500), session(21, 500)]
    expect(workloadSummary(loads, TODAY).zone).toBe("bajo")
  })

  it("counts only the last 7 days as acute", () => {
    const summary = workloadSummary([session(ACUTE_DAYS - 1, 100), session(ACUTE_DAYS, 999)], TODAY)
    expect(summary.acute).toBe(100)
    expect(summary.acuteSessions).toBe(1)
  })

  it("drops sessions older than the 28-day window entirely", () => {
    const summary = workloadSummary([session(28, 5000), session(0, 100)], TODAY)
    expect(summary.chronic).toBe(25) // only the 100, spread over four weeks
  })

  it("ignores future-dated sessions instead of counting them as this week", () => {
    // Training that hasn't happened must not inflate the current load.
    const loads = [session(-3, 900), session(0, 200), session(7, 200), session(14, 200), session(21, 200)]
    const summary = workloadSummary(loads, TODAY)
    expect(summary.acute).toBe(200)
  })
})

describe("zoneForRatio", () => {
  it("puts the sweet-spot boundaries on the right side", () => {
    expect(zoneForRatio(0.79)).toBe("bajo")
    expect(zoneForRatio(0.8)).toBe("optimo")
    expect(zoneForRatio(1.3)).toBe("optimo")
    expect(zoneForRatio(1.31)).toBe("precaucion")
    expect(zoneForRatio(1.5)).toBe("precaucion")
    expect(zoneForRatio(1.51)).toBe("riesgo")
  })
})

describe("weeklyLoads", () => {
  it("returns the requested number of weeks, oldest first", () => {
    const weeks = weeklyLoads([session(0, 100), session(7, 200), session(14, 300), session(21, 400)], TODAY)
    expect(weeks.map(w => w.total)).toEqual([400, 300, 200, 100])
  })

  it("reports an empty week as zero rather than skipping it", () => {
    // A gap in the middle is information — the chart must not close it up.
    const weeks = weeklyLoads([session(0, 100), session(14, 300)], TODAY)
    expect(weeks.map(w => w.total)).toEqual([0, 300, 0, 100])
  })
})
