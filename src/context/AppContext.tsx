"use client"
import React, { createContext, useContext, useState, useCallback } from "react"
import type { Player, Activity, Evaluation } from "@/lib/types"
import { MOCK_PLAYERS, MOCK_ACTIVITIES, MOCK_EVALUATIONS } from "@/lib/mock-data"

interface AppState {
  players: Player[]
  activities: Activity[]
  evaluations: Evaluation[]
  isAuthenticated: boolean
  currentUser: { name: string; role: string } | null
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean
  logout: () => void
  addPlayer: (player: Omit<Player, "id" | "created_at">) => Player
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void
  addActivity: (activity: Omit<Activity, "id" | "created_at">) => Activity
  addEvaluation: (evaluation: Omit<Evaluation, "id">) => Evaluation
  getPlayer: (id: string) => Player | undefined
  getPlayerActivities: (playerId: string) => Activity[]
  getPlayerEvaluations: (playerId: string) => Evaluation[]
  getLatestEvaluation: (playerId: string) => Evaluation | undefined
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    players: MOCK_PLAYERS,
    activities: MOCK_ACTIVITIES,
    evaluations: MOCK_EVALUATIONS,
    isAuthenticated: false,
    currentUser: null,
  })

  const login = useCallback((email: string, password: string): boolean => {
    if (email === "entrenador@futbolmetrics.com" && password === "coach2024") {
      setState(s => ({
        ...s,
        isAuthenticated: true,
        currentUser: { name: "Entrenador Principal", role: "Coach" },
      }))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setState(s => ({ ...s, isAuthenticated: false, currentUser: null }))
  }, [])

  const addPlayer = useCallback((data: Omit<Player, "id" | "created_at">): Player => {
    const player: Player = {
      ...data,
      id: `p${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, players: [...s.players, player] }))
    return player
  }, [])

  const updatePlayer = useCallback((id: string, data: Partial<Player>) => {
    setState(s => ({
      ...s,
      players: s.players.map(p => p.id === id ? { ...p, ...data } : p),
    }))
  }, [])

  const deletePlayer = useCallback((id: string) => {
    setState(s => ({ ...s, players: s.players.filter(p => p.id !== id) }))
  }, [])

  const addActivity = useCallback((data: Omit<Activity, "id" | "created_at">): Activity => {
    const activity: Activity = {
      ...data,
      id: `a${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setState(s => ({ ...s, activities: [...s.activities, activity] }))
    return activity
  }, [])

  const addEvaluation = useCallback((data: Omit<Evaluation, "id">): Evaluation => {
    const evaluation: Evaluation = { ...data, id: `ev${Date.now()}` }
    setState(s => ({ ...s, evaluations: [...s.evaluations, evaluation] }))
    return evaluation
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

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addActivity,
        addEvaluation,
        getPlayer,
        getPlayerActivities,
        getPlayerEvaluations,
        getLatestEvaluation,
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
