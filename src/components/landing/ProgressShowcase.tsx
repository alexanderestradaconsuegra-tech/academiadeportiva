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

      {/* Bar chart */}
      <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Evolución medida</p>
            <h3 className="text-xl md:text-2xl font-black text-white">Cada mes, un salto real</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-3 h-3 rounded bg-slate-500/70 inline-block" /> Sin Metrikas
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="w-3 h-3 rounded bg-[#0B5CFF] inline-block" /> Con Metrikas
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2 md:gap-4 h-40">
          {MONTHS.map((month, i) => {
            const before = BEFORE[i]
            const after  = BEFORE[i] + Math.round((AFTER[i] - BEFORE[i]) * progress)
            const maxH   = 100
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 md:gap-1" style={{ height: 128 }}>
                  {/* Before bar */}
                  <div className="flex-1 rounded-t-md bg-slate-500/40 transition-all duration-700"
                    style={{ height: `${(before / maxH) * 100}%` }} />
                  {/* After bar */}
                  <div className="flex-1 rounded-t-md bg-[#0B5CFF] shadow-md shadow-blue-900/30 transition-all duration-700 relative"
                    style={{ height: `${(after / maxH) * 100}%` }}>
                    {i === MONTHS.length - 1 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black">
                        +{Math.round((AFTER[i] - BEFORE[i]) * progress)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-white/40 font-semibold">{month}</span>
              </div>
            )
          })}
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
