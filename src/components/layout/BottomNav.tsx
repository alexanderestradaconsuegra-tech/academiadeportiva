"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useT } from "@/lib/i18n/useT"
import { nav } from "@/lib/i18n/dictionaries/nav"
import { MAIN_NAV, MORE_NAV, SETTINGS_NAV, visibleTo } from "./nav-items"

// Phone bar: the same five main pages as the sidebar plus a "More" sheet.
const SHORT: Partial<Record<string, "home" | "paymentsNav">> = { dashboard: "home" }

export default function BottomNav() {
  const pathname = usePathname()
  const { currentUser } = useApp()
  const t = useT(nav)
  const isAssistant = currentUser?.role === "assistant"
  const [open, setOpen] = useState(false)

  const main = visibleTo(MAIN_NAV, isAssistant)
  const more = visibleTo([...MORE_NAV, SETTINGS_NAV], isAssistant)
  const moreActive = more.some(i => pathname.startsWith(i.href))

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {open && (
        <>
          <button aria-label="Cerrar" className="no-print fixed inset-0 z-30 md:hidden bg-black/20" onClick={() => setOpen(false)} />
          <div
            className="no-print fixed left-3 right-3 z-40 md:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 grid grid-cols-3 gap-1 animate-fade-in"
            style={{ bottom: "calc(68px + env(safe-area-inset-bottom))" }}
          >
            {more.map(({ href, icon: Icon, label, badge }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href} className={cn(
                  "relative flex flex-col items-center gap-1 py-3 rounded-xl text-[11px] font-semibold text-center",
                  active ? "bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400" : "text-slate-600 dark:text-slate-300"
                )}>
                  <Icon size={20} />
                  <span className="leading-tight px-1">{t(label)}</span>
                  {badge && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                </Link>
              )
            })}
          </div>
        </>
      )}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-bottom">
        <div className="flex items-end pt-1 pb-safe overflow-hidden">
          {main.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-0.5 py-1 flex-1 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                  active ? "bg-lime-400 shadow-md shadow-lime-400/40 dark:shadow-none" : "bg-transparent"
                )}>
                  <Icon size={16} className={cn("transition-colors", active ? "text-[#05122F]" : "text-slate-400 dark:text-slate-500")} />
                </div>
                <span className={cn("text-[9px] font-semibold leading-none truncate w-full text-center",
                  active ? "text-lime-700 dark:text-lime-400" : "text-slate-400 dark:text-slate-500")}>
                  {t(SHORT[label] ?? label)}
                </span>
              </Link>
            )
          })}
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
            className="flex flex-col items-center gap-0.5 px-0.5 py-1 flex-1 min-w-0">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
              open || moreActive ? "bg-lime-400 shadow-md shadow-lime-400/40 dark:shadow-none" : "bg-transparent")}>
              <MoreHorizontal size={16} className={open || moreActive ? "text-[#05122F]" : "text-slate-400 dark:text-slate-500"} />
            </div>
            <span className={cn("text-[9px] font-semibold leading-none",
              open || moreActive ? "text-lime-700 dark:text-lime-400" : "text-slate-400 dark:text-slate-500")}>{t("more")}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
