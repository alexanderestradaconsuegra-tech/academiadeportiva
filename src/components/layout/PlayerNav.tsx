"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { Trophy, UserCircle, LogOut, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import PushToggle from "@/components/PushToggle"

export default function PlayerNav() {
  const pathname = usePathname()
  const { currentUser, logout, teamSettings, darkMode, toggleDarkMode } = useApp()
  const profilePath = currentUser?.player_id ? `/players/${currentUser.player_id}` : null

  const NAV = [
    { href: profilePath ?? "#", icon: UserCircle, label: "Mi perfil" },
    { href: "/matches", icon: Trophy, label: "Partidos" },
  ]

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-end justify-around px-4 pt-2 pb-4">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href) && href !== "#"
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  active ? "bg-[#0B5CFF] shadow-md shadow-blue-200" : "bg-transparent"
                )}>
                  <Icon size={20} className={active ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                </div>
                <span className={cn("text-[10px] font-semibold", active ? "text-[#0B5CFF]" : "text-slate-400 dark:text-slate-500")}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar (narrow) */}
      <aside className="no-print hidden md:flex fixed left-0 top-0 h-screen w-56 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col z-30 shadow-sm">
        {/* Academy logo */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B5CFF] flex items-center justify-center shadow-md shadow-blue-200 overflow-hidden shrink-0">
              {teamSettings?.logo_url
                ? <img src={teamSettings.logo_url} alt={teamSettings.name} className="w-full h-full object-cover" />
                : <Trophy className="w-5 h-5 text-white" />
              }
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-bold text-slate-900 dark:text-white truncate block">{teamSettings?.name || "FutbolMetrics"}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Jugador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href) && href !== "#"
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF] border-l-[3px] border-[#0B5CFF] pl-[9px]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}>
                <Icon size={18} className={active ? "text-[#0B5CFF]" : "text-slate-400"} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Push notifications toggle */}
        <div className="px-3 pb-3">
          <PushToggle />
        </div>

        {/* User info */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5CFF] to-[#071B4D] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser?.full_name.charAt(0) ?? "J"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{currentUser?.full_name}</p>
              <p className="text-[10px] text-slate-400">Jugador</p>
            </div>
            <button onClick={toggleDarkMode} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button onClick={logout} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
