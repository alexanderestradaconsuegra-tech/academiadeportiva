"use client"
import { useMemo, useState } from "react"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import { Check, Gauge } from "lucide-react"

/**
 * The player rating how hard a session was. This one input is what the entire
 * workload system runs on, so it is built to be answered in about three
 * seconds on a phone: ten big targets, no keyboard, no scrolling.
 *
 * Effort has to come from the player — that's what "perceived exertion" means,
 * and it's why the metric works without any hardware.
 */

const RPE_LABELS: Record<number, string> = {
  1: "Muy suave", 2: "Suave", 3: "Liviano", 4: "Moderado", 5: "Algo duro",
  6: "Duro", 7: "Muy duro", 8: "Durísimo", 9: "Casi al máximo", 10: "Máximo",
}

function rpeColor(v: number) {
  if (v <= 3) return "bg-emerald-400 text-[#05122F]"
  if (v <= 5) return "bg-lime-400 text-[#05122F]"
  if (v <= 7) return "bg-amber-400 text-[#05122F]"
  return "bg-red-500 text-white"
}

const DURATIONS = [45, 60, 75, 90, 120]

export default function RpeLogger({ playerId }: { playerId: string }) {
  const { trainings, sessionLoads, logSessionLoad } = useApp()
  const [rpe, setRpe] = useState<number | null>(null)
  const [duration, setDuration] = useState(90)
  const [saved, setSaved] = useState(false)

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  // The most recent training that already happened — that's the one they'd be
  // rating. Linking it also stops the same session being logged twice.
  const recentTraining = useMemo(() => {
    return [...trainings]
      .filter(t => t.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
  }, [trainings, today])

  const targetDate = recentTraining?.date ?? today
  const trainingId = recentTraining?.id ?? null

  const alreadyLogged = useMemo(
    () => sessionLoads.find(l =>
      l.player_id === playerId &&
      (trainingId ? l.training_id === trainingId : l.date === targetDate)
    ),
    [sessionLoads, playerId, trainingId, targetDate]
  )

  function handleSave() {
    if (rpe === null) return
    logSessionLoad({
      player_id: playerId,
      training_id: trainingId,
      date: targetDate,
      rpe,
      duration_min: duration,
      notes: null,
      logged_by_coach: false,
    })
    setSaved(true)
  }

  if (saved || (alreadyLogged && rpe === null)) {
    const value = saved ? rpe : alreadyLogged?.rpe
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Esfuerzo registrado</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {recentTraining?.title ?? "Sesión"} · {value}/10
            </p>
          </div>
          <button
            onClick={() => { setSaved(false); setRpe(alreadyLogged?.rpe ?? null) }}
            className="ml-auto h-9 px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0"
          >
            Cambiar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <Gauge size={16} className="text-lime-600 dark:text-lime-400 shrink-0" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">¿Qué tan duro estuvo?</h2>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        {recentTraining ? recentTraining.title : "Tu última sesión"} · Sirve para cuidar tu carga y evitar lesiones
      </p>

      {/* Ten targets in two rows: reachable with a thumb, no keyboard. */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
          <button
            key={v}
            onClick={() => setRpe(v)}
            aria-label={`${v} de 10 — ${RPE_LABELS[v]}`}
            className={cn(
              "h-12 rounded-xl text-sm font-black transition-all",
              rpe === v
                ? rpeColor(v) + " scale-105 shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {rpe !== null && (
        <>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 text-center">
            {RPE_LABELS[rpe]}
          </p>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
            ¿Cuánto duró?
          </p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "h-11 rounded-xl text-xs font-bold transition-colors",
                  duration === d
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}
              >
                {d}&apos;
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="w-full h-12 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold active:bg-lime-500 transition-colors"
          >
            Listo
          </button>
        </>
      )}
    </div>
  )
}
