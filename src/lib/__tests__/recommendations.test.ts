import { describe, it, expect } from "vitest"
import { weakAreas, recommendedExercises, STRONG_SCORE } from "../recommendations"
import type { Evaluation, Exercise, ActivityCategory } from "../types"

function evaluation(scores: Partial<Evaluation> = {}): Evaluation {
  return {
    id: "ev-1",
    player_id: "p1",
    speed_score: 80,
    strength_score: 80,
    technique_score: 80,
    resistance_score: 80,
    power_score: 80,
    agility_score: 80,
    general_score: 80,
    date: "2026-09-01",
    ...scores,
  }
}

function exercise(category: ActivityCategory, name: string): Exercise {
  return { id: `${category}-${name}`, category, name, video_url: "", description: "", created_at: "2026-01-01" }
}

// This decides what a player is told to go practice. Recommending something
// they are already good at wastes the one piece of homework they'll actually
// look at, and missing a real weakness defeats the purpose entirely.
describe("weakAreas", () => {
  it("returns nothing when every attribute is strong", () => {
    expect(weakAreas(evaluation())).toEqual([])
  })

  it("only counts attributes below the strong threshold", () => {
    const areas = weakAreas(evaluation({ speed_score: STRONG_SCORE - 1, agility_score: STRONG_SCORE }))
    expect(areas).toEqual([{ category: "Velocidad", score: STRONG_SCORE - 1 }])
  })

  it("orders the weakest attribute first", () => {
    const areas = weakAreas(evaluation({ speed_score: 60, agility_score: 40, technique_score: 55 }))
    expect(areas.map(a => a.category)).toEqual(["Agilidad", "Técnica", "Velocidad"])
  })

  it("caps how many weaknesses come back", () => {
    // Everything is weak — a player shouldn't get handed six areas at once.
    const all = evaluation({
      speed_score: 10, strength_score: 20, technique_score: 30,
      resistance_score: 40, power_score: 50, agility_score: 60,
    })
    expect(weakAreas(all)).toHaveLength(3)
    expect(weakAreas(all, 2)).toHaveLength(2)
  })

  it("never suggests Pliometría, which evaluations don't score", () => {
    const all = evaluation({
      speed_score: 10, strength_score: 10, technique_score: 10,
      resistance_score: 10, power_score: 10, agility_score: 10,
    })
    expect(weakAreas(all, 10).map(a => a.category)).not.toContain("Pliometría")
  })
})

describe("recommendedExercises", () => {
  const library = [
    exercise("Agilidad", "Escalera de coordinación"),
    exercise("Agilidad", "Conos en zigzag"),
    exercise("Agilidad", "Cambios de dirección"),
    exercise("Velocidad", "Sprint 30m"),
    exercise("Fuerza", "Sentadillas"),
  ]

  it("only pulls drills from the weak category", () => {
    const [group] = recommendedExercises(evaluation({ agility_score: 40 }), library)
    expect(group.category).toBe("Agilidad")
    expect(group.exercises.every(ex => ex.category === "Agilidad")).toBe(true)
  })

  it("limits how many drills each weakness produces", () => {
    const [group] = recommendedExercises(evaluation({ agility_score: 40 }), library, 2)
    expect(group.exercises).toHaveLength(2)
  })

  it("still reports a weakness the library has no drills for", () => {
    // The gap is the useful signal: it tells the coach what to add.
    const [group] = recommendedExercises(evaluation({ resistance_score: 30 }), library)
    expect(group.category).toBe("Resistencia")
    expect(group.exercises).toEqual([])
  })

  it("returns nothing to work on for a player with no weak areas", () => {
    expect(recommendedExercises(evaluation(), library)).toEqual([])
  })
})
