"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import ChartSkeleton from "@/components/ui/ChartSkeleton"
import { CATEGORY_SCORES, PROGRESS_DATA } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"
import { useT } from "@/lib/i18n/useT"
import { charts } from "@/lib/i18n/dictionaries/charts"

const ProgressAreaChart = dynamic(() => import("@/components/charts/ChartsPageCharts").then(m => m.ProgressAreaChart), { ssr: false, loading: () => <ChartSkeleton height={220} /> })
const CategoryBarChart = dynamic(() => import("@/components/charts/ChartsPageCharts").then(m => m.CategoryBarChart), { ssr: false, loading: () => <ChartSkeleton height={220} /> })
const MonthlyEvolutionChart = dynamic(() => import("@/components/charts/ChartsPageCharts").then(m => m.MonthlyEvolutionChart), { ssr: false, loading: () => <ChartSkeleton height={220} /> })
const ComparisonBarChart = dynamic(() => import("@/components/charts/ChartsPageCharts").then(m => m.ComparisonBarChart), { ssr: false, loading: () => <ChartSkeleton height={220} /> })
const AttrRadarChart = dynamic(() => import("@/components/charts/ChartsPageCharts").then(m => m.AttrRadarChart), { ssr: false, loading: () => <ChartSkeleton height={220} /> })

const COLORS = ["#a3e635","#10B981","#F59E0B","#EF4444","#8B5CF6","#F97316"]

export default function ChartsPage() {
  const { players, evaluations, getLatestEvaluation } = useApp()
  const t = useT(charts)
  const [compareA, setCompareA] = useState(players[0]?.id ?? "")
  const [compareB, setCompareB] = useState(players[1]?.id ?? "")

  const ATTRS = [
    { key: "speed_score", label: t("attrSpeed") },
    { key: "strength_score", label: t("attrStrength") },
    { key: "technique_score", label: t("attrTechnique") },
    { key: "resistance_score", label: t("attrResistance") },
    { key: "power_score", label: t("attrPower") },
    { key: "agility_score", label: t("attrAgility") },
  ]

  const evalA = getLatestEvaluation(compareA)
  const evalB = getLatestEvaluation(compareB)
  const playerA = players.find(p => p.id === compareA)
  const playerB = players.find(p => p.id === compareB)

  const compareData = ATTRS.map(a => ({
    attr: a.label.substring(0, 3),
    [playerA?.name.split(" ")[0] ?? "A"]: evalA?.[a.key as keyof typeof evalA] as number ?? 0,
    [playerB?.name.split(" ")[0] ?? "B"]: evalB?.[a.key as keyof typeof evalB] as number ?? 0,
  }))

  const radarA = ATTRS.map(a => ({
    subject: a.label.substring(0, 3),
    value: evalA?.[a.key as keyof typeof evalA] as number ?? 0,
  }))
  const radarB = ATTRS.map(a => ({
    subject: a.label.substring(0, 3),
    value: evalB?.[a.key as keyof typeof evalB] as number ?? 0,
  }))

  const monthlyData = [
    { month: t("monthJul"), ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(65 + Math.random() * 20)])) },
    { month: t("monthAug"), ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(67 + Math.random() * 20)])) },
    { month: t("monthSep"), ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(70 + Math.random() * 20)])) },
    { month: t("monthOct"), ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(73 + Math.random() * 20)])) },
    { month: t("monthNov"), ...Object.fromEntries(players.slice(0,3).map((p, i) => [p.name.split(" ")[0], [84, 80, 83][i]])) },
  ]

  const top3 = players.slice(0, 3)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Progress line */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("teamProgress")}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("monthlyAverageScore")}</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">+12 pts ↑</span>
            </div>
            <ProgressAreaChart data={PROGRESS_DATA} pointsLabel={t("points")} scoreLabel={t("score")} />
          </div>

          {/* Category bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("scoreByCategory")}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("fullTeamAverage")}</p>
            </div>
            <CategoryBarChart data={CATEGORY_SCORES} pointsLabel={t("points")} />
          </div>

          {/* Evolution multi-line */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("monthlyEvolutionByPlayer")}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("top3Players")}</p>
            </div>
            <MonthlyEvolutionChart data={monthlyData} players={top3} colors={COLORS} />
          </div>

          {/* Comparison bars */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("comparisonBetweenPlayers")}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("headToHeadAttributes")}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={compareA} onChange={e => setCompareA(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:border-lime-500 outline-none cursor-pointer">
                  {players.map(p => <option key={p.id} value={p.id}>{p.name.split(" ")[0]}</option>)}
                </select>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t("vs")}</span>
                <select value={compareB} onChange={e => setCompareB(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:border-lime-500 outline-none cursor-pointer">
                  {players.map(p => <option key={p.id} value={p.id}>{p.name.split(" ")[0]}</option>)}
                </select>
              </div>
            </div>
            <ComparisonBarChart data={compareData} playerAName={playerA?.name} playerBName={playerB?.name} />
          </div>
        </div>

        {/* Radar comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("radarComparisonTitle")}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">{playerA?.name.split(" ")[0]} {t("vs")} {playerB?.name.split(" ")[0]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { name: playerA?.name ?? "A", data: radarA, color: "#a3e635" },
              { name: playerB?.name ?? "B", data: radarB, color: "#10B981" },
            ].map(({ name, data, color }) => (
              <div key={name}>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center mb-3">{name}</p>
                <AttrRadarChart data={data} color={color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
