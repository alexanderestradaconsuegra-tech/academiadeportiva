"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import { ArrowLeft, UserCircle } from "lucide-react"
import Link from "next/link"
import type { DominantFoot, Position, Category } from "@/lib/types"
import { avatarUrl } from "@/lib/utils"

const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]
const CATEGORIES: Category[] = ["Sub-10","Sub-12","Sub-14","Sub-16","Sub-18","Juvenil","Senior"]
const FEET: DominantFoot[] = ["Derecha","Izquierda","Ambidiestro"]

export default function NewPlayerPage() {
  const { addPlayer } = useApp()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", age: "", birth_date: "", position: "" as Position | "",
    dominant_foot: "" as DominantFoot | "", height: "", weight: "",
    club: "Academia FutbolMetrics", category: "" as Category | "",
    objective: "", notes: "", photo_url: "",
  })

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const previewAvatar = form.photo_url || (form.name ? avatarUrl(form.name, "new") : "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const player = addPlayer({
      name: form.name,
      age: Number(form.age),
      birth_date: form.birth_date,
      position: form.position as Position,
      dominant_foot: form.dominant_foot as DominantFoot,
      height: Number(form.height),
      weight: Number(form.weight),
      club: form.club,
      category: form.category as Category,
      objective: form.objective,
      notes: form.notes,
      photo_url: form.photo_url || avatarUrl(form.name, "new"),
    })
    router.push(`/players/${player.id}`)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/players" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <PageHeader title="Nuevo Jugador" subtitle="Completa el formulario para registrar un jugador" className="mb-0 flex-1" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Photo */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-4 h-fit">
              <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Se genera automáticamente un avatar.<br />Puedes pegar una URL de foto.
              </p>
              <Input
                label="URL de foto"
                placeholder="https://..."
                value={form.photo_url}
                onChange={e => set("photo_url", e.target.value)}
                className="w-full text-xs"
              />
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Personal info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Nombre completo *" placeholder="Carlos Andrés Martínez" value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <Input label="Edad" type="number" placeholder="17" min={5} max={40} value={form.age} onChange={e => set("age", e.target.value)} />
                  <Input label="Fecha de nacimiento" type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} />
                  <Input label="Altura (cm)" type="number" placeholder="178" min={100} max={250} value={form.height} onChange={e => set("height", e.target.value)} />
                  <Input label="Peso (kg)" type="number" placeholder="72" min={30} max={150} value={form.weight} onChange={e => set("weight", e.target.value)} />
                </div>
              </div>

              {/* Sports info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Información Deportiva</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Posición *"
                    value={form.position} onChange={e => set("position", e.target.value)}
                    placeholder="Seleccionar..." required
                    options={POSITIONS.map(p => ({ value: p, label: p }))}
                  />
                  <Select
                    label="Pierna hábil *"
                    value={form.dominant_foot} onChange={e => set("dominant_foot", e.target.value)}
                    placeholder="Seleccionar..." required
                    options={FEET.map(f => ({ value: f, label: f }))}
                  />
                  <Select
                    label="Categoría *"
                    value={form.category} onChange={e => set("category", e.target.value)}
                    placeholder="Seleccionar..." required
                    options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  />
                  <Input label="Club" placeholder="Academia FutbolMetrics" value={form.club} onChange={e => set("club", e.target.value)} />
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Objetivos y Observaciones</h3>
                <div className="space-y-4">
                  <Textarea label="Objetivo deportivo" placeholder="Llegar al fútbol profesional..." value={form.objective} onChange={e => set("objective", e.target.value)} rows={2} />
                  <Textarea label="Observaciones del entrenador" placeholder="Notas adicionales sobre el jugador..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Link href="/players">
                  <Button variant="secondary" type="button">Cancelar</Button>
                </Link>
                <Button type="submit" loading={saving}>
                  Crear Jugador
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
