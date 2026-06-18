"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Heart, Dumbbell, BarChart3, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/players",   icon: Users,          label: "Jugadores" },
  { href: "/health",    icon: Heart,           label: "Salud",    live: true },
  { href: "/activities",icon: Dumbbell,        label: "Actividad" },
  { href: "/calendar",  icon: CalendarDays,    label: "Calendario" },
  { href: "/charts",    icon: BarChart3,       label: "Análisis"  },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-bottom">
      <div className="flex items-end justify-around px-1 pt-2 pb-safe">
        {NAV.map(({ href, icon: Icon, label, live }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-0 flex-1 relative"
            >
              {live && !active && (
                <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                live
                  ? active
                    ? "bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-200"
                    : "bg-red-50 dark:bg-red-500/10"
                  : active
                    ? "bg-[#0B5CFF] shadow-md shadow-blue-200"
                    : "bg-transparent"
              )}>
                <Icon
                  size={live ? 22 : 20}
                  className={cn(
                    "transition-colors",
                    live
                      ? active ? "text-white" : "text-red-500"
                      : active ? "text-white" : "text-slate-400 dark:text-slate-500"
                  )}
                  fill={live && active ? "currentColor" : "none"}
                />
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-colors leading-none",
                active
                  ? live ? "text-red-500" : "text-[#0B5CFF]"
                  : "text-slate-400 dark:text-slate-500"
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
