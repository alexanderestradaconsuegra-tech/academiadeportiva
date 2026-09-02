import { describe, it, expect } from "vitest"
import { occurrencesFor, pendingSessions, HORIZON_DAYS } from "../schedules"
import type { TrainingSchedule } from "../types"

function schedule(overrides: Partial<TrainingSchedule> = {}): TrainingSchedule {
  return {
    id: "sch-1",
    day_of_week: 2, // martes
    time: "18:30",
    title: "",
    category: "Sub-12",
    location: "Cancha municipal",
    notes: "",
    is_active: true,
    created_at: "2026-01-01",
    ...overrides,
  }
}

// 2026-09-01 is a Tuesday.
const TUESDAY = "2026-09-01"

// This generator runs every day. Anything it gets wrong either duplicates a
// session daily, or silently leaves an academy with no sessions at all.
describe("occurrencesFor", () => {
  it("includes the start date when it already falls on the right weekday", () => {
    expect(occurrencesFor(2, TUESDAY, 7)).toEqual([TUESDAY])
  })

  it("returns one date per week across the horizon", () => {
    const dates = occurrencesFor(2, TUESDAY, HORIZON_DAYS)
    expect(dates).toEqual(["2026-09-01", "2026-09-08", "2026-09-15"])
  })

  it("finds the next matching weekday when the range starts elsewhere", () => {
    // Starting Wednesday, the next Tuesday is six days out.
    expect(occurrencesFor(2, "2026-09-02", 7)).toEqual(["2026-09-08"])
  })

  it("handles Sunday, where the weekday index wraps to zero", () => {
    expect(occurrencesFor(0, TUESDAY, 7)).toEqual(["2026-09-06"])
  })

  it("crosses a month boundary without skipping a week", () => {
    const dates = occurrencesFor(2, "2026-09-22", 21)
    expect(dates).toEqual(["2026-09-22", "2026-09-29", "2026-10-06"])
  })
})

describe("pendingSessions", () => {
  const none = new Set<string>()

  it("plans every upcoming date when nothing exists yet", () => {
    const planned = pendingSessions(schedule(), none, none, TUESDAY)
    expect(planned.map(p => p.date)).toEqual(["2026-09-01", "2026-09-08", "2026-09-15"])
  })

  it("never re-creates a session that already exists", () => {
    // The generator runs daily; without this it would duplicate every session
    // once a day, forever.
    const existing = new Set(["2026-09-01", "2026-09-08"])
    const planned = pendingSessions(schedule(), existing, none, TUESDAY)
    expect(planned.map(p => p.date)).toEqual(["2026-09-15"])
  })

  it("respects a single cancelled date without breaking the series", () => {
    // The coach called off one Tuesday. That date stays gone, the rest keep coming.
    const skipped = new Set(["2026-09-08"])
    const planned = pendingSessions(schedule(), none, skipped, TUESDAY)
    expect(planned.map(p => p.date)).toEqual(["2026-09-01", "2026-09-15"])
  })

  it("produces nothing at all for a paused schedule", () => {
    expect(pendingSessions(schedule({ is_active: false }), none, none, TUESDAY)).toEqual([])
  })

  it("carries the schedule's details onto each planned session", () => {
    const [first] = pendingSessions(schedule({ title: "Físico Sub-12" }), none, none, TUESDAY)
    expect(first).toMatchObject({
      schedule_id: "sch-1",
      time: "18:30",
      title: "Físico Sub-12",
      category: "Sub-12",
      location: "Cancha municipal",
    })
  })

  it("names a session after its category when the coach left the title empty", () => {
    const [first] = pendingSessions(schedule({ title: "" }), none, none, TUESDAY)
    expect(first.title).toBe("Entrenamiento Sub-12")
  })
})
