"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"
import PlayerNav from "./PlayerNav"

const PLAYER_ALLOWED_PREFIXES = ["/matches", "/players"]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarding, authReady, currentUser } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isPlayer = currentUser?.role === "player"
  const ownPlayerPath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null

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
