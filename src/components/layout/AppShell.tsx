"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { AlertTriangle, LogOut } from "lucide-react"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"
import PlayerNav from "./PlayerNav"

const PLAYER_ALLOWED_PREFIXES = ["/matches", "/players", "/calendar", "/activities"]
const BLOCKED_STATUSES = new Set(["suspended", "canceled"])

function SuspendedScreen({ isCoach }: { isCoach: boolean }) {
  const { logout } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handlePay() {
    setError("")
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || "No se pudo iniciar el pago.")
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError("No se pudo iniciar el pago.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] dark:bg-[#0B1120] p-6">
      <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Academia suspendida</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isCoach
            ? "El acceso de tu academia está suspendido. Regulariza tu suscripción para seguir usando la plataforma."
            : "El acceso de tu academia está suspendido temporalmente. Contacta a tu entrenador."}
        </p>
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex flex-col gap-2">
          {isCoach && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full h-11 bg-[#0B5CFF] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {loading ? "Redirigiendo…" : "Regularizar pago"}
            </button>
          )}
          <button onClick={logout} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarding, authReady, currentUser, teamSettings } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isPlayer = currentUser?.role === "player"
  const ownPlayerPath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null
  const isSuspended = !!teamSettings && BLOCKED_STATUSES.has(teamSettings.subscription_status)

  const isOnAllowedPlayerPath = isPlayer && (
    PLAYER_ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  )

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      if (pathname !== "/") router.replace("/")
      return
    }
    if (isOnboarding) {
      if (pathname !== "/onboarding") router.replace("/onboarding")
      return
    }
    // Players can access their profile and matches (including convocatoria)
    if (isPlayer && ownPlayerPath && !isOnAllowedPlayerPath) {
      router.replace(ownPlayerPath)
    }
  }, [authReady, isAuthenticated, isOnboarding, isPlayer, ownPlayerPath, isOnAllowedPlayerPath, pathname, router])

  if (!authReady || !isAuthenticated) return null
  if (isOnboarding) return null
  if (isSuspended) return <SuspendedScreen isCoach={currentUser?.role === "coach"} />
  if (isPlayer && !isOnAllowedPlayerPath) return null

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#0B1120]">
      {/* Sidebar: coach full sidebar, player compact sidebar */}
      {isPlayer ? <PlayerNav /> : <Sidebar />}

      {/* Main content */}
      <div className={isPlayer ? "flex-1 flex flex-col min-h-screen md:ml-56" : "flex-1 flex flex-col min-h-screen md:ml-64 print:ml-0"}>
        {/* Mobile top header */}
        {!isPlayer && <MobileHeader />}

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — coach only (player has PlayerNav) */}
      {!isPlayer && <BottomNav />}
    </div>
  )
}
