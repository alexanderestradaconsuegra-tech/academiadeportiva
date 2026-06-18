"use client"
import { useState, useRef } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import ScoreRing from "@/components/ui/ScoreRing"
import { Printer, Download, TrendingUp, TrendingDown, Target, ChevronDown } from "lucide-react"
import { cn, formatDate, getScoreColor, getCategoryColor } from "@/lib/utils"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts"

const ATTRS = [
  { key: "speed_score", label: "Velocidad", fill: "#F59E0B" },
  { key: "strength_score", label: "Fuerza", fill: "#EF4444" },
  { key: "technique_score", label: "Técnica", fill: "#3B82F6" },
  { key: "resistance_score", label: "Resistencia", fill: "#10B981" },
  { key: "power_score", label: "Potencia", fill: "#F97316" },
  { key: "agility_score", label: "Agilidad", fill: "#8B5CF6" },
]

export default function ReportsPage() {
  const { players, getLatestEvaluation, getPlayerActivities } = useApp()
  const [selectedId, setSelectedId] = useState(players[0]?.id ?? "")
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const player = players.find(p => p.id === selectedId)
  const evaluation = player ? getLatestEvaluation(player.id) : undefined
  const activities = player ? getPlayerActivities(player.id) : []

  async function handleDownloadPdf() {
    if (!reportRef.current || !player) return
    setDownloading(true)
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ])
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(`reporte-${player.name.replace(/\s+/g, "_").toLowerCase()}.pdf`)
    setDownloading(false)
  }

  if (!player) return <AppShell><div className="p-8 text-slate-400 dark:text-slate-500">Selecciona un jugador para ver el reporte.</div></AppShell>

  const attrs = evaluation ? ATTRS.map(a => ({
    ...a,
    value: evaluation[a.key as keyof typeof evaluation] as number,
  })) : []

  const radarData = attrs.map(a => ({ subject: a.label.substring(0, 3), value: a.value }))

  const strengths = attrs.filter(a => a.value >= 80).sort((a, b) => b.value - a.value)
  const weaknesses = attrs.filter(a => a.value < 75).sort((a, b) => a.value - b.value)

  const recentActs = activities.slice(0, 5)
  const scoreThisMonth = evaluation?.general_score ?? 0

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Reporte del Jugador" subtitle="Vista detallada de rendimiento y evolución">
          <div className="flex items-center gap-3 no-print">
            <div className="relative">
              <select
                value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer appearance-none"
              >
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer size={14} /> Imprimir
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} loading={downloading}>
              <Download size={14} /> Descargar PDF
            </Button>
          </div>
        </PageHeader>

        {/* Report card */}
        <div ref={reportRef} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6 print:border-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#071B4D] to-[#0B5CFF] px-4 py-6 md:px-8 md:py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, white 1px, transparent 1px)", backgroundSize: "35px 35px" }} />
            <div className="flex items-center gap-6 relative z-10">
              <img src={player.photo_url} alt={player.name} className="w-20 h-20 rounded-2xl border-2 border-white/30 shadow-xl object-cover" />
              <div className="flex-1">
                <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-widest mb-1">Reporte de Rendimiento</p>
                <h1 className="text-2xl font-black text-white tracking-tight">{player.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-blue-100 text-sm">{player.position}</span>
                  <span className="text-blue-200/40">·</span>
                  <span className="text-blue-100 text-sm">{player.age} años · {player.category}</span>
                  <span className="text-blue-200/40">·</span>
                  <span className="text-blue-100 text-sm">{player.club}</span>
                </div>
              </div>
              {evaluation && <ScoreRing score={evaluation.general_score} size={80} strokeWidth={7} />}
            </div>
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className="text-blue-200/60 text-xs">Última evaluación:</span>
              <span className="text-white text-xs font-semibold">{evaluation ? formatDate(evaluation.date) : "Sin evaluación"}</span>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Left */}
              <div className="xl:col-span-2 space-y-6">
                {/* Attribute bars */}
                {evaluation && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Métricas de Rendimiento</h2>
                    <div className="space-y-3">
                      {attrs.map(a => (
                        <div key={a.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.label}</span>
                            <span className={cn("text-xs font-bold", getScoreColor(a.value))}>{a.value} pts</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.value}%`, background: a.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={14} className="text-emerald-600" />
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Fortalezas</h3>
                    </div>
                    {strengths.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500">Sin fortalezas destacadas aún</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {strengths.map(s => (
                          <li key={s.key} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{s.label}</span>
                            <span className="font-bold text-emerald-600">{s.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown size={14} className="text-amber-600" />
                      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">Áreas a Mejorar</h3>
                    </div>
                    {weaknesses.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500">¡Excelente rendimiento en todas las áreas!</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {weaknesses.map(w => (
                          <li key={w.key} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{w.label}</span>
                            <span className="font-bold text-amber-600">{w.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Objective */}
                {player.objective && (
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-[#0B5CFF]" />
                      <h3 className="text-xs font-bold text-[#0B5CFF] uppercase tracking-wide">Objetivo Deportivo</h3>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{player.objective}</p>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recomendaciones del Entrenador</h2>
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                    {(weaknesses.length > 0 ? weaknesses : strengths).slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-[#0B5CFF] font-bold mt-0.5">→</span>
                        {weaknesses.length > 0
                          ? `Reforzar ${a.label.toLowerCase()} con ejercicios específicos. Score actual: ${a.value}/100.`
                          : `Mantener y potenciar la ventaja en ${a.label.toLowerCase()}. Score destacado: ${a.value}/100.`
                        }
                      </div>
                    ))}
                    {player.notes && (
                      <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[#0B5CFF] font-bold mt-0.5">→</span>
                        {player.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent activities */}
                {recentActs.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Progreso del Mes — Actividades Recientes</h2>
                    <div className="space-y-2">
                      {recentActs.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0", getCategoryColor(a.category))}>
                            {a.category.substring(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{a.exercise}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(a.date)}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 shrink-0">{a.value} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{a.unit}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="space-y-6">
                {/* Radar */}
                {radarData.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 text-center">Perfil de Habilidades</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                        <Radar dataKey="value" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#0B5CFF", strokeWidth: 0 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Bar */}
                {attrs.length > 0 && (
                  <div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={attrs} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={65} />
                        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} pts`]} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                          {attrs.map((a, i) => <Cell key={i} fill={a.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Stats summary */}
                <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-xl p-5 text-white">
                  <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-4">Resumen</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Score general", value: `${scoreThisMonth}/100` },
                      { label: "Actividades", value: activities.length },
                      { label: "Altura / Peso", value: `${player.height}cm / ${player.weight}kg` },
                      { label: "Pierna hábil", value: player.dominant_foot },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-blue-200/70">{label}</span>
                        <span className="font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
