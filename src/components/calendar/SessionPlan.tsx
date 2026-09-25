"use client"
import { useMemo, useState } from "react"
import { useApp } from "@/context/AppContext"
import { cn, formatDate } from "@/lib/utils"
import type { ActivityUnit, Training, TrainingExercise } from "@/lib/types"
import { X, Plus, Trash2, Check, Copy, Ruler, GripVertical, ClipboardList } from "lucide-react"

const UNITS: ActivityUnit[] = ["segundos", "kg", "repeticiones", "metros", "puntos"]

/**
 * The drills that make up one session, and the measurements taken during it.
 *
 * The module used to be entirely per-player: logging a session where 20 kids
 * did 5 drills meant filling the activity form 100 times. Here the plan is
 * built once for the whole group, and only the drills the coach marks as
 * measurable ever ask for a number per player.
 */
export default function SessionPlan({ training, onClose }: { training: Training; onClose: () => void }) {
  const {
    exercises, trainings, getTrainingExercises, addTrainingExercise, updateTrainingExercise,
    removeTrainingExercise, copySessionPlan, players, getTrainingAttendance, addActivity, activities,
  } = useApp()

  const [picking, setPicking] = useState(false)
  const [measuring, setMeasuring] = useState<TrainingExercise | null>(null)
  const [copying, setCopying] = useState(false)
  const [copyMsg, setCopyMsg] = useState("")

  const plan = getTrainingExercises(training.id)

  // Sessions that already have a plan are the templates — the academy's own
  // past sessions, rather than a separate template concept to maintain.
  const copySources = useMemo(() => {
    const withPlan = new Set(
      trainings.filter(t => t.id !== training.id && getTrainingExercises(t.id).length > 0).map(t => t.id)
    )
    return trainings
      .filter(t => withPlan.has(t.id))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainings, training.id])

  function addFromLibrary(exerciseId: string) {
    const ex = exercises.find(e => e.id === exerciseId)
    if (!ex) return
    addTrainingExercise(training.id, {
      exercise_id: ex.id,
      name: ex.name,
      category: ex.category,
      position: plan.length,
      sets: null,
      reps: null,
      duration_min: null,
      is_measurable: false,
      unit: null,
      notes: null,
      completed_at: null,
    })
    setPicking(false)
  }

  async function handleCopy(fromId: string) {
    setCopying(true)
    const n = await copySessionPlan(fromId, training.id)
    setCopying(false)
    setCopyMsg(n > 0 ? `Se copiaron ${n} ejercicios` : "Esa sesión no tiene ejercicios")
    setTimeout(() => setCopyMsg(""), 3000)
  }

  const alreadyInPlan = new Set(plan.map(p => p.exercise_id).filter(Boolean))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl animate-scale-in max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">Plan de la sesión</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {training.title} · {formatDate(training.date)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {plan.length === 0 && !picking && (
            <div className="text-center py-6">
              <ClipboardList size={30} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Sin ejercicios todavía. Agregá los que se van a hacer hoy.
              </p>
            </div>
          )}

          {plan.map((te, i) => (
            <div key={te.id} className={cn(
              "rounded-xl border p-3",
              te.completed_at
                ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5"
                : "border-slate-200 dark:border-slate-700"
            )}>
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600 shrink-0 pt-0.5">
                  <GripVertical size={13} />
                  <span className="text-[11px] font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{te.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{te.category}</p>
                </div>
                <button
                  onClick={() => removeTrainingExercise(te.id)}
                  aria-label="Quitar del plan"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Series / reps / minutos — opcionales, sin obligar a llenar nada */}
              <div className="grid grid-cols-3 gap-2 mt-2.5">
                {([
                  { key: "sets" as const, label: "Series" },
                  { key: "reps" as const, label: "Reps" },
                  { key: "duration_min" as const, label: "Min" },
                ]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">{label}</label>
                    <input
                      type="number" min={1}
                      defaultValue={te[key] ?? ""}
                      onBlur={e => {
                        const v = e.target.value === "" ? null : Number(e.target.value)
                        if (v !== te[key]) updateTrainingExercise(te.id, { [key]: v })
                      }}
                      className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-lime-600"
                    />
                  </div>
                ))}
              </div>

              <input
                placeholder="Nota del grupo (ej: costó el ritmo, mejoró el pase)"
                defaultValue={te.notes ?? ""}
                onBlur={e => {
                  const v = e.target.value.trim() || null
                  if (v !== te.notes) updateTrainingExercise(te.id, { notes: v })
                }}
                className="w-full h-9 px-3 mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-lime-600"
              />

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <button
                  onClick={() => updateTrainingExercise(te.id, { completed_at: te.completed_at ? null : new Date().toISOString() })}
                  className={cn(
                    "h-10 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors",
                    te.completed_at
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-lime-400 text-[#05122F]"
                  )}
                >
                  <Check size={13} /> {te.completed_at ? "Realizado" : "Marcar hecho"}
                </button>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={te.is_measurable}
                    onChange={e => updateTrainingExercise(te.id, {
                      is_measurable: e.target.checked,
                      unit: e.target.checked ? (te.unit ?? "segundos") : null,
                    })}
                    className="w-4 h-4 rounded border-slate-300 text-lime-600"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Se mide</span>
                </label>

                {te.is_measurable && (
                  <>
                    <select
                      value={te.unit ?? "segundos"}
                      onChange={e => updateTrainingExercise(te.id, { unit: e.target.value as ActivityUnit })}
                      aria-label="Unidad"
                      className="h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] outline-none"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button
                      onClick={() => setMeasuring(te)}
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Ruler size={13} /> Anotar marcas
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {picking && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Elegí de tu biblioteca
              </p>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {exercises
                  .filter(ex => !alreadyInPlan.has(ex.id))
                  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                  .map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => addFromLibrary(ex.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-20 shrink-0 truncate">{ex.category}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{ex.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
          {copyMsg && <p className="text-[11px] text-lime-700 dark:text-lime-400 font-semibold">{copyMsg}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPicking(p => !p)}
              className="h-11 flex-1 rounded-xl bg-lime-400 text-[#05122F] text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {picking ? <X size={14} /> : <Plus size={14} />} {picking ? "Cerrar" : "Agregar ejercicio"}
            </button>
            {copySources.length > 0 && (
              <select
                aria-label="Copiar plan de otra sesión"
                disabled={copying}
                value=""
                onChange={e => { if (e.target.value) void handleCopy(e.target.value) }}
                className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none max-w-[45%]"
              >
                <option value="">📋 Copiar de…</option>
                {copySources.map(t => (
                  <option key={t.id} value={t.id}>{formatDate(t.date)} · {t.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {measuring && (
        <MeasureSheet
          trainingExercise={measuring}
          training={training}
          players={players}
          attendance={getTrainingAttendance(training.id)}
          activities={activities}
          onSave={addActivity}
          onClose={() => setMeasuring(null)}
        />
      )}
    </div>
  )
}

/**
 * Per-player numbers for one measurable drill.
 *
 * Only the players who actually attended are listed — asking the coach to
 * skip past absent kids is exactly the friction this module is trying to
 * remove. Saved marks land in `activities`, which already feeds the player's
 * progress charts and profile.
 */
function MeasureSheet({
  trainingExercise: te, training, players, attendance, activities, onSave, onClose,
}: {
  trainingExercise: TrainingExercise
  training: Training
  players: ReturnType<typeof useApp>["players"]
  attendance: ReturnType<typeof useApp>["attendance"]
  activities: ReturnType<typeof useApp>["activities"]
  onSave: ReturnType<typeof useApp>["addActivity"]
  onClose: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const present = useMemo(() => {
    const ok = new Set(attendance.filter(a => a.status === "present" || a.status === "late").map(a => a.player_id))
    const list = players.filter(p => ok.has(p.id))
    // No attendance taken yet: fall back to the session's category rather than
    // showing an empty sheet the coach can't use.
    if (list.length > 0) return list
    return players.filter(p => !training.category || p.category === training.category)
  }, [attendance, players, training.category])

  // A mark already recorded for this drill on this date — so reopening the
  // sheet shows what was entered instead of looking empty.
  const existing = useMemo(() => {
    const map = new Map<string, number>()
    activities
      .filter(a => a.date === training.date && a.exercise === te.name)
      .forEach(a => map.set(a.player_id, a.value))
    return map
  }, [activities, training.date, te.name])

  function handleSave() {
    present.forEach(p => {
      const raw = values[p.id]
      if (raw === undefined || raw === "") return
      const value = Number(raw)
      if (!Number.isFinite(value)) return
      onSave({
        player_id: p.id,
        date: training.date,
        category: te.category,
        exercise: te.name,
        value,
        unit: te.unit ?? "puntos",
        intensity: "Media",
        notes: "",
      })
    })
    setSaved(true)
    setTimeout(onClose, 700)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{te.name}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {present.length} jugadores · en {te.unit ?? "puntos"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {present.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
              No hay jugadores para esta sesión.
            </p>
          ) : present.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
              {existing.has(p.id) && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">antes: {existing.get(p.id)}</span>
              )}
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="—"
                value={values[p.id] ?? ""}
                onChange={e => setValues(v => ({ ...v, [p.id]: e.target.value }))}
                className="w-24 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-right outline-none focus:border-lime-600 shrink-0"
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleSave}
            disabled={saved}
            className="w-full h-12 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold disabled:opacity-60"
          >
            {saved ? "✓ Guardado" : "Guardar marcas"}
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
            Solo se guardan los que anotes. Las marcas entran al progreso del jugador.
          </p>
        </div>
      </div>
    </div>
  )
}
