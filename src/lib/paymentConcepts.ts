import type { payments as paymentsDict } from "@/lib/i18n/dictionaries/payments"

/** The kinds of charge an academy raises. One list, so every screen offers the same. */
export const CONCEPTS = ["monthly_fee", "enrollment", "uniform", "tournament", "other"] as const
export type Concept = typeof CONCEPTS[number]

export const CONCEPT_KEYS: Record<Concept, keyof typeof paymentsDict> = {
  monthly_fee: "monthlyFee",
  enrollment: "enrollment",
  uniform: "uniform",
  tournament: "tournament",
  other: "otherConcept",
}
