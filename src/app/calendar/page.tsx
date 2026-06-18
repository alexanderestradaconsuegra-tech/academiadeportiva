"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import { Plus, X, CalendarDays, MapPin, Clock, Pencil, Trash2 } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { Category, Training } from "@/lib/types"

const CATEGORIES: Category[] = ["Sub-10", "Sub-12", "Sub-14", "Sub-16", "Sub-18", "Juvenil", "Senior"]

const emptyForm = {
  title: "", date: new Date().toISOString().split("T")[0], time: "",
  category: "" as Category | "", location: "", notes: "",
}

async function notifyNewTraining(data: { title: string; date: string; time: string; category: Category | null }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) return
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: "Nuevo entrenamiento",
        body: `${data.title} · ${formatDate(data.date)}${data.time ? " " + data.time : ""}`,
        category: data.category || "all",
      }),
    })
  } catch {
    /* notificación es de mejor esfuerzo, no bloquea la creación */
  }
}

export default function CalendarPage() {
  const { trainings, addTraining, updateTraining, deleteTraining } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const today = new Date().toISOString().split("T")[0]
  const sorted = [...trainings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const upcoming = sorted.filter(t => t.date >= today)
  const past = sorted.filter(t => t.date < today).reverse()

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(t: Training) {
    setEditingId(t.id)
    setForm({
      title: t.title, date: t.date, time: t.time,
      category: t.category ?? "", location: t.location, notes: t.notes,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      title: form.title,
      date: form.date,
      time: form.time,
      category: form.category || null,
      location: form.location,
      notes: form.notes,
    }
    if (editingId) {
      updateTraining(editingId, data)
    } else {
      addTraining(data)
      notifyNewTraining(data)
    }
    setShowForm(false)
    setForm(emptyForm)
    setSaving(false)
  }

  function handleDelete(id: string) {
    if (confirm("¿Eliminar este entrenamiento?")) deleteTraining(id)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Calendario" subtitle={`${trainings.length} entrenamientos programados`}>
          <Button onClick={openCreate}>
            <Plus size={16} /> Nuevo Entrenamiento
          </Button>
        </PageHeader>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingId ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input label="Título *" placeholder="Ej: Entrenamiento técnico" value={form.title} onChange={e => set("title", e.target.value)} required />
                  </div>
                  <Input label="Fecha *" type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                  <Input label="Hora" type="time" value={form.time} onChange={e => set("time", e.target.value)} />
                  <Select label="Categoría" value={form.category} onChange={e => set("category", e.target.value)}
                    placeholder="Todas las categorías" options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                  <Input label="Lugar" placeholder="Ej: Cancha 1" value={form.location} onChange={e => set("location", e.target.value)} />
                  <div className="col-span-2">
                    <Textarea label="Notas" placeholder="Detalles adicionales..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-1">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="submit" loading={saving}>Guardar</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Próximos</h2>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <CalendarDays size={36} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">No hay entrenamientos programados</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {upcoming.map(t => (
                    <TrainingRow key={t.id} t={t} onEdit={() => openEdit(t)} onDelete={() => handleDelete(t.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Pasados</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden opacity-70">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {past.map(t => (
                    <TrainingRow key={t.id} t={t} onEdit={() => openEdit(t)} onDelete={() => handleDelete(t.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function TrainingRow({ t, onEdit, onDelete }: { t: Training; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF] flex items-center justify-center shrink-0">
        <CalendarDays size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(t.date)}</span>
          {t.time && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={11} /> {t.time}</span>
            </>
          )}
          {t.location && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={11} /> {t.location}</span>
            </>
          )}
          {t.notes && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-32">{t.notes}</span></>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {t.category && <Badge variant="blue">{t.category}</Badge>}
        <button onClick={onEdit} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors")} title="Editar">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors")} title="Eliminar">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
