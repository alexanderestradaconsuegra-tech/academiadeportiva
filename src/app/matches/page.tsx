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
import { Plus, X, Trophy, MapPin, Clock, Pencil, Trash2, Video, ChevronRight } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { Category, Match, ConvocatoriaPlayer } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { matches as matchesDict } from "@/lib/i18n/dictionaries/matches"
import { useEnumT } from "@/lib/i18n/enums"

const CATEGORIES: Category[] = ["Sub-10", "Sub-12", "Sub-14", "Sub-16", "Sub-18", "Juvenil", "Senior"]

const emptyForm = {
  opponent: "", competition: "", date: new Date().toISOString().split("T")[0], time: "",
  location: "", is_home: "true", category: "" as Category | "",
  our_score: "", opponent_score: "", video_url: "", notes: "",
}

export default function MatchesPage() {
  const { matches, addMatch, updateMatch, deleteMatch, currentUser, convocatorias } = useApp()
  const isCoach = currentUser?.role === "coach"
  const myPlayerId = currentUser?.player_id ?? null
  const t = useT(matchesDict)
  const enumT = useEnumT()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const today = new Date().toISOString().split("T")[0]
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const upcoming = sorted.filter(m => m.date >= today)
  const past = sorted.filter(m => m.date < today).reverse()

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(m: Match) {
    setEditingId(m.id)
    setForm({
      opponent: m.opponent, competition: m.competition, date: m.date, time: m.time,
      location: m.location, is_home: String(m.is_home), category: m.category ?? "",
      our_score: m.our_score === null ? "" : String(m.our_score),
      opponent_score: m.opponent_score === null ? "" : String(m.opponent_score),
      video_url: m.video_url, notes: m.notes,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      opponent: form.opponent,
      competition: form.competition,
      date: form.date,
      time: form.time,
      location: form.location,
      is_home: form.is_home === "true",
      category: form.category || null,
      our_score: form.our_score === "" ? null : Number(form.our_score),
      opponent_score: form.opponent_score === "" ? null : Number(form.opponent_score),
      video_url: form.video_url,
      notes: form.notes,
    }
    if (editingId) {
      updateMatch(editingId, data)
    } else {
      addMatch(data)
    }
    setShowForm(false)
    setForm(emptyForm)
    setSaving(false)
  }

  function handleDelete(id: string) {
    if (confirm(t("confirmDeleteMatch"))) deleteMatch(id)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("title")} subtitle={`${matches.length} ${t("matchesRegisteredCount")}`}>
          {isCoach && (
            <Button onClick={openCreate}>
              <Plus size={16} /> {t("newMatch")}
            </Button>
          )}
        </PageHeader>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingId ? t("editMatch") : t("newMatch")}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input label={t("opponentLabel")} placeholder={t("opponentPlaceholder")} value={form.opponent} onChange={e => set("opponent", e.target.value)} required />
                  </div>
                  <Input label={t("dateLabel")} type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                  <Input label={t("timeLabel")} type="time" value={form.time} onChange={e => set("time", e.target.value)} />
                  <Select label={t("homeAwayLabel")} value={form.is_home} onChange={e => set("is_home", e.target.value)}
                    options={[{ value: "true", label: t("home") }, { value: "false", label: t("away") }]} />
                  <Select label={t("categoryLabel")} value={form.category} onChange={e => set("category", e.target.value)}
                    placeholder={t("allCategories")} options={CATEGORIES.map(c => ({ value: c, label: enumT.category(c) }))} />
                  <Input label={t("competitionLabel")} placeholder={t("competitionPlaceholder")} value={form.competition} onChange={e => set("competition", e.target.value)} />
                  <Input label={t("locationLabel")} placeholder={t("locationPlaceholder")} value={form.location} onChange={e => set("location", e.target.value)} />
                  <Input label={t("ourGoalsLabel")} type="number" min={0} placeholder="0" value={form.our_score} onChange={e => set("our_score", e.target.value)} />
                  <Input label={t("opponentGoalsLabel")} type="number" min={0} placeholder="0" value={form.opponent_score} onChange={e => set("opponent_score", e.target.value)} />
                  <div className="col-span-2">
                    <Input label={t("matchVideoLabel")} placeholder={t("matchVideoPlaceholder")} value={form.video_url} onChange={e => set("video_url", e.target.value)} hint={t("matchVideoHint")} />
                  </div>
                  <div className="col-span-2">
                    <Textarea label={t("notesLabel")} placeholder={t("matchNotesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
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

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t("upcoming")}</h2>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Trophy size={36} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">{t("noMatchesScheduled")}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {upcoming.map(m => {
                    const conv = convocatorias.find(c => c.match_id === m.id)
                    const myEntry = myPlayerId ? conv?.players.find(p => p.player_id === myPlayerId) : null
                    return <MatchRow key={m.id} m={m} isCoach={isCoach} onEdit={() => openEdit(m)} onDelete={() => handleDelete(m.id)} myConvEntry={myEntry} />
                  })}
                </div>
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t("played")}</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {past.map(m => (
                    <MatchRow key={m.id} m={m} isCoach={isCoach} onEdit={() => openEdit(m)} onDelete={() => handleDelete(m.id)} myConvEntry={null} />
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

function MatchRow({ m, isCoach, onEdit, onDelete, myConvEntry }: { m: Match; isCoach: boolean; onEdit: () => void; onDelete: () => void; myConvEntry?: ConvocatoriaPlayer | null }) {
  const t = useT(matchesDict)
  const enumT = useEnumT()
  const played = m.our_score !== null && m.opponent_score !== null
  const result = played
    ? m.our_score! > m.opponent_score! ? "win" : m.our_score! < m.opponent_score! ? "loss" : "draw"
    : null

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        result === "win" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" :
        result === "loss" ? "bg-red-50 dark:bg-red-500/10 text-red-600" :
        result === "draw" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" :
        "bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF]"
      )}>
        <Trophy size={18} />
      </div>
      <Link href={`/matches/${m.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {m.is_home ? "vs" : "@"} {m.opponent}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(m.date)}</span>
          {m.time && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={11} /> {m.time}</span>
            </>
          )}
          {m.location && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={11} /> {m.location}</span>
            </>
          )}
          {m.video_url && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-blue-500 flex items-center gap-1"><Video size={11} /> {t("video360")}</span>
            </>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {myConvEntry && (
          <span className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
            myConvEntry.confirmed === true  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
            myConvEntry.confirmed === false ? "bg-red-50 dark:bg-red-500/10 text-red-500" :
                                              "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
          )}>
            {myConvEntry.confirmed === true ? "✓ Confirmado" : myConvEntry.confirmed === false ? "✗ No voy" : "⚽ Convocado"}
          </span>
        )}
        {m.category && <Badge variant="blue">{enumT.category(m.category)}</Badge>}
        {played && (
          <span className={cn(
            "text-sm font-black px-2.5 py-1 rounded-lg",
            result === "win" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" :
            result === "loss" ? "text-red-500 bg-red-50 dark:bg-red-500/10" :
            "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
          )}>
            {m.our_score} - {m.opponent_score}
          </span>
        )}
        {isCoach && (
          <>
            <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t("edit")}>
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" title={t("delete")}>
              <Trash2 size={14} />
            </button>
          </>
        )}
        <Link href={`/matches/${m.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
