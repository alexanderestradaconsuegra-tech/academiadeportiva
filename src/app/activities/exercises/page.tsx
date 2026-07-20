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
    addExercise({ category, name, video_url: "" })
    setNewName(n => ({ ...n, [category]: "" }))
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <Link href="/activities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-4">
          <ArrowLeft size={15} /> {t("backToActivities")}
        </Link>
        <PageHeader title={t("exerciseVideos")} subtitle={t("exerciseVideosSubtitle")} />

        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const items = exercises.filter(ex => ex.category === category).sort((a, b) => a.name.localeCompare(b.name))
            return (
              <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{enumT.activityCategory(category)}</h2>
                </div>
                {category === "Velocidad" && (
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Video destacado</p>
                    <div className="flex justify-start">
                      <div className="w-[200px] rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: "9/16" }}>
                        <iframe
                          src="https://www.youtube.com/embed/AW6mpDDb12s"
                          title="Velocidad - Video destacado"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 px-5 py-3">
                      <Film size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 w-44 shrink-0 truncate">{ex.name}</p>
                      {isCoach ? (
                        <>
                          <input
                            type="url"
                            placeholder={t("pasteYoutubeLink")}
                            defaultValue={ex.video_url}
                            onBlur={e => { if (e.target.value.trim() !== ex.video_url) updateExercise(ex.id, { video_url: e.target.value.trim() }) }}
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
                          />
                          <button onClick={() => deleteExercise(ex.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0" title={t("deleteExercise")}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : ex.video_url ? (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{t("viewVideo")}</a>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">{t("noVideoYet")}</span>
                      )}
                    </div>
                  ))}
                </div>
                {isCoach && (
                  <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
                    <input
                      placeholder={t("newExercisePlaceholder")}
                      value={newName[category] ?? ""}
                      onChange={e => setNewName(n => ({ ...n, [category]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(category) } }}
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
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
