"use client"
import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Player, Activity, Evaluation, HealthProfile, LiveSession, HRSample, SpeedSample, TeamSettings, Profile, UserRole, Training, Category, PositionSample, Match, MatchPlayerStat, Exercise, Language } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { registerServiceWorker } from "@/lib/push"
import type { Tables, TablesUpdate, Json } from "@/lib/database.types"

interface AppState {
  players: Player[]
  activities: Activity[]
  evaluations: Evaluation[]
  healthProfiles: HealthProfile[]
  liveSessions: LiveSession[]
  teamSettings: TeamSettings | null
  trainings: Training[]
  positionSamples: PositionSample[]
  matches: Match[]
  matchStats: MatchPlayerStat[]
  exercises: Exercise[]
  isAuthenticated: boolean
  authReady: boolean
  currentUser: Profile | null
  darkMode: boolean
}

interface AppContextType extends AppState {
  language: Language
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  addPlayer: (player: Omit<Player, "id" | "created_at">) => Player
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void
  addActivity: (activity: Omit<Activity, "id" | "created_at">) => Activity
  addEvaluation: (evaluation: Omit<Evaluation, "id">) => Evaluation
  updateEvaluation: (id: string, evaluation: Partial<Omit<Evaluation, "id" | "player_id">>) => void
  deleteEvaluation: (id: string) => void
  addLiveSession: (session: Omit<LiveSession, "id">) => LiveSession
  updateTeamSettings: (data: Partial<Omit<TeamSettings, "id" | "updated_at">>) => void
  addTraining: (training: Omit<Training, "id" | "created_at">) => Training
  updateTraining: (id: string, data: Partial<Training>) => void
  deleteTraining: (id: string) => void
  addMatch: (match: Omit<Match, "id" | "created_at">) => Match
  updateMatch: (id: string, data: Partial<Omit<Match, "id" | "created_at">>) => void
  deleteMatch: (id: string) => void
  addMatchStat: (stat: Omit<MatchPlayerStat, "id" | "created_at">) => MatchPlayerStat
  updateMatchStat: (id: string, data: Partial<Omit<MatchPlayerStat, "id" | "created_at" | "match_id" | "player_id">>) => void
  deleteMatchStat: (id: string) => void
  getMatchStats: (matchId: string) => MatchPlayerStat[]
  getPlayerMatches: (playerId: string) => { match: Match; stat: MatchPlayerStat }[]
  addExercise: (exercise: Omit<Exercise, "id" | "created_at">) => Exercise
  updateExercise: (id: string, data: Partial<Omit<Exercise, "id" | "created_at">>) => void
  deleteExercise: (id: string) => void
  getPlayer: (id: string) => Player | undefined
  getPlayerActivities: (playerId: string) => Activity[]
  getPlayerEvaluations: (playerId: string) => Evaluation[]
  getLatestEvaluation: (playerId: string) => Evaluation | undefined
  getPlayerHealth: (playerId: string) => HealthProfile | undefined
  getPlayerSessions: (playerId: string) => LiveSession[]
  getUpcomingTrainings: (category?: Category | null) => Training[]
  toggleDarkMode: () => void
  addPositionSample: (sample: Omit<PositionSample, "id" | "created_at">) => void
  addPositionSamples: (samples: Omit<PositionSample, "id" | "created_at">[]) => void
  deletePositionSession: (playerId: string, sessionLabel: string) => void
  getPlayerPositionSamples: (playerId: string) => PositionSample[]
}

const AppContext = createContext<AppContextType | null>(null)

const AUTH_ERRORS: Record<"invalidCredentials" | "noAccess", Record<Language, string>> = {
  invalidCredentials: {
    es: "Credenciales incorrectas. Intenta de nuevo.",
    en: "Incorrect credentials. Please try again.",
    pt: "Credenciais incorretas. Tente novamente.",
  },
  noAccess: {
    es: "Tu cuenta no tiene un acceso asignado. Contacta al entrenador.",
    en: "Your account doesn't have an access assigned. Contact the coach.",
    pt: "Sua conta não tem um acesso atribuído. Contate o treinador.",
  },
}

function mapPlayer(row: Tables<"players">): Player {
  return {
    id: row.id,
    name: row.name,
    photo_url: row.photo_url ?? "",
    age: row.age,
    birth_date: row.birth_date,
    position: row.position,
    dominant_foot: row.dominant_foot,
    height: row.height,
    weight: row.weight,
    club: row.club ?? "",
    category: row.category,
    objective: row.objective ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

function mapActivity(row: Tables<"activities">): Activity {
  return {
    id: row.id,
    player_id: row.player_id,
    date: row.date,
    category: row.category,
    exercise: row.exercise,
    value: row.value,
    unit: row.unit,
    intensity: row.intensity,
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

function mapEvaluation(row: Tables<"evaluations">): Evaluation {
  return {
    id: row.id,
    player_id: row.player_id,
    speed_score: row.speed_score,
    strength_score: row.strength_score,
    technique_score: row.technique_score,
    resistance_score: row.resistance_score,
    power_score: row.power_score,
    agility_score: row.agility_score,
    general_score: row.general_score,
    date: row.date,
  }
}

function mapHealthProfile(row: Tables<"health_profiles">): HealthProfile {
  return {
    id: row.id,
    player_id: row.player_id,
    resting_hr: row.resting_hr ?? 0,
    max_hr: row.max_hr ?? 0,
    hrv: row.hrv ?? 0,
    vo2max: row.vo2max ?? 0,
    recovery_index: row.recovery_index ?? 0,
    blood_pressure_sys: row.blood_pressure_sys ?? 0,
    blood_pressure_dia: row.blood_pressure_dia ?? 0,
    weight: row.weight ?? 0,
    body_fat_pct: row.body_fat_pct ?? 0,
    date: row.date,
  }
}

function mapLiveSession(row: Tables<"live_sessions">): LiveSession {
  return {
    id: row.id,
    player_id: row.player_id,
    started_at: row.started_at,
    ended_at: row.ended_at ?? undefined,
    device_name: row.device_name ?? undefined,
    device_type: row.device_type,
    hr_samples: (row.hr_samples as unknown as HRSample[]) ?? [],
    speed_samples: (row.speed_samples as unknown as SpeedSample[]) ?? [],
    avg_hr: row.avg_hr ?? 0,
    max_hr_session: row.max_hr_session ?? 0,
    min_hr_session: row.min_hr_session ?? 0,
    avg_speed_kmh: row.avg_speed_kmh ?? 0,
    max_speed_kmh: row.max_speed_kmh ?? 0,
    distance_m: row.distance_m ?? 0,
    duration_s: row.duration_s ?? 0,
    calories_est: row.calories_est ?? 0,
    notes: row.notes ?? "",
  }
}

function mapTeamSettings(row: Tables<"team_settings">): TeamSettings {
  return {
    id: row.id,
    name: row.name,
    logo_url: row.logo_url ?? "",
    city: row.city ?? "",
    founded_year: row.founded_year,
    description: row.description ?? "",
    language: (row.language as Language) ?? "es",
    updated_at: row.updated_at,
    calib_p0_lat: row.calib_p0_lat,
    calib_p0_lng: row.calib_p0_lng,
    calib_p1_lat: row.calib_p1_lat,
    calib_p1_lng: row.calib_p1_lng,
    calib_p2_lat: row.calib_p2_lat,
    calib_p2_lng: row.calib_p2_lng,
  }
}

function mapTraining(row: Tables<"trainings">): Training {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? "",
    category: row.category,
    location: row.location ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

function mapPositionSample(row: Tables<"position_samples">): PositionSample {
  return {
    id: row.id,
    player_id: row.player_id,
    session_label: row.session_label,
    x: row.x,
    y: row.y,
    created_at: row.created_at,
  }
}

function mapMatch(row: Tables<"matches">): Match {
  return {
    id: row.id,
    opponent: row.opponent,
    competition: row.competition ?? "",
    date: row.date,
    time: row.time ?? "",
    location: row.location ?? "",
    is_home: row.is_home,
    category: row.category,
    our_score: row.our_score,
    opponent_score: row.opponent_score,
    video_url: row.video_url ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

function mapMatchStat(row: Tables<"match_player_stats">): MatchPlayerStat {
  return {
    id: row.id,
    match_id: row.match_id,
    player_id: row.player_id,
    minutes_played: row.minutes_played,
    goals: row.goals,
    assists: row.assists,
    yellow_cards: row.yellow_cards,
    red_cards: row.red_cards,
    rating: row.rating,
    position_played: row.position_played ?? "",
    highlight_url: row.highlight_url ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

function mapExercise(row: Tables<"exercises">): Exercise {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    video_url: row.video_url ?? "",
    created_at: row.created_at,
  }
}

function mapProfile(row: Tables<"profiles">): Profile {
  return {
    id: row.id,
    role: row.role as UserRole,
    player_id: row.player_id,
    full_name: row.full_name || "",
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    players: [],
    activities: [],
    evaluations: [],
    healthProfiles: [],
    liveSessions: [],
    teamSettings: null,
    trainings: [],
    positionSamples: [],
    matches: [],
    matchStats: [],
    exercises: [],
    isAuthenticated: false,
    authReady: false,
    currentUser: null,
    darkMode: false,
  })

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", dark)
    setState(s => ({ ...s, darkMode: dark }))
  }, [])

  useEffect(() => {
    registerServiceWorker()
  }, [])

  const toggleDarkMode = useCallback(() => {
    setState(s => {
      const dark = !s.darkMode
      document.documentElement.classList.toggle("dark", dark)
      localStorage.setItem("theme", dark ? "dark" : "light")
      return { ...s, darkMode: dark }
    })
  }, [])

  const loadTeamSettings = useCallback(async () => {
    const { data } = await supabase.from("team_settings").select("*").limit(1).maybeSingle()
    setState(s => ({ ...s, teamSettings: data ? mapTeamSettings(data) : null }))
  }, [])

  const loadPlayerData = useCallback(async () => {
    const [playersRes, activitiesRes, evaluationsRes, healthRes, sessionsRes, trainingsRes, positionSamplesRes, matchesRes, matchStatsRes, exercisesRes] = await Promise.all([
      supabase.from("players").select("*"),
      supabase.from("activities").select("*"),
      supabase.from("evaluations").select("*"),
      supabase.from("health_profiles").select("*"),
      supabase.from("live_sessions").select("*"),
      supabase.from("trainings").select("*"),
      supabase.from("position_samples").select("*"),
      supabase.from("matches").select("*"),
      supabase.from("match_player_stats").select("*"),
      supabase.from("exercises").select("*"),
    ])
    setState(s => ({
      ...s,
      players: (playersRes.data ?? []).map(mapPlayer),
      activities: (activitiesRes.data ?? []).map(mapActivity),
      evaluations: (evaluationsRes.data ?? []).map(mapEvaluation),
      healthProfiles: (healthRes.data ?? []).map(mapHealthProfile),
      liveSessions: (sessionsRes.data ?? []).map(mapLiveSession),
      trainings: (trainingsRes.data ?? []).map(mapTraining),
      positionSamples: (positionSamplesRes.data ?? []).map(mapPositionSample),
      matches: (matchesRes.data ?? []).map(mapMatch),
      matchStats: (matchStatsRes.data ?? []).map(mapMatchStat),
      exercises: (exercisesRes.data ?? []).map(mapExercise),
    }))
  }, [])

  const loadProfileFor = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
    return data ? mapProfile(data) : null
  }, [])

  useEffect(() => {
    loadTeamSettings()

    async function restoreSession() {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user.id
      if (userId) {
        const profile = await loadProfileFor(userId)
        if (profile) {
          setState(s => ({ ...s, isAuthenticated: true, currentUser: profile }))
          await loadPlayerData()
        }
      }
      setState(s => ({ ...s, authReady: true }))
    }
    restoreSession()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState(s => ({
          ...s,
          isAuthenticated: false,
          currentUser: null,
          players: [],
          activities: [],
          evaluations: [],
          healthProfiles: [],
          liveSessions: [],
          trainings: [],
          positionSamples: [],
          matches: [],
          matchStats: [],
          exercises: [],
        }))
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [loadTeamSettings, loadPlayerData, loadProfileFor])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const lang = state.teamSettings?.language ?? "es"
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return AUTH_ERRORS.invalidCredentials[lang]
    const profile = await loadProfileFor(data.user.id)
    if (!profile) {
      await supabase.auth.signOut()
      return AUTH_ERRORS.noAccess[lang]
    }
    setState(s => ({ ...s, isAuthenticated: true, currentUser: profile }))
    await loadPlayerData()
    return null
  }, [loadProfileFor, loadPlayerData, state.teamSettings?.language])

  const logout = useCallback(() => {
    supabase.auth.signOut()
    setState(s => ({
      ...s,
      isAuthenticated: false,
      currentUser: null,
      players: [],
      activities: [],
      evaluations: [],
      healthProfiles: [],
      liveSessions: [],
      positionSamples: [],
    }))
  }, [])

  const addPlayer = useCallback((data: Omit<Player, "id" | "created_at">): Player => {
    const player: Player = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, players: [...s.players, player] }))
    supabase.from("players").insert({
      id: player.id,
      name: player.name,
      photo_url: player.photo_url || null,
      age: player.age,
      birth_date: player.birth_date,
      position: player.position,
      dominant_foot: player.dominant_foot,
      height: player.height,
      weight: player.weight,
      club: player.club || null,
      category: player.category,
      objective: player.objective || null,
      notes: player.notes || null,
      created_at: player.created_at,
    }).then(({ error }) => { if (error) console.error("addPlayer:", error) })
    return player
  }, [])

  const updatePlayer = useCallback((id: string, data: Partial<Player>) => {
    setState(s => ({
      ...s,
      players: s.players.map(p => p.id === id ? { ...p, ...data } : p),
    }))
    const update: TablesUpdate<"players"> = { ...data }
    if ("photo_url" in update) update.photo_url = update.photo_url || null
    if ("club" in update) update.club = update.club || null
    if ("objective" in update) update.objective = update.objective || null
    if ("notes" in update) update.notes = update.notes || null
    supabase.from("players").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updatePlayer:", error) })
  }, [])

  const deletePlayer = useCallback((id: string) => {
    setState(s => ({
      ...s,
      players: s.players.filter(p => p.id !== id),
      activities: s.activities.filter(a => a.player_id !== id),
      evaluations: s.evaluations.filter(e => e.player_id !== id),
      healthProfiles: s.healthProfiles.filter(h => h.player_id !== id),
      liveSessions: s.liveSessions.filter(ls => ls.player_id !== id),
      positionSamples: s.positionSamples.filter(p => p.player_id !== id),
    }))
    supabase.from("players").delete().eq("id", id).then(({ error }) => { if (error) console.error("deletePlayer:", error) })
  }, [])

  const addActivity = useCallback((data: Omit<Activity, "id" | "created_at">): Activity => {
    const activity: Activity = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, activities: [...s.activities, activity] }))
    supabase.from("activities").insert({
      id: activity.id,
      player_id: activity.player_id,
      date: activity.date,
      category: activity.category,
      exercise: activity.exercise,
      value: activity.value,
      unit: activity.unit,
      intensity: activity.intensity,
      notes: activity.notes || null,
      created_at: activity.created_at,
    }).then(({ error }) => { if (error) console.error("addActivity:", error) })
    return activity
  }, [])

  const addEvaluation = useCallback((data: Omit<Evaluation, "id">): Evaluation => {
    const evaluation: Evaluation = { ...data, id: crypto.randomUUID() }
    setState(s => ({ ...s, evaluations: [...s.evaluations, evaluation] }))
    supabase.from("evaluations").insert(evaluation).then(({ error }) => { if (error) console.error("addEvaluation:", error) })
    return evaluation
  }, [])

  const updateEvaluation = useCallback((id: string, data: Partial<Omit<Evaluation, "id" | "player_id">>) => {
    setState(s => ({
      ...s,
      evaluations: s.evaluations.map(e => e.id === id ? { ...e, ...data } : e),
    }))
    supabase.from("evaluations").update(data).eq("id", id).then(({ error }) => { if (error) console.error("updateEvaluation:", error) })
  }, [])

  const deleteEvaluation = useCallback((id: string) => {
    setState(s => ({ ...s, evaluations: s.evaluations.filter(e => e.id !== id) }))
    supabase.from("evaluations").delete().eq("id", id).then(({ error }) => { if (error) console.error("deleteEvaluation:", error) })
  }, [])

  const getPlayer = useCallback((id: string) => state.players.find(p => p.id === id), [state.players])

  const getPlayerActivities = useCallback(
    (playerId: string) => state.activities.filter(a => a.player_id === playerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.activities]
  )

  const getPlayerEvaluations = useCallback(
    (playerId: string) => state.evaluations.filter(e => e.player_id === playerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.evaluations]
  )

  const getLatestEvaluation = useCallback(
    (playerId: string) => getPlayerEvaluations(playerId)[0],
    [getPlayerEvaluations]
  )

  const addLiveSession = useCallback((data: Omit<LiveSession, "id">): LiveSession => {
    const session: LiveSession = { ...data, id: crypto.randomUUID() }
    setState(s => ({ ...s, liveSessions: [session, ...s.liveSessions] }))
    supabase.from("live_sessions").insert({
      id: session.id,
      player_id: session.player_id,
      started_at: session.started_at,
      ended_at: session.ended_at ?? null,
      device_name: session.device_name ?? null,
      device_type: session.device_type,
      hr_samples: session.hr_samples as unknown as Json,
      speed_samples: session.speed_samples as unknown as Json,
      avg_hr: session.avg_hr,
      max_hr_session: session.max_hr_session,
      min_hr_session: session.min_hr_session,
      avg_speed_kmh: session.avg_speed_kmh,
      max_speed_kmh: session.max_speed_kmh,
      distance_m: session.distance_m,
      duration_s: session.duration_s,
      calories_est: session.calories_est,
      notes: session.notes || null,
    }).then(({ error }) => { if (error) console.error("addLiveSession:", error) })
    return session
  }, [])

  const getPlayerHealth = useCallback(
    (playerId: string) => state.healthProfiles.find(h => h.player_id === playerId),
    [state.healthProfiles]
  )

  const getPlayerSessions = useCallback(
    (playerId: string) => state.liveSessions.filter(s => s.player_id === playerId).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()),
    [state.liveSessions]
  )

  const updateTeamSettings = useCallback((data: Partial<Omit<TeamSettings, "id" | "updated_at">>) => {
    if (!state.teamSettings) return
    const id = state.teamSettings.id
    setState(s => ({
      ...s,
      teamSettings: s.teamSettings ? { ...s.teamSettings, ...data } : null,
    }))
    const update: TablesUpdate<"team_settings"> = { ...data, updated_at: new Date().toISOString() }
    if ("logo_url" in update) update.logo_url = update.logo_url || null
    if ("city" in update) update.city = update.city || null
    if ("description" in update) update.description = update.description || null
    supabase.from("team_settings").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updateTeamSettings:", error) })
  }, [state.teamSettings])

  const addTraining = useCallback((data: Omit<Training, "id" | "created_at">): Training => {
    const training: Training = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, trainings: [...s.trainings, training] }))
    supabase.from("trainings").insert({
      id: training.id,
      title: training.title,
      date: training.date,
      time: training.time || null,
      category: training.category,
      location: training.location || null,
      notes: training.notes || null,
      created_at: training.created_at,
    }).then(({ error }) => { if (error) console.error("addTraining:", error) })
    return training
  }, [])

  const updateTraining = useCallback((id: string, data: Partial<Training>) => {
    setState(s => ({
      ...s,
      trainings: s.trainings.map(t => t.id === id ? { ...t, ...data } : t),
    }))
    const update: TablesUpdate<"trainings"> = { ...data }
    if ("time" in update) update.time = update.time || null
    if ("location" in update) update.location = update.location || null
    if ("notes" in update) update.notes = update.notes || null
    supabase.from("trainings").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updateTraining:", error) })
  }, [])

  const deleteTraining = useCallback((id: string) => {
    setState(s => ({ ...s, trainings: s.trainings.filter(t => t.id !== id) }))
    supabase.from("trainings").delete().eq("id", id).then(({ error }) => { if (error) console.error("deleteTraining:", error) })
  }, [])

  const addMatch = useCallback((data: Omit<Match, "id" | "created_at">): Match => {
    const match: Match = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, matches: [...s.matches, match] }))
    supabase.from("matches").insert({
      id: match.id,
      opponent: match.opponent,
      competition: match.competition || null,
      date: match.date,
      time: match.time || null,
      location: match.location || null,
      is_home: match.is_home,
      category: match.category,
      our_score: match.our_score,
      opponent_score: match.opponent_score,
      video_url: match.video_url || null,
      notes: match.notes || null,
      created_at: match.created_at,
    }).then(({ error }) => { if (error) console.error("addMatch:", error) })
    return match
  }, [])

  const updateMatch = useCallback((id: string, data: Partial<Omit<Match, "id" | "created_at">>) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === id ? { ...m, ...data } : m),
    }))
    const update: TablesUpdate<"matches"> = { ...data }
    if ("competition" in update) update.competition = update.competition || null
    if ("time" in update) update.time = update.time || null
    if ("location" in update) update.location = update.location || null
    if ("video_url" in update) update.video_url = update.video_url || null
    if ("notes" in update) update.notes = update.notes || null
    supabase.from("matches").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updateMatch:", error) })
  }, [])

  const deleteMatch = useCallback((id: string) => {
    setState(s => ({
      ...s,
      matches: s.matches.filter(m => m.id !== id),
      matchStats: s.matchStats.filter(ms => ms.match_id !== id),
    }))
    supabase.from("matches").delete().eq("id", id).then(({ error }) => { if (error) console.error("deleteMatch:", error) })
  }, [])

  const addMatchStat = useCallback((data: Omit<MatchPlayerStat, "id" | "created_at">): MatchPlayerStat => {
    const stat: MatchPlayerStat = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, matchStats: [...s.matchStats, stat] }))
    supabase.from("match_player_stats").insert({
      id: stat.id,
      match_id: stat.match_id,
      player_id: stat.player_id,
      minutes_played: stat.minutes_played,
      goals: stat.goals,
      assists: stat.assists,
      yellow_cards: stat.yellow_cards,
      red_cards: stat.red_cards,
      rating: stat.rating,
      position_played: stat.position_played || null,
      highlight_url: stat.highlight_url || null,
      notes: stat.notes || null,
      created_at: stat.created_at,
    }).then(({ error }) => { if (error) console.error("addMatchStat:", error) })
    return stat
  }, [])

  const updateMatchStat = useCallback((id: string, data: Partial<Omit<MatchPlayerStat, "id" | "created_at" | "match_id" | "player_id">>) => {
    setState(s => ({
      ...s,
      matchStats: s.matchStats.map(ms => ms.id === id ? { ...ms, ...data } : ms),
    }))
    const update: TablesUpdate<"match_player_stats"> = { ...data }
    if ("position_played" in update) update.position_played = update.position_played || null
    if ("highlight_url" in update) update.highlight_url = update.highlight_url || null
    if ("notes" in update) update.notes = update.notes || null
    supabase.from("match_player_stats").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updateMatchStat:", error) })
  }, [])

  const deleteMatchStat = useCallback((id: string) => {
    setState(s => ({ ...s, matchStats: s.matchStats.filter(ms => ms.id !== id) }))
    supabase.from("match_player_stats").delete().eq("id", id).then(({ error }) => { if (error) console.error("deleteMatchStat:", error) })
  }, [])

  const getMatchStats = useCallback(
    (matchId: string) => state.matchStats.filter(ms => ms.match_id === matchId),
    [state.matchStats]
  )

  const getPlayerMatches = useCallback((playerId: string) => {
    return state.matchStats
      .filter(ms => ms.player_id === playerId)
      .map(stat => ({ match: state.matches.find(m => m.id === stat.match_id), stat }))
      .filter((x): x is { match: Match; stat: MatchPlayerStat } => !!x.match)
      .sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime())
  }, [state.matchStats, state.matches])

  const addExercise = useCallback((data: Omit<Exercise, "id" | "created_at">): Exercise => {
    const exercise: Exercise = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, exercises: [...s.exercises, exercise] }))
    supabase.from("exercises").insert({
      id: exercise.id,
      category: exercise.category,
      name: exercise.name,
      video_url: exercise.video_url || null,
      created_at: exercise.created_at,
    }).then(({ error }) => { if (error) console.error("addExercise:", error) })
    return exercise
  }, [])

  const updateExercise = useCallback((id: string, data: Partial<Omit<Exercise, "id" | "created_at">>) => {
    setState(s => ({
      ...s,
      exercises: s.exercises.map(e => e.id === id ? { ...e, ...data } : e),
    }))
    const update: TablesUpdate<"exercises"> = { ...data }
    if ("video_url" in update) update.video_url = update.video_url || null
    supabase.from("exercises").update(update).eq("id", id).then(({ error }) => { if (error) console.error("updateExercise:", error) })
  }, [])

  const deleteExercise = useCallback((id: string) => {
    setState(s => ({ ...s, exercises: s.exercises.filter(e => e.id !== id) }))
    supabase.from("exercises").delete().eq("id", id).then(({ error }) => { if (error) console.error("deleteExercise:", error) })
  }, [])

  const addPositionSample = useCallback((data: Omit<PositionSample, "id" | "created_at">) => {
    const sample: PositionSample = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    setState(s => ({ ...s, positionSamples: [...s.positionSamples, sample] }))
    supabase.from("position_samples").insert({
      id: sample.id,
      player_id: sample.player_id,
      session_label: sample.session_label,
      x: sample.x,
      y: sample.y,
      created_at: sample.created_at,
    }).then(({ error }) => { if (error) console.error("addPositionSample:", error) })
  }, [])

  const addPositionSamples = useCallback((items: Omit<PositionSample, "id" | "created_at">[]) => {
    if (items.length === 0) return
    const now = new Date().toISOString()
    const samples: PositionSample[] = items.map(data => ({ ...data, id: crypto.randomUUID(), created_at: now }))
    setState(s => ({ ...s, positionSamples: [...s.positionSamples, ...samples] }))
    supabase.from("position_samples").insert(
      samples.map(sample => ({
        id: sample.id,
        player_id: sample.player_id,
        session_label: sample.session_label,
        x: sample.x,
        y: sample.y,
        created_at: sample.created_at,
      }))
    ).then(({ error }) => { if (error) console.error("addPositionSamples:", error) })
  }, [])

  const deletePositionSession = useCallback((playerId: string, sessionLabel: string) => {
    setState(s => ({
      ...s,
      positionSamples: s.positionSamples.filter(p => !(p.player_id === playerId && p.session_label === sessionLabel)),
    }))
    supabase.from("position_samples").delete().eq("player_id", playerId).eq("session_label", sessionLabel)
      .then(({ error }) => { if (error) console.error("deletePositionSession:", error) })
  }, [])

  const getPlayerPositionSamples = useCallback(
    (playerId: string) => state.positionSamples.filter(p => p.player_id === playerId),
    [state.positionSamples]
  )

  const getUpcomingTrainings = useCallback((category?: Category | null) => {
    const today = new Date().toISOString().split("T")[0]
    return state.trainings
      .filter(t => t.date >= today && (!category || !t.category || t.category === category))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }, [state.trainings])

  return (
    <AppContext.Provider
      value={{
        ...state,
        language: state.teamSettings?.language ?? "es",
        login,
        logout,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addActivity,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        addLiveSession,
        updateTeamSettings,
        addTraining,
        updateTraining,
        deleteTraining,
        addMatch,
        updateMatch,
        deleteMatch,
        addMatchStat,
        updateMatchStat,
        deleteMatchStat,
        getMatchStats,
        getPlayerMatches,
        addExercise,
        updateExercise,
        deleteExercise,
        getPlayer,
        getPlayerActivities,
        getPlayerEvaluations,
        getLatestEvaluation,
        getPlayerHealth,
        getPlayerSessions,
        getUpcomingTrainings,
        toggleDarkMode,
        addPositionSample,
        addPositionSamples,
        deletePositionSession,
        getPlayerPositionSamples,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
