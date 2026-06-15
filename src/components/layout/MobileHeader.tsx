"use client"
import { usePathname } from "next/navigation"
import { Trophy, Bell } from "lucide-react"
import { useApp } from "@/context/AppContext"

const TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/players":    "Jugadores",
  "/health":     "Salud en Vivo",
  "/activities": "Actividades",
  "/charts":     "Gráficos",
  "/reports":    "Reportes",
}

export default function MobileHeader() {
  const pathname = usePathname()
  const { currentUser } = useApp()
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "FutbolMetrics"
  const isHealth = pathname.startsWith("/health")

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 h-14 flex items-center justify-between safe-area-top">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isHealth ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-[#0B5CFF]"}`}>
          <Trophy size={14} className="text-white" />
        </div>
        <span className="text-base font-bold text-slate-900 tracking-tight">{title}</span>
        {isHealth && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 animate-pulse">LIVE</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5CFF] to-[#071B4D] flex items-center justify-center text-white text-xs font-bold">
          {currentUser?.name.charAt(0) ?? "E"}
        </div>
      </div>
    </header>
  )
}
