"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useT } from "@/lib/i18n/useT"
import { dashboard } from "@/lib/i18n/dictionaries/dashboard"
import { cn } from "@/lib/utils"

const KEY = "metrikas-getting-started-hidden"

/**
 * A short guide for a new academy. Each step is "done" when the data exists, so
 * there is nothing to maintain, and the whole card disappears once all three
 * are done (or when the coach hides it).
 */
export default function GettingStarted() {
  const { players, trainings, payments, currentUser, dataReady } = useApp()
  const t = useT(dashboard)
  const [hidden, setHidden] = useState(true) // hidden until we know, to avoid a flash
  useEffect(() => {
    try { setHidden(localStorage.getItem(KEY) === "1") } catch { setHidden(false) }
  }, [])

  if (!dataReady || currentUser?.role !== "coach" || hidden) return null

  const steps = [
    { done: players.length > 0, href: "/players/new", title: t("gsPlayers"), hint: t("gsPlayersHint") },
    { done: trainings.length > 0, href: "/calendar", title: t("gsTraining"), hint: t("gsTrainingHint") },
    { done: payments.length > 0, href: "/payments", title: t("gsPayment"), hint: t("gsPaymentHint") },
  ]
  if (steps.every(s => s.done)) return null
  const next = steps.findIndex(s => !s.done)

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-lime-200 dark:border-lime-500/20 mb-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("gsTitle")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("gsSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => { setHidden(true); try { localStorage.setItem(KEY, "1") } catch { /* private mode */ } }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {t("gsHide")}
        </button>
      </div>
      <ol className="grid gap-2 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors group",
                s.done
                  ? "border-slate-100 dark:border-slate-800 opacity-60"
                  : i === next
                    ? "border-lime-300 dark:border-lime-500/40 bg-lime-50 dark:bg-lime-500/10"
                    : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              {s.done
                ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                : <Circle size={20} className="text-slate-300 dark:text-slate-600 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", s.done ? "line-through text-slate-500" : "text-slate-900 dark:text-white")}>{s.title}</p>
                {!s.done && <p className="text-xs text-slate-500 dark:text-slate-400">{s.hint}</p>}
              </div>
              {!s.done && <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
