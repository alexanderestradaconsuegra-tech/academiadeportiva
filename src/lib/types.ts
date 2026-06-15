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
