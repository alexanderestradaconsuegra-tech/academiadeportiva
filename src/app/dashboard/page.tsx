"use client"
import { useMemo } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import StatCard from "@/components/ui/StatCard"
import { Users, TrendingUp, AlertTriangle, Activity, ChevronRight, Star } from "lucide-react"
import { PROGRESS_DATA, CATEGORY_SCORES } from "@/lib/mock-data"
import { cn, formatDate, getCategoryColor } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts"

export default function DashboardPage() {
  const { players, activities, evaluations, getLatestEvaluation } = useApp()

  const stats = useMemo(() => {
    const allScores = players.map(p => getLatestEvaluation(p.id)?.general_score ?? 0).filter(Boolean)
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
    const lowPerf = players.filter(p => (getLatestEvaluation(p.id)?.general_score ?? 100) < 75)
    const bestPlayer = players.reduce((best, p) => {
      const score = getLatestEvaluation(p.id)?.general_score ?? 0
      return score > (getLatestEvaluation(best?.id ?? "")?.general_score ?? 0) ? p : best
    }, players[0])
    return { avgScore, lowPerf, bestPlayer }
  }, [players, getLatestEvaluation])

  const recentActivities = activities.slice(0, 6)
  const topPlayers = [...players]
    .sort((a, b) => (getLatestEvaluation(b.id)?.general_score ?? 0) - (getLatestEvaluation(a.id)?.general_score ?? 0))
    .slice(0, 4)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 md:p-6 mb-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-1">Bienvenido de vuelta 👋</p>
            <h1 className="text-white text-2xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-blue-200/70 text-sm mt-1">Resumen de rendimiento — {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-5">
          <StatCard
            title="Total Jugadores"
            value={players.length}
            subtitle="Registrados en el sistema"
            icon={<Users size={20} />}
            color="blue"
            trend={{ value: 20, label: "este mes" }}
          />
          <StatCard
            title="Jugadores Activos"
            value={players.length - stats.lowPerf.length}
            subtitle="Con rendimiento óptimo"
            icon={<Activity size={20} />}
            color="green"
          />
          <StatCard
            title="Score Promedio"
            value={stats.avgScore}
            subtitle="Evaluación general del equipo"
            icon={<TrendingUp size={20} />}
            color="purple"
            trend={{ value: 5, label: "vs mes anterior" }}
          />
          <StatCard
            title="Bajo Rendimiento"
            value={stats.lowPerf.length}
            subtitle="Requieren atención especial"
            icon={<AlertTriangle size={20} />}
            color={stats.lowPerf.length > 0 ? "amber" : "green"}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
          {/* Progress chart */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Progreso del Equipo</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Score promedio — últimos 6 meses</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">↑ +12 pts</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PROGRESS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5CFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0B5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  formatter={(v: number) => [`${v} pts`, "Score"]}
                />
                <Area type="monotone" dataKey="score" stroke="#0B5CFF" strokeWidth={2.5} fill="url(#colorScore)" dot={{ fill: "#0B5CFF", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#0B5CFF" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category bar chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Por Categoría</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Score promedio del equipo</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CATEGORY_SCORES} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v} pts`, "Score"]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                  {CATEGORY_SCORES.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Top players */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top Jugadores</h2>
              <Link href="/players" className="text-xs text-[#0B5CFF] font-semibold hover:underline flex items-center gap-1">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {topPlayers.map((player, i) => {
                const ev = getLatestEvaluation(player.id)
                const score = ev?.general_score ?? 0
                return (
                  <Link key={player.id} href={`/players/${player.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                    <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                      i === 0 ? "bg-amber-100 dark:bg-amber-500/15 text-amber-600" : i === 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"
                    )}>{i + 1}</span>
                    <img src={player.photo_url} alt={player.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{player.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{player.position} · {player.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", score >= 85 ? "text-emerald-500" : score >= 70 ? "text-[#0B5CFF]" : "text-amber-500")}>{score}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">pts</p>
                    </div>
                    {i === 0 && <Star className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" />}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Últimas Actividades</h2>
              <Link href="/activities" className="text-xs text-[#0B5CFF] font-semibold hover:underline flex items-center gap-1">
                Ver todas <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivities.map(a => {
                const player = players.find(p => p.id === a.player_id)
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", getCategoryColor(a.category).split(" ")[0].replace("text-", "bg-"))}>
                      <div className={cn("w-2 h-2 rounded-full", a.category === "Velocidad" ? "bg-yellow-400" : a.category === "Técnica" ? "bg-blue-400" : a.category === "Fuerza" ? "bg-red-400" : a.category === "Resistencia" ? "bg-emerald-400" : a.category === "Potencia" ? "bg-orange-400" : a.category === "Pliometría" ? "bg-pink-400" : "bg-purple-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.exercise}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{player?.name ?? "?"} · {formatDate(a.date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.value} <span className="font-normal text-slate-400 dark:text-slate-500">{a.unit}</span></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
