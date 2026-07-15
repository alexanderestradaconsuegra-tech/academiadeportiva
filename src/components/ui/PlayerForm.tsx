"use client"
import { calcAutoScore } from "@/lib/autoScore"
import type { Activity, Attendance, Evaluation, ActivityCategory } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const LABELS: Record<string, string> = {
  speed_score:      "Velocidad",
  strength_score:   "Fuerza",
  technique_score:  "Técnica",
  resistance_score: "Resistencia",
  power_score:      "Potencia",
  agility_score:    "Agilidad",
}

interface Props {
  baseEval?: Evaluation
  activities: Activity[]
  attendances: Attendance[]
}

export default function PlayerForm({ baseEval, activities, attendances }: Props) {
  const auto = calcAutoScore(baseEval, activities, attendances)

  if (!auto.hasData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Forma actual</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Se necesitan al menos 4 actividades registradas para calcular la forma automáticamente.
        </p>
      </div>
    )
  }

  const generalAuto = Math.round(
    Object.values(auto.scores).reduce((s, v) => s + v, 0) / Object.values(auto.scores).length
  )

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Forma actual</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Calculada automáticamente con actividades y asistencia
          </p>
        </div>
        <div className="text-center">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg",
            generalAuto >= 7 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" :
            generalAuto >= 5 ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" :
            "bg-red-50 text-red-500 dark:bg-red-500/10"
          )}>
            {generalAuto}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">/ 10</p>
        </div>
      </div>

      {/* Attendance warning */}
      {auto.attendancePenalty < -0.5 && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl px-3 py-2 mb-4 text-xs">
          <AlertTriangle size={13} className="shrink-0" />
          <span>
            Asistencia {auto.attendanceRate}% en los últimos entrenamientos — penalización de {auto.attendancePenalty} pts en todos los scores.
          </span>
        </div>
      )}

      {/* Skills */}
      <div className="space-y-2.5">
        {auto.trends.map(trend => {
          const score = auto.scores[trend.field] ?? 5
          return (
            <div key={trend.field} className="flex items-center gap-3">
              {/* Trend icon */}
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                trend.trend === "up"      ? "bg-emerald-50 dark:bg-emerald-500/10" :
                trend.trend === "down"    ? "bg-red-50 dark:bg-red-500/10" :
                trend.trend === "stable"  ? "bg-slate-100 dark:bg-slate-800" :
                                            "bg-slate-50 dark:bg-slate-800/60"
              )}>
                {trend.trend === "up"     ? <TrendingUp size={12} className="text-emerald-500" /> :
                 trend.trend === "down"   ? <TrendingDown size={12} className="text-red-500" /> :
                                            <Minus size={12} className="text-slate-400" />}
              </div>

              {/* Label */}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-20 shrink-0">
                {LABELS[trend.field]}
              </span>

              {/* Bar */}
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    score >= 7 ? "bg-emerald-400" :
                    score >= 5 ? "bg-blue-400" : "bg-red-400"
                  )}
                  style={{ width: `${score * 10}%` }}
                />
              </div>

              {/* Score */}
              <span className={cn(
                "text-xs font-bold w-8 text-right shrink-0",
                score >= 7 ? "text-emerald-600 dark:text-emerald-400" :
                score >= 5 ? "text-blue-600 dark:text-blue-400" :
                             "text-red-500"
              )}>
                {score.toFixed(1)}
              </span>

              {/* Delta badge */}
              {trend.trend !== "no_data" && trend.delta !== 0 && (
                <span className={cn(
                  "text-[10px] font-bold w-10 text-right shrink-0",
                  trend.delta > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {trend.delta > 0 ? "+" : ""}{trend.delta}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-4">
        Basado en {activities.length} actividades · {attendances.length} entrenamientos registrados
      </p>
    </div>
  )
}
