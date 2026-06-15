"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { DominantFoot, Position, Category } from "@/lib/types"

const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]
const CATEGORIES: Category[] = ["Sub-10","Sub-12","Sub-14","Sub-16","Sub-18","Juvenil","Senior"]
const FEET: DominantFoot[] = ["Derecha","Izquierda","Ambidiestro"]

export default function EditPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const { getPlayer, updatePlayer, deletePlayer } = useApp()
  const router = useRouter()
  const player = getPlayer(id)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: "", age: "", birth_date: "", position: "" as Position | "",
    dominant_foot: "" as DominantFoot | "", height: "", weight: "",
    club: "", category: "" as Category | "",
    objective: "", notes: "", photo_url: "",
  })

  useEffect(() => {
    if (player) {
      setForm({
        name: player.name, age: String(player.age), birth_date: player.birth_date,
        position: player.position, dominant_foot: player.dominant_foot,
        height: String(player.height), weight: String(player.weight),
        club: player.club, category: player.category,
        objective: player.objective, notes: player.notes, photo_url: player.photo_url,
      })
    }
  }, [player])

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (!player) return <AppShell><div className="p-8 text-slate-400">Jugador no encontrado.</div></AppShell>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    updatePlayer(id, {
      name: form.name, age: Number(form.age), birth_date: form.birth_date,
      position: form.position as Position, dominant_foot: form.dominant_foot as DominantFoot,
      height: Number(form.height), weight: Number(form.weight), club: form.club,
      category: form.category as Category, objective: form.objective, notes: form.notes, photo_url: form.photo_url,
    })
    router.push(`/players/${id}`)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${player?.name}? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    await new Promise(r => setTimeout(r, 500))
    deletePlayer(id)
    router.push("/players")
  }

  return (
    <AppShell>
      <div className="p-6 xl:p-8 animate-fade-in max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/players/${id}`} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <PageHeader title="Editar Jugador" subtitle={player.name} className="mb-0 flex-1" />
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 size={14} /> Eliminar
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 h-fit">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 mx-auto mb-4">
                <img src={form.photo_url || player.photo_url} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <Input label="URL de foto" placeholder="https://..." value={form.photo_url} onChange={e => set("photo_url", e.target.value)} className="w-full text-xs" />
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Input label="Nombre completo *" value={form.name} onChange={e => set("name", e.target.value)} required /></div>
                  <Input label="Edad" type="number" min={5} max={40} value={form.age} onChange={e => set("age", e.target.value)} />
                  <Input label="Fecha de nacimiento" type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} />
                  <Input label="Altura (cm)" type="number" value={form.height} onChange={e => set("height", e.target.value)} />
                  <Input label="Peso (kg)" type="number" value={form.weight} onChange={e => set("weight", e.target.value)} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Información Deportiva</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Posición *" value={form.position} onChange={e => set("position", e.target.value)} required options={POSITIONS.map(p => ({ value: p, label: p }))} />
                  <Select label="Pierna hábil *" value={form.dominant_foot} onChange={e => set("dominant_foot", e.target.value)} required options={FEET.map(f => ({ value: f, label: f }))} />
                  <Select label="Categoría *" value={form.category} onChange={e => set("category", e.target.value)} required options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                  <Input label="Club" value={form.club} onChange={e => set("club", e.target.value)} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Objetivos y Observaciones</h3>
                <div className="space-y-4">
                  <Textarea label="Objetivo deportivo" value={form.objective} onChange={e => set("objective", e.target.value)} rows={2} />
                  <Textarea label="Observaciones" value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Link href={`/players/${id}`}><Button variant="secondary" type="button">Cancelar</Button></Link>
                <Button type="submit" loading={saving}>Guardar Cambios</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
