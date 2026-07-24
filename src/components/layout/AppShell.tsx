"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"
import PlayerNav from "./PlayerNav"

const PLAYER_ALLOWED_PREFIXES = ["/matches", "/players", "/activities", "/tactics", "/health"]
const ASSISTANT_BLOCKED_PREFIXES = ["/payments", "/settings", "/reports", "/charts"]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarding, authReady, currentUser, isTrialExpired, trialDaysLeft } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isPlayer = currentUser?.role === "player"
  const isAssistant = currentUser?.role === "assistant"
  const ownPlayerPath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null

  const isOnAllowedPlayerPath = isPlayer && (
    PLAYER_ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  )

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      if (pathname !== "/login") router.replace("/login")
      return
    }
    if (isOnboarding) {
      if (pathname !== "/onboarding") router.replace("/onboarding")
      return
    }
    if (isTrialExpired && pathname !== "/expired") {
      router.replace("/expired")
      return
    }
    if (isPlayer && ownPlayerPath && !isOnAllowedPlayerPath) {
      router.replace(ownPlayerPath)
    }
    if (isAssistant && ASSISTANT_BLOCKED_PREFIXES.some(p => pathname.startsWith(p))) {
      router.replace("/dashboard")
    }
  }, [authReady, isAuthenticated, isOnboarding, isTrialExpired, isPlayer, isAssistant, ownPlayerPath, isOnAllowedPlayerPath, pathname, router])

  if (!authReady || !isAuthenticated) return null
  if (isOnboarding) return null
  if (isTrialExpired) return null
  if (isPlayer && !isOnAllowedPlayerPath) return null

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#0B1120]">
      {isPlayer ? <PlayerNav /> : <Sidebar />}

      <div className={isPlayer ? "flex-1 flex flex-col min-h-screen md:ml-56" : "flex-1 flex flex-col min-h-screen md:ml-64 print:ml-0"}>
        {!isPlayer && <MobileHeader />}

        {/* Trial banner — coach only, while trial is active */}
        {!isPlayer && trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="no-print bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2 flex items-center justify-between gap-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⏳ Prueba gratuita — te {trialDaysLeft === 1 ? "queda 1 día" : `quedan ${trialDaysLeft} días`}. Escríbenos para activar tu academia.
            </p>
            <a
              href={`https://wa.me/56992103974?text=${encodeURIComponent("Hola, quiero activar mi academia en Metrikas.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-bold text-amber-700 dark:text-amber-400 underline underline-offset-2"
            >
              Activar →
            </a>
          </div>
        )}

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {!isPlayer && <BottomNav />}
    </div>
  )
}
