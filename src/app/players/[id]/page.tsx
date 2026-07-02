"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import ScoreRing from "@/components/ui/ScoreRing"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import NotificationToggle from "@/components/ui/NotificationToggle"
import { ArrowLeft, Edit, Dumbbell, Calendar, CalendarDays, Clock, MapPin, Ruler, Weight, Target, Star, TrendingUp, ArrowUp, ArrowDown, ArrowRight, Plus, X, Trash2, Trophy, Goal, Footprints, Download } from "lucide-react"
import { cn, formatDate, getCategoryColor, getIntensityColor, getScoreColor } from "@/lib/utils"
import type { Evaluation } from "@/lib/types"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend
} from "recharts"
import { Heart, Zap, Wind, Activity as ActivityIcon } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"
import type { ActivityCategory } from "@/lib/types"

const ATTR_KEYS: Record<string, ActivityCategory> = {
  speed_score: "Velocidad",
  strength_score: "Fuerza",
  technique_score: "Técnica",
  resistance_score: "Resistencia",
  power_score: "Potencia",
  agility_score: "Agilidad",
}

const ATTR_COLORS: Record<string, string> = {
  speed_score: "#F59E0B",
  strength_score: "#EF4444",
  technique_score: "#3B82F6",
  resistance_score: "#10B981",
  power_score: "#F97316",
  agility_score: "#8B5CF6",
}

function EvaluationComparison({ evaluations }: { evaluations: Evaluation[] }) {
  const t = useT(playersDict)
  const e = useEnumT()
  const sorted = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const [beforeId, setBeforeId] = useState(sorted[0].id)
  const [afterId, setAfterId] = useState(sorted[sorted.length - 1].id)
  const before = sorted.find(ev => ev.id === beforeId) ?? sorted[0]
  const after = sorted.find(ev => ev.id === afterId) ?? sorted[sorted.length - 1]

  const radarData = Object.entries(ATTR_KEYS).map(([k, attrKey]) => ({
    subject: e.activityCategory(attrKey).substring(0, 3),
    before: before[k as keyof Evaluation] as number,
    after: after[k as keyof Evaluation] as number,
  }))

  const rows = Object.entries(ATTR_KEYS).map(([k, attrKey]) => {
    const b = before[k as keyof Evaluation] as number
    const a = after[k as keyof Evaluation] as number
    return { key: k, label: e.activityCategory(attrKey), before: b, after: a, delta: a - b }
  })

  const generalDelta = after.general_score - before.general_score
  const selectClass = "h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer"

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("beforeAfterComparison")}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("evolutionBetweenEvals")}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={beforeId} onChange={ev => setBeforeId(ev.target.value)} className={selectClass}>
            {sorted.map(ev => <option key={ev.id} value={ev.id}>{formatDate(ev.date)}</option>)}
          </select>
          <ArrowRight size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <select value={afterId} onChange={ev => setAfterId(ev.target.value)} className={selectClass}>
            {sorted.map(ev => <option key={ev.id} value={ev.id}>{formatDate(ev.date)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
        <ScoreRing score={before.general_score} size={56} strokeWidth={5} />
        <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
        <ScoreRing score={after.general_score} size={56} strokeWidth={5} />
        <div className="flex-1 text-right">
          <span className={cn(
            "inline-flex items-center gap-1 text-sm font-black px-2.5 py-1 rounded-lg",
            generalDelta > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" :
            generalDelta < 0 ? "text-red-500 bg-red-50 dark:bg-red-500/10" :
            "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
          )}>
            {generalDelta > 0 ? <ArrowUp size={13} /> : generalDelta < 0 ? <ArrowDown size={13} /> : null}
            {generalDelta > 0 ? "+" : ""}{generalDelta} pts
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t("generalScore")}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
          <Radar name={t("beforeLabel")} dataKey="before" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.12} strokeWidth={2} dot={{ r: 3, fill: "#94A3B8", strokeWidth: 0 }} />
          <Radar name={t("afterLabel")} dataKey="after" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#0B5CFF", strokeWidth: 0 }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {rows.map(r => (
          <div key={r.key} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{r.label}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-400 dark:text-slate-500">
                {r.before} <ArrowRight size={10} className="inline -mt-0.5" /> <span className="font-bold text-slate-800 dark:text-slate-100">{r.after}</span>
              </span>
              <span className={cn(
                "text-xs font-bold flex items-center gap-0.5 shrink-0",
                r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-red-500" : "text-slate-400 dark:text-slate-500"
              )}>
                {r.delta > 0 ? <ArrowUp size={11} /> : r.delta < 0 ? <ArrowDown size={11} /> : null}
                {r.delta !== 0 ? `${r.delta > 0 ? "+" : ""}${r.delta}` : "="}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const EMPTY_EVAL_FORM = {
  date: new Date().toISOString().split("T")[0],
  speed_score: "70", strength_score: "70", technique_score: "70",
  resistance_score: "70", power_score: "70", agility_score: "70",
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { getPlayer, getPlayerActivities, getPlayerEvaluations, getLatestEvaluation, getPlayerHealth, getPlayerSessions, getUpcomingTrainings, getPlayerMatches, currentUser, addEvaluation, updateEvaluation, deleteEvaluation } = useApp()
  const isCoach = currentUser?.role === "coach"
  const t = useT(playersDict)
  const e = useEnumT()

  const player = getPlayer(id)
  const activities = getPlayerActivities(id)
  const evaluations = getPlayerEvaluations(id)
  const latestEval = getLatestEvaluation(id)
  const health = getPlayerHealth(id)
  const sessions = getPlayerSessions(id)
  const upcomingTrainings = player ? getUpcomingTrainings(player.category).slice(0, 3) : []
  const playerMatches = getPlayerMatches(id)

  const [showEvalForm, setShowEvalForm] = useState(false)
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null)
  const [evalForm, setEvalForm] = useState(EMPTY_EVAL_FORM)
  const [savingEval, setSavingEval] = useState(false)

  const setEvalField = (k: keyof typeof evalForm, v: string) => setEvalForm(f => ({ ...f, [k]: v }))

  function openNewEval() {
    setEditingEvalId(null)
    setEvalForm(EMPTY_EVAL_FORM)
    setShowEvalForm(true)
  }

  function openEditEval(ev: Evaluation) {
    setEditingEvalId(ev.id)
    setEvalForm({
      date: ev.date,
      speed_score: String(ev.speed_score), strength_score: String(ev.strength_score), technique_score: String(ev.technique_score),
      resistance_score: String(ev.resistance_score), power_score: String(ev.power_score), agility_score: String(ev.agility_score),
    })
    setShowEvalForm(true)
  }

  async function handleEvalSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSavingEval(true)
    const scores = {
      speed_score: Number(evalForm.speed_score), strength_score: Number(evalForm.strength_score),
      technique_score: Number(evalForm.technique_score), resistance_score: Number(evalForm.resistance_score),
      power_score: Number(evalForm.power_score), agility_score: Number(evalForm.agility_score),
    }
    const general_score = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    if (editingEvalId) {
      updateEvaluation(editingEvalId, { ...scores, general_score, date: evalForm.date })
    } else {
      addEvaluation({ player_id: id, ...scores, general_score, date: evalForm.date })
    }
    setShowEvalForm(false)
    setSavingEval(false)
  }

  function handleDeleteEval(ev: Evaluation) {
    if (!confirm(t("confirmDeleteEvaluation").replace("{date}", formatDate(ev.date)))) return
    deleteEvaluation(ev.id)
  }

  if (!player) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96 text-slate-400 dark:text-slate-500">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{t("playerNotFound")}</p>
            <Link href="/players" className="text-[#0B5CFF] text-sm">{t("backToPlayers")}</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const radarData = latestEval ? Object.entries(ATTR_KEYS).map(([k, attrKey]) => ({
    subject: e.activityCategory(attrKey).substring(0, 3),
    value: latestEval[k as keyof typeof latestEval] as number,
    fullMark: 100,
  })) : []

  const progressData = [...evaluations].reverse().map(ev => ({
    date: formatDate(ev.date),
    score: ev.general_score,
    velocidad: ev.speed_score,
    tecnica: ev.technique_score,
  }))

  const attrs = latestEval ? Object.entries(ATTR_KEYS).map(([k, attrKey]) => [k, e.activityCategory(attrKey)] as const) : []

  const bestActivity = activities.reduce<typeof activities[0] | null>((best, a) => {
    if (!best) return a
    return a.value > best.value ? a : best
  }, null)

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Hero header */}
        <div className="bg-gradient-to-r from-[#071B4D] via-[#0A2E8A] to-[#0B5CFF] px-4 md:px-6 xl:px-8 pt-4 md:pt-6 pb-20 md:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F5F7FB]/30 to-transparent" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <Link href="/players" className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex-1">
              <p className="text-blue-200/70 text-xs font-medium">{t("playerProfile")}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="no-print w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              title={t("downloadPdf")}
            >
              <Download size={15} />
            </button>
            {isCoach && (
              <Link href={`/players/${id}/edit`}>
                <Button variant="outline" size="sm" className="no-print bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Edit size={14} /> {t("edit")}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-end gap-5 relative z-40">
            <div className="w-20 h-20 md:w-24 md:h-24 xl:w-28 xl:h-28 rounded-2xl border-2 border-white/30 shadow-2xl overflow-hidden shrink-0 bg-white/10">
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-lg md:text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">{player.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">{e.position(player.position)}</span>
                <span className="text-blue-200/70 text-sm">·</span>
                <span className="text-blue-100 text-sm">{player.age} {t("yearsOld")}</span>
                <span className="text-blue-200/70 text-sm">·</span>
                <span className="text-blue-100 text-sm">{e.category(player.category)}</span>
              </div>
            </div>
            {latestEval && (
              <div className="shrink-0 text-center pb-1">
                <ScoreRing score={latestEval.general_score} size={72} strokeWidth={6} />
              </div>
            )}
          </div>
        </div>

        <div className="pb-6 md:pb-8">
          {/* Bio cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 px-4 md:px-6 xl:px-8 -mt-12 md:-mt-14 relative z-10">
            {[
              { icon: Ruler, label: t("height"), value: `${player.height} cm` },
              { icon: Weight, label: t("weight"), value: `${player.weight} kg` },
              { icon: Calendar, label: t("birth"), value: player.birth_date ? formatDate(player.birth_date) : "—" },
              { icon: Star, label: t("dominantLeg"), value: e.dominantFoot(player.dominant_foot) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#0B5CFF]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-4 md:px-6 xl:px-8">
            {/* Left column */}
            <div className="xl:col-span-2 space-y-6">
              {/* Attribute scores */}
              {latestEval ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("physicalTechnicalAttributes")}</h2>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(latestEval.date)}</span>
                    </div>
                    {isCoach && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditEval(latestEval)}>
                          <Edit size={13} /> {t("edit")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={openNewEval}>
                          <Plus size={13} /> {t("newEvaluation")}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attrs.map(([k, label]) => {
                      const v = latestEval[k as keyof typeof latestEval] as number
                      const pct = v
                      return (
                        <div key={k} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
                            <span className={cn("text-sm font-black", getScoreColor(v))}>{v}</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: ATTR_COLORS[k] }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : isCoach ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center">
                  <Target size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("noAttributeEvaluationsYet")}</p>
                  <Button size="sm" onClick={openNewEval}>
                    <Plus size={13} /> {t("addFirstEvaluation")}
                  </Button>
                </div>
              ) : null}

              {/* Progress line chart */}
              {progressData.length > 1 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("scoreEvolution")}</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={progressData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0B5CFF" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0B5CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} pts`]} />
                      <Area type="monotone" dataKey="score" stroke="#0B5CFF" strokeWidth={2.5} fill="url(#pg)" dot={{ fill: "#0B5CFF", r: 4, strokeWidth: 0 }} name={t("generalScore")} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Before/after comparison */}
              {evaluations.length > 1 && <EvaluationComparison evaluations={evaluations} />}

              {/* Activities */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("trainingHistory")}</h2>
                  <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{activities.length} {t("records")}</span>
                </div>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Dumbbell size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("noActivitiesRegistered")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", getCategoryColor(a.category))}>
                          {e.activityCategory(a.category).substring(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.exercise}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(a.date)} · <span className={cn("font-medium", getIntensityColor(a.intensity).split(" ")[0])}>{e.intensity(a.intensity)}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{a.value}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{e.activityUnit(a.unit)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matches */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("matchHistory")}</h2>
                  <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{playerMatches.length} {t("matches")}</span>
                </div>
                {playerMatches.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Trophy size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("noMatchesRegistered")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playerMatches.map(({ match, stat }) => (
                      <Link key={stat.id} href={`/matches/${match.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF] flex items-center justify-center shrink-0">
                          <Trophy size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{match.is_home ? "vs" : "@"} {match.opponent}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(match.date)} · {stat.minutes_played}&apos;</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {stat.goals > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Goal size={12} /> {stat.goals}</span>}
                          {stat.assists > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-blue-500"><Footprints size={12} /> {stat.assists}</span>}
                          {stat.rating !== null && <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"><Star size={10} className="fill-amber-400 text-amber-400" /> {stat.rating}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {!isCoach && <NotificationToggle />}

              {/* Radar chart */}
              {radarData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("attributeRadar")}</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Radar name="Score" dataKey="value" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: "#0B5CFF", strokeWidth: 0 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Info */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                {player.objective && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">{t("sportingObjective")}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{player.objective}</p>
                  </div>
                )}
                {player.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">{t("observations")}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{player.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">{t("club")}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{player.club}</p>
                </div>
              </div>

              {/* Upcoming trainings */}
              {upcomingTrainings.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={15} className="text-[#0B5CFF]" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("upcomingTrainings")}</h2>
                  </div>
                  <div className="space-y-2">
                    {upcomingTrainings.map(tr => (
                      <div key={tr.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{tr.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(tr.date)}</span>
                          {tr.time && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={11} /> {tr.time}</span>
                            </>
                          )}
                          {tr.location && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={11} /> {tr.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best mark */}
              {bestActivity && (
                <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-blue-200" />
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">{t("bestPersonalMark")}</span>
                  </div>
                  <p className="text-2xl font-black">{bestActivity.value} <span className="text-base font-normal text-blue-200">{e.activityUnit(bestActivity.unit)}</span></p>
                  <p className="text-sm text-blue-100 mt-1">{bestActivity.exercise}</p>
                  <p className="text-xs text-blue-200/60 mt-0.5">{formatDate(bestActivity.date)}</p>
                </div>
              )}

              {/* Health metrics */}
              {health && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart size={15} className="text-red-500" fill="#EF4444" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("biometricHealth")}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t("restingHr"), value: `${health.resting_hr} bpm`, icon: "❤️", color: "text-red-500" },
                      { label: t("maxHr"), value: `${health.max_hr} bpm`, icon: "⚡", color: "text-orange-500" },
                      { label: "HRV", value: `${health.hrv} ms`, icon: "📊", color: "text-purple-500" },
                      { label: t("vo2max"), value: `${health.vo2max}`, icon: "💨", color: "text-blue-500" },
                      { label: t("recoveryIndex"), value: `${health.recovery_index}%`, icon: "🔋", color: health.recovery_index >= 80 ? "text-emerald-500" : "text-amber-500" },
                      { label: t("bodyFatPct"), value: `${health.body_fat_pct}%`, icon: "⚖️", color: "text-slate-600 dark:text-slate-400" },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{m.icon}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{m.label}</span>
                        </div>
                        <p className={cn("text-sm font-black", m.color)}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{t("bloodPressure")}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{health.blood_pressure_sys}/{health.blood_pressure_dia} mmHg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions summary */}
              {sessions.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ActivityIcon size={15} className="text-[#0B5CFF]" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("latestLiveSessions")}</h2>
                  </div>
                  {sessions.slice(0, 2).map(s => (
                    <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{s.device_name ?? s.device_type}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(s.started_at.split("T")[0])} · {Math.floor(s.duration_s / 60)}min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">{s.avg_hr}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500">bpm</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/health" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0B5CFF] hover:underline">
                    {t("viewLiveMonitor")}
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              {isCoach && (
                <div className="space-y-2">
                  <Link href="/activities" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:bg-[#0B5CFF] transition-colors">
                      <Dumbbell size={16} className="text-[#0B5CFF] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("logActivity")}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t("addNewTraining")}</p>
                    </div>
                  </Link>
                  <Link href={`/reports?player=${id}`} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:bg-[#0B5CFF] transition-colors">
                      <Target size={16} className="text-[#0B5CFF] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("viewReport")}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t("fullPlayerReport")}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {showEvalForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingEvalId ? t("editEvaluation") : t("newEvaluationTitle")}
                </h2>
                <button onClick={() => setShowEvalForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleEvalSubmit} className="p-5 space-y-4">
                <Input label={t("dateLabel")} type="date" value={evalForm.date} onChange={e => setEvalField("date", e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ATTR_KEYS).map(([k, attrKey]) => (
                    <Input
                      key={k}
                      label={`${e.activityCategory(attrKey)} (0-100)`}
                      type="number"
                      min={0}
                      max={100}
                      value={evalForm[k as keyof typeof evalForm]}
                      onChange={e => setEvalField(k as keyof typeof evalForm, e.target.value)}
                      required
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 justify-end pt-2">
                  {editingEvalId && (
                    <Button
                      type="button"
                      variant="danger"
                      className="mr-auto"
                      onClick={() => {
                        const ev = evaluations.find(e => e.id === editingEvalId)
                        if (ev) { handleDeleteEval(ev); setShowEvalForm(false) }
                      }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </Button>
                  )}
                  <Button variant="secondary" type="button" onClick={() => setShowEvalForm(false)}>Cancelar</Button>
                  <Button type="submit" loading={savingEval}>Guardar</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
