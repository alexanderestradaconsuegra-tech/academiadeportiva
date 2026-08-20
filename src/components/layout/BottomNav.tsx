"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Heart, Dumbbell, BarChart3, CalendarDays, PenTool, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/useT"
import { nav } from "@/lib/i18n/dictionaries/nav"

export default function BottomNav() {
  const pathname = usePathname()
  const t = useT(nav)

  const NAV = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("home") },
    { href: "/players",   icon: Users,          label: t("players") },
    { href: "/health",    icon: Heart,           label: t("healthShort"), live: true },
    { href: "/activities",icon: Dumbbell,        label: t("activity") },
    { href: "/matches",   icon: Trophy,          label: t("matches") },
    { href: "/calendar",  icon: CalendarDays,    label: t("calendar") },
    { href: "/tactics",   icon: PenTool,         label: t("tacticsShort") },
    { href: "/charts",    icon: BarChart3,       label: t("chartsShort") },
  ]
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-bottom">
      <div className="flex items-end pt-1 pb-safe overflow-hidden">
        {NAV.map(({ href, icon: Icon, label, live }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-0.5 py-1 flex-1 min-w-0 relative"
            >
              {live && !active && (
                <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                live
                  ? active
                    ? "bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-200"
                    : "bg-red-50 dark:bg-red-500/10"
                  : active
                    ? "bg-lime-400 shadow-md shadow-lime-400/40 dark:shadow-none"
                    : "bg-transparent"
              )}>
                <Icon
                  size={live ? 17 : 15}
                  className={cn(
                    "transition-colors",
                    live
                      ? active ? "text-white" : "text-red-500"
                      : active ? "text-[#05122F]" : "text-slate-400 dark:text-slate-500"
                  )}
                  fill={live && active ? "currentColor" : "none"}
                />
              </div>
              <span className={cn(
                "text-[8px] font-semibold transition-colors leading-none truncate w-full text-center",
                active
                  ? live ? "text-red-500" : "text-lime-700 dark:text-lime-400"
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
