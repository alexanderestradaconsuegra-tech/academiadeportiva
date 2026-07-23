"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import { Plus, X, Dumbbell, Film } from "lucide-react"
import { cn, formatDate, getCategoryColor, getIntensityColor } from "@/lib/utils"
import type { ActivityCategory, ActivityUnit, Intensity } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { activities as activitiesDict } from "@/lib/i18n/dictionaries/activities"
import { useEnumT } from "@/lib/i18n/enums"

const CATEGORIES: ActivityCategory[] = ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Pliometría","Agilidad"]
const UNITS: ActivityUnit[] = ["segundos","kg","repeticiones","metros","puntos"]
const INTENSITIES: Intensity[] = ["Baja","Media","Alta"]

const catBadgeMap: Record<string, "amber" | "red" | "blue" | "green" | "orange" | "purple" | "pink"> = {
  Velocidad: "amber", Fuerza: "red", Técnica: "blue", Resistencia: "green", Potencia: "orange", Pliometría: "pink", Agilidad: "purple"
}

export default function ActivitiesPage() {
  const { players, activities, exercises, addActivity, currentUser } = useApp()
  const t = useT(activitiesDict)
  const enumT = useEnumT()
  const isPlayer = currentUser?.role === "player"
  const ownPlayerId = currentUser?.player_id ?? null
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

  const categoryExercises = form.category
    ? exercises.filter(ex => ex.category === form.category).sort((a, b) => a.name.localeCompare(b.name))
    : []
  const selectedExercise = exercises.find(ex => ex.category === form.category && ex.name === form.exercise)

  function findExerciseVideo(category: ActivityCategory, exerciseName: string) {
    return exercises.find(ex => ex.category === category && ex.name === exerciseName)?.video_url
  }

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
    if (isPlayer) return a.player_id === ownPlayerId && (filterCat === "all" || a.category === filterCat)
    const matchP = filterPlayer === "all" || a.player_id === filterPlayer
    const matchC = filterCat === "all" || a.category === filterCat
    return matchP && matchC
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("title")} subtitle={`${filtered.length} ${t("trainingRecordsCount")}`}>
          <Link href="/activities/exercises">
            <Button variant="outline">
              <Film size={15} /> {t("exerciseVideos")}
            </Button>
          </Link>
          {!isPlayer && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} /> {t("registerActivity")}
            </Button>
          )}
        </PageHeader>

        {/* Modal form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("registerActivity")}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Select label={t("playerLabel")} value={form.player_id} onChange={e => set("player_id", e.target.value)} required
                      placeholder={t("selectPlayerPlaceholder")}
                      options={players.map(p => ({ value: p.id, label: p.name }))} />
                  </div>
                  <Input label={t("dateLabel")} type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                  <Select label={t("intensityLabel")} value={form.intensity} onChange={e => set("intensity", e.target.value)} required
                    placeholder={t("selectPlaceholder")} options={INTENSITIES.map(i => ({ value: i, label: enumT.intensity(i) }))} />
                  <Select label={t("categoryLabel")} value={form.category} onChange={e => { set("category", e.target.value); set("exercise", "") }} required
                    placeholder={t("selectPlaceholder")} options={CATEGORIES.map(c => ({ value: c, label: enumT.activityCategory(c) }))} />
                  <div>
                    <Select label={t("exerciseLabel")} value={form.exercise} onChange={e => set("exercise", e.target.value)} required
                      placeholder={t("selectPlaceholder")} options={categoryExercises.map(ex => ({ value: ex.name, label: ex.name }))} />
                    {selectedExercise?.video_url && (
                      <a href={selectedExercise.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1.5">
                        <Film size={11} /> {t("viewReferenceVideo")}
                      </a>
                    )}
                  </div>
                  <Input label={t("resultLabel")} type="number" step="0.01" placeholder="0" value={form.value} onChange={e => set("value", e.target.value)} required />
                  <Select label={t("unitLabel")} value={form.unit} onChange={e => set("unit", e.target.value)} required
                    placeholder={t("selectPlaceholder")} options={UNITS.map(u => ({ value: u, label: enumT.activityUnit(u) }))} />
                  <div className="col-span-2">
                    <Textarea label={t("observationsLabel")} placeholder={t("additionalNotesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-1">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
                  <Button type="submit" loading={saving}>{t("save")}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6 flex flex-wrap gap-3">
          {!isPlayer && (
            <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer">
              <option value="all">{t("allPlayers")}</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer">
            <option value="all">{t("allCategories")}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{enumT.activityCategory(c)}</option>)}
          </select>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-auto self-center">{filtered.length} {filtered.length !== 1 ? t("resultsCountPlural") : t("resultsCount")}</span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Dumbbell size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">{t("noActivitiesRegistered")}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map(a => {
                const player = players.find(p => p.id === a.player_id)
                const videoUrl = findExerciseVideo(a.category, a.exercise)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", getCategoryColor(a.category))}>
                      {a.category.substring(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.exercise}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {!isPlayer && <><span className="text-xs text-slate-400 dark:text-slate-500">{player?.name ?? "?"}</span><span className="text-slate-200">·</span></>}
                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(a.date)}</span>
                        {videoUrl && (
                          <>
                            <span className="text-slate-200">·</span>
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                              <Film size={11} /> {t("video")}
                            </a>
                          </>
                        )}
                        {a.notes && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-32">{a.notes}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={catBadgeMap[a.category] ?? "default"}>{enumT.activityCategory(a.category)}</Badge>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", getIntensityColor(a.intensity))}>{enumT.intensity(a.intensity)}</span>
                      <div className="text-right min-w-16">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{a.value}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{enumT.activityUnit(a.unit)}</p>
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
