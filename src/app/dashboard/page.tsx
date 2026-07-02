"use client"
import { useMemo } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import StatCard from "@/components/ui/StatCard"
import { Users, TrendingUp, AlertTriangle, Activity, ChevronRight, Star, CreditCard } from "lucide-react"
import type { ActivityCategory, Evaluation } from "@/lib/types"
import { effectivePaymentStatus } from "@/lib/types"
import { payments as paymentsDict } from "@/lib/i18n/dictionaries/payments"
import { cn, formatDate, getCategoryColor } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts"
import { useT } from "@/lib/i18n/useT"
import { dashboard } from "@/lib/i18n/dictionaries/dashboard"
import { useEnumT } from "@/lib/i18n/enums"

export default function DashboardPage() {
  const { players, activities, evaluations, payments, getLatestEvaluation, language } = useApp()
  const t = useT(dashboard)
  const tp = useT(paymentsDict)
  const e = useEnumT()

  const stats = useMemo(() => {
    const allScores = players.map(p => getLatestEvaluation(p.id)?.general_score ?? 0).filter(Boolean)
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
    const lowPerf = players.filter(p => (getLatestEvaluation(p.id)?.general_score ?? 100) < 75)
    const bestPlayer = players.reduce((best, p) => {
      const score = getLatestEvaluation(p.id)?.general_score ?? 0
      return score > (getLatestEvaluation(best?.id ?? "")?.general_score ?? 0) ? p : best
    }, players[0])
    return { avgScore, lowPerf, bestPlayer }
  }, [players, getLatestEvaluation])

  const progressData = useMemo(() => {
    if (!evaluations.length) return []
    const byMonth = new Map<string, number[]>()
    evaluations.forEach(ev => {
      const [year, month] = ev.date.split("-")
      const key = `${year}-${month}`
      if (!byMonth.has(key)) byMonth.set(key, [])
      byMonth.get(key)!.push(ev.general_score)
    })
    const sortedKeys = Array.from(byMonth.keys()).sort().slice(-6)
    const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-CO"
    return sortedKeys.map(key => {
      const scores = byMonth.get(key)!
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const label = new Date(`${key}-01`).toLocaleString(locale, { month: "short" })
      return { month: label.charAt(0).toUpperCase() + label.slice(1), score: avg }
    })
  }, [evaluations, language])

  const categoryScores = useMemo(() => {
    const latestEvals = players.map(p => getLatestEvaluation(p.id)).filter((ev): ev is Evaluation => !!ev)
    if (!latestEvals.length) return []
    const avg = (scores: number[]) => Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return [
      { key: "Velocidad" as ActivityCategory, score: avg(latestEvals.map(ev => ev.speed_score)),      fill: "#F59E0B" },
      { key: "Fuerza" as ActivityCategory,    score: avg(latestEvals.map(ev => ev.strength_score)),   fill: "#EF4444" },
      { key: "Técnica" as ActivityCategory,   score: avg(latestEvals.map(ev => ev.technique_score)),  fill: "#3B82F6" },
      { key: "Resistencia" as ActivityCategory, score: avg(latestEvals.map(ev => ev.resistance_score)), fill: "#10B981" },
      { key: "Potencia" as ActivityCategory,  score: avg(latestEvals.map(ev => ev.power_score)),      fill: "#F97316" },
      { key: "Agilidad" as ActivityCategory,  score: avg(latestEvals.map(ev => ev.agility_score)),    fill: "#8B5CF6" },
    ]
  }, [players, getLatestEvaluation])

  const progressTrend = progressData.length >= 2
    ? progressData[progressData.length - 1].score - progressData[0].score
    : null

  const paymentAlerts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const overdue = payments.filter(p => effectivePaymentStatus(p, today) === "overdue")
    const overduePlayerIds = new Set(overdue.map(p => p.player_id))
    return {
      playerCount: overduePlayerIds.size,
      total: overdue.reduce((s, p) => s + p.amount, 0),
    }
  }, [payments])

  const recentActivities = activities.slice(0, 6)
  const topPlayers = [...players]
    .sort((a, b) => (getLatestEvaluation(b.id)?.general_score ?? 0) - (getLatestEvaluation(a.id)?.general_score ?? 0))
    .slice(0, 4)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 md:p-6 mb-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-1">{t("welcomeBack")}</p>
            <h1 className="text-white text-2xl font-bold tracking-tight">{t("controlPanel")}</h1>
            <p className="text-blue-200/70 text-sm mt-1">{t("performanceSummary")} — {new Date().toLocaleDateString(language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-CO", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-5">
          <StatCard
            title={t("totalPlayers")}
            value={players.length}
            subtitle={t("registeredInSystem")}
            icon={<Users size={20} />}
            color="blue"
            trend={{ value: 20, label: t("thisMonth") }}
          />
          <StatCard
            title={t("activePlayers")}
            value={players.length - stats.lowPerf.length}
            subtitle={t("optimalPerformance")}
            icon={<Activity size={20} />}
            color="green"
          />
          <StatCard
            title={t("averageScore")}
            value={stats.avgScore}
            subtitle={t("teamGeneralEvaluation")}
            icon={<TrendingUp size={20} />}
            color="purple"
            trend={{ value: 5, label: t("vsLastMonth") }}
          />
          <StatCard
            title={t("lowPerformance")}
            value={stats.lowPerf.length}
            subtitle={t("needsSpecialAttention")}
            icon={<AlertTriangle size={20} />}
            color={stats.lowPerf.length > 0 ? "amber" : "green"}
          />
        </div>

        {/* Payment alert */}
        {paymentAlerts.playerCount > 0 && (
          <Link href="/payments?status=overdue" className="flex items-center gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-5 py-4 mb-5 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{tp("paymentAlert")}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{paymentAlerts.playerCount} {tp("studentsOverdue")} · <strong>${paymentAlerts.total.toLocaleString()}</strong></p>
            </div>
            <ChevronRight size={16} className="text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
          {/* Progress chart */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("teamProgress")}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("averageScoreLast6Months")}</p>
              </div>
              {progressTrend !== null && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${progressTrend >= 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-red-500 bg-red-50 dark:bg-red-500/10"}`}>
                  {progressTrend >= 0 ? "↑" : "↓"} {progressTrend >= 0 ? "+" : ""}{progressTrend} pts
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={progressData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5CFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0B5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  formatter={(v: number) => [`${v} ${t("points")}`, t("score")]}
                />
                <Area type="monotone" dataKey="score" stroke="#0B5CFF" strokeWidth={2.5} fill="url(#colorScore)" dot={{ fill: "#0B5CFF", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#0B5CFF" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category bar chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("byCategory")}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{t("teamAverageScore")}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryScores.map(c => ({ ...c, name: e.activityCategory(c.key) }))} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v} ${t("points")}`, t("score")]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                  {categoryScores.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Top players */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("topPlayers")}</h2>
              <Link href="/players" className="text-xs text-[#0B5CFF] font-semibold hover:underline flex items-center gap-1">
                {t("viewAll")} <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {topPlayers.map((player, i) => {
                const ev = getLatestEvaluation(player.id)
                const score = ev?.general_score ?? 0
                return (
                  <Link key={player.id} href={`/players/${player.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                    <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                      i === 0 ? "bg-amber-100 dark:bg-amber-500/15 text-amber-600" : i === 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"
                    )}>{i + 1}</span>
                    <img src={player.photo_url} alt={player.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{player.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{e.position(player.position)} · {e.category(player.category)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", score >= 85 ? "text-emerald-500" : score >= 70 ? "text-[#0B5CFF]" : "text-amber-500")}>{score}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{t("points")}</p>
                    </div>
                    {i === 0 && <Star className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" />}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("latestActivities")}</h2>
              <Link href="/activities" className="text-xs text-[#0B5CFF] font-semibold hover:underline flex items-center gap-1">
                {t("viewAllFem")} <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivities.map(a => {
                const player = players.find(p => p.id === a.player_id)
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", getCategoryColor(a.category).split(" ")[0].replace("text-", "bg-"))}>
                      <div className={cn("w-2 h-2 rounded-full", a.category === "Velocidad" ? "bg-yellow-400" : a.category === "Técnica" ? "bg-blue-400" : a.category === "Fuerza" ? "bg-red-400" : a.category === "Resistencia" ? "bg-emerald-400" : a.category === "Potencia" ? "bg-orange-400" : a.category === "Pliometría" ? "bg-pink-400" : "bg-purple-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.exercise}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{player?.name ?? "?"} · {formatDate(a.date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.value} <span className="font-normal text-slate-400 dark:text-slate-500">{e.activityUnit(a.unit)}</span></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
