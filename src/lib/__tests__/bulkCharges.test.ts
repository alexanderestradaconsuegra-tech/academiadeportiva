import { describe, it, expect } from "vitest"
import { planBulkCharges, bulkTotal } from "../bulkCharges"
import type { Player } from "../types"

function player(id: string, category: Player["category"] = "Sub-12"): Player {
  return { id, name: id, category } as Player
}

const players = [player("a"), player("b"), player("c", "Sub-10"), player("d", "Sub-10")]
const DUE = "2026-10-01"

function plan(over: Partial<Parameters<typeof planBulkCharges>[0]> = {}) {
  return planBulkCharges({
    players, payments: [], concept: "enrollment", dueDate: DUE, target: { kind: "all" }, ...over,
  })
}

// Money goes to real families here. Charging someone twice, or losing a whole
// batch to one repeated row, are both failures a coach would notice on the phone.
describe("planBulkCharges", () => {
  it("charges the whole academy", () => {
    expect(plan().toCreate.map(p => p.id)).toEqual(["a", "b", "c", "d"])
  })

  it("charges only one category", () => {
    const out = plan({ target: { kind: "category", category: "Sub-10" } })
    expect(out.toCreate.map(p => p.id)).toEqual(["c", "d"])
  })

  it("charges only the players picked", () => {
    expect(plan({ target: { kind: "players", ids: ["b", "d"] } }).toCreate.map(p => p.id)).toEqual(["b", "d"])
  })

  it("ignores a picked id that no longer matches a player", () => {
    // Deleted between opening the list and confirming: no orphan charge.
    expect(plan({ target: { kind: "players", ids: ["b", "ghost"] } }).toCreate.map(p => p.id)).toEqual(["b"])
  })

  it("skips a player who already has this exact charge, and says so", () => {
    const out = plan({ payments: [{ player_id: "a", concept: "enrollment", due_date: DUE }] })
    expect(out.toCreate.map(p => p.id)).toEqual(["b", "c", "d"])
    expect(out.alreadyHave.map(p => p.id)).toEqual(["a"])
  })

  it("does not skip someone whose existing charge is a different concept", () => {
    // Enrollment and a uniform on the same date are two legitimate charges.
    const out = plan({ payments: [{ player_id: "a", concept: "uniform", due_date: DUE }] })
    expect(out.toCreate.map(p => p.id)).toContain("a")
  })

  it("does not skip someone whose existing charge is a different date", () => {
    const out = plan({ payments: [{ player_id: "a", concept: "enrollment", due_date: "2026-09-01" }] })
    expect(out.toCreate.map(p => p.id)).toContain("a")
  })

  it("running it twice creates nothing the second time", () => {
    const first = plan()
    const payments = first.toCreate.map(p => ({ player_id: p.id, concept: "enrollment", due_date: DUE }))
    const second = plan({ payments })
    expect(second.toCreate).toEqual([])
    expect(second.alreadyHave).toHaveLength(4)
  })

  it("returns an empty plan for an empty academy or category", () => {
    expect(plan({ players: [] }).toCreate).toEqual([])
    expect(plan({ target: { kind: "category", category: "Senior" } }).toCreate).toEqual([])
  })
})

describe("bulkTotal", () => {
  it("multiplies without floating-point drift", () => {
    expect(bulkTotal(87, 55000)).toBe(4785000)
    expect(bulkTotal(3, 0.1)).toBe(0.3)
  })
})
