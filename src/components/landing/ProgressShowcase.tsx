"use client"
import { useEffect, useRef, useState } from "react"
import { TrendingUp, Award, Flame, Target, ArrowUpRight } from "lucide-react"

const MONTHS = ["Feb", "Mar", "Abr", "May", "Jun", "Jul"]
const BEFORE = [62, 65, 68, 70, 74, 79]
const AFTER  = [72, 78, 84, 87, 91, 95]

const METRICS = [
  { label: "Velocidad",   before: 72, after: 91, icon: Flame,      color: "#f59e0b", bg: "bg-amber-50",    text: "text-amber-500" },
  { label: "Técnica",     before: 68, after: 88, icon: Target,     color: "#0B5CFF", bg: "bg-blue-50",     text: "text-blue-500"  },
  { label: "Resistencia", before: 74, after: 89, icon: TrendingUp,  color: "#10b981", bg: "bg-emerald-50",  text: "text-emerald-500" },
  { label: "Agilidad",    before: 70, after: 90, icon: Award,      color: "#8b5cf6", bg: "bg-violet-50",   text: "text-violet-500" },
]

export default function ProgressShowcase() {
  const [visible, setVisible] = useState(false)
  const [p, setP] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let raf: number; const start = performance.now(); const D = 1400
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / D)
      setP(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [visible])

  // SVG helpers
  const pts = (data: number[]) => data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (v / 100) * 100 * p
    return `${x},${y}`
  }).join(" ")

  const area = (data: number[]) => {
    const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (data.length - 1)) * 100},${100 - (v / 100) * 100 * p}`).join(" ")
    return `${line} L100,100 L0,100 Z`
  }

  return (
    <div ref={ref} className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

      {/* LEFT — chart card (white, clean) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Evolución medida</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Cada mes, un salto real</h3>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" />Sin Metrikas</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-[#0B5CFF]" />Con Metrikas</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative mt-4" style={{ aspectRatio: "16/7" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B5CFF" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0B5CFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25,50,75].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.4" />)}
            <path d={area(BEFORE)} fill="url(#gB)" />
            <polyline points={pts(BEFORE)} fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />
            <path d={area(AFTER)} fill="url(#gA)" />
            <polyline points={pts(AFTER)} fill="none" stroke="#0B5CFF" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            {AFTER.map((v, i) => {
              const x = (i / (AFTER.length - 1)) * 100
              const y = 100 - (v / 100) * 100 * p
              return <g key={i}><circle cx={x} cy={y} r="1.5" fill="white" stroke="#0B5CFF" strokeWidth="0.7" vectorEffect="non-scaling-stroke" /></g>
            })}
          </svg>

          {/* Badge */}
          <div className="absolute top-0 right-0 bg-[#0B5CFF] text-white text-xs font-black px-2.5 py-1.5 rounded-xl shadow-md shadow-blue-200">
            +{Math.round((AFTER[AFTER.length-1] - BEFORE[0]) * p)} pts
          </div>
        </div>

        <div className="grid grid-cols-6 mt-2 text-[10px] text-slate-300 font-semibold">
          {MONTHS.map(m => <span key={m} className="text-center">{m}</span>)}
        </div>
      </div>

      {/* RIGHT — stat column */}
      <div className="flex flex-col gap-4">
        {/* Big KPI */}
        <div className="bg-[#0B5CFF] rounded-3xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-200" />
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Progreso general</p>
          </div>
          <p className="text-6xl font-black tabular-nums leading-none">
            +{Math.round(22 * p)}<span className="text-3xl text-blue-300">%</span>
          </p>
          <p className="text-blue-200 text-sm mt-2">Score promedio en 6 meses</p>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-blue-200">
            <ArrowUpRight size={13} /> Comparado con academias sin sistema
          </div>
        </div>

        {/* 2 mini KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <Flame size={16} className="text-amber-400 mb-2" />
            <p className="text-2xl font-black text-slate-900 tabular-nums">{Math.round(14 * p)}<span className="text-sm text-slate-400">/22</span></p>
            <p className="text-[11px] text-slate-400 mt-0.5">Jugadores TOP</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <Award size={16} className="text-violet-400 mb-2" />
            <p className="text-2xl font-black text-slate-900 tabular-nums">{Math.round(94 * p)}<span className="text-sm text-slate-400">%</span></p>
            <p className="text-[11px] text-slate-400 mt-0.5">Asistencia</p>
          </div>
        </div>

        {/* Metric bars */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          {METRICS.map(m => {
            const cur = m.before + (m.after - m.before) * p
            const pct = (cur / 100) * 100
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <m.icon size={12} style={{ color: m.color }} />
                    <p className="text-xs font-semibold text-slate-700">{m.label}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-black text-slate-900">{Math.round(cur)}</p>
                    <p className="text-[10px] font-bold" style={{ color: m.color }}>+{Math.round((m.after - m.before) * p)}</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: m.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
