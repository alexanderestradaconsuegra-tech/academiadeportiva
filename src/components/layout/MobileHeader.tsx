"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Trophy, Settings, LogOut } from "lucide-react"
import { useApp } from "@/context/AppContext"

const TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/players":    "Jugadores",
  "/health":     "Salud en Vivo",
  "/activities": "Actividades",
  "/charts":     "Gráficos",
  "/reports":    "Reportes",
  "/settings":   "Configuración",
}

export default function MobileHeader() {
  const pathname = usePathname()
  const { currentUser, teamSettings, logout } = useApp()
  const isPlayer = currentUser?.role === "player"
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? (teamSettings?.name || "FutbolMetrics")
  const isHealth = pathname.startsWith("/health")

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 h-14 flex items-center justify-between safe-area-top">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${isHealth ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-[#0B5CFF]"}`}>
          {teamSettings?.logo_url && !isHealth ? (
            <img src={teamSettings.logo_url} alt={teamSettings.name} className="w-full h-full object-cover" />
          ) : (
            <Trophy size={14} className="text-white" />
          )}
        </div>
        <span className="text-base font-bold text-slate-900 tracking-tight">{title}</span>
        {isHealth && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 animate-pulse">LIVE</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isPlayer ? (
          <button onClick={logout} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        ) : (
          <Link href="/settings" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Settings size={16} />
          </Link>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5CFF] to-[#071B4D] flex items-center justify-center text-white text-xs font-bold">
          {currentUser?.full_name.charAt(0) ?? "E"}
        </div>
      </div>
    </header>
  )
}
