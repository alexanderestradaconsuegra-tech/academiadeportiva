"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { ArrowLeft, Film, Plus, Trash2 } from "lucide-react"
import type { ActivityCategory } from "@/lib/types"

const CATEGORIES: ActivityCategory[] = ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Pliometría","Agilidad"]

export default function ExerciseLibraryPage() {
  const { currentUser, exercises, addExercise, updateExercise, deleteExercise } = useApp()
  const isCoach = currentUser?.role === "coach"
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
          <ArrowLeft size={15} /> Volver a Actividades
        </Link>
        <PageHeader title="Videos de Ejercicios" subtitle="Pega el link de YouTube que muestra la técnica correcta de cada ejercicio" />

        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const items = exercises.filter(ex => ex.category === category).sort((a, b) => a.name.localeCompare(b.name))
            return (
              <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{category}</h2>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 px-5 py-3">
                      <Film size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 w-44 shrink-0 truncate">{ex.name}</p>
                      {isCoach ? (
                        <>
                          <input
                            type="url"
                            placeholder="Pega el link de YouTube..."
                            defaultValue={ex.video_url}
                            onBlur={e => { if (e.target.value.trim() !== ex.video_url) updateExercise(ex.id, { video_url: e.target.value.trim() }) }}
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
                          />
                          <button onClick={() => deleteExercise(ex.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0" title="Eliminar ejercicio">
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : ex.video_url ? (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">Ver video</a>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">Sin video todavía</span>
                      )}
                    </div>
                  ))}
                </div>
                {isCoach && (
                  <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
                    <input
                      placeholder="Nuevo ejercicio..."
                      value={newName[category] ?? ""}
                      onChange={e => setNewName(n => ({ ...n, [category]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(category) } }}
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
                    />
                    <Button size="sm" variant="secondary" onClick={() => handleAdd(category)}>
                      <Plus size={13} /> Agregar
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
