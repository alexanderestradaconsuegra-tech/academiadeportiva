"use client"
import { useState } from "react"
import ScoreRing from "@/components/ui/ScoreRing"
import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts"
import { cn, formatDate } from "@/lib/utils"
import type { Evaluation, ActivityCategory } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"

const ATTR_KEYS: Record<string, ActivityCategory> = {
  speed_score: "Velocidad",
  strength_score: "Fuerza",
  technique_score: "Técnica",
  resistance_score: "Resistencia",
  power_score: "Potencia",
  agility_score: "Agilidad",
}

export default function EvaluationComparison({ evaluations }: { evaluations: Evaluation[] }) {
  const t = useT(playersDict)
  const e = useEnumT()
  const sorted = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const [beforeId, setBeforeId] = useState(sorted[0].id)
  const [afterId, setAfterId] = useState(sorted[sorted.length - 1].id)
  const before = sorted.find(ev => ev.id === beforeId) ?? sorted[0]
  const after = sorted.find(ev => ev.id === afterId) ?? sorted[sorted.length - 1]

  const radarData = Object.entries(ATTR_KEYS).map(([k, attrKey]) => ({
    subject: e.activityCategory(attrKey).substring(0, 3),
    before: before[k as keyof Evaluation] as number,
    after: after[k as keyof Evaluation] as number,
  }))

  const rows = Object.entries(ATTR_KEYS).map(([k, attrKey]) => {
    const b = before[k as keyof Evaluation] as number
    const a = after[k as keyof Evaluation] as number
    return { key: k, label: e.activityCategory(attrKey), before: b, after: a, delta: a - b }
  })

  const generalDelta = after.general_score - before.general_score
  const selectClass = "h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer"

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("beforeAfterComparison")}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("evolutionBetweenEvals")}</p>
        </div>
        <div className="flex items-center gap-2 w-full">
          <select value={beforeId} onChange={ev => setBeforeId(ev.target.value)} className={selectClass + " flex-1 min-w-0"}>
            {sorted.map(ev => <option key={ev.id} value={ev.id}>{formatDate(ev.date)}</option>)}
          </select>
          <ArrowRight size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <select value={afterId} onChange={ev => setAfterId(ev.target.value)} className={selectClass + " flex-1 min-w-0"}>
            {sorted.map(ev => <option key={ev.id} value={ev.id}>{formatDate(ev.date)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
        <ScoreRing score={before.general_score} size={56} strokeWidth={5} />
        <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
        <ScoreRing score={after.general_score} size={56} strokeWidth={5} />
        <div className="flex-1 text-right">
          <span className={cn(
            "inline-flex items-center gap-1 text-sm font-black px-2.5 py-1 rounded-lg",
            generalDelta > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" :
            generalDelta < 0 ? "text-red-500 bg-red-50 dark:bg-red-500/10" :
            "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
          )}>
            {generalDelta > 0 ? <ArrowUp size={13} /> : generalDelta < 0 ? <ArrowDown size={13} /> : null}
            {generalDelta > 0 ? "+" : ""}{generalDelta} pts
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t("generalScore")}</p>
        </div>
      </div>

      <div className="overflow-hidden">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 15, right: 30, bottom: 15, left: 30 }}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748B" }} />
            <Radar name={t("beforeLabel")} dataKey="before" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.12} strokeWidth={2} dot={{ r: 3, fill: "#94A3B8", strokeWidth: 0 }} />
            <Radar name={t("afterLabel")} dataKey="after" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#0B5CFF", strokeWidth: 0 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {rows.map(r => (
          <div key={r.key} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{r.label}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-400 dark:text-slate-500">
                {r.before} <ArrowRight size={10} className="inline -mt-0.5" /> <span className="font-bold text-slate-800 dark:text-slate-100">{r.after}</span>
              </span>
              <span className={cn(
                "text-xs font-bold flex items-center gap-0.5 shrink-0",
                r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-red-500" : "text-slate-400 dark:text-slate-500"
              )}>
                {r.delta > 0 ? <ArrowUp size={11} /> : r.delta < 0 ? <ArrowDown size={11} /> : null}
                {r.delta !== 0 ? `${r.delta > 0 ? "+" : ""}${r.delta}` : "="}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
