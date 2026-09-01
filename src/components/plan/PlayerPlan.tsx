"use client"
import { useMemo } from "react"
import { useApp } from "@/context/AppContext"
import { cn, formatDate } from "@/lib/utils"
import { recommendedExercises } from "@/lib/recommendations"
import { Film, Check, Target, Sparkles } from "lucide-react"
import { useEnumT } from "@/lib/i18n/enums"

/**
 * The player's own training plan: what their coach asked them to work on, plus
 * what their last evaluation says they should. Built for a phone first — this
 * is the screen a 12-year-old opens between trainings, so every action is a
 * full-width tap target and nothing depends on hover.
 */
export default function PlayerPlan({ playerId }: { playerId: string }) {
  const { exercises, getPlayerAssignments, setAssignmentDone, getLatestEvaluation } = useApp()
  const enumT = useEnumT()

  const assignments = getPlayerAssignments(playerId)
  const latestEval = getLatestEvaluation(playerId)

  const exerciseById = useMemo(
    () => new Map(exercises.map(ex => [ex.id, ex])),
    [exercises]
  )

  const done = assignments.filter(a => a.completed_at).length

  // Only suggest drills the coach hasn't already assigned — seeing the same
  // exercise in both lists just looks like a bug.
  const assignedIds = new Set(assignments.map(a => a.exercise_id))
  const suggestions = useMemo(() => {
    if (!latestEval) return []
    return recommendedExercises(latestEval, exercises)
      .map(group => ({ ...group, exercises: group.exercises.filter(ex => !assignedIds.has(ex.id)) }))
      .filter(group => group.exercises.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestEval, exercises, assignments])

  if (assignments.length === 0 && suggestions.length === 0) return null

  return (
    <div className="mb-5 space-y-4">
      {assignments.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Target size={16} className="text-lime-600 dark:text-lime-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mi plan</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              {done} de {assignments.length} listos
            </span>
          </div>

          {/* Progress — small, but it's the whole reason a kid comes back. */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-lime-400 transition-all duration-500"
              style={{ width: `${assignments.length ? (done / assignments.length) * 100 : 0}%` }}
            />
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {assignments.map(a => {
              const ex = exerciseById.get(a.exercise_id)
              const isDone = !!a.completed_at
              return (
                <div key={a.id} className={cn("px-4 sm:px-5 py-4", isDone && "opacity-60")}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold text-slate-900 dark:text-white",
                        isDone && "line-through decoration-slate-300"
                      )}>
                        {ex?.name ?? "Ejercicio"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {ex && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {enumT.activityCategory(ex.category)}
                          </span>
                        )}
                        {a.due_date && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Para el {formatDate(a.due_date)}
                          </span>
                        )}
                      </div>
                      {ex?.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{ex.description}</p>
                      )}
                      {a.note && (
                        <p className="text-xs text-lime-700 dark:text-lime-400 mt-1.5">
                          Tu coach: {a.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Full-width actions: thumb-friendly, no hover needed. */}
                  <div className="flex items-center gap-2 mt-3">
                    {ex?.video_url && (
                      <a
                        href={ex.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 active:bg-slate-100 dark:active:bg-slate-800 transition-colors shrink-0"
                      >
                        <Film size={14} /> Ver video
                      </a>
                    )}
                    <button
                      onClick={() => setAssignmentDone(a.id, !isDone)}
                      className={cn(
                        "h-11 flex-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors",
                        isDone
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          : "bg-lime-400 text-[#05122F] active:bg-lime-500"
                      )}
                    >
                      <Check size={15} /> {isDone ? "Hecho" : "Marcar como hecho"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <Sparkles size={16} className="text-blue-500 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Para mejorar</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Según tu última evaluación</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {suggestions.map(group => (
              <div key={group.category} className="px-4 sm:px-5 py-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {enumT.activityCategory(group.category)}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {group.score}/100
                  </span>
                </div>
                <div className="space-y-2">
                  {group.exercises.map(ex => (
                    <div key={ex.id} className="flex items-center gap-3">
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
                          className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 transition-colors shrink-0"
                          aria-label={`Ver video de ${ex.name}`}
                        >
                          <Film size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
