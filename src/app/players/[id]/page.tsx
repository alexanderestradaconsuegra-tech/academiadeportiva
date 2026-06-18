"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import ScoreRing from "@/components/ui/ScoreRing"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { ArrowLeft, Edit, Dumbbell, Calendar, Ruler, Weight, Target, Star, TrendingUp } from "lucide-react"
import { cn, formatDate, getCategoryColor, getIntensityColor, getScoreColor } from "@/lib/utils"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from "recharts"
import { Heart, Zap, Wind, Activity as ActivityIcon } from "lucide-react"

const ATTR_LABELS: Record<string, string> = {
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

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { getPlayer, getPlayerActivities, getPlayerEvaluations, getLatestEvaluation, getPlayerHealth, getPlayerSessions } = useApp()

  const player = getPlayer(id)
  const activities = getPlayerActivities(id)
  const evaluations = getPlayerEvaluations(id)
  const latestEval = getLatestEvaluation(id)
  const health = getPlayerHealth(id)
  const sessions = getPlayerSessions(id)

  if (!player) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96 text-slate-400">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">Jugador no encontrado</p>
            <Link href="/players" className="text-[#0B5CFF] text-sm">← Volver a jugadores</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const radarData = latestEval ? Object.entries(ATTR_LABELS).map(([k, label]) => ({
    subject: label.substring(0, 3),
    value: latestEval[k as keyof typeof latestEval] as number,
    fullMark: 100,
  })) : []

  const progressData = [...evaluations].reverse().map(e => ({
    date: formatDate(e.date),
    score: e.general_score,
    velocidad: e.speed_score,
    tecnica: e.technique_score,
  }))

  const attrs = latestEval ? Object.entries(ATTR_LABELS) : []

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
              <p className="text-blue-200/70 text-xs font-medium">Perfil del Jugador</p>
            </div>
            <Link href={`/players/${id}/edit`}>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Edit size={14} /> Editar
              </Button>
            </Link>
          </div>

          <div className="flex items-end gap-5 relative z-40">
            <div className="w-20 h-20 md:w-24 md:h-24 xl:w-28 xl:h-28 rounded-2xl border-2 border-white/30 shadow-2xl overflow-hidden shrink-0 bg-white/10">
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-lg md:text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">{player.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">{player.position}</span>
                <span className="text-blue-200/70 text-sm">·</span>
                <span className="text-blue-100 text-sm">{player.age} años</span>
                <span className="text-blue-200/70 text-sm">·</span>
                <span className="text-blue-100 text-sm">{player.category}</span>
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
              { icon: Ruler, label: "Altura", value: `${player.height} cm` },
              { icon: Weight, label: "Peso", value: `${player.weight} kg` },
              { icon: Calendar, label: "Nacimiento", value: player.birth_date ? formatDate(player.birth_date) : "—" },
              { icon: Star, label: "Pierna hábil", value: player.dominant_foot },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#0B5CFF]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-4 md:px-6 xl:px-8">
            {/* Left column */}
            <div className="xl:col-span-2 space-y-6">
              {/* Attribute scores */}
              {latestEval && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-slate-900">Atributos Físicos y Técnicos</h2>
                    <span className="text-xs text-slate-400">{formatDate(latestEval.date)}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attrs.map(([k, label]) => {
                      const v = latestEval[k as keyof typeof latestEval] as number
                      const pct = v
                      return (
                        <div key={k} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">{label}</span>
                            <span className={cn("text-sm font-black", getScoreColor(v))}>{v}</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
              )}

              {/* Progress line chart */}
              {progressData.length > 1 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 mb-4">Evolución del Score</h2>
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
                      <Area type="monotone" dataKey="score" stroke="#0B5CFF" strokeWidth={2.5} fill="url(#pg)" dot={{ fill: "#0B5CFF", r: 4, strokeWidth: 0 }} name="Score general" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Activities */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900">Historial de Entrenamientos</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{activities.length} registros</span>
                </div>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Dumbbell size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin actividades registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", getCategoryColor(a.category))}>
                          {a.category.substring(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{a.exercise}</p>
                          <p className="text-xs text-slate-400">{formatDate(a.date)} · <span className={cn("font-medium", getIntensityColor(a.intensity).split(" ")[0])}>{a.intensity}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800">{a.value}</p>
                          <p className="text-xs text-slate-400">{a.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Radar chart */}
              {radarData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 mb-4">Radar de Atributos</h2>
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
              <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
                {player.objective && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Objetivo deportivo</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{player.objective}</p>
                  </div>
                )}
                {player.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Observaciones</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{player.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Club</p>
                  <p className="text-sm text-slate-700 font-medium">{player.club}</p>
                </div>
              </div>

              {/* Best mark */}
              {bestActivity && (
                <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-blue-200" />
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Mejor Marca Personal</span>
                  </div>
                  <p className="text-2xl font-black">{bestActivity.value} <span className="text-base font-normal text-blue-200">{bestActivity.unit}</span></p>
                  <p className="text-sm text-blue-100 mt-1">{bestActivity.exercise}</p>
                  <p className="text-xs text-blue-200/60 mt-0.5">{formatDate(bestActivity.date)}</p>
                </div>
              )}

              {/* Health metrics */}
              {health && (
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart size={15} className="text-red-500" fill="#EF4444" />
                    <h2 className="text-sm font-bold text-slate-900">Salud Biométrica</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "FC Reposo", value: `${health.resting_hr} bpm`, icon: "❤️", color: "text-red-500" },
                      { label: "FC Máxima", value: `${health.max_hr} bpm`, icon: "⚡", color: "text-orange-500" },
                      { label: "HRV", value: `${health.hrv} ms`, icon: "📊", color: "text-purple-500" },
                      { label: "VO₂ Máx", value: `${health.vo2max}`, icon: "💨", color: "text-blue-500" },
                      { label: "Rec. Index", value: `${health.recovery_index}%`, icon: "🔋", color: health.recovery_index >= 80 ? "text-emerald-500" : "text-amber-500" },
                      { label: "% Grasa", value: `${health.body_fat_pct}%`, icon: "⚖️", color: "text-slate-600" },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{m.icon}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{m.label}</span>
                        </div>
                        <p className={cn("text-sm font-black", m.color)}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Presión arterial</span>
                      <span className="font-bold text-slate-800">{health.blood_pressure_sys}/{health.blood_pressure_dia} mmHg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions summary */}
              {sessions.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ActivityIcon size={15} className="text-[#0B5CFF]" />
                    <h2 className="text-sm font-bold text-slate-900">Últimas Sesiones en Vivo</h2>
                  </div>
                  {sessions.slice(0, 2).map(s => (
                    <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900">{s.device_name ?? s.device_type}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(s.started_at.split("T")[0])} · {Math.floor(s.duration_s / 60)}min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">{s.avg_hr}</p>
                        <p className="text-[9px] text-slate-400">bpm</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/health" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0B5CFF] hover:underline">
                    Ver monitor en vivo →
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <div className="space-y-2">
                <Link href="/activities" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-[#0B5CFF] transition-colors">
                    <Dumbbell size={16} className="text-[#0B5CFF] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Registrar actividad</p>
                    <p className="text-xs text-slate-400">Agregar nuevo entrenamiento</p>
                  </div>
                </Link>
                <Link href={`/reports?player=${id}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-[#0B5CFF] transition-colors">
                    <Target size={16} className="text-[#0B5CFF] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ver reporte</p>
                    <p className="text-xs text-slate-400">Informe completo del jugador</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
