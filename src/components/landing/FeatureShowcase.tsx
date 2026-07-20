"use client"
import { Calendar, Users, ClipboardList, CreditCard, ChevronRight } from "lucide-react"

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] border-[6px] border-slate-700 bg-slate-900 shadow-2xl overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 flex justify-center z-10 pt-1">
          <div className="w-24 h-5 bg-slate-900 rounded-b-2xl" />
        </div>
        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden">
          {children}
        </div>
      </div>
      {/* Glow */}
      <div className="absolute -inset-4 rounded-[3rem] bg-[#0B5CFF]/10 blur-2xl -z-10" />
    </div>
  )
}

/* ── Phone screen mocks ─────────────────────── */

function CalendarScreen() {
  const events = [
    { day: "Lun 21", time: "16:00", title: "Sub-15 · Entrenamiento", color: "bg-blue-500" },
    { day: "Mié 23", time: "17:30", title: "Sub-13 · Partido amistoso", color: "bg-emerald-500" },
    { day: "Sáb 26", time: "10:00", title: "Sub-18 · Copa regional", color: "bg-amber-500" },
  ]
  return (
    <div className="h-full bg-[#05122F] pt-8 px-3 pb-3 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-white text-xs font-bold">Julio 2026</p>
        <div className="w-6 h-6 rounded-lg bg-[#0B5CFF] flex items-center justify-center">
          <Calendar size={12} className="text-white" />
        </div>
      </div>
      {/* Mini calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-3">
        {["L","M","X","J","V","S","D"].map(d => (
          <p key={d} className="text-center text-[8px] text-white/40 font-semibold">{d}</p>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
          <div key={d} className={`aspect-square flex items-center justify-center rounded-md text-[8px] font-semibold ${
            d === 21 ? "bg-[#0B5CFF] text-white" : d === 23 ? "bg-emerald-500 text-white" : d === 26 ? "bg-amber-500 text-white" : "text-white/50"
          }`}>{d}</div>
        ))}
      </div>
      {/* Events */}
      <div className="space-y-1.5 flex-1">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider px-1">Próximos eventos</p>
        {events.map(e => (
          <div key={e.day} className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
            <div className={`w-1 h-8 rounded-full ${e.color} shrink-0`} />
            <div>
              <p className="text-white text-[9px] font-bold leading-tight">{e.title}</p>
              <p className="text-white/40 text-[8px]">{e.day} · {e.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlayersScreen() {
  const players = [
    { name: "Mateo García", pos: "POR", score: 88, color: "bg-amber-400" },
    { name: "Lucas Pérez", pos: "DFC", score: 82, color: "bg-blue-400" },
    { name: "Emma Torres", pos: "LI", score: 79, color: "bg-emerald-400" },
    { name: "Diego Ruiz", pos: "MCD", score: 91, color: "bg-fuchsia-400" },
  ]
  return (
    <div className="h-full bg-[#05122F] pt-8 px-3 pb-3 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-white text-xs font-bold">Jugadores</p>
        <div className="w-6 h-6 rounded-lg bg-[#0B5CFF] flex items-center justify-center">
          <Users size={12} className="text-white" />
        </div>
      </div>
      <div className="bg-white/5 rounded-xl px-3 py-2 mb-3 flex items-center gap-2 border border-white/10">
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <p className="text-white/40 text-[9px]">Buscar jugador...</p>
      </div>
      <div className="space-y-1.5 flex-1">
        {players.map(p => (
          <div key={p.name} className="flex items-center gap-2.5 bg-white/5 rounded-xl p-2 border border-white/10">
            <div className={`w-8 h-8 rounded-xl ${p.color} flex items-center justify-center text-white text-[9px] font-black shrink-0`}>
              {p.pos}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[9px] font-bold truncate">{p.name}</p>
              <p className="text-white/40 text-[8px]">{p.pos} · Sub-15</p>
            </div>
            <div className={`text-[10px] font-black ${p.score >= 85 ? "text-emerald-400" : "text-[#0B5CFF]"}`}>{p.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConvocatoriaScreen() {
  const lineup = [
    { name: "Mateo", pos: "POR", x: 50, y: 12 },
    { name: "Emma", pos: "LI", x: 18, y: 38 },
    { name: "Lucas", pos: "DFC", x: 38, y: 35 },
    { name: "Diego", pos: "DFC", x: 62, y: 35 },
    { name: "Sofía", pos: "LD", x: 82, y: 38 },
    { name: "Tomás", pos: "MC", x: 25, y: 58 },
    { name: "Sara", pos: "MCD", x: 50, y: 55 },
    { name: "Nico", pos: "MC", x: 75, y: 58 },
    { name: "Ale", pos: "EXI", x: 18, y: 76 },
    { name: "Bruno", pos: "DC", x: 50, y: 78 },
    { name: "Mia", pos: "EXD", x: 82, y: 76 },
  ]
  return (
    <div className="h-full bg-[#05122F] pt-8 px-3 pb-3 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-white text-[10px] font-bold">Convocatoria · 4-4-2</p>
        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">11 titulares</span>
      </div>
      {/* Pitch */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10" style={{ background: "linear-gradient(180deg, #1a6b3a 0%, #1d7a42 50%, #1a6b3a 100%)" }}>
        {/* Lines */}
        <div className="absolute inset-x-[15%] top-[48%] bottom-[48%] border border-white/20 rounded-full" />
        <div className="absolute inset-x-[30%] top-[5%] bottom-[82%] border border-white/20" />
        <div className="absolute inset-x-[30%] top-[82%] bottom-[5%] border border-white/20" />
        {/* Players */}
        {lineup.map(p => (
          <div key={p.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <div className="w-6 h-6 rounded-full bg-[#0B5CFF] border-2 border-white flex items-center justify-center text-white text-[6px] font-black shadow-lg">
              {p.pos.slice(0,2)}
            </div>
            <p className="text-white text-[6px] font-bold mt-0.5 drop-shadow">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Feature rows ───────────────────────────── */

const FEATURES = [
  {
    icon: Calendar,
    label: "Calendario",
    title: "Planifica todos los eventos de tu academia.",
    desc: "Partidos, entrenamientos y torneos en un solo lugar. Cada evento queda visible para todo el cuerpo técnico y los jugadores al instante.",
    bullets: [
      "Crea eventos en segundos con fecha, hora y categoría",
      "Los jugadores reciben notificación automática",
      "Vista semanal y mensual para todo el equipo",
    ],
    screen: <CalendarScreen />,
    reverse: false,
  },
  {
    icon: Users,
    label: "Jugadores",
    title: "Conoce el estado real de cada jugador.",
    desc: "Perfil completo por jugador: posición, categoría, evaluaciones físicas y progreso semana a semana.",
    bullets: [
      "Score general basado en evaluaciones reales",
      "Historial de actividades y métricas por categoría",
      "Identifica quién necesita atención especial",
    ],
    screen: <PlayersScreen />,
    reverse: true,
  },
  {
    icon: ClipboardList,
    label: "Convocatoria",
    title: "Arma tu once y compártelo en segundos.",
    desc: "Define la formación, arrastra jugadores a su posición y envía la convocatoria con un clic. El jugador la confirma desde su celular.",
    bullets: [
      "Tablero táctico interactivo con formaciones reales",
      "El jugador confirma o declina asistencia",
      "El entrenador ve el estado en tiempo real",
    ],
    screen: <ConvocatoriaScreen />,
    reverse: false,
  },
]

export default function FeatureShowcase() {
  return (
    <div className="space-y-24 md:space-y-32">
      {FEATURES.map((f) => {
        const Icon = f.icon
        return (
          <div
            key={f.label}
            className={`flex flex-col ${f.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
          >
            {/* Phone mockup */}
            <div className="w-full lg:w-auto lg:shrink-0 flex justify-center">
              <PhoneFrame>{f.screen}</PhoneFrame>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#0B5CFF]/20 border border-[#0B5CFF]/30 flex items-center justify-center">
                  <Icon size={18} className="text-[#0B5CFF]" />
                </div>
                <span className="text-sm font-bold text-[#0B5CFF] uppercase tracking-widest">{f.label}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">{f.title}</h3>
              <p className="text-blue-100/60 text-base leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-3">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-start gap-3">
                    <ChevronRight size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" />
                    <span className="text-sm text-white/80">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
