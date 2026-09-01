"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import { cn, avatarUrl } from "@/lib/utils"
import { workloadSummary, ZONE_LABELS, type LoadZone } from "@/lib/workload"
import { ShieldAlert, ChevronRight, Plus, X } from "lucide-react"

const ZONE_ORDER: Record<LoadZone, number> = { riesgo: 0, precaucion: 1, bajo: 2, optimo: 3, sin_datos: 4 }
const ZONE_DOT: Record<LoadZone, string> = {
  riesgo: "bg-red-500", precaucion: "bg-amber-500", bajo: "bg-blue-400",
  optimo: "bg-emerald-500", sin_datos: "bg-slate-300",
}
const ZONE_TEXT: Record<LoadZone, string> = {
  riesgo: "text-red-600", precaucion: "text-amber-600", bajo: "text-blue-600",
  optimo: "text-emerald-600", sin_datos: "text-slate-400",
}

/**
 * The squad view a coach opens on a Monday: who is carrying a load spike this
 * week, sorted worst first. Riskiest players surface without being looked for
 * — the whole value is that it flags the player nobody was worried about.
 */
export default function SquadWorkload() {
  const { players, sessionLoads, trainings, logSessionLoad } = useApp()
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkRpe, setBulkRpe] = useState(6)
  const [bulkDuration, setBulkDuration] = useState(90)

  const rows = useMemo(() => {
    return players
      .map(p => ({
        player: p,
        summary: workloadSummary(sessionLoads.filter(l => l.player_id === p.id), today),
      }))
      .sort((a, b) => {
        const z = ZONE_ORDER[a.summary.zone] - ZONE_ORDER[b.summary.zone]
        if (z !== 0) return z
        return b.summary.acute - a.summary.acute
      })
  }, [players, sessionLoads, today])

  const atRisk = rows.filter(r => r.summary.zone === "riesgo" || r.summary.zone === "precaucion")

  const lastTraining = useMemo(
    () => [...trainings].filter(t => t.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0],
    [trainings, today]
  )

  // Kids forget to rate. Without a way to fill a whole session in at once the
  // data goes stale and every zone drifts to "sin datos" — which is the most
  // likely way this feature quietly dies.
  function applyBulk() {
    const targets = lastTraining?.category
      ? players.filter(p => p.category === lastTraining.category)
      : players
    const alreadyRated = new Set(
      sessionLoads
        .filter(l => lastTraining ? l.training_id === lastTraining.id : l.date === today)
        .map(l => l.player_id)
    )
    targets
      .filter(p => !alreadyRated.has(p.id))
      .forEach(p => logSessionLoad({
        player_id: p.id,
        training_id: lastTraining?.id ?? null,
        date: lastTraining?.date ?? today,
        rpe: bulkRpe,
        duration_min: bulkDuration,
        notes: null,
        logged_by_coach: true,
      }))
    setBulkOpen(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-5">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert size={16} className={atRisk.length > 0 ? "text-amber-500 shrink-0" : "text-slate-400 shrink-0"} />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Carga del plantel</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {atRisk.length > 0 ? `${atRisk.length} para vigilar esta semana` : "Sin alertas de carga"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setBulkOpen(o => !o)}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {bulkOpen ? <X size={14} /> : <Plus size={14} />} Cargar grupo
        </button>
      </div>

      {bulkOpen && (
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Registra el esfuerzo de {lastTraining ? `"${lastTraining.title}"` : "hoy"} para los que no lo cargaron.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Esfuerzo (1-10)</label>
              <input
                type="number" min={1} max={10} value={bulkRpe}
                onChange={e => setBulkRpe(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="w-20 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Minutos</label>
              <input
                type="number" min={1} max={400} value={bulkDuration}
                onChange={e => setBulkDuration(Math.min(400, Math.max(1, Number(e.target.value) || 1)))}
                className="w-24 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
              />
            </div>
            <button onClick={applyBulk} className="h-10 px-4 rounded-xl bg-lime-400 text-[#05122F] text-xs font-bold hover:bg-lime-500 transition-colors">
              Aplicar al grupo
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="px-4 sm:px-5 py-8 text-sm text-slate-400 dark:text-slate-500 text-center">
          Todavía no hay jugadores cargados.
        </p>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {rows.map(({ player, summary }) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <img
                src={player.photo_url || avatarUrl(player.name, player.id)}
                alt={player.name}
                className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{player.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", ZONE_DOT[summary.zone])} />
                  <span className={cn("text-[11px] font-semibold", ZONE_TEXT[summary.zone])}>
                    {ZONE_LABELS[summary.zone]}
                  </span>
                  {summary.ratio !== null && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">· {summary.ratio.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{summary.acute.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">carga semanal</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
