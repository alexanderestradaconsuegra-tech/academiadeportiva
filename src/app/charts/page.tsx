"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import { CATEGORY_SCORES, PROGRESS_DATA } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
  LineChart, Line
} from "recharts"

const COLORS = ["#0B5CFF","#10B981","#F59E0B","#EF4444","#8B5CF6","#F97316"]

export default function ChartsPage() {
  const { players, evaluations, getLatestEvaluation } = useApp()
  const [compareA, setCompareA] = useState(players[0]?.id ?? "")
  const [compareB, setCompareB] = useState(players[1]?.id ?? "")

  const ATTRS = [
    { key: "speed_score", label: "Velocidad" },
    { key: "strength_score", label: "Fuerza" },
    { key: "technique_score", label: "Técnica" },
    { key: "resistance_score", label: "Resistencia" },
    { key: "power_score", label: "Potencia" },
    { key: "agility_score", label: "Agilidad" },
  ]

  const evalA = getLatestEvaluation(compareA)
  const evalB = getLatestEvaluation(compareB)
  const playerA = players.find(p => p.id === compareA)
  const playerB = players.find(p => p.id === compareB)

  const compareData = ATTRS.map(a => ({
    attr: a.label.substring(0, 3),
    [playerA?.name.split(" ")[0] ?? "A"]: evalA?.[a.key as keyof typeof evalA] as number ?? 0,
    [playerB?.name.split(" ")[0] ?? "B"]: evalB?.[a.key as keyof typeof evalB] as number ?? 0,
  }))

  const radarA = ATTRS.map(a => ({
    subject: a.label.substring(0, 3),
    value: evalA?.[a.key as keyof typeof evalA] as number ?? 0,
  }))
  const radarB = ATTRS.map(a => ({
    subject: a.label.substring(0, 3),
    value: evalB?.[a.key as keyof typeof evalB] as number ?? 0,
  }))

  const monthlyData = [
    { month: "Jul", ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(65 + Math.random() * 20)])) },
    { month: "Ago", ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(67 + Math.random() * 20)])) },
    { month: "Sep", ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(70 + Math.random() * 20)])) },
    { month: "Oct", ...Object.fromEntries(players.slice(0,3).map(p => [p.name.split(" ")[0], Math.floor(73 + Math.random() * 20)])) },
    { month: "Nov", ...Object.fromEntries(players.slice(0,3).map((p, i) => [p.name.split(" ")[0], [84, 80, 83][i]])) },
  ]

  const top3 = players.slice(0, 3)

  return (
    <AppShell>
      <div className="p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Gráficos y Análisis" subtitle="Visualiza el rendimiento y progreso del equipo" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Progress line */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Progreso del Equipo</h2>
                <p className="text-xs text-slate-400 mt-0.5">Score promedio mensual</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">+12 pts ↑</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={PROGRESS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5CFF" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0B5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[65, 95]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} pts`, "Score"]} />
                <Area type="monotone" dataKey="score" stroke="#0B5CFF" strokeWidth={2.5} fill="url(#cg)" dot={{ r: 4, fill: "#0B5CFF", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">Score por Categoría</h2>
              <p className="text-xs text-slate-400 mt-0.5">Promedio del equipo completo</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_SCORES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} pts`]} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                  {CATEGORY_SCORES.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Evolution multi-line */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">Evolución Mensual por Jugador</h2>
              <p className="text-xs text-slate-400 mt-0.5">Top 3 jugadores</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                {top3.map((p, i) => (
                  <Line key={p.id} type="monotone" dataKey={p.name.split(" ")[0]} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: COLORS[i] }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison bars */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Comparación entre Jugadores</h2>
                <p className="text-xs text-slate-400 mt-0.5">Atributos cara a cara</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={compareA} onChange={e => setCompareA(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
                  {players.map(p => <option key={p.id} value={p.id}>{p.name.split(" ")[0]}</option>)}
                </select>
                <span className="text-xs text-slate-400 font-bold">vs</span>
                <select value={compareB} onChange={e => setCompareB(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
                  {players.map(p => <option key={p.id} value={p.id}>{p.name.split(" ")[0]}</option>)}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={compareData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="attr" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                {playerA && <Bar dataKey={playerA.name.split(" ")[0]} fill="#0B5CFF" radius={[4,4,0,0]} barSize={16} />}
                {playerB && <Bar dataKey={playerB.name.split(" ")[0]} fill="#10B981" radius={[4,4,0,0]} barSize={16} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Radar de Atributos — Comparación</h2>
          <p className="text-xs text-slate-400 mb-5">{playerA?.name.split(" ")[0]} vs {playerB?.name.split(" ")[0]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { name: playerA?.name ?? "A", data: radarA, color: "#0B5CFF" },
              { name: playerB?.name ?? "B", data: radarB, color: "#10B981" },
            ].map(({ name, data, color }) => (
              <div key={name}>
                <p className="text-xs font-semibold text-slate-600 text-center mb-3">{name}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={data}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                    <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
