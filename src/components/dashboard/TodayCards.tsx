"use client"
import { useMemo } from "react"
import Link from "next/link"
import { CalendarDays, CreditCard, HeartPulse, ChevronRight, CheckCircle2 } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { effectivePaymentStatus } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { dashboard } from "@/lib/i18n/dictionaries/dashboard"
import { payments as paymentsDict } from "@/lib/i18n/dictionaries/payments"
import { cn } from "@/lib/utils"

const shell = "bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 flex flex-col"

/**
 * "What do I have to do today": today's sessions, overdue payments, and the
 * players who need attention. Built only from data the dashboard already loads.
 */
export default function TodayCards() {
  const { players, trainings, matches, payments, injuries, getLatestEvaluation, currentUser } = useApp()
  const t = useT(dashboard)
  const tp = useT(paymentsDict)
  const isAssistant = currentUser?.role === "assistant"

  // Local calendar day (toISOString would be tomorrow in the evening in Chile).
  const today = new Date().toLocaleDateString("en-CA")

  const agenda = useMemo(() => {
    const items = [
      ...trainings.map(x => ({ id: x.id, date: x.date, time: x.time, title: x.title, match: false })),
      ...matches.map(x => ({ id: x.id, date: x.date, time: x.time, title: `vs ${x.opponent}`, match: true })),
    ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    const todays = items.filter(i => i.date === today)
    return { todays, next: todays.length ? null : items.find(i => i.date > today) ?? null }
  }, [trainings, matches, today])

  const overdue = useMemo(() => {
    const od = payments.filter(p => effectivePaymentStatus(p, today) === "overdue")
    return { count: new Set(od.map(p => p.player_id)).size, total: od.reduce((s, p) => s + p.amount, 0) }
  }, [payments, today])

  const attention = useMemo(() => {
    const injuredIds = new Set(injuries.filter(i => !i.is_recovered).map(i => i.player_id))
    return players
      .map(p => ({
        player: p,
        injured: injuredIds.has(p.id),
        low: (getLatestEvaluation(p.id)?.general_score ?? 100) < 75,
      }))
      .filter(x => x.injured || x.low)
  }, [players, injuries, getLatestEvaluation])

  return (
    <section aria-label={t("todayTitle")} className={cn("grid gap-3 md:gap-4 mb-5", isAssistant ? "md:grid-cols-2" : "lg:grid-cols-3")}>
      <div className={shell}>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
          <CalendarDays size={16} className="text-lime-700 dark:text-lime-400" /> {t("todayTrainings")}
        </h2>
        {agenda.todays.length > 0 ? (
          <ul className="space-y-2">
            {agenda.todays.slice(0, 4).map(i => (
              <li key={i.id}>
                <Link href={i.match ? `/matches/${i.id}` : "/calendar"} className="flex items-center gap-3 text-sm hover:text-lime-700 dark:hover:text-lime-400 transition-colors">
                  <span className="tabular-nums font-bold text-slate-900 dark:text-white w-12">{i.time?.slice(0, 5)}</span>
                  <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{i.title}</span>
                  {i.match && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">{t("matchTag")}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>{t("nothingToday")}</p>
            {agenda.next && <p className="text-xs mt-1">{t("nextUp")}: {agenda.next.date} · {agenda.next.time?.slice(0, 5)} · {agenda.next.title}</p>}
            <Link href="/calendar" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-lime-700 dark:text-lime-400 hover:underline">
              {t("addToCalendar")} <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {!isAssistant && (
        <Link href="/payments?status=overdue" className={cn(shell, "card-hover group", overdue.count > 0 && "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10")}>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
            <CreditCard size={16} className={overdue.count > 0 ? "text-amber-600" : "text-lime-700 dark:text-lime-400"} /> {tp("paymentAlert")}
          </h2>
          {overdue.count > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-3xl font-bold tracking-tight tabular-nums text-amber-700 dark:text-amber-300">${overdue.total.toLocaleString()}</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-1 flex items-center gap-1">
                {overdue.count} {tp("studentsOverdue")} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CheckCircle2 size={16} className="text-emerald-500" /> {t("allPaidUp")}</p>
          )}
        </Link>
      )}

      <div className={shell}>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
          <HeartPulse size={16} className={attention.length ? "text-red-500" : "text-lime-700 dark:text-lime-400"} /> {t("attentionTitle")}
        </h2>
        {attention.length > 0 ? (
          <ul className="space-y-2">
            {attention.slice(0, 4).map(({ player, injured, low }) => (
              <li key={player.id}>
                <Link href={`/players/${player.id}`} className="flex items-center gap-3 text-sm hover:text-lime-700 dark:hover:text-lime-400 transition-colors">
                  <span className="flex-1 truncate text-slate-700 dark:text-slate-200 font-medium">{player.name}</span>
                  {injured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/15 text-red-600">{t("injuredTag")}</span>}
                  {low && !injured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">{t("lowTag")}</span>}
                </Link>
              </li>
            ))}
            {attention.length > 4 && <li className="text-xs text-slate-400">+{attention.length - 4}</li>}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CheckCircle2 size={16} className="text-emerald-500" /> {t("noAttention")}</p>
        )}
      </div>
    </section>
  )
}
