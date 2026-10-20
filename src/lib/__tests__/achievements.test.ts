import { describe, it, expect } from "vitest"
import { computeAchievements, type AttendedSession } from "../achievements"

const TODAY = "2026-10-20"
const s = (date: string, status: AttendedSession["status"]): AttendedSession => ({ date, status })
const get = (list: ReturnType<typeof computeAchievements>, id: string) => list.find(a => a.id === id)!
const run = (sessions: AttendedSession[] = [], evaluations: { date: string; general_score: number }[] = [], injuries: { date_return: string | null; is_recovered: boolean }[] = []) =>
  computeAchievements({ sessions, evaluations, injuries }, TODAY)

describe("streak", () => {
  it("counts back from the latest session and stops at an absence", () => {
    const r = run([s("2026-10-01", "present"), s("2026-10-03", "absent"), s("2026-10-05", "present"), s("2026-10-07", "late"), s("2026-10-09", "present")])
    expect(get(r, "streak").earned).toBe(false)
    expect(get(r, "streak").progress).toEqual({ current: 3, target: 5 })
  })

  it("is earned at five, and an excused absence does not break it", () => {
    const r = run(["01", "03", "05", "07", "09"].map(d => s(`2026-10-${d}`, "present")).concat(s("2026-10-08", "excused")))
    expect(get(r, "streak").earned).toBe(true)
  })

  it("ignores future sessions and ones with no attendance taken", () => {
    const r = run([s("2026-10-19", "present"), s("2026-10-20", null), s("2026-10-25", "absent")])
    expect(get(r, "streak").progress).toEqual({ current: 1, target: 5 })
  })
})

describe("sessions", () => {
  it("shows progress to the first tier, then the tier reached", () => {
    const nine = Array.from({ length: 9 }, (_, i) => s(`2026-09-${String(i + 1).padStart(2, "0")}`, "present"))
    expect(get(run(nine), "sessions")).toMatchObject({ earned: false, progress: { current: 9, target: 10 } })
    const ten = [...nine, s("2026-09-10", "present")]
    expect(get(run(ten), "sessions")).toMatchObject({ earned: true, title: "10 entrenamientos", progress: { current: 10, target: 25 } })
  })
})

describe("perfect month", () => {
  it("needs at least four sessions in 30 days, all attended", () => {
    const three = [s("2026-10-01", "present"), s("2026-10-08", "present"), s("2026-10-15", "present")]
    expect(get(run(three), "perfect_month").earned).toBe(false)
    expect(get(run([...three, s("2026-10-18", "present")]), "perfect_month").earned).toBe(true)
    expect(get(run([...three, s("2026-10-18", "absent")]), "perfect_month").earned).toBe(false)
  })

  it("does not count sessions older than 30 days", () => {
    const old = [s("2026-08-01", "absent"), ...["01", "08", "15", "18"].map(d => s(`2026-10-${d}`, "present"))]
    expect(get(run(old), "perfect_month").earned).toBe(true)
  })
})

describe("best evaluation", () => {
  it("is earned only when the latest beats every earlier one", () => {
    expect(get(run([], [{ date: "2026-09-01", general_score: 70 }, { date: "2026-10-01", general_score: 78 }]), "best_eval").earned).toBe(true)
    expect(get(run([], [{ date: "2026-09-01", general_score: 80 }, { date: "2026-10-01", general_score: 78 }]), "best_eval").earned).toBe(false)
    expect(get(run([], [{ date: "2026-10-01", general_score: 90 }]), "best_eval").earned).toBe(false)
  })
})

describe("comeback", () => {
  it("needs a recovered injury and a session attended after returning", () => {
    const inj = [{ date_return: "2026-10-05", is_recovered: true }]
    expect(get(run([s("2026-10-03", "present")], [], inj), "comeback").earned).toBe(false)
    expect(get(run([s("2026-10-06", "present")], [], inj), "comeback").earned).toBe(true)
    expect(get(run([s("2026-10-06", "present")], [], [{ date_return: null, is_recovered: false }]), "comeback").earned).toBe(false)
  })
})
