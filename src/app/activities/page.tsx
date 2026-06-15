"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import { Plus, X, Dumbbell } from "lucide-react"
import { cn, formatDate, getCategoryColor, getIntensityColor } from "@/lib/utils"
import type { ActivityCategory, ActivityUnit, Intensity } from "@/lib/types"

const CATEGORIES: ActivityCategory[] = ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Agilidad"]
const UNITS: ActivityUnit[] = ["segundos","kg","repeticiones","metros","puntos"]
const INTENSITIES: Intensity[] = ["Baja","Media","Alta"]

const EXERCISES: Record<ActivityCategory, string[]> = {
  Velocidad: ["Sprint 20m","Sprint 40m","Sprint 60m","Sprint 100m","Velocidad de reacción"],
  Fuerza: ["Sentadilla","Press de banca","Peso muerto","Prensa de piernas","Extensión de cuádriceps"],
  Técnica: ["Conducción slalom","Pases de precisión","Control de balón","Regate 1v1","Atajadas al arco"],
  Resistencia: ["Cooper Test","Carrera continua 5km","Fartlek","Yo-Yo test","Resistencia aeróbica"],
  Potencia: ["Salto vertical","Salto horizontal","Lanzamiento balón medicinal","CMJ","Drop jump"],
  Agilidad: ["Escalera de agilidad","Slalom con balón","T-test","Hexagonal","Illinois agility"],
}

const catBadgeMap: Record<string, "amber" | "red" | "blue" | "green" | "orange" | "purple"> = {
  Velocidad: "amber", Fuerza: "red", Técnica: "blue", Resistencia: "green", Potencia: "orange", Agilidad: "purple"
}

export default function ActivitiesPage() {
  const { players, activities, addActivity } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterPlayer, setFilterPlayer] = useState("all")
  const [filterCat, setFilterCat] = useState("all")

  const [form, setForm] = useState({
    player_id: "", date: new Date().toISOString().split("T")[0],
    category: "" as ActivityCategory | "", exercise: "", value: "",
    unit: "" as ActivityUnit | "", intensity: "" as Intensity | "", notes: "",
  })

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const exercises = form.category ? EXERCISES[form.category as ActivityCategory] || [] : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    addActivity({
      player_id: form.player_id,
      date: form.date,
      category: form.category as ActivityCategory,
      exercise: form.exercise,
      value: Number(form.value),
      unit: form.unit as ActivityUnit,
      intensity: form.intensity as Intensity,
      notes: form.notes,
    })
    setShowForm(false)
    setForm({ player_id: "", date: new Date().toISOString().split("T")[0], category: "", exercise: "", value: "", unit: "", intensity: "", notes: "" })
    setSaving(false)
  }

  const filtered = activities.filter(a => {
    const matchP = filterPlayer === "all" || a.player_id === filterPlayer
    const matchC = filterCat === "all" || a.category === filterCat
    return matchP && matchC
  })

  return (
    <AppShell>
      <div className="p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Actividades" subtitle={`${activities.length} registros de entrenamiento`}>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Registrar Actividad
          </Button>
        </PageHeader>

        {/* Modal form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Registrar Actividad</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Select label="Jugador *" value={form.player_id} onChange={e => set("player_id", e.target.value)} required
                      placeholder="Seleccionar jugador..."
                      options={players.map(p => ({ value: p.id, label: p.name }))} />
                  </div>
                  <Input label="Fecha *" type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                  <Select label="Intensidad *" value={form.intensity} onChange={e => set("intensity", e.target.value)} required
                    placeholder="Seleccionar..." options={INTENSITIES.map(i => ({ value: i, label: i }))} />
                  <Select label="Categoría *" value={form.category} onChange={e => { set("category", e.target.value); set("exercise", "") }} required
                    placeholder="Seleccionar..." options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                  <Select label="Ejercicio *" value={form.exercise} onChange={e => set("exercise", e.target.value)} required
                    placeholder="Seleccionar..." options={exercises.map(ex => ({ value: ex, label: ex }))} />
                  <Input label="Resultado *" type="number" step="0.01" placeholder="0" value={form.value} onChange={e => set("value", e.target.value)} required />
                  <Select label="Unidad *" value={form.unit} onChange={e => set("unit", e.target.value)} required
                    placeholder="Seleccionar..." options={UNITS.map(u => ({ value: u, label: u }))} />
                  <div className="col-span-2">
                    <Textarea label="Observaciones" placeholder="Notas adicionales..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
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

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex flex-wrap gap-3">
          <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
            <option value="all">Todos los jugadores</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
            <option value="all">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-xs text-slate-400 font-medium ml-auto self-center">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Dumbbell size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">No hay actividades registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filtered.map(a => {
                const player = players.find(p => p.id === a.player_id)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", getCategoryColor(a.category))}>
                      {a.category.substring(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{a.exercise}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">{player?.name ?? "?"}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
                        {a.notes && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 truncate max-w-32">{a.notes}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={catBadgeMap[a.category] ?? "default"}>{a.category}</Badge>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", getIntensityColor(a.intensity))}>{a.intensity}</span>
                      <div className="text-right min-w-16">
                        <p className="text-sm font-bold text-slate-800">{a.value}</p>
                        <p className="text-xs text-slate-400">{a.unit}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
