"use client"
import { useState } from "react"
import { Zap, Dumbbell, Target, Timer, Flame, ArrowUpCircle, Wind, PlayCircle, Video, ClipboardList } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Exercise {
  name: string
  detail: string
  unit: string
  benchmark: string
}

interface Category {
  key: string
  color: string
  ring: string
  icon: LucideIcon
  desc: string
  exercises: Exercise[]
}

const CATEGORIES: Category[] = [
  {
    key: "Velocidad", color: "from-amber-400 to-orange-500", ring: "ring-amber-400/30", icon: Zap,
    desc: "Sprints, tiempos y aceleración medibles",
    exercises: [
      { name: "Sprint 40m", detail: "Salida detenida, medir con cronómetro", unit: "segundos", benchmark: "Sub-15: 5.4s" },
      { name: "10m lanzados", detail: "Máxima velocidad en tramo corto", unit: "segundos", benchmark: "Sub-15: 1.6s" },
      { name: "Sprint con cambio de dirección", detail: "Trayecto en L a máxima intensidad", unit: "segundos", benchmark: "Sub-15: 7.2s" },
    ],
  },
  {
    key: "Fuerza", color: "from-red-400 to-red-600", ring: "ring-red-400/30", icon: Dumbbell,
    desc: "Cargas, repeticiones y potencia muscular",
    exercises: [
      { name: "Sentadilla con carga", detail: "3 series de 8 repeticiones", unit: "kg", benchmark: "Sub-15: 60 kg" },
      { name: "Press de banca", detail: "4 series de 6-8 repeticiones", unit: "kg", benchmark: "Sub-15: 40 kg" },
      { name: "Peso muerto", detail: "Técnica supervisada, cargas progresivas", unit: "kg", benchmark: "Sub-15: 70 kg" },
    ],
  },
  {
    key: "Técnica", color: "from-blue-400 to-blue-600", ring: "ring-blue-400/30", icon: Target,
    desc: "Precisión, control y toma de decisiones",
    exercises: [
      { name: "Conducción slalom", detail: "Zigzag entre 8 conos, control con ambas piernas", unit: "puntos", benchmark: "Excelente: 90+" },
      { name: "Pases precisos 20m", detail: "10 pases al aro, pierna dominante y débil", unit: "aciertos", benchmark: "Objetivo: 8/10" },
      { name: "Definición con pierna débil", detail: "Remate a portería, 10 intentos", unit: "goles", benchmark: "Objetivo: 6/10" },
    ],
  },
  {
    key: "Resistencia", color: "from-emerald-400 to-emerald-600", ring: "ring-emerald-400/30", icon: Timer,
    desc: "Capacidad aeróbica y aguante en carrera",
    exercises: [
      { name: "Cooper Test (12 min)", detail: "Distancia máxima recorrida en 12 minutos", unit: "metros", benchmark: "Sub-15: 2500m" },
      { name: "Yo-Yo IR1", detail: "Test intermitente de recuperación", unit: "metros", benchmark: "Objetivo: 1800m" },
      { name: "Circuito 4x400m", detail: "Con recuperación de 90s entre series", unit: "segundos", benchmark: "Sub-15: 75s/vuelta" },
    ],
  },
  {
    key: "Potencia", color: "from-orange-400 to-red-500", ring: "ring-orange-400/30", icon: Flame,
    desc: "Explosividad y fuerza aplicada al instante",
    exercises: [
      { name: "Salto vertical (CMJ)", detail: "Medir altura máxima con contramovimiento", unit: "cm", benchmark: "Sub-15: 40 cm" },
      { name: "Salto largo sin impulso", detail: "Pies juntos, medir distancia", unit: "metros", benchmark: "Sub-15: 2.0m" },
      { name: "Lanzamiento de balón medicinal", detail: "3 kg desde el pecho", unit: "metros", benchmark: "Sub-15: 6.5m" },
    ],
  },
  {
    key: "Pliometría", color: "from-pink-400 to-fuchsia-600", ring: "ring-pink-400/30", icon: ArrowUpCircle,
    desc: "Saltos y rebotes para reacción muscular",
    exercises: [
      { name: "Box jumps", detail: "Cajón de 40cm, 4 series de 8 repeticiones", unit: "repeticiones", benchmark: "Progresión: +10%/mes" },
      { name: "Skipping alto en escalera", detail: "20 segundos máxima frecuencia", unit: "repeticiones", benchmark: "Sub-15: 45 apoyos" },
      { name: "Saltos laterales sobre vallas", detail: "5 vallas de 30cm, ida y vuelta", unit: "segundos", benchmark: "Sub-15: 6.8s" },
    ],
  },
  {
    key: "Agilidad", color: "from-purple-400 to-purple-600", ring: "ring-purple-400/30", icon: Wind,
    desc: "Cambios de dirección y coordinación",
    exercises: [
      { name: "Test T", detail: "Recorrido en T con cambios de dirección", unit: "segundos", benchmark: "Sub-15: 10.5s" },
      { name: "Illinois Agility", detail: "Circuito de conos con giros de 180°", unit: "segundos", benchmark: "Sub-15: 17.0s" },
      { name: "Escalera de agilidad", detail: "Combinaciones de pisadas rápidas", unit: "puntos", benchmark: "Excelente: 85+" },
    ],
  },
]

export default function ExerciseLibrary() {
  const [active, setActive] = useState(0)
  const cat = CATEGORIES[active]
  const Icon = cat.icon

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((c, i) => {
          const CIcon = c.icon
          const isActive = active === i
          return (
            <button
              key={c.key}
              onClick={() => setActive(i)}
              className={`group h-11 pl-3 pr-4 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all ${
                isActive
                  ? `bg-gradient-to-br ${c.color} text-white shadow-lg ring-2 ${c.ring} scale-105`
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              <CIcon size={16} className={isActive ? "text-white" : "text-white/60"} />
              {c.key}
            </button>
          )
        })}
      </div>

      {/* Selected category detail */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
        {/* Left: category card + video mock */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${cat.color} p-8`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-5">
              <Icon size={26} className="text-white" />
            </div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Categoría</p>
            <h3 className="text-3xl font-black text-white leading-tight mb-2">{cat.key}</h3>
            <p className="text-sm text-white/85 mb-6">{cat.desc}</p>

            {/* Mock video preview */}
            <div className="relative bg-black/40 backdrop-blur rounded-2xl overflow-hidden aspect-video border border-white/20 group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <PlayCircle size={40} className="text-slate-900" fill="currentColor" strokeWidth={0} />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <Video size={12} />
                  <span className="font-semibold">Video guía · {cat.exercises[0].name}</span>
                </div>
              </div>
              {/* fake timeline */}
              <div className="absolute inset-x-3 bottom-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-1/3 rounded-full" />
              </div>
            </div>
            <p className="text-xs text-white/70 mt-3 text-center">Cada ejercicio guarda su enlace a YouTube o Vimeo. El deportista lo ve embebido en su app.</p>
          </div>
        </div>

        {/* Right: exercise list */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-300" />
              <h4 className="text-sm font-bold text-white">Ejercicios de {cat.key.toLowerCase()}</h4>
            </div>
            <span className="text-xs font-bold text-white/40">{cat.exercises.length} ejercicios</span>
          </div>

          <div className="space-y-3">
            {cat.exercises.map((ex, i) => (
              <div key={ex.name} className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-white">{ex.name}</p>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5">
                      {ex.unit}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-1.5">{ex.detail}</p>
                  <p className="text-[11px] font-semibold text-emerald-300">📊 {ex.benchmark}</p>
                </div>
                <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors shrink-0">
                  <PlayCircle size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3 text-xs text-white/50">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Video size={14} className="text-blue-300" />
            </div>
            <p className="flex-1">Cada ejercicio incluye <span className="text-white font-bold">video, unidad de medida, benchmark por edad y espacio para registrar cada intento.</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
