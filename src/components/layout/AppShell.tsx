"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"
import PlayerNav from "./PlayerNav"
import DemoBanner from "./DemoBanner"

const PLAYER_ALLOWED_PREFIXES = ["/matches", "/activities", "/tactics", "/health", "/payments"]
const ASSISTANT_BLOCKED_PREFIXES = ["/payments", "/settings", "/reports", "/charts"]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarding, authReady, currentUser, isTrialExpired, trialDaysLeft, isSubscriptionBlocked } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isPlayer = currentUser?.role === "player"
  const isAssistant = currentUser?.role === "assistant"
  const ownPlayerPath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null

  const isOnAllowedPlayerPath = isPlayer && (
    PLAYER_ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    (ownPlayerPath !== null && pathname.startsWith(ownPlayerPath))
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
    if ((isTrialExpired || isSubscriptionBlocked) && !pathname.startsWith("/subscribe")) {
      router.replace("/subscribe")
      return
    }
    if (isPlayer && ownPlayerPath && !isOnAllowedPlayerPath) {
      router.replace(ownPlayerPath)
    }
    if (isAssistant && ASSISTANT_BLOCKED_PREFIXES.some(p => pathname.startsWith(p))) {
      router.replace("/dashboard")
    }
  }, [authReady, isAuthenticated, isOnboarding, isTrialExpired, isSubscriptionBlocked, isPlayer, isAssistant, ownPlayerPath, isOnAllowedPlayerPath, pathname, router])

  if (!authReady || !isAuthenticated) return null
  if (isOnboarding) return null
  if (isTrialExpired || isSubscriptionBlocked) return null
  if (isPlayer && !isOnAllowedPlayerPath) return null

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#0B1120] overflow-x-hidden">
      {isPlayer ? <PlayerNav /> : <Sidebar />}

      <div className={isPlayer ? "flex-1 flex flex-col min-h-screen md:ml-56 min-w-0 w-full" : "flex-1 flex flex-col min-h-screen md:ml-64 print:ml-0 min-w-0 w-full"}>
        {!isPlayer && <MobileHeader />}

        {/* Demo mode banner */}
        {currentUser?.academy_id === "a0000002-0000-0000-0000-000000000000" && (
          <div className="no-print bg-violet-600 px-4 py-2 flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-white tracking-wide uppercase">MODO DEMO</span>
            <span className="text-violet-200 text-xs">Estás explorando con datos de ejemplo · los cambios no afectan cuentas reales</span>
          </div>
        )}

        {/* Demo banner — coach only, while trial is active */}
        {!isPlayer && <DemoBanner daysLeft={trialDaysLeft} />}

        <main className="flex-1 pb-24 md:pb-0 overflow-x-hidden w-full min-w-0 max-w-full">
          {children}
        </main>
      </div>

      {!isPlayer && <BottomNav />}
    </div>
  )
}
