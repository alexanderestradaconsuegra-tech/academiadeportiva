"use client"
import { useMemo, useState } from "react"
import { useApp } from "@/context/AppContext"
import { cn, formatDate } from "@/lib/utils"
import { recommendedExercises, STRONG_SCORE } from "@/lib/recommendations"
import { Target, Plus, Trash2, Check, Film, Sparkles } from "lucide-react"
import { useEnumT } from "@/lib/i18n/enums"

/**
 * The coach's side of the training plan: what this player's last evaluation
 * says they're weakest at, the drills the academy already has for it, and one
 * tap to turn that into homework the player sees on their phone.
 *
 * This is the bridge the exercise library was missing — scores on one screen
 * and a drill list on another, with the coach connecting them by hand.
 */
export default function CoachPlan({ playerId }: { playerId: string }) {
  const {
    exercises, getPlayerAssignments, assignExercise, unassignExercise, getLatestEvaluation,
  } = useApp()
  const enumT = useEnumT()
  const [picking, setPicking] = useState(false)
  const [pickedExercise, setPickedExercise] = useState("")
  const [note, setNote] = useState("")
  const [dueDate, setDueDate] = useState("")

  const assignments = getPlayerAssignments(playerId)
  const latestEval = getLatestEvaluation(playerId)
  const exerciseById = useMemo(() => new Map(exercises.map(ex => [ex.id, ex])), [exercises])
  const assignedIds = useMemo(() => new Set(assignments.map(a => a.exercise_id)), [assignments])

  const groups = useMemo(() => {
    if (!latestEval) return []
    return recommendedExercises(latestEval, exercises)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestEval, exercises])

  function handleAssignPicked() {
    if (!pickedExercise) return
    assignExercise(playerId, pickedExercise, note, dueDate)
    setPickedExercise("")
    setNote("")
    setDueDate("")
    setPicking(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Target size={16} className="text-lime-600 dark:text-lime-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Plan de trabajo</h2>
        </div>
        <button
          onClick={() => setPicking(p => !p)}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={14} /> Asignar
        </button>
      </div>

      {picking && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-4 space-y-2.5">
          <select
            value={pickedExercise}
            onChange={ev => setPickedExercise(ev.target.value)}
            aria-label="Ejercicio"
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-lime-600 dark:focus:border-lime-400 outline-none"
          >
            <option value="">Elegir ejercicio…</option>
            {exercises
              .filter(ex => !assignedIds.has(ex.id))
              .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
              .map(ex => (
                <option key={ex.id} value={ex.id}>{enumT.activityCategory(ex.category)} · {ex.name}</option>
              ))}
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              placeholder="Nota para el jugador (opcional)"
              value={note}
              onChange={ev => setNote(ev.target.value)}
              className="flex-1 min-w-0 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600 dark:focus:border-lime-400"
            />
            <input
              type="date"
              aria-label="Fecha límite"
              value={dueDate}
              onChange={ev => setDueDate(ev.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600 dark:focus:border-lime-400 shrink-0"
            />
          </div>
          <button
            onClick={handleAssignPicked}
            disabled={!pickedExercise}
            className="w-full h-10 rounded-xl bg-lime-400 text-[#05122F] text-xs font-bold disabled:opacity-50 hover:bg-lime-500 transition-colors"
          >
            Asignar al jugador
          </button>
        </div>
      )}

      {/* Currently assigned */}
      {assignments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {assignments.map(a => {
            const ex = exerciseById.get(a.exercise_id)
            const isDone = !!a.completed_at
            return (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  isDone ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600"
                )}>
                  <Check size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold text-slate-900 dark:text-white truncate", isDone && "line-through decoration-slate-300")}>
                    {ex?.name ?? "Ejercicio"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ex && <span className="text-[11px] text-slate-400 dark:text-slate-500">{enumT.activityCategory(ex.category)}</span>}
                    {a.due_date && <span className="text-[11px] text-slate-400 dark:text-slate-500">· {formatDate(a.due_date)}</span>}
                    {isDone && a.completed_at && (
                      <span className="text-[11px] text-emerald-600">· Completado {formatDate(a.completed_at.split("T")[0])}</span>
                    )}
                  </div>
                  {a.note && <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">{a.note}</p>}
                </div>
                <button
                  onClick={() => unassignExercise(a.id)}
                  aria-label="Quitar del plan"
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Todavía no le asignaste ejercicios. Abajo están los que su última evaluación sugiere.
        </p>
      )}

      {/* Recommendations from the latest evaluation */}
      {!latestEval ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Cuando cargues una evaluación, acá van a aparecer los ejercicios recomendados según sus puntos débiles.
        </p>
      ) : groups.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <Sparkles size={15} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Sin puntos débiles: todos sus atributos están sobre {STRONG_SCORE}.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60">
            <Sparkles size={14} className="text-blue-500 shrink-0" />
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Recomendado según su evaluación
            </p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {groups.map(group => (
              <div key={group.category} className="px-3 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{enumT.activityCategory(group.category)}</span>
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {group.score}/100
                  </span>
                </div>
                {group.exercises.length === 0 ? (
                  // Worth surfacing rather than hiding: it's telling the coach
                  // their library has nothing for this player's weakest area.
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    No hay ejercicios de esta categoría en tu biblioteca todavía.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {group.exercises.map(ex => {
                      const already = assignedIds.has(ex.id)
                      return (
                        <div key={ex.id} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{ex.name}</p>
                            {ex.description && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{ex.description}</p>
                            )}
                          </div>
                          {ex.video_url && (
                            <a
                              href={ex.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Ver video de ${ex.name}`}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0"
                            >
                              <Film size={13} />
                            </a>
                          )}
                          <button
                            onClick={() => assignExercise(playerId, ex.id)}
                            disabled={already}
                            className={cn(
                              "h-9 px-3 rounded-lg text-[11px] font-bold transition-colors shrink-0",
                              already
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                : "bg-lime-400 text-[#05122F] hover:bg-lime-500"
                            )}
                          >
                            {already ? "Asignado" : "Asignar"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
