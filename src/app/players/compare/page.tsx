"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import { ArrowLeft, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Player, Evaluation, DominantFoot, Position, Category } from "@/lib/types"
import { cn, avatarUrl, getScoreColor } from "@/lib/utils"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend
} from "recharts"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"

const ATTR_KEYS = [
  { key: "speed_score",      labelKey: "speed"      as const },
  { key: "strength_score",   labelKey: "strength"   as const },
  { key: "technique_score",  labelKey: "technique"  as const },
  { key: "resistance_score", labelKey: "resistance" as const },
  { key: "power_score",      labelKey: "power"      as const },
  { key: "agility_score",    labelKey: "agility"    as const },
] as const

type AttrKey = typeof ATTR_KEYS[number]["key"]

function PlayerSelector({
  label, selected, players, onSelect,
}: {
  label: string
  selected: Player | null
  players: Player[]
  onSelect: (p: Player | null) => void
}) {
  const t = useT(playersDict)
  const e = useEnumT()

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <select
        value={selected?.id ?? ""}
        onChange={ev => {
          const p = players.find(p => p.id === ev.target.value) ?? null
          onSelect(p)
        }}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
      >
        <option value="">{t("selectPlayer")}</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} · {e.position(p.position as Position)} · {e.category(p.category as Category)}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <img
            src={selected.photo_url || avatarUrl(selected.name, selected.id)}
            alt={selected.name}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selected.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {e.position(selected.position as Position)} · {e.category(selected.category as Category)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {selected.age} {t("yearsOld")} · {e.dominantFoot(selected.dominant_foot as DominantFoot)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ scoreA, scoreB, label }: { scoreA: number; scoreB: number; label: string }) {
  const diff = scoreA - scoreB
  const aWins = diff > 0
  const bWins = diff < 0
  const tied = diff === 0

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* A side */}
      <div className="flex items-center gap-2 justify-end">
        <span className={cn("text-sm font-bold", getScoreColor(scoreA))}>{scoreA}</span>
        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex justify-end">
          <div
            className={cn("h-2 rounded-full transition-all", aWins ? "bg-[#0B5CFF]" : tied ? "bg-slate-400" : "bg-slate-200 dark:bg-slate-700")}
            style={{ width: `${scoreA}%` }}
          />
        </div>
        {aWins && <TrendingUp size={12} className="text-[#0B5CFF] shrink-0" />}
      </div>

      {/* Label */}
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center min-w-20 px-1">{label}</span>

      {/* B side */}
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-2 rounded-full transition-all", bWins ? "bg-purple-500" : tied ? "bg-slate-400" : "bg-slate-200 dark:bg-slate-700")}
            style={{ width: `${scoreB}%` }}
          />
        </div>
        <span className={cn("text-sm font-bold", getScoreColor(scoreB))}>{scoreB}</span>
        {bWins && <TrendingUp size={12} className="text-purple-500 shrink-0" />}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const { players, getLatestEvaluation } = useApp()
  const t = useT(playersDict)
  const e = useEnumT()

  const [playerA, setPlayerA] = useState<Player | null>(null)
  const [playerB, setPlayerB] = useState<Player | null>(null)

  const evalA = playerA ? getLatestEvaluation(playerA.id) : null
  const evalB = playerB ? getLatestEvaluation(playerB.id) : null

  const radarData = useMemo(() => {
    if (!evalA && !evalB) return []
    return ATTR_KEYS.map(({ key, labelKey }) => ({
      attr: t(labelKey),
      A: evalA?.[key as AttrKey] ?? 0,
      B: evalB?.[key as AttrKey] ?? 0,
    }))
  }, [evalA, evalB, t])

  const aWinsCount = ATTR_KEYS.filter(({ key }) =>
    (evalA?.[key as AttrKey] ?? 0) > (evalB?.[key as AttrKey] ?? 0)
  ).length
  const bWinsCount = ATTR_KEYS.filter(({ key }) =>
    (evalB?.[key as AttrKey] ?? 0) > (evalA?.[key as AttrKey] ?? 0)
  ).length

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("compareTitle")} subtitle={t("compareSubtitle")}>
          <Link href="/players" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={14} /> {t("backToPlayers")}
          </Link>
        </PageHeader>

        {/* Player selectors */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <PlayerSelector label={t("playerA")} selected={playerA} players={players.filter(p => p.id !== playerB?.id)} onSelect={setPlayerA} />
            <div className="flex items-center justify-center sm:mt-8 shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ArrowLeftRight size={14} className="text-slate-400" />
              </div>
            </div>
            <PlayerSelector label={t("playerB")} selected={playerB} players={players.filter(p => p.id !== playerA?.id)} onSelect={setPlayerB} />
          </div>
        </div>

        {(!playerA || !playerB) ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <ArrowLeftRight size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-sm">{t("selectBothPlayers")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Radar chart */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("radarOverlay")}</h2>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                    <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-700" />
                    <PolarAngleAxis dataKey="attr" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <Radar name={playerA.name} dataKey="A" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#0B5CFF" }} />
                    <Radar name={playerB.name} dataKey="B" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 text-center py-16">{t("noEvaluation")}</p>
              )}
            </div>

            {/* Attribute comparison bars */}
            <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("attributeComparison")}</h2>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-[#0B5CFF]">{playerA.name.split(" ")[0]} {aWinsCount}W</span>
                  <Minus size={12} className="text-slate-300" />
                  <span className="text-purple-500">{playerB.name.split(" ")[0]} {bWinsCount}W</span>
                </div>
              </div>

              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs font-semibold text-[#0B5CFF] truncate text-right">{playerA.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0B5CFF] shrink-0" />
                </div>
                <div className="min-w-20" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-purple-500 truncate">{playerB.name}</span>
                </div>
              </div>

              {/* General score row */}
              <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <ScoreBar
                  scoreA={evalA?.general_score ?? 0}
                  scoreB={evalB?.general_score ?? 0}
                  label={t("generalScore")}
                />
              </div>

              {/* Attribute rows */}
              <div className="space-y-3">
                {ATTR_KEYS.map(({ key, labelKey }) => (
                  <ScoreBar
                    key={key}
                    scoreA={evalA?.[key as AttrKey] ?? 0}
                    scoreB={evalB?.[key as AttrKey] ?? 0}
                    label={t(labelKey)}
                  />
                ))}
              </div>

              {/* No evaluation notice */}
              {(!evalA || !evalB) && (
                <p className="text-xs text-amber-500 mt-4 text-center">
                  {t("noEvaluation")} — {!evalA ? playerA.name : playerB.name}
                </p>
              )}
            </div>

            {/* Bio comparison */}
            <div className="xl:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("bioComparison")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t("age"),         a: `${playerA.age} ${t("yearsOld")}`,                  b: `${playerB.age} ${t("yearsOld")}` },
                  { label: t("heightLabel"), a: playerA.height ? `${playerA.height} cm` : "—",       b: playerB.height ? `${playerB.height} cm` : "—" },
                  { label: t("weightLabel"), a: playerA.weight ? `${playerA.weight} kg` : "—",       b: playerB.weight ? `${playerB.weight} kg` : "—" },
                  { label: t("dominantLeg"), a: e.dominantFoot(playerA.dominant_foot as DominantFoot), b: e.dominantFoot(playerB.dominant_foot as DominantFoot) },
                ].map(({ label, a, b }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0B5CFF] shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
