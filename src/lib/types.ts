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

export type UserRole = "coach" | "player"

export interface Profile {
  id: string
  role: UserRole
  player_id: string | null
  full_name: string
}

export interface TeamSettings {
  id: string
  name: string
  logo_url: string
  city: string
  founded_year: number | null
  description: string
  updated_at: string
  calib_p0_lat: number | null
  calib_p0_lng: number | null
  calib_p1_lat: number | null
  calib_p1_lng: number | null
  calib_p2_lat: number | null
  calib_p2_lng: number | null
}

export interface Training {
  id: string
  title: string
  date: string
  time: string
  category: Category | null
  location: string
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
