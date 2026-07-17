"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import { Plus, X, CalendarDays, MapPin, Clock, Pencil, Trash2, ClipboardList, Check } from "lucide-react"
import { cn, formatDate, avatarUrl } from "@/lib/utils"
import type { Category, Training, AttendanceStatus } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { calendar } from "@/lib/i18n/dictionaries/calendar"
import { useEnumT } from "@/lib/i18n/enums"

const CATEGORIES: Category[] = ["Sub-5", "Sub-6", "Sub-7", "Sub-8", "Sub-9", "Sub-10", "Sub-11", "Sub-12", "Sub-13", "Sub-14", "Sub-15", "Otra"]

const emptyForm = {
  title: "", date: new Date().toISOString().split("T")[0], time: "",
  category: "" as Category | "", location: "", notes: "",
}

async function notifyNewTraining(data: { title: string; date: string; time: string; category: Category | null }, notificationTitle: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) return
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: notificationTitle,
        body: `${data.title} · ${formatDate(data.date)}${data.time ? " " + data.time : ""}`,
        category: data.category || "all",
      }),
    })
  } catch {
    /* notificación es de mejor esfuerzo, no bloquea la creación */
  }
}

export default function CalendarPage() {
  const { trainings, players, currentUser, addTraining, updateTraining, deleteTraining, upsertAttendance, getTrainingAttendance } = useApp()
  const isCoach = currentUser?.role === "coach"
  const myPlayerId = currentUser?.player_id ?? null
  const myPlayer = players.find(p => p.id === myPlayerId)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [attendanceTraining, setAttendanceTraining] = useState<Training | null>(null)
  const t = useT(calendar)
  const e = useEnumT()

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const today = new Date().toISOString().split("T")[0]
  const visible = isCoach
    ? trainings
    : trainings.filter(tr => !tr.category || tr.category === myPlayer?.category)
  const sorted = [...visible].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const upcoming = sorted.filter(t => t.date >= today)
  const past = sorted.filter(t => t.date < today).reverse()

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(t: Training) {
    setEditingId(t.id)
    setForm({
      title: t.title, date: t.date, time: t.time,
      category: t.category ?? "", location: t.location, notes: t.notes,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      title: form.title,
      date: form.date,
      time: form.time,
      category: form.category || null,
      location: form.location,
      notes: form.notes,
    }
    if (editingId) {
      updateTraining(editingId, data)
    } else {
      addTraining(data)
      notifyNewTraining(data, t("newTrainingNotificationTitle"))
    }
    setShowForm(false)
    setForm(emptyForm)
    setSaving(false)
  }

  function handleDelete(id: string) {
    if (confirm(t("confirmDeleteTraining"))) deleteTraining(id)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={`${visible.length} ${t("trainingsScheduled")}`}>
          {isCoach && (
            <Button onClick={openCreate}>
              <Plus size={16} /> {t("newTraining")}
            </Button>
          )}
        </PageHeader>

        {/* Attendance modal */}
        {isCoach && attendanceTraining && (
          <AttendanceModal
            training={attendanceTraining}
            players={players.filter(p => !attendanceTraining.category || p.category === attendanceTraining.category)}
            attendance={getTrainingAttendance(attendanceTraining.id)}
            onUpsert={(playerId, status) => upsertAttendance(attendanceTraining.id, playerId, status)}
            onClose={() => setAttendanceTraining(null)}
          />
        )}

        {isCoach && showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingId ? t("editTraining") : t("newTraining")}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input label={t("titleLabel")} placeholder={t("titlePlaceholder")} value={form.title} onChange={e => set("title", e.target.value)} required />
                  </div>
                  <Input label={t("dateLabel")} type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
                  <Input label={t("timeLabel")} type="time" value={form.time} onChange={e => set("time", e.target.value)} />
                  <Select label={t("categoryLabel")} value={form.category} onChange={ev => set("category", ev.target.value)}
                    placeholder={t("allCategories")} options={CATEGORIES.map(c => ({ value: c, label: e.category(c) }))} />
                  <Input label={t("locationLabel")} placeholder={t("locationPlaceholder")} value={form.location} onChange={e => set("location", e.target.value)} />
                  <div className="col-span-2">
                    <Textarea label={t("notesLabel")} placeholder={t("notesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
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
                <CalendarDays size={36} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">{t("noTrainingsScheduled")}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {upcoming.map(tr => (
                    <TrainingRow
                      key={tr.id} t={tr} isPast={false} isCoach={isCoach} myPlayerId={myPlayerId}
                      attendance={getTrainingAttendance(tr.id)}
                      onEdit={() => openEdit(tr)} onDelete={() => handleDelete(tr.id)} onAttendance={() => setAttendanceTraining(tr)}
                      onRsvp={status => myPlayerId && upsertAttendance(tr.id, myPlayerId, status)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t("past")}</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {past.map(tr => (
                    <TrainingRow
                      key={tr.id} t={tr} isPast={true} isCoach={isCoach} myPlayerId={myPlayerId}
                      attendance={getTrainingAttendance(tr.id)}
                      onEdit={() => openEdit(tr)} onDelete={() => handleDelete(tr.id)} onAttendance={() => setAttendanceTraining(tr)}
                      onRsvp={status => myPlayerId && upsertAttendance(tr.id, myPlayerId, status)}
                    />
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

function TrainingRow({ t: training, isPast, isCoach, myPlayerId, attendance, onEdit, onDelete, onAttendance, onRsvp }: {
  t: Training; isPast: boolean; isCoach: boolean; myPlayerId: string | null
  attendance: ReturnType<typeof useApp>["attendance"]
  onEdit: () => void; onDelete: () => void; onAttendance: () => void
  onRsvp: (status: AttendanceStatus) => void
}) {
  const t = useT(calendar)
  const e = useEnumT()
  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length
  const hasAttendance = attendance.length > 0
  const myStatus = myPlayerId ? attendance.find(a => a.player_id === myPlayerId)?.status ?? null : null
  return (
    <div className={cn("flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors", isPast && "opacity-75")}>
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF] flex items-center justify-center shrink-0">
        <CalendarDays size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{training.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(training.date)}</span>
          {training.time && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={11} /> {training.time}</span></>}
          {training.location && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={11} /> {training.location}</span></>}
          {training.notes && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-32">{training.notes}</span></>}
        </div>
        {isCoach && isPast && hasAttendance && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Check size={11} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{presentCount} {t("presentCount")} · {attendance.length} {t("of")} total</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {training.category && <Badge variant="blue">{e.category(training.category)}</Badge>}
        {isCoach ? (
          <>
            <button onClick={onAttendance} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title={t("markAttendance")}>
              <ClipboardList size={14} />
            </button>
            <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t("edit")}>
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" title={t("deleteAction")}>
              <Trash2 size={14} />
            </button>
          </>
        ) : isPast ? (
          myStatus && (
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", STATUS_CONFIG[myStatus].bg, STATUS_CONFIG[myStatus].text)}>
              {t(myStatus as keyof typeof t)}
            </span>
          )
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRsvp("present")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                myStatus === "present" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              {t("iWillAttend")}
            </button>
            <button
              onClick={() => onRsvp("absent")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                myStatus === "absent" ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500"
              )}
            >
              {t("iCannotAttend")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
  present:  { label: "present",  bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  late:     { label: "late",     bg: "bg-amber-100 dark:bg-amber-500/20",     text: "text-amber-700 dark:text-amber-400" },
  excused:  { label: "excused",  bg: "bg-blue-100 dark:bg-blue-500/20",       text: "text-blue-700 dark:text-blue-400" },
  absent:   { label: "absent",   bg: "bg-red-100 dark:bg-red-500/20",         text: "text-red-700 dark:text-red-400" },
}
const STATUS_CYCLE: AttendanceStatus[] = ["present", "late", "excused", "absent"]

function AttendanceModal({ training, players, attendance, onUpsert, onClose }: {
  training: Training
  players: { id: string; name: string; photo_url: string }[]
  attendance: { player_id: string; status: AttendanceStatus }[]
  onUpsert: (playerId: string, status: AttendanceStatus) => void
  onClose: () => void
}) {
  const t = useT(calendar)
  const statusMap = Object.fromEntries(attendance.map(a => [a.player_id, a.status]))

  function cycle(playerId: string) {
    const current = statusMap[playerId]
    const idx = current ? STATUS_CYCLE.indexOf(current) : -1
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onUpsert(playerId, next)
  }

  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("attendance")} — {training.title}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(training.date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Summary bar */}
        {attendance.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-4 text-xs">
              {STATUS_CYCLE.map(s => {
                const count = attendance.filter(a => a.status === s).length
                const cfg = STATUS_CONFIG[s]
                return count > 0 ? (
                  <span key={s} className={cn("font-semibold px-2 py-0.5 rounded-md", cfg.bg, cfg.text)}>{count} {t(s as keyof typeof t)}</span>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Player list */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-800">
          {players.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">{t("noPlayersInCategory")}</div>
          ) : players.map(player => {
            const status = statusMap[player.id] as AttendanceStatus | undefined
            const cfg = status ? STATUS_CONFIG[status] : null
            return (
              <div key={player.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <img src={player.photo_url || avatarUrl(player.name, player.id)} alt={player.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{player.name}</span>
                <button
                  onClick={() => cycle(player.id)}
                  className={cn(
                    "h-7 px-3 rounded-lg text-xs font-semibold transition-all border",
                    cfg
                      ? cn(cfg.bg, cfg.text, "border-transparent")
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {status ? t(status as any) : "—"}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {presentCount} {t("presentCount")} {t("of")} {players.length}
          </span>
          <Button size="sm" onClick={onClose}>{t("closeAttendance")}</Button>
        </div>
      </div>
    </div>
  )
}
