import type { TrainingSchedule } from "./types"

/**
 * Turns a weekly schedule ("Sub-12, martes y jueves 18:30") into the actual
 * dates to create sessions for.
 *
 * Sessions are materialised as real trainings rather than drawn on the fly
 * because attendance, RSVPs and session load all attach to a concrete
 * training row — a virtual occurrence would have nothing to hang them on.
 */

/** How far ahead sessions are created. Three weeks is enough for a parent to plan around. */
export const HORIZON_DAYS = 21

export const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
export const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

/**
 * Dates this schedule should run on, from `fromISO` (inclusive) forward.
 *
 * All arithmetic is UTC: dates are stored as plain YYYY-MM-DD, and doing this
 * in local time in a timezone behind UTC lands sessions on the wrong weekday.
 */
export function occurrencesFor(
  dayOfWeek: number,
  fromISO: string,
  days = HORIZON_DAYS,
): string[] {
  const dates: string[] = []
  const cursor = new Date(fromISO + "T00:00:00Z")
  for (let i = 0; i < days; i++) {
    if (cursor.getUTCDay() === dayOfWeek) {
      dates.push(cursor.toISOString().split("T")[0])
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export interface PlannedSession {
  schedule_id: string
  date: string
  time: string
  title: string
  category: string | null
  location: string
  notes: string
}

/**
 * What still needs creating for one schedule: its upcoming dates minus the
 * ones that already have a session and the ones the coach cancelled.
 *
 * Idempotent by design — this runs daily, so producing anything already
 * present would duplicate a session every single day.
 */
export function pendingSessions(
  schedule: TrainingSchedule,
  existingDates: Set<string>,
  skippedDates: Set<string>,
  fromISO: string,
  days = HORIZON_DAYS,
): PlannedSession[] {
  if (!schedule.is_active) return []

  return occurrencesFor(schedule.day_of_week, fromISO, days)
    .filter(date => !existingDates.has(date) && !skippedDates.has(date))
    .map(date => ({
      schedule_id: schedule.id,
      date,
      time: schedule.time,
      title: schedule.title || defaultTitle(schedule),
      category: schedule.category,
      location: schedule.location,
      notes: schedule.notes,
    }))
}

export function defaultTitle(schedule: Pick<TrainingSchedule, "category">): string {
  return schedule.category ? `Entrenamiento ${schedule.category}` : "Entrenamiento"
}
