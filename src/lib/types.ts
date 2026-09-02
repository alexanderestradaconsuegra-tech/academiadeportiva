export type Language = "es" | "en" | "pt"

export type Position =
  | "Portero"
  | "Defensa Central"
  | "Lateral Derecho"
  | "Lateral Izquierdo"
  | "Mediocampista Defensivo"
  | "Mediocampista Central"
  | "Mediocampista Ofensivo"
  | "Extremo Derecho"
  | "Extremo Izquierdo"
  | "Delantero Centro"
  | "Segundo Delantero"

export type DominantFoot = "Derecha" | "Izquierda" | "Ambidiestro"

export type Category =
  | "Sub-10"
  | "Sub-12"
  | "Sub-14"
  | "Sub-16"
  | "Sub-18"
  | "Juvenil"
  | "Senior"

export type ActivityCategory =
  | "Velocidad"
  | "Fuerza"
  | "Técnica"
  | "Resistencia"
  | "Potencia"
  | "Pliometría"
  | "Agilidad"

export type ActivityUnit =
  | "segundos"
  | "kg"
  | "repeticiones"
  | "metros"
  | "puntos"

export type Intensity = "Baja" | "Media" | "Alta"

export interface Player {
  id: string
  name: string
  photo_url: string
  age: number
  birth_date: string
  position: Position
  dominant_foot: DominantFoot
  height: number
  weight: number
  club: string
  category: Category
  objective: string
  notes: string
  created_at: string
}

export interface Activity {
  id: string
  player_id: string
  date: string
  category: ActivityCategory
  exercise: string
  value: number
  unit: ActivityUnit
  intensity: Intensity
  notes: string
  created_at: string
}

export interface Exercise {
  id: string
  category: ActivityCategory
  name: string
  video_url: string // link de referencia (ej. YouTube) mostrando la técnica correcta
  description: string // cómo ejecutarlo: "3 series de 10, descanso 40s"
  created_at: string
}

/**
 * Carga de una sesión: esfuerzo percibido (1-10) x minutos. Es la base del
 * control de carga aguda:crónica que se usa para anticipar lesiones.
 */
export interface SessionLoad {
  id: string
  player_id: string
  training_id: string | null
  date: string
  rpe: number
  duration_min: number
  load: number
  notes: string | null
  logged_by_coach: boolean
  created_at: string
}

/** Un ejercicio que el coach le asignó a un jugador — su "plan de trabajo". */
export interface ExerciseAssignment {
  id: string
  player_id: string
  exercise_id: string
  note: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export interface Evaluation {
  id: string
  player_id: string
  speed_score: number
  strength_score: number
  technique_score: number
  resistance_score: number
  power_score: number
  agility_score: number
  general_score: number
  date: string
}

export interface PlayerWithStats extends Player {
  latest_evaluation?: Evaluation
  activities_count?: number
  progress_trend?: number
}

export type PaymentStatus = "pending" | "paid" | "overdue" | "en_revision"

export interface Payment {
  id: string
  player_id: string
  concept: string
  amount: number
  due_date: string
  paid_date: string | null
  status: "pending" | "paid" | "en_revision"
  notes: string | null
  created_at: string
  receipt_path?: string | null
  receipt_note?: string | null
  receipt_uploaded_at?: string | null
  rejection_note?: string | null
}

/** Days after due_date before an unpaid payment reads as "Vencido" instead of "Pendiente". */
export const PAYMENT_GRACE_DAYS = 5

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split("T")[0]
}

export function effectivePaymentStatus(payment: Payment, today: string): PaymentStatus {
  if (payment.status === "paid") return "paid"
  if (payment.status === "en_revision") return "en_revision"
  const overdueFrom = addDaysToDateString(payment.due_date, PAYMENT_GRACE_DAYS)
  return today >= overdueFrom ? "overdue" : "pending"
}

/**
 * Which month's monthly-fee charge to generate, given today's date.
 *
 * Normally the 1st of the current month. But if a coach turns on the
 * monthly fee for the first time (or the generator runs) late enough in the
 * month that a charge dated the 1st would already read as overdue under the
 * grace period, that would backdate a debt the family never actually missed
 * — so it skips straight to next month's 1st instead.
 */
export function resolveMonthlyChargeDate(today: string): string {
  const currentMonthFirst = today.slice(0, 7) + "-01"
  const overdueFrom = addDaysToDateString(currentMonthFirst, PAYMENT_GRACE_DAYS)
  if (today >= overdueFrom) {
    const d = new Date(currentMonthFirst + "T00:00:00Z")
    d.setUTCMonth(d.getUTCMonth() + 1)
    return d.toISOString().split("T")[0]
  }
  return currentMonthFirst
}

// ── Gastos de la academia ────────────────────────────────────────────────

export type ExpenseCategory = "arriendo" | "sueldos" | "implementos" | "servicios" | "otro"

export interface Expense {
  id: string
  category: ExpenseCategory
  concept: string
  amount: number
  date: string
  is_recurring: boolean
  notes: string | null
  created_at: string
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  arriendo: "Arriendo de cancha",
  sueldos: "Sueldos",
  implementos: "Implementos",
  servicios: "Servicios (luz, agua, internet)",
  otro: "Otro",
}

export type InjurySeverity = "minor" | "moderate" | "severe"

export interface Injury {
  id: string
  player_id: string
  body_part: string
  injury_type: string
  severity: InjurySeverity
  date_start: string
  date_return: string | null
  is_recovered: boolean
  notes: string | null
  created_at: string
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused"
export type RsvpStatus = "confirmed" | "declined" | "pending"

export interface Attendance {
  id: string
  training_id: string
  player_id: string
  status: AttendanceStatus | null
  rsvp: RsvpStatus
  notes: string | null
  created_at: string
}

export interface PhysicalTest {
  id: string
  player_id: string
  test_type: string
  value: number
  unit: string
  date: string
  notes: string | null
  created_at: string
}

export type UserRole = "coach" | "player" | "assistant"

export interface Profile {
  id: string
  role: UserRole
  player_id: string | null
  full_name: string
  academy_id: string | null
  category: Category | null
}

export interface TeamSettings {
  id: string
  name: string
  logo_url: string
  city: string
  founded_year: number | null
  description: string
  language: Language
  updated_at: string
  monthly_fee: number | null
  calib_p0_lat: number | null
  calib_p0_lng: number | null
  calib_p1_lat: number | null
  calib_p1_lng: number | null
  calib_p2_lat: number | null
  calib_p2_lng: number | null
  trial_expires_at: string | null
  activation_code: string | null
  subscription_status: string | null
  subscription_current_period_end: string | null
  mp_payment_id: string | null
  mp_plan: string | null
  mp_preapproval_id: string | null
}

export interface Training {
  id: string
  title: string
  date: string
  time: string
  category: Category | null
  location: string
  notes: string
  /** Qué horario fijo generó esta sesión, si vino de uno. */
  schedule_id: string | null
  created_at: string
}

/** Horario fijo semanal: "Sub-12 entrena martes 18:30 en la cancha municipal". */
export interface TrainingSchedule {
  id: string
  day_of_week: number // 0 = domingo
  time: string
  title: string
  category: Category | null
  location: string
  notes: string
  is_active: boolean
  created_at: string
}

// ── Partidos ───────────────────────────────────────────────────────────────

export interface Match {
  id: string
  opponent: string
  competition: string
  date: string
  time: string
  location: string
  is_home: boolean
  category: Category | null
  our_score: number | null
  opponent_score: number | null
  video_url: string // link al video/replay de la cámara 360 (Veo, Pixellot, etc.)
  notes: string
  created_at: string
}

export interface MatchPlayerStat {
  id: string
  match_id: string
  player_id: string
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  rating: number | null
  position_played: string
  highlight_url: string // link al clip individual generado por la cámara 360
  notes: string
  created_at: string
}

// ── Health / Biometrics ────────────────────────────────────────────────────

export type HRZone = "reposo" | "calentamiento" | "aeróbica" | "anaeróbica" | "máxima"

export interface HealthProfile {
  id: string
  player_id: string
  resting_hr: number          // bpm en reposo
  max_hr: number              // bpm máximo (220 - edad estimado)
  hrv: number                 // HRV ms
  vo2max: number              // mL/kg/min estimado
  recovery_index: number      // 0–100
  blood_pressure_sys: number  // mmHg sistólica
  blood_pressure_dia: number  // mmHg diastólica
  weight: number              // kg (puede variar con el tiempo)
  body_fat_pct: number        // % grasa corporal
  date: string
}

export interface LiveSession {
  id: string
  player_id: string
  started_at: string
  ended_at?: string
  device_name?: string
  device_type: "polar_h10" | "wahoo_tickr" | "garmin_hrm" | "generic_ble" | "manual"
  hr_samples: HRSample[]      // muestras de ritmo cardíaco
  speed_samples: SpeedSample[]
  avg_hr: number
  max_hr_session: number
  min_hr_session: number
  avg_speed_kmh: number
  max_speed_kmh: number
  distance_m: number
  duration_s: number
  calories_est: number
  notes: string
}

export interface HRSample {
  ts: number   // timestamp relativo en segundos desde inicio
  bpm: number
  zone: HRZone
}

export interface SpeedSample {
  ts: number
  kmh: number
  lat?: number
  lng?: number
}

// ── Mapas de calor (posiciones en cancha) ──────────────────────────────────

export interface PositionSample {
  id: string
  player_id: string
  session_label: string
  x: number
  y: number
  created_at: string
}

// ── Convocatoria (Squad Lineup) ─────────────────────────────────────────────

export interface ConvocatoriaPlayer {
  id: string
  convocatoria_id: string
  player_id: string
  position_label: string
  x: number  // 0-100 percent on pitch width
  y: number  // 0-100 percent on pitch height
  instruction: string
  confirmed: boolean | null  // null = pending, true = confirmed, false = declined
  created_at: string
}

export interface Convocatoria {
  id: string
  match_id: string
  academy_id: string | null
  formation: string
  notes: string
  created_at: string
  players: ConvocatoriaPlayer[]
}
