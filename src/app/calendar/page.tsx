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
import { Plus, X, CalendarDays, MapPin, Clock, Pencil, Trash2, ClipboardList, Check, UserCheck, UserX, HelpCircle, RepeatIcon, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { cn, formatDate, avatarUrl } from "@/lib/utils"
import type { Category, Training, AttendanceStatus, RsvpStatus } from "@/lib/types"
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
  const { trainings, players, currentUser, addTraining, updateTraining, deleteTraining, upsertAttendance, upsertRsvp, getTrainingAttendance, trainingSchedules, upsertTrainingSchedule, deleteTrainingSchedule, generateMonthTrainings } = useApp()
  const isOwner = currentUser?.role === "coach"
  const isAssistant = currentUser?.role === "assistant"
  const isCoach = isOwner || isAssistant
  const myPlayerId = currentUser?.player_id ?? null
  const myPlayer = players.find(p => p.id === myPlayerId)
  const canManage = (tr: Training) => isOwner || (isAssistant && tr.category === currentUser?.category)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [attendanceTraining, setAttendanceTraining] = useState<Training | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ created: number; skipped: number } | null>(null)
  const t = useT(calendar)
  const e = useEnumT()

  const now = new Date()
  const [genYear, setGenYear]   = useState(now.getFullYear())
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1)

  async function handleGenerate() {
    setGenerating(true)
    setGenResult(null)
    const result = await generateMonthTrainings(genYear, genMonth)
    setGenResult(result)
    setGenerating(false)
  }

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
    setForm({ ...emptyForm, category: (isAssistant ? currentUser?.category : "") ?? "" })
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
                    placeholder={t("allCategories")} disabled={isAssistant} options={CATEGORIES.map(c => ({ value: c, label: e.category(c) }))} />
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

        {/* Recurring schedule panel — solo entrenador principal */}
        {isOwner && (
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowSchedule(s => !s)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                  <RepeatIcon size={15} className="text-violet-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Horario recurrente</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {trainingSchedules.length === 0
                      ? "Sin días configurados — configura los días fijos de entrenamiento"
                      : `${trainingSchedules.length} día${trainingSchedules.length > 1 ? "s" : ""} configurado${trainingSchedules.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              {showSchedule ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {showSchedule && (
              <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-5 space-y-5">
                <WeekScheduleEditor
                  schedules={trainingSchedules}
                  categories={CATEGORIES}
                  onUpsert={upsertTrainingSchedule}
                  onDelete={deleteTrainingSchedule}
                  e={e}
                />

                {/* Generar mes */}
                {trainingSchedules.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3">Generar entrenamientos para un mes</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={genMonth}
                        onChange={ev => setGenMonth(Number(ev.target.value))}
                        className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      >
                        {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => (
                          <option key={m} value={i+1}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={genYear}
                        onChange={ev => setGenYear(Number(ev.target.value))}
                        className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      >
                        {[now.getFullYear(), now.getFullYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="h-9 px-4 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        <Sparkles size={13} />
                        {generating ? "Generando…" : "Generar entrenamientos"}
                      </button>
                      {genResult && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ {genResult.created} creados{genResult.skipped > 0 ? ` · ${genResult.skipped} ya existían` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                      key={tr.id} t={tr} isPast={false} isCoach={isCoach} canManage={canManage(tr)} myPlayerId={myPlayerId}
                      attendance={getTrainingAttendance(tr.id)}
                      onEdit={() => openEdit(tr)} onDelete={() => handleDelete(tr.id)} onAttendance={() => setAttendanceTraining(tr)}
                      onRsvp={rsvp => myPlayerId && upsertRsvp(tr.id, myPlayerId, rsvp)}
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
                      key={tr.id} t={tr} isPast={true} isCoach={isCoach} canManage={canManage(tr)} myPlayerId={myPlayerId}
                      attendance={getTrainingAttendance(tr.id)}
                      onEdit={() => openEdit(tr)} onDelete={() => handleDelete(tr.id)} onAttendance={() => setAttendanceTraining(tr)}
                      onRsvp={rsvp => myPlayerId && upsertRsvp(tr.id, myPlayerId, rsvp)}
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

function TrainingRow({ t: training, isPast, isCoach, canManage, myPlayerId, attendance, onEdit, onDelete, onAttendance, onRsvp }: {
  t: Training; isPast: boolean; isCoach: boolean; canManage: boolean; myPlayerId: string | null
  attendance: ReturnType<typeof useApp>["attendance"]
  onEdit: () => void; onDelete: () => void; onAttendance: () => void
  onRsvp: (rsvp: RsvpStatus) => void
}) {
  const t = useT(calendar)
  const e = useEnumT()

  // Conteos para entrenador
  const rsvpConfirmed = attendance.filter(a => a.rsvp === "confirmed").length
  const rsvpDeclined  = attendance.filter(a => a.rsvp === "declined").length
  const rsvpPending   = attendance.filter(a => a.rsvp === "pending").length
  const hasRsvp = attendance.length > 0

  // Asistencia real (post-evento)
  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length
  const hasAttendance = attendance.some(a => a.status !== "present" || isPast)

  // Estado del jugador actual
  const myRecord = myPlayerId ? attendance.find(a => a.player_id === myPlayerId) : null
  const myRsvp   = myRecord?.rsvp ?? "pending"
  const myStatus = myRecord?.status ?? null

  return (
    <div className={cn("px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors", isPast && "opacity-75")}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF] flex items-center justify-center shrink-0">
          <CalendarDays size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{training.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(training.date)}</span>
            {training.time && <><span className="text-slate-200 dark:text-slate-700">·</span><span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={11} /> {training.time}</span></>}
            {training.location && <><span className="text-slate-200 dark:text-slate-700">·</span><span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={11} /> {training.location}</span></>}
          </div>

          {/* Conteo RSVP para entrenador — eventos futuros */}
          {isCoach && !isPast && hasRsvp && (
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <UserCheck size={12} /> {rsvpConfirmed} {t("confirmed")}
              </span>
              {rsvpDeclined > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                  <UserX size={12} /> {rsvpDeclined} {t("declined")}
                </span>
              )}
              {rsvpPending > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <HelpCircle size={12} /> {rsvpPending} {t("pending")}
                </span>
              )}
            </div>
          )}

          {/* Asistencia real para entrenador — eventos pasados */}
          {isCoach && isPast && hasRsvp && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Check size={11} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{presentCount} {t("presentCount")} · {attendance.length} {t("of")} total</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {training.category && <Badge variant="blue">{e.category(training.category)}</Badge>}

          {isCoach ? (
            canManage && (
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
            )
          ) : isPast ? (
            myStatus && (
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", STATUS_CONFIG[myStatus].bg, STATUS_CONFIG[myStatus].text)}>
                {t(myStatus as keyof typeof t)}
              </span>
            )
          ) : (
            /* Botones RSVP para el jugador en eventos futuros */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onRsvp("confirmed")}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                  myRsvp === "confirmed"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                )}
              >
                {t("iWillAttend")}
              </button>
              <button
                onClick={() => onRsvp("declined")}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                  myRsvp === "declined"
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500"
                )}
              >
                {t("iCannotAttend")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner de confirmación destacado para jugador — solo si no ha respondido */}
      {!isCoach && !isPast && myRsvp === "pending" && (
        <div className="mt-3 ml-14 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            <HelpCircle size={14} className="text-amber-500" />
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium flex-1">
            ¿Vas a este entrenamiento? Confirma tu asistencia.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onRsvp("confirmed")}
              className="h-7 px-3 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              Sí, voy
            </button>
            <button
              onClick={() => onRsvp("declined")}
              className="h-7 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              No puedo
            </button>
          </div>
        </div>
      )}
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
  attendance: { player_id: string; status: AttendanceStatus; rsvp: RsvpStatus }[]
  onUpsert: (playerId: string, status: AttendanceStatus) => void
  onClose: () => void
}) {
  const t = useT(calendar)
  const statusMap = Object.fromEntries(attendance.map(a => [a.player_id, a.status]))
  const rsvpMap   = Object.fromEntries(attendance.map(a => [a.player_id, a.rsvp]))

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
                {/* Badge RSVP del jugador */}
                {rsvpMap[player.id] === "confirmed" && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Confirmó</span>}
                {rsvpMap[player.id] === "declined"  && <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">✕ No viene</span>}
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

/* ── WeekScheduleEditor ─────────────────────────────────────────────────── */
const DAYS = [
  { dow: 1, label: "Lun" }, { dow: 2, label: "Mar" }, { dow: 3, label: "Mié" },
  { dow: 4, label: "Jue" }, { dow: 5, label: "Vie" }, { dow: 6, label: "Sáb" },
  { dow: 0, label: "Dom" },
]

function WeekScheduleEditor({ schedules, categories, onUpsert, onDelete, e }: {
  schedules: { id: string; day_of_week: number; time: string; category: string | null; location: string }[]
  categories: Category[]
  onUpsert: (s: { day_of_week: number; time: string; category: string | null; location: string; notes: string }) => Promise<void>
  onDelete: (id: string) => void
  e: ReturnType<typeof useEnumT>
}) {
  const scheduleMap = Object.fromEntries(schedules.map(s => [s.day_of_week, s]))
  const [editing, setEditing] = useState<number | null>(null)
  const [time, setTime]         = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [saving, setSaving]     = useState(false)

  function openDay(dow: number) {
    const existing = scheduleMap[dow]
    setTime(existing?.time ?? "")
    setCategory(existing?.category ?? "")
    setLocation(existing?.location ?? "")
    setEditing(dow)
  }

  async function save() {
    if (editing === null) return
    setSaving(true)
    await onUpsert({ day_of_week: editing, time, category: category || null, location, notes: "" })
    setSaving(false)
    setEditing(null)
  }

  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        Activa los días de entrenamiento. El sistema generará todos esos días en el mes que elijas.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {DAYS.map(({ dow, label }) => {
          const active = !!scheduleMap[dow]
          return (
            <button
              key={dow}
              onClick={() => active ? onDelete(scheduleMap[dow].id) : openDay(dow)}
              onContextMenu={ev => { ev.preventDefault(); if (active) openDay(dow) }}
              className={cn(
                "relative flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                active
                  ? "bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-200 dark:shadow-violet-900/40"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:text-violet-500"
              )}
              title={active ? "Click para quitar · clic derecho para editar" : "Click para activar"}
            >
              {label}
              {active && (
                <span className="text-[9px] font-semibold text-violet-100 mt-0.5">
                  {scheduleMap[dow].time || "—"}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {schedules.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {schedules.map(s => {
            const day = DAYS.find(d => d.dow === s.day_of_week)
            return (
              <div key={s.id} className="flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl px-3 py-2">
                <span className="text-xs font-black text-violet-600 dark:text-violet-400">{day?.label}</span>
                {s.time && <span className="text-[11px] text-violet-500 dark:text-violet-300">{s.time}</span>}
                {s.category && <span className="text-[10px] text-violet-400 dark:text-violet-500">{s.category}</span>}
                {s.location && <span className="text-[10px] text-slate-400 truncate max-w-24">{s.location}</span>}
                <button onClick={() => openDay(s.day_of_week)} className="text-violet-300 hover:text-violet-500 transition-colors ml-1">
                  <Pencil size={10} />
                </button>
                <button onClick={() => onDelete(s.id)} className="text-violet-300 hover:text-red-400 transition-colors">
                  <X size={10} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Mini form para configurar un día */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Configurar {DAYS.find(d => d.dow === editing)?.label}
              </p>
              <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Hora</span>
                <input type="time" value={time} onChange={ev => setTime(ev.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Categoría (opcional)</span>
                <select value={category} onChange={ev => setCategory(ev.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="">Todas las categorías</option>
                  {categories.map(c => <option key={c} value={c}>{e.category(c)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Lugar (opcional)</span>
                <input type="text" value={location} onChange={ev => setLocation(ev.target.value)} placeholder="Ej: Cancha 1"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditing(null)} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 h-9 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
