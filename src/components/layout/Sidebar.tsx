"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/useT"
import { nav } from "@/lib/i18n/dictionaries/nav"
import { common } from "@/lib/i18n/dictionaries/common"
import { useEffect, useState } from "react"
import { LogOut, ChevronRight, ChevronDown, Sun, Moon } from "lucide-react"
import { MAIN_NAV, MORE_NAV, SETTINGS_NAV, visibleTo, type NavItem } from "./nav-items"
import PushToggle from "@/components/PushToggle"
import MetrikasLogo from "@/components/ui/MetrikasLogo"

export default function Sidebar() {
  const pathname = usePathname()
  const { currentUser, logout, teamSettings, darkMode, toggleDarkMode } = useApp()
  const t = useT(nav)
  const tCommon = useT(common)

  const isAssistant = currentUser?.role === "assistant"

  const main = visibleTo(MAIN_NAV, isAssistant)
  const more = visibleTo(MORE_NAV, isAssistant)
  const settings = visibleTo([SETTINGS_NAV], isAssistant)

  // The "more tools" group opens by itself when you are on one of its pages,
  // and remembers if you left it open.
  const moreActive = more.some(i => pathname.startsWith(i.href))
  const [moreOpenPref, setMoreOpenPref] = useState(false)
  useEffect(() => {
    try { setMoreOpenPref(localStorage.getItem("metrikas-nav-more") === "1") } catch { /* private mode */ }
  }, [])
  const moreOpen = moreOpenPref || moreActive
  const toggleMore = () => {
    const next = !moreOpenPref
    setMoreOpenPref(next)
    try { localStorage.setItem("metrikas-nav-more", next ? "1" : "0") } catch { /* private mode */ }
  }

  const renderItem = ({ href, icon: Icon, label, badge }: NavItem) => {
    const active = pathname.startsWith(href)
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
          active
            ? "bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 border-l-[3px] border-lime-600 dark:border-lime-400 pl-[9px]"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        <Icon className={cn("w-4.5 h-4.5", active ? "text-lime-700 dark:text-lime-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600")} size={18} />
        <span className="flex-1">{t(label)}</span>
        {badge && !active && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/15 text-red-600 animate-pulse">{badge}</span>
        )}
        {active && <ChevronRight className="w-3.5 h-3.5 text-lime-700 dark:text-lime-400" />}
      </Link>
    )
  }

  return (
    <aside className="no-print hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-slate-900/10 overflow-hidden shrink-0">
            {teamSettings?.logo_url ? (
              <img src={teamSettings.logo_url} alt={teamSettings.name} className="w-full h-full object-cover" />
            ) : (
              <MetrikasLogo variant="icon" height={22} theme="dark" />
            )}
          </div>
          <div className="min-w-0">
            {teamSettings?.name
              ? <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate block">{teamSettings.name}</span>
              : <><MetrikasLogo variant="full" height={15} theme="light" className="dark:hidden" /><MetrikasLogo variant="full" height={15} theme="dark" className="hidden dark:block" /></>
            }
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Pro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">{t("menu")}</p>
        {main.map(renderItem)}

        <button
          type="button"
          onClick={toggleMore}
          aria-expanded={moreOpen}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <ChevronDown size={18} className={cn("transition-transform duration-200", moreOpen ? "" : "-rotate-90")} />
          <span className="flex-1 text-left">{t("moreTools")}</span>
        </button>
        {moreOpen && <div className="space-y-0.5">{more.map(renderItem)}</div>}

        {settings.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">{settings.map(renderItem)}</div>
        )}
      </nav>

      {/* Push toggle — solo entrenador */}
      {currentUser?.role === "coach" && (
        <div className="px-4 pb-3">
          <PushToggle />
        </div>
      )}

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-[#05122F] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {currentUser?.full_name.charAt(0) ?? "E"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{currentUser?.full_name || t("trainer")}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {isAssistant ? `Asistente · ${currentUser?.category ?? ""}` : t("coach")}
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title={t("changeTheme")}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            title={tCommon("logout")}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
