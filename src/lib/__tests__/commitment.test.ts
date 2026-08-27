import { describe, it, expect } from "vitest"
import { computeCommitment, commitmentLevel } from "../commitment"
import type { Attendance, Training } from "../types"

function training(id: string, date: string): Training {
  return { id, date, category: null, location: null, notes: null, created_at: date } as unknown as Training
}

function attended(trainingId: string, status: Attendance["status"]): Attendance {
  return {
    id: `a-${trainingId}`,
    training_id: trainingId,
    player_id: "p1",
    status,
    rsvp: "pending",
    notes: null,
    created_at: "2026-01-01",
  }
}

describe("commitmentLevel", () => {
  it("maps the four bands at their boundaries", () => {
    expect(commitmentLevel(100)).toBe("ejemplar")
    expect(commitmentLevel(90)).toBe("ejemplar")
    expect(commitmentLevel(89)).toBe("constante")
    expect(commitmentLevel(75)).toBe("constante")
    expect(commitmentLevel(74)).toBe("irregular")
    expect(commitmentLevel(50)).toBe("irregular")
    expect(commitmentLevel(49)).toBe("ausente")
    expect(commitmentLevel(0)).toBe("ausente")
  })
})

describe("computeCommitment", () => {
  it("returns null rather than 0% when there is nothing to judge", () => {
    // A brand-new player must not read as "Ausente" — that would accuse
    // someone who has never had a training to miss.
    const c = computeCommitment([], [])
    expect(c.rate).toBeNull()
    expect(c.level).toBeNull()
  })

  it("counts a full attendance record as 100%", () => {
    const trainings = [training("t1", "2026-01-01"), training("t2", "2026-01-02")]
    const attendance = [attended("t1", "present"), attended("t2", "present")]
    expect(computeCommitment(attendance, trainings).rate).toBe(100)
  })

  it("counts late as half — they showed up, just not on time", () => {
    const trainings = [training("t1", "2026-01-01"), training("t2", "2026-01-02")]
    const attendance = [attended("t1", "present"), attended("t2", "late")]
    expect(computeCommitment(attendance, trainings).rate).toBe(75)
  })

  it("leaves excused absences out of the denominator entirely", () => {
    // Punishing a justified absence is what makes the number feel unfair,
    // so an excused session must not move the rate at all.
    const trainings = [training("t1", "2026-01-01"), training("t2", "2026-01-02")]
    const withExcused = computeCommitment(
      [attended("t1", "present"), attended("t2", "excused")],
      trainings
    )
    expect(withExcused.rate).toBe(100)
    expect(withExcused.excused).toBe(1)
    expect(withExcused.counted).toBe(1)
  })

  it("only scores the most recent trainings, so old attendance cannot mask a recent drop", () => {
    // Ten perfect sessions followed by five missed ones: an all-time average
    // would still read ~67%, which is the exact failure this window exists
    // to prevent.
    const trainings = [
      ...Array.from({ length: 10 }, (_, i) => training(`old${i}`, `2026-01-${String(i + 1).padStart(2, "0")}`)),
      ...Array.from({ length: 5 }, (_, i) => training(`new${i}`, `2026-02-${String(i + 1).padStart(2, "0")}`)),
    ]
    const attendance = [
      ...Array.from({ length: 10 }, (_, i) => attended(`old${i}`, "present")),
      ...Array.from({ length: 5 }, (_, i) => attended(`new${i}`, "absent")),
    ]
    const c = computeCommitment(attendance, trainings)
    expect(c.counted).toBe(10)
    expect(c.rate).toBe(50)
    expect(c.level).toBe("irregular")
  })

  it("ignores attendance rows whose training no longer exists", () => {
    const c = computeCommitment([attended("borrado", "absent")], [training("t1", "2026-01-01")])
    expect(c.rate).toBeNull()
  })

  it("ignores rows with no status — an RSVP is not attendance", () => {
    const trainings = [training("t1", "2026-01-01"), training("t2", "2026-01-02")]
    const c = computeCommitment([attended("t1", "present"), attended("t2", null)], trainings)
    expect(c.counted).toBe(1)
    expect(c.rate).toBe(100)
  })
})
