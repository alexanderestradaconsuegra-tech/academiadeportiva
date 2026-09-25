"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Insight, InsightTone } from "@/lib/insights"
import { AlertTriangle, TrendingDown, Trophy, Info, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react"

const TONE: Record<InsightTone, { icon: typeof Info; box: string; iconColor: string; title: string }> = {
  alert:   { icon: AlertTriangle, box: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",             iconColor: "text-red-500",     title: "text-red-700 dark:text-red-300" },
  warning: { icon: TrendingDown,  box: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",     iconColor: "text-amber-500",   title: "text-amber-800 dark:text-amber-300" },
  good:    { icon: Trophy,        box: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", iconColor: "text-emerald-500", title: "text-emerald-800 dark:text-emerald-300" },
  info:    { icon: Info,          box: "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700",        iconColor: "text-slate-400",   title: "text-slate-700 dark:text-slate-200" },
}

/**
 * "Lo que tenés que saber hoy" — the answer at the top of a page that used to
 * only ask for input. Short on purpose: five findings a coach acts on beat
 * twenty they scroll past.
 */
export default function InsightsPanel({
  insights, emptyText, limit = 5,
}: {
  insights: Insight[]
  emptyText: string
  limit?: number
}) {
  const shown = insights.slice(0, limit)

  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles size={15} className="text-lime-600 dark:text-lime-400 shrink-0" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lo que tenés que saber hoy</h2>
        {insights.length > limit && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">+{insights.length - limit} más</span>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {shown.map(ins => {
            const tone = TONE[ins.tone]
            const Icon = tone.icon
            const body = (
              <div className={cn("h-full rounded-2xl border p-3.5 flex gap-3", tone.box, ins.href && "hover:shadow-sm transition-shadow")}>
                <Icon size={18} className={cn("shrink-0 mt-0.5", tone.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold leading-snug", tone.title)}>{ins.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{ins.detail}</p>
                  {ins.action && ins.href && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-2">
                      {ins.action} <ChevronRight size={12} />
                    </span>
                  )}
                </div>
              </div>
            )
            return ins.href
              ? <Link key={ins.id} href={ins.href} className="block">{body}</Link>
              : <div key={ins.id}>{body}</div>
          })}
        </div>
      )}
    </section>
  )
}
