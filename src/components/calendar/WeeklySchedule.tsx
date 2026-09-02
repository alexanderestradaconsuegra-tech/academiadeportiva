"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import { DAY_LABELS, DAY_LABELS_SHORT, defaultTitle, HORIZON_DAYS } from "@/lib/schedules"
import type { Category, TrainingSchedule } from "@/lib/types"
import { CalendarClock, Plus, X, Trash2, MapPin, Pause, Play } from "lucide-react"

const CATEGORIES: Category[] = ["Sub-10", "Sub-12", "Sub-14", "Sub-16", "Sub-18", "Juvenil", "Senior"]

const EMPTY = { day_of_week: 2, time: "18:30", title: "", category: "" as Category | "", location: "", notes: "" }

/**
 * The weekly pattern an academy actually runs on ("Sub-12, martes y jueves
 * 18:30"). Defining it once is what stops a coach hand-creating thirty-odd
 * sessions a month, one form at a time — the friction that sends them back
 * to a WhatsApp group.
 */
export default function WeeklySchedule() {
  const { trainingSchedules, addTrainingSchedule, updateTrainingSchedule, deleteTrainingSchedule } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const sorted = [...trainingSchedules].sort(
    (a, b) => a.day_of_week - b.day_of_week || a.time.localeCompare(b.time)
  )

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    addTrainingSchedule({
      day_of_week: form.day_of_week,
      time: form.time,
      title: form.title,
      category: form.category || null,
      location: form.location,
      notes: form.notes,
      is_active: true,
    })
    setForm(EMPTY)
    setOpen(false)
  }

  function handleDelete(sc: TrainingSchedule) {
    if (!confirm("¿Eliminar este horario fijo? Las sesiones ya creadas se mantienen.")) return
    deleteTrainingSchedule(sc.id)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-5">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarClock size={16} className="text-lime-600 dark:text-lime-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Horario semanal</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Las sesiones se crean solas con {HORIZON_DAYS} días de anticipación
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {open ? <X size={14} /> : <Plus size={14} />} Agregar
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Día</label>
            {/* Seven targets rather than a select: on a phone this is one tap. */}
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_LABELS_SHORT.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, day_of_week: i }))}
                  className={cn(
                    "h-11 rounded-xl text-[11px] font-bold transition-colors",
                    form.day_of_week === i
                      ? "bg-lime-400 text-[#05122F]"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Hora</label>
              <input
                type="time" required value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category | "" }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
              >
                <option value="">Todas</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <input
            placeholder="Cancha o lugar"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
          />
          <input
            placeholder={`Nombre (opcional — por defecto "${defaultTitle({ category: form.category || null })}")`}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-lime-600"
          />
          <button type="submit" className="w-full h-11 rounded-xl bg-lime-400 text-[#05122F] text-xs font-bold hover:bg-lime-500 transition-colors">
            Crear horario y generar sesiones
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="px-4 sm:px-5 py-6 text-xs text-slate-400 dark:text-slate-500 text-center">
          Sin horarios fijos. Definí uno y las sesiones se crean solas cada semana.
        </p>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {sorted.map(sc => (
            <div key={sc.id} className={cn("flex items-center gap-3 px-4 sm:px-5 py-3", !sc.is_active && "opacity-50")}>
              <div className="w-12 shrink-0 text-center">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{DAY_LABELS_SHORT[sc.day_of_week]}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{sc.time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {sc.title || defaultTitle(sc)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {DAY_LABELS[sc.day_of_week]} · {sc.category ?? "Todas"}
                  </span>
                  {sc.location && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
                      <MapPin size={10} /> {sc.location}
                    </span>
                  )}
                  {!sc.is_active && <span className="text-[10px] font-bold text-amber-600">En pausa</span>}
                </div>
              </div>
              <button
                onClick={() => updateTrainingSchedule(sc.id, { is_active: !sc.is_active })}
                aria-label={sc.is_active ? "Pausar horario" : "Reactivar horario"}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors shrink-0"
              >
                {sc.is_active ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={() => handleDelete(sc)}
                aria-label="Eliminar horario"
                className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
