"use client"
import { useMemo } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import { cn, formatDate } from "@/lib/utils"
import type { Category } from "@/lib/types"
import { Dumbbell, Trophy, MapPin, Clock, CalendarDays } from "lucide-react"

/**
 * Trainings and matches in one list.
 *
 * Matches lived on their own page, so the "calendar" showed half of what a
 * coach or family is committed to — the one screen meant to answer "what do
 * we have this week" couldn't.
 */
export default function UpcomingAgenda({ categoryFilter, days = 14 }: { categoryFilter?: Category | null; days?: number }) {
  const { trainings, matches } = useApp()

  const items = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const end = (() => {
      const d = new Date(today + "T00:00:00Z")
      d.setUTCDate(d.getUTCDate() + days)
      return d.toISOString().split("T")[0]
    })()

    const inRange = (date: string) => date >= today && date <= end
    const matchesCategory = (c: Category | null) => !categoryFilter || !c || c === categoryFilter

    const t = trainings
      .filter(tr => inRange(tr.date) && matchesCategory(tr.category))
      .map(tr => ({
        kind: "training" as const,
        id: tr.id,
        date: tr.date,
        time: tr.time,
        title: tr.title,
        subtitle: tr.location,
        category: tr.category,
        href: null as string | null,
      }))

    const m = matches
      .filter(mt => inRange(mt.date) && matchesCategory(mt.category))
      .map(mt => ({
        kind: "match" as const,
        id: mt.id,
        date: mt.date,
        time: mt.time,
        title: `${mt.is_home ? "vs" : "@"} ${mt.opponent}`,
        subtitle: mt.competition || mt.location,
        category: mt.category,
        href: `/matches/${mt.id}`,
      }))

    return [...t, ...m].sort(
      (a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "")
    )
  }, [trainings, matches, categoryFilter, days])

  // Grouped by day so a week reads as a week, not as an undifferentiated list.
  const byDay = useMemo(() => {
    const map = new Map<string, typeof items>()
    items.forEach(it => {
      const list = map.get(it.date) ?? []
      list.push(it)
      map.set(it.date, list)
    })
    return Array.from(map.entries())
  }, [items])

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 py-10 text-center mb-5">
        <CalendarDays size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          Nada agendado en los próximos {days} días
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-5">
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Próximos {days} días</h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">Entrenamientos y partidos juntos</p>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {byDay.map(([date, dayItems]) => (
          <div key={date} className="px-4 sm:px-5 py-3">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {dayItems.map(it => {
                const row = (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      it.kind === "match"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600"
                        : "bg-lime-100 dark:bg-lime-500/20 text-lime-700 dark:text-lime-400"
                    )}>
                      {it.kind === "match" ? <Trophy size={15} /> : <Dumbbell size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{it.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {it.time && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {it.time}
                          </span>
                        )}
                        {it.category && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{it.category}</span>
                        )}
                        {it.subtitle && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
                            <MapPin size={10} /> {it.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
                return it.href
                  ? <Link key={`${it.kind}-${it.id}`} href={it.href} className="block rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-2 px-2 py-1">{row}</Link>
                  : <div key={`${it.kind}-${it.id}`} className="-mx-2 px-2 py-1">{row}</div>
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
