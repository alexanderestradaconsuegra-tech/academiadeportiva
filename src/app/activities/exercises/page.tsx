"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { ArrowLeft, Film, Plus, Trash2 } from "lucide-react"
import type { ActivityCategory } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { activities as activitiesDict } from "@/lib/i18n/dictionaries/activities"
import { useEnumT } from "@/lib/i18n/enums"

const CATEGORIES: ActivityCategory[] = ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Pliometría","Agilidad"]

export default function ExerciseLibraryPage() {
  const { currentUser, exercises, addExercise, updateExercise, deleteExercise } = useApp()
  const isCoach = currentUser?.role === "coach"
  const t = useT(activitiesDict)
  const enumT = useEnumT()
  const [newName, setNewName] = useState<Record<string, string>>({})

  function handleAdd(category: ActivityCategory) {
    const name = (newName[category] ?? "").trim()
    if (!name) return
    addExercise({ category, name, video_url: "", description: "" })
    setNewName(n => ({ ...n, [category]: "" }))
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <Link href="/activities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-lime-700 dark:hover:text-lime-400 mb-4">
          <ArrowLeft size={15} /> {t("backToActivities")}
        </Link>
        <PageHeader title="Biblioteca de ejercicios" subtitle="Agrega, edita o elimina ejercicios por categoría. Cada academia tiene su propia lista." />

        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const items = exercises.filter(ex => ex.category === category).sort((a, b) => a.name.localeCompare(b.name))
            return (
              <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{enumT.activityCategory(category)}</h2>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map(ex => (
                    <div key={ex.id} className="flex items-start gap-3 px-4 sm:px-5 py-3">
                      <Film size={14} className="text-slate-300 dark:text-slate-600 shrink-0 mt-3" />
                      {/* Name and video stack on phones and sit side by side from
                          sm up; min-w-0 lets them actually shrink instead of
                          pushing the row off screen. */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          {isCoach ? (
                            <input
                              defaultValue={ex.name}
                              onBlur={e => { const v = e.target.value.trim(); if (v && v !== ex.name) updateExercise(ex.id, { name: v }) }}
                              className="w-full sm:w-44 sm:shrink-0 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium bg-white dark:bg-slate-900 focus:border-lime-600 dark:focus:border-lime-400 outline-none text-slate-800 dark:text-slate-200"
                            />
                          ) : (
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 w-full sm:w-44 sm:shrink-0 truncate">{ex.name}</p>
                          )}
                          {isCoach ? (
                            <input
                              type="url"
                              placeholder={t("pasteYoutubeLink")}
                              defaultValue={ex.video_url}
                              onBlur={e => { if (e.target.value.trim() !== ex.video_url) updateExercise(ex.id, { video_url: e.target.value.trim() }) }}
                              className="w-full sm:flex-1 min-w-0 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-lime-600 dark:focus:border-lime-400 outline-none"
                            />
                          ) : ex.video_url ? (
                            <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-lime-700 dark:text-lime-400 hover:underline">{t("viewVideo")}</a>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">{t("noVideoYet")}</span>
                          )}
                        </div>
                        {/* Shown to the player on their plan card, so it's worth
                            filling in: a name alone doesn't tell them what to do. */}
                        {isCoach ? (
                          <input
                            placeholder="Cómo hacerlo (ej: 3 series de 10, descanso 40s)"
                            defaultValue={ex.description}
                            onBlur={e => { const v = e.target.value.trim(); if (v !== ex.description) updateExercise(ex.id, { description: v }) }}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:border-lime-600 dark:focus:border-lime-400 outline-none text-slate-600 dark:text-slate-300"
                          />
                        ) : ex.description ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{ex.description}</p>
                        ) : null}
                      </div>
                      {isCoach && (
                        <button onClick={() => deleteExercise(ex.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0" title={t("deleteExercise")}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isCoach && (
                  <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
                    <input
                      placeholder={t("newExercisePlaceholder")}
                      value={newName[category] ?? ""}
                      onChange={e => setNewName(n => ({ ...n, [category]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(category) } }}
                      className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-lime-600 dark:focus:border-lime-400 outline-none"
                    />
                    <Button size="sm" variant="secondary" onClick={() => handleAdd(category)}>
                      <Plus size={13} /> {t("add")}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
