"use client"
import { useEffect, useRef, useState } from "react"
import { TrendingUp, Award, Target, Flame } from "lucide-react"

const MONTHS = ["Feb", "Mar", "Abr", "May", "Jun", "Jul"]
const BEFORE = [62, 65, 68, 70, 74, 79]
const AFTER = [72, 78, 84, 87, 91, 95]

const METRICS = [
  { label: "Velocidad", before: 72, after: 91, unit: "pts", color: "from-amber-400 to-orange-500", icon: Flame },
  { label: "Técnica", before: 68, after: 88, unit: "pts", color: "from-blue-400 to-blue-600", icon: Target },
  { label: "Resistencia", before: 74, after: 89, unit: "pts", color: "from-emerald-400 to-emerald-600", icon: TrendingUp },
  { label: "Agilidad", before: 70, after: 90, unit: "pts", color: "from-fuchsia-400 to-purple-600", icon: Award },
]

export default function ProgressShowcase() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let raf: number
    const start = performance.now()
    const DURATION = 1400
    function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  const maxVal = 100
  const points = (data: number[]) =>
    data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const raw = (v / maxVal) * 100
      const y = 100 - raw * progress
      return `${x},${y}`
    }).join(" ")

  const areaPath = (data: number[]) => {
    const line = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const raw = (v / maxVal) * 100
      const y = 100 - raw * progress
      return `${i === 0 ? "M" : "L"}${x},${y}`
    }).join(" ")
    return `${line} L100,100 L0,100 Z`
  }

  return (
    <div ref={ref}>
      {/* Big stats hero */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-400/20 rounded-3xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-300" />
              </div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Progreso general</p>
            </div>
            <p className="text-5xl font-black text-white tabular-nums">
              +{Math.round(22 * progress)}<span className="text-2xl text-emerald-300">%</span>
            </p>
            <p className="text-xs text-emerald-100/60 mt-2">Score promedio del equipo en 6 meses</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-400/20 rounded-3xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Flame size={16} className="text-amber-300" />
              </div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Jugadores TOP</p>
            </div>
            <p className="text-5xl font-black text-white tabular-nums">
              {Math.round(14 * progress)}<span className="text-2xl text-amber-300">/22</span>
            </p>
            <p className="text-xs text-amber-100/60 mt-2">Sobre 80 pts en evaluación general</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-fuchsia-500/10 to-purple-600/5 border border-fuchsia-400/20 rounded-3xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                <Award size={16} className="text-fuchsia-300" />
              </div>
              <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-widest">Asistencia</p>
            </div>
            <p className="text-5xl font-black text-white tabular-nums">
              {Math.round(94 * progress)}<span className="text-2xl text-fuchsia-300">%</span>
            </p>
            <p className="text-xs text-fuchsia-100/60 mt-2">Promedio de asistencia a entrenos</p>
          </div>
        </div>
      </div>

      {/* Big chart */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Evolución medida</p>
            <h3 className="text-xl md:text-2xl font-black text-white">Cada mes, un salto real</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="w-3 h-3 rounded-full bg-slate-400" /> Sin Metrikas
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#0B5CFF] to-fuchsia-500" /> Con Metrikas
            </span>
          </div>
        </div>

        <div className="relative w-full" style={{ aspectRatio: "16/6" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="gradAfter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B5CFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#0B5CFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradBefore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineAfter" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B5CFF" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>

            {/* Horizontal grid */}
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
            ))}

            {/* Before area + line */}
            <path d={areaPath(BEFORE)} fill="url(#gradBefore)" />
            <polyline
              points={points(BEFORE)}
              fill="none"
              stroke="rgba(148,163,184,0.7)"
              strokeWidth="0.6"
              strokeDasharray="1.5 1"
              vectorEffect="non-scaling-stroke"
            />

            {/* After area + line */}
            <path d={areaPath(AFTER)} fill="url(#gradAfter)" />
            <polyline
              points={points(AFTER)}
              fill="none"
              stroke="url(#lineAfter)"
              strokeWidth="0.9"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points on after */}
            {AFTER.map((v, i) => {
              const x = (i / (AFTER.length - 1)) * 100
              const y = 100 - (v / maxVal) * 100 * progress
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="1.2" fill="white" vectorEffect="non-scaling-stroke" />
                  <circle cx={x} cy={y} r="0.6" fill="#0B5CFF" vectorEffect="non-scaling-stroke" />
                </g>
              )
            })}
          </svg>

          {/* Peak badge */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: "100%", top: `${100 - (AFTER[AFTER.length - 1] / maxVal) * 100 * progress}%`, transform: "translate(-100%, -140%)" }}
          >
            <div className="px-2 py-1 rounded-lg bg-gradient-to-br from-[#0B5CFF] to-fuchsia-600 text-white text-[10px] font-black shadow-lg shadow-blue-900/50">
              +{Math.round((AFTER[AFTER.length - 1] - BEFORE[0]) * progress)} pts
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 mt-3 text-[10px] text-white/40 font-semibold">
          {MONTHS.map(m => <span key={m} className="text-center">{m}</span>)}
        </div>
      </div>

      {/* Per-metric progress bars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(m => {
          const bar = ((m.after - m.before) * progress) + m.before
          const barPct = (bar / 100) * 100
          const barBeforePct = (m.before / 100) * 100
          return (
            <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                  <m.icon size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-white/80">{m.label}</p>
              </div>
              <div className="flex items-end justify-between mb-2">
                <p className="text-3xl font-black text-white tabular-nums">{Math.round(bar)}</p>
                <p className="text-xs font-bold text-emerald-400">+{Math.round((m.after - m.before) * progress)}</p>
              </div>
              <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-slate-500/40" style={{ width: `${barBeforePct}%` }} />
                <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${m.color} transition-all duration-500`} style={{ width: `${barPct}%` }} />
              </div>
              <p className="text-[10px] text-white/40 mt-2">Desde {m.before} pts hasta {m.after} pts</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
