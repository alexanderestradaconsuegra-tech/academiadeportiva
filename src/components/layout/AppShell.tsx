"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MobileHeader from "./MobileHeader"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/") {
      router.replace("/")
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Mobile top header */}
        <MobileHeader />

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
