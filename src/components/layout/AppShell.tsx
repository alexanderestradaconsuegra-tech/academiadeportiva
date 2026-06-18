"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authReady, currentUser } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  const isPlayer = currentUser?.role === "player"
  const ownPlayerPath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      if (pathname !== "/") router.replace("/")
      return
    }
    if (isPlayer && ownPlayerPath && pathname !== ownPlayerPath) {
      router.replace(ownPlayerPath)
    }
  }, [authReady, isAuthenticated, isPlayer, ownPlayerPath, pathname, router])

  if (!authReady || !isAuthenticated) return null
  if (isPlayer && ownPlayerPath && pathname !== ownPlayerPath) return null

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#0B1120]">
      {/* Desktop sidebar — hidden on mobile */}
      {!isPlayer && <Sidebar />}

      {/* Main content */}
      <div className={isPlayer ? "flex-1 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen md:ml-64"}>
        {/* Mobile top header */}
        <MobileHeader />

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {!isPlayer && <BottomNav />}
    </div>
  )
}
