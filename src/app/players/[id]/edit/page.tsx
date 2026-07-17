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
import PhotoUpload from "@/components/ui/PhotoUpload"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { DominantFoot, Position, Category } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"

const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]
const CATEGORIES: Category[] = ["Sub-5","Sub-6","Sub-7","Sub-8","Sub-9","Sub-10","Sub-11","Sub-12","Sub-13","Sub-14","Sub-15","Otra"]
const FEET: DominantFoot[] = ["Derecha","Izquierda","Ambidiestro"]

export default function EditPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const { getPlayer, updatePlayer, deletePlayer, currentUser } = useApp()
  const router = useRouter()
  const t = useT(playersDict)
  const e = useEnumT()
  const player = getPlayer(id)
  const isAssistant = currentUser?.role === "assistant"

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

  if (!player) return <AppShell><div className="p-8 text-slate-400 dark:text-slate-500">{t("playerNotFound")}.</div></AppShell>

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
    if (!confirm(t("confirmDeletePlayer").replace("{name}", player?.name ?? ""))) return
    setDeleting(true)
    await new Promise(r => setTimeout(r, 500))
    deletePlayer(id)
    router.push("/players")
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/players/${id}`} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <PageHeader title={t("editPlayerTitle")} subtitle={player.name} className="mb-0 flex-1" />
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 size={14} /> {t("delete")}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-fit">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 mx-auto mb-4">
                <img src={form.photo_url || player.photo_url} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3">
                <PhotoUpload folder="players" onUploaded={url => set("photo_url", url)} />
                <Input label={t("photoUrlLabel")} placeholder="https://..." value={form.photo_url} onChange={ev => set("photo_url", ev.target.value)} className="w-full text-xs" />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("personalInfo")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Input label={t("fullNameLabel")} value={form.name} onChange={ev => set("name", ev.target.value)} required /></div>
                  <Input label={t("ageLabel")} type="number" min={5} max={40} value={form.age} onChange={ev => set("age", ev.target.value)} />
                  <Input label={t("birthDateLabel")} type="date" value={form.birth_date} onChange={ev => set("birth_date", ev.target.value)} />
                  <Input label={t("heightCmLabel")} type="number" value={form.height} onChange={ev => set("height", ev.target.value)} />
                  <Input label={t("weightKgLabel")} type="number" value={form.weight} onChange={ev => set("weight", ev.target.value)} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("sportsInfo")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label={t("positionLabel")} value={form.position} onChange={ev => set("position", ev.target.value)} required options={POSITIONS.map(p => ({ value: p, label: e.position(p) }))} />
                  <Select label={t("dominantFootLabel")} value={form.dominant_foot} onChange={ev => set("dominant_foot", ev.target.value)} required options={FEET.map(f => ({ value: f, label: e.dominantFoot(f) }))} />
                  <Select label={t("categoryLabel")} value={form.category} onChange={ev => set("category", ev.target.value)} required disabled={isAssistant} options={CATEGORIES.map(c => ({ value: c, label: e.category(c) }))} />
                  <Input label={t("clubLabel")} value={form.club} onChange={ev => set("club", ev.target.value)} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("objectivesAndObservations")}</h3>
                <div className="space-y-4">
                  <Textarea label={t("sportingObjectiveLabel")} value={form.objective} onChange={ev => set("objective", ev.target.value)} rows={2} />
                  <Textarea label={t("observationsLabel")} value={form.notes} onChange={ev => set("notes", ev.target.value)} rows={2} />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Link href={`/players/${id}`}><Button variant="secondary" type="button">{t("cancel")}</Button></Link>
                <Button type="submit" loading={saving}>{t("saveChanges")}</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
