"use client"
import { useMemo } from "react"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import { workloadSummary, weeklyLoads, ZONE_LABELS, ZONE_ADVICE, type LoadZone } from "@/lib/workload"
import { Activity, TrendingUp } from "lucide-react"

const ZONE_STYLE: Record<LoadZone, { dot: string; text: string; bg: string; border: string }> = {
  sin_datos:  { dot: "bg-slate-300",   text: "text-slate-500",   bg: "bg-slate-50 dark:bg-slate-800/60",      border: "border-slate-200 dark:border-slate-700" },
  bajo:       { dot: "bg-blue-400",    text: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-500/10",        border: "border-blue-200 dark:border-blue-500/20" },
  optimo:     { dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10",  border: "border-emerald-200 dark:border-emerald-500/20" },
  precaucion: { dot: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-500/10",      border: "border-amber-200 dark:border-amber-500/20" },
  riesgo:     { dot: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50 dark:bg-red-500/10",          border: "border-red-200 dark:border-red-500/20" },
}

/** For a player, the same information without the jargon. */
const PLAYER_MESSAGE: Record<LoadZone, string> = {
  sin_datos: "Registra tu esfuerzo después de cada entrenamiento para ver tu carga.",
  bajo: "Vienes entrenando más suave que de costumbre.",
  optimo: "Tu carga viene bien: exigente pero sin pasarte.",
  precaucion: "Subiste bastante la exigencia esta semana. Descansa bien.",
  riesgo: "Cargaste mucho más que tu último mes. Cuidado con las lesiones.",
}

export default function WorkloadCard({ playerId, variant = "coach" }: { playerId: string; variant?: "coach" | "player" }) {
  const { getPlayerLoads } = useApp()
  const loads = getPlayerLoads(playerId)
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  const summary = useMemo(() => workloadSummary(loads, today), [loads, today])
  const weeks = useMemo(() => weeklyLoads(loads, today), [loads, today])
  const style = ZONE_STYLE[summary.zone]
  const maxWeek = Math.max(...weeks.map(w => w.total), 1)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-slate-400 shrink-0" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Carga de entrenamiento</h2>
      </div>

      <div className={cn("rounded-xl border p-3.5 mb-3", style.bg, style.border)}>
        <div className="flex items-center gap-2.5">
          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", style.dot)} />
          <p className={cn("text-sm font-bold", style.text)}>{ZONE_LABELS[summary.zone]}</p>
          {summary.ratio !== null && variant === "coach" && (
            <span className="ml-auto text-xs font-black text-slate-500 dark:text-slate-400 shrink-0">
              {summary.ratio.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          {variant === "player" ? PLAYER_MESSAGE[summary.zone] : ZONE_ADVICE[summary.zone]}
        </p>
      </div>

      {variant === "coach" && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">Esta semana</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{summary.acute.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{summary.acuteSessions} sesiones</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">Promedio 4 semanas</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{summary.chronic.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">por semana</p>
          </div>
        </div>
      )}

      {/* Four-week trend: the shape behind the ratio, so a coach can tell a
          spike from a steady build at a glance. */}
      <div className="flex items-end gap-1.5 h-16">
        {weeks.map((w, i) => (
          <div key={w.weekStart} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-t-md transition-all", i === weeks.length - 1 ? style.dot : "bg-slate-200 dark:bg-slate-700")}
              style={{ height: `${Math.max((w.total / maxWeek) * 100, 3)}%` }}
              title={`${w.total} de carga`}
            />
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              {i === weeks.length - 1 ? "Hoy" : `S${i + 1}`}
            </span>
          </div>
        ))}
      </div>

      {variant === "coach" && summary.zone === "sin_datos" && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 flex items-start gap-1.5">
          <TrendingUp size={12} className="mt-0.5 shrink-0" />
          Se necesitan unas semanas de registros antes de poder comparar carga actual contra su base.
        </p>
      )}
    </div>
  )
}
