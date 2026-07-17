import type { Player, Activity, Evaluation, HealthProfile, LiveSession, HRSample } from "./types"

export const MOCK_PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Carlos Andrés Martínez",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos&backgroundColor=0B5CFF",
    age: 17,
    birth_date: "2007-03-15",
    position: "Delantero Centro",
    dominant_foot: "Derecha",
    height: 178,
    weight: 72,
    club: "Academia FutbolMetrics",
    category: "Otra",
    objective: "Llegar al fútbol profesional y representar la selección nacional",
    notes: "Jugador con gran potencial ofensivo. Necesita mejorar juego aéreo.",
    created_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "p2",
    name: "Sebastián López Torres",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian&backgroundColor=0B5CFF",
    age: 15,
    birth_date: "2009-07-22",
    position: "Mediocampista Central",
    dominant_foot: "Izquierda",
    height: 171,
    weight: 65,
    club: "Academia FutbolMetrics",
    category: "Otra",
    objective: "Desarrollar visión de juego y liderazgo en el campo",
    notes: "Excelente distribuidor del balón. Líder natural del equipo.",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "p3",
    name: "Diego Alejandro Ruiz",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=diego&backgroundColor=071B4D",
    age: 16,
    birth_date: "2008-11-08",
    position: "Lateral Derecho",
    dominant_foot: "Derecha",
    height: 175,
    weight: 70,
    club: "Academia FutbolMetrics",
    category: "Otra",
    objective: "Especializarse en la posición de lateral y mejorar el cruce",
    notes: "Gran velocidad en banda. Debe mejorar en defensa individual.",
    created_at: "2024-02-01T08:30:00Z",
  },
  {
    id: "p4",
    name: "Mateo García Velandia",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=mateo&backgroundColor=0B5CFF",
    age: 14,
    birth_date: "2010-05-30",
    position: "Portero",
    dominant_foot: "Derecha",
    height: 182,
    weight: 78,
    club: "Academia FutbolMetrics",
    category: "Sub-14",
    objective: "Perfeccionar reflejos y salidas del área",
    notes: "Muy buen portero para su edad. Excelente entre los tres palos.",
    created_at: "2024-02-10T11:00:00Z",
  },
  {
    id: "p5",
    name: "Julián Esteban Herrera",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=julian&backgroundColor=071B4D",
    age: 18,
    birth_date: "2006-09-12",
    position: "Extremo Izquierdo",
    dominant_foot: "Izquierda",
    height: 173,
    weight: 68,
    club: "Academia FutbolMetrics",
    category: "Otra",
    objective: "Consolidarse como extremo y aumentar efectividad en gol",
    notes: "Regateador nato. Necesita mejorar la toma de decisiones.",
    created_at: "2024-02-20T09:30:00Z",
  },
  {
    id: "p6",
    name: "Felipe Antonio Ospina",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felipe&backgroundColor=0B5CFF",
    age: 13,
    birth_date: "2011-01-18",
    position: "Defensa Central",
    dominant_foot: "Derecha",
    height: 168,
    weight: 60,
    club: "Academia FutbolMetrics",
    category: "Sub-14",
    objective: "Construir una sólida base defensiva y mejorar el juego aéreo",
    notes: "Muy inteligente tácticamente para su edad.",
    created_at: "2024-03-05T14:00:00Z",
  },
]

export const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: "e1",
    player_id: "p1",
    speed_score: 88,
    strength_score: 79,
    technique_score: 85,
    resistance_score: 82,
    power_score: 86,
    agility_score: 84,
    general_score: 84,
    date: "2024-11-01",
  },
  {
    id: "e2",
    player_id: "p2",
    speed_score: 76,
    strength_score: 72,
    technique_score: 91,
    resistance_score: 85,
    power_score: 74,
    agility_score: 83,
    general_score: 80,
    date: "2024-11-01",
  },
  {
    id: "e3",
    player_id: "p3",
    speed_score: 92,
    strength_score: 74,
    technique_score: 78,
    resistance_score: 80,
    power_score: 82,
    agility_score: 90,
    general_score: 83,
    date: "2024-11-01",
  },
  {
    id: "e4",
    player_id: "p4",
    speed_score: 70,
    strength_score: 80,
    technique_score: 82,
    resistance_score: 78,
    power_score: 76,
    agility_score: 77,
    general_score: 77,
    date: "2024-11-01",
  },
  {
    id: "e5",
    player_id: "p5",
    speed_score: 91,
    strength_score: 68,
    technique_score: 88,
    resistance_score: 77,
    power_score: 80,
    agility_score: 93,
    general_score: 83,
    date: "2024-11-01",
  },
  {
    id: "e6",
    player_id: "p6",
    speed_score: 65,
    strength_score: 70,
    technique_score: 72,
    resistance_score: 74,
    power_score: 68,
    agility_score: 69,
    general_score: 70,
    date: "2024-11-01",
  },
  // Historical evaluations for charts
  { id: "e1b", player_id: "p1", speed_score: 82, strength_score: 74, technique_score: 80, resistance_score: 77, power_score: 80, agility_score: 78, general_score: 79, date: "2024-09-01" },
  { id: "e1c", player_id: "p1", speed_score: 85, strength_score: 76, technique_score: 82, resistance_score: 79, power_score: 83, agility_score: 81, general_score: 81, date: "2024-10-01" },
  { id: "e2b", player_id: "p2", speed_score: 72, strength_score: 69, technique_score: 87, resistance_score: 80, power_score: 70, agility_score: 79, general_score: 76, date: "2024-09-01" },
  { id: "e2c", player_id: "p2", speed_score: 74, strength_score: 71, technique_score: 89, resistance_score: 82, power_score: 72, agility_score: 81, general_score: 78, date: "2024-10-01" },
  { id: "e5b", player_id: "p5", speed_score: 87, strength_score: 64, technique_score: 84, resistance_score: 72, power_score: 76, agility_score: 89, general_score: 79, date: "2024-09-01" },
  { id: "e5c", player_id: "p5", speed_score: 89, strength_score: 66, technique_score: 86, resistance_score: 74, power_score: 78, agility_score: 91, general_score: 81, date: "2024-10-01" },
]

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "a1", player_id: "p1", date: "2024-11-10", category: "Velocidad", exercise: "Sprint 40m", value: 5.2, unit: "segundos", intensity: "Alta", notes: "Mejor tiempo personal", created_at: "2024-11-10T10:00:00Z" },
  { id: "a2", player_id: "p1", date: "2024-11-08", category: "Técnica", exercise: "Conducción de balón slalom", value: 92, unit: "puntos", intensity: "Media", notes: "Excelente control", created_at: "2024-11-08T10:00:00Z" },
  { id: "a3", player_id: "p1", date: "2024-11-06", category: "Fuerza", exercise: "Sentadilla", value: 85, unit: "kg", intensity: "Alta", notes: "", created_at: "2024-11-06T10:00:00Z" },
  { id: "a4", player_id: "p1", date: "2024-11-04", category: "Resistencia", exercise: "Cooper Test", value: 2800, unit: "metros", intensity: "Alta", notes: "Muy buen resultado", created_at: "2024-11-04T10:00:00Z" },
  { id: "a5", player_id: "p2", date: "2024-11-10", category: "Técnica", exercise: "Pases de precisión", value: 95, unit: "puntos", intensity: "Media", notes: "Técnica impecable", created_at: "2024-11-10T10:00:00Z" },
  { id: "a6", player_id: "p2", date: "2024-11-09", category: "Resistencia", exercise: "Carrera continua 5km", value: 1320, unit: "segundos", intensity: "Media", notes: "", created_at: "2024-11-09T10:00:00Z" },
  { id: "a7", player_id: "p3", date: "2024-11-10", category: "Velocidad", exercise: "Sprint 60m", value: 7.1, unit: "segundos", intensity: "Alta", notes: "Nuevo récord personal", created_at: "2024-11-10T10:00:00Z" },
  { id: "a8", player_id: "p3", date: "2024-11-07", category: "Agilidad", exercise: "Escalera de agilidad", value: 88, unit: "puntos", intensity: "Alta", notes: "", created_at: "2024-11-07T10:00:00Z" },
  { id: "a9", player_id: "p4", date: "2024-11-10", category: "Técnica", exercise: "Atajadas al arco", value: 82, unit: "puntos", intensity: "Alta", notes: "", created_at: "2024-11-10T10:00:00Z" },
  { id: "a10", player_id: "p5", date: "2024-11-10", category: "Agilidad", exercise: "Slalom con balón", value: 91, unit: "puntos", intensity: "Alta", notes: "Dominó el ejercicio", created_at: "2024-11-10T10:00:00Z" },
  { id: "a11", player_id: "p5", date: "2024-11-09", category: "Velocidad", exercise: "Sprint 30m", value: 3.8, unit: "segundos", intensity: "Alta", notes: "Excelente arrancada", created_at: "2024-11-09T10:00:00Z" },
  { id: "a12", player_id: "p1", date: "2024-11-02", category: "Potencia", exercise: "Salto vertical", value: 58, unit: "metros", intensity: "Alta", notes: "", created_at: "2024-11-02T10:00:00Z" },
  { id: "a13", player_id: "p6", date: "2024-11-08", category: "Fuerza", exercise: "Press de banca", value: 55, unit: "kg", intensity: "Media", notes: "Progreso constante", created_at: "2024-11-08T10:00:00Z" },
  { id: "a14", player_id: "p6", date: "2024-11-06", category: "Resistencia", exercise: "Fartlek 20min", value: 20, unit: "repeticiones", intensity: "Media", notes: "", created_at: "2024-11-06T10:00:00Z" },
]

// ── Health Profiles ──────────────────────────────────────────────────────
export const MOCK_HEALTH_PROFILES: HealthProfile[] = [
  { id: "h1", player_id: "p1", resting_hr: 58, max_hr: 203, hrv: 72, vo2max: 54.2, recovery_index: 88, blood_pressure_sys: 118, blood_pressure_dia: 74, weight: 72, body_fat_pct: 10.2, date: "2024-11-01" },
  { id: "h2", player_id: "p2", resting_hr: 62, max_hr: 205, hrv: 65, vo2max: 51.8, recovery_index: 82, blood_pressure_sys: 116, blood_pressure_dia: 72, weight: 65, body_fat_pct: 11.5, date: "2024-11-01" },
  { id: "h3", player_id: "p3", resting_hr: 55, max_hr: 204, hrv: 78, vo2max: 56.1, recovery_index: 91, blood_pressure_sys: 114, blood_pressure_dia: 70, weight: 70, body_fat_pct: 9.8, date: "2024-11-01" },
  { id: "h4", player_id: "p4", resting_hr: 64, max_hr: 206, hrv: 60, vo2max: 49.5, recovery_index: 76, blood_pressure_sys: 120, blood_pressure_dia: 76, weight: 78, body_fat_pct: 14.1, date: "2024-11-01" },
  { id: "h5", player_id: "p5", resting_hr: 52, max_hr: 202, hrv: 85, vo2max: 57.3, recovery_index: 93, blood_pressure_sys: 112, blood_pressure_dia: 68, weight: 68, body_fat_pct: 9.1, date: "2024-11-01" },
  { id: "h6", player_id: "p6", resting_hr: 68, max_hr: 207, hrv: 55, vo2max: 46.2, recovery_index: 70, blood_pressure_sys: 122, blood_pressure_dia: 78, weight: 60, body_fat_pct: 15.3, date: "2024-11-01" },
]

// ── Mock Live Sessions ───────────────────────────────────────────────────
function genHRSamples(durationS: number, baseHR: number, maxHR: number): HRSample[] {
  const samples: HRSample[] = []
  let hr = baseHR
  for (let t = 0; t <= durationS; t += 5) {
    const phase = t / durationS
    let target = phase < 0.1 ? baseHR + 20 :
                 phase < 0.5 ? baseHR + 60 + (maxHR - baseHR - 60) * ((phase - 0.1) / 0.4) :
                 phase < 0.8 ? maxHR - 10 + Math.random() * 15 :
                 baseHR + 40 - (phase - 0.8) / 0.2 * 30
    hr = hr * 0.85 + target * 0.15 + (Math.random() - 0.5) * 4
    hr = Math.max(baseHR - 5, Math.min(maxHR, hr))
    const bpm = Math.round(hr)
    const pct = (bpm - baseHR) / (maxHR - baseHR)
    const zone = pct < 0.1 ? "reposo" : pct < 0.35 ? "calentamiento" : pct < 0.6 ? "aeróbica" : pct < 0.8 ? "anaeróbica" : "máxima"
    samples.push({ ts: t, bpm, zone })
  }
  return samples
}

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: "ls1", player_id: "p1", started_at: "2024-11-10T09:00:00Z", ended_at: "2024-11-10T09:45:00Z",
    device_name: "Polar H10 - Carlos", device_type: "polar_h10",
    hr_samples: genHRSamples(2700, 58, 188), speed_samples: [],
    avg_hr: 162, max_hr_session: 188, min_hr_session: 58, avg_speed_kmh: 14.2,
    max_speed_kmh: 28.6, distance_m: 5340, duration_s: 2700, calories_est: 612, notes: "Sesión de pressing y sprints",
  },
  {
    id: "ls2", player_id: "p5", started_at: "2024-11-09T10:00:00Z", ended_at: "2024-11-09T10:40:00Z",
    device_name: "Wahoo TICKR - Julián", device_type: "wahoo_tickr",
    hr_samples: genHRSamples(2400, 52, 185), speed_samples: [],
    avg_hr: 158, max_hr_session: 185, min_hr_session: 52, avg_speed_kmh: 16.1,
    max_speed_kmh: 31.2, distance_m: 6420, duration_s: 2400, calories_est: 548, notes: "Trabajo de agilidad y velocidad",
  },
  {
    id: "ls3", player_id: "p3", started_at: "2024-11-08T08:30:00Z", ended_at: "2024-11-08T09:15:00Z",
    device_name: "Garmin HRM-Pro - Diego", device_type: "garmin_hrm",
    hr_samples: genHRSamples(2700, 55, 190), speed_samples: [],
    avg_hr: 165, max_hr_session: 190, min_hr_session: 55, avg_speed_kmh: 15.5,
    max_speed_kmh: 32.1, distance_m: 6980, duration_s: 2700, calories_est: 631, notes: "Trabajo de laterales y cruces",
  },
]

export const PROGRESS_DATA = [
  { month: "Jul", score: 72 },
  { month: "Ago", score: 74 },
  { month: "Sep", score: 77 },
  { month: "Oct", score: 79 },
  { month: "Nov", score: 82 },
  { month: "Dic", score: 84 },
]

export const CATEGORY_SCORES = [
  { name: "Velocidad", score: 82, fill: "#F59E0B" },
  { name: "Fuerza", score: 74, fill: "#EF4444" },
  { name: "Técnica", score: 88, fill: "#3B82F6" },
  { name: "Resistencia", score: 80, fill: "#10B981" },
  { name: "Potencia", score: 79, fill: "#F97316" },
  { name: "Agilidad", score: 84, fill: "#8B5CF6" },
]
