"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { ArrowLeft, Film, Plus, Trash2, PlayCircle, ChevronUp, ExternalLink } from "lucide-react"
import type { ActivityCategory } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { activities as activitiesDict } from "@/lib/i18n/dictionaries/activities"
import { useEnumT } from "@/lib/i18n/enums"
import { getYoutubeEmbedUrl, cn } from "@/lib/utils"

const CATEGORIES: ActivityCategory[] = ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Pliometría","Agilidad"]

export default function ExerciseLibraryPage() {
  const { currentUser, exercises, addExercise, updateExercise, deleteExercise } = useApp()
  const isCoach = currentUser?.role === "coach"
  const t = useT(activitiesDict)
  const enumT = useEnumT()
  const [newName, setNewName] = useState<Record<string, string>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map(ex => {
                    const embedUrl = getYoutubeEmbedUrl(ex.video_url)
                    const expanded = expandedId === ex.id
                    return (
                      <div key={ex.id}>
                        <div className="flex items-center gap-3 px-5 py-3">
                          <Film size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 w-44 shrink-0 truncate">{ex.name}</p>
                          {isCoach && (
                            <input
                              type="url"
                              placeholder={t("pasteYoutubeLink")}
                              defaultValue={ex.video_url}
                              onBlur={e => { if (e.target.value.trim() !== ex.video_url) updateExercise(ex.id, { video_url: e.target.value.trim() }) }}
                              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
                            />
                          )}
                          {!isCoach && !ex.video_url && (
                            <span className="text-sm text-slate-400 dark:text-slate-500">{t("noVideoYet")}</span>
                          )}
                          {ex.video_url && embedUrl && (
                            <button
                              onClick={() => setExpandedId(expanded ? null : ex.id)}
                              className={cn(
                                "flex items-center gap-1.5 text-sm font-semibold shrink-0 px-2.5 py-1 rounded-lg transition-colors",
                                expanded ? "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" : "text-[#0B5CFF] bg-blue-50 dark:bg-blue-500/10"
                              )}
                            >
                              {expanded ? <><ChevronUp size={14} /> {t("hideVideo")}</> : <><PlayCircle size={14} /> {t("viewVideo")}</>}
                            </button>
                          )}
                          {ex.video_url && !embedUrl && (
                            <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-500 hover:underline shrink-0">
                              {t("viewVideo")} <ExternalLink size={12} />
                            </a>
                          )}
                          {isCoach && (
                            <button onClick={() => deleteExercise(ex.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0" title={t("deleteExercise")}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {expanded && embedUrl && (
                          <div className="px-5 pb-4">
                            <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                              <iframe
                                src={embedUrl}
                                title={ex.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
