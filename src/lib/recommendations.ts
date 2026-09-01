import type { ActivityCategory, Evaluation, Exercise } from "./types"

/**
 * Turns an evaluation into a training plan: the attributes a player scored
 * lowest on, and the drills the academy already has for those attributes.
 *
 * This is the whole point of the exercise library existing — without it a
 * coach has scores on one screen and a list of drills on another, and has to
 * connect the two in their head for every player, every month.
 */

/**
 * Which evaluation score maps to which exercise category.
 *
 * Pliometría is deliberately absent: evaluations don't score it, so it can
 * never be "weak" — a coach assigns those drills by hand.
 */
export const SCORE_TO_CATEGORY: { field: keyof Evaluation; category: ActivityCategory }[] = [
  { field: "speed_score", category: "Velocidad" },
  { field: "strength_score", category: "Fuerza" },
  { field: "technique_score", category: "Técnica" },
  { field: "resistance_score", category: "Resistencia" },
  { field: "power_score", category: "Potencia" },
  { field: "agility_score", category: "Agilidad" },
]

/** At or above this, an attribute is doing fine and isn't worth a drill. */
export const STRONG_SCORE = 70

export interface WeakArea {
  category: ActivityCategory
  score: number
}

/**
 * The player's weakest scored attributes, worst first.
 *
 * Only returns attributes actually below STRONG_SCORE — a player who is good
 * at everything should see an empty plan, not three drills for skills they
 * have already mastered. Ties break by the order in SCORE_TO_CATEGORY so the
 * output is stable across renders.
 */
export function weakAreas(evaluation: Evaluation, limit = 3): WeakArea[] {
  return SCORE_TO_CATEGORY
    .map(({ field, category }) => ({ category, score: Number(evaluation[field]) }))
    .filter(a => Number.isFinite(a.score) && a.score < STRONG_SCORE)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
}

export interface RecommendedGroup {
  category: ActivityCategory
  score: number
  exercises: Exercise[]
}

/**
 * Drills to work on, grouped by the weak attribute that motivated them.
 *
 * A weak area with no drills in the library still comes back (with an empty
 * list) — that gap is worth showing the coach, since it tells them what to
 * add to the library, rather than silently pretending the weakness isn't there.
 */
export function recommendedExercises(
  evaluation: Evaluation,
  exercises: Exercise[],
  perCategory = 2,
  limit = 3,
): RecommendedGroup[] {
  return weakAreas(evaluation, limit).map(({ category, score }) => ({
    category,
    score,
    exercises: exercises
      .filter(ex => ex.category === category)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, perCategory),
  }))
}
