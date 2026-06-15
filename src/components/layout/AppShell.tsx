"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import Sidebar from "./Sidebar"

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
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
