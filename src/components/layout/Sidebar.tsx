"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, Dumbbell, BarChart3, FileText, LogOut, Trophy, ChevronRight, Heart, Settings, CalendarDays
} from "lucide-react"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/players", icon: Users, label: "Jugadores" },
  { href: "/activities", icon: Dumbbell, label: "Actividades" },
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
  { href: "/health", icon: Heart, label: "Salud en Vivo", badge: "LIVE" },
  { href: "/charts", icon: BarChart3, label: "Gráficos" },
  { href: "/reports", icon: FileText, label: "Reportes" },
  { href: "/settings", icon: Settings, label: "Configuración" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { currentUser, logout, teamSettings } = useApp()

  return (
    <aside className="no-print hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-blue-200 overflow-hidden shrink-0">
            {teamSettings?.logo_url ? (
              <img src={teamSettings.logo_url} alt={teamSettings.name} className="w-full h-full object-cover" />
            ) : (
              <Trophy className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[15px] font-bold text-slate-900 tracking-tight truncate block">{teamSettings?.name || "FutbolMetrics"}</span>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Pro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">Menú</p>
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-blue-50 text-[#0B5CFF] border-l-[3px] border-[#0B5CFF] pl-[9px]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", active ? "text-[#0B5CFF]" : "text-slate-400 group-hover:text-slate-600")} size={18} />
              <span className="flex-1">{label}</span>
              {badge && !active && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 animate-pulse">{badge}</span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 text-[#0B5CFF]" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5CFF] to-[#071B4D] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {currentUser?.full_name.charAt(0) ?? "E"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{currentUser?.full_name || "Entrenador"}</p>
            <p className="text-[10px] text-slate-400">Coach</p>
          </div>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
