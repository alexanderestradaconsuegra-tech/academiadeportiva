"use client"
import { Calendar, Users, ClipboardList, ChevronRight, Check, X } from "lucide-react"

/* ── Realistic phone frame ──────────────────── */
function Phone({ children, float }: { children: React.ReactNode; float?: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: 240 }}>
      {/* Phone body */}
      <div className="relative bg-[#111] rounded-[2.8rem] shadow-2xl border border-white/10" style={{ padding: "10px" }}>
        {/* Screen */}
        <div className="relative rounded-[2.2rem] overflow-hidden bg-[#0d1117]" style={{ aspectRatio: "9/19.5" }}>
          {/* Status bar */}
          <div className="absolute top-0 inset-x-0 h-8 bg-[#0d1117] z-20 flex items-start justify-center pt-1">
            <div className="w-20 h-5 bg-[#111] rounded-b-2xl" />
          </div>
          {/* Content */}
          <div className="absolute inset-0 pt-8">
            {children}
          </div>
        </div>
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
      </div>
      {/* Floating element */}
      {float && (
        <div className="absolute -right-16 top-16 z-10">
          {float}
        </div>
      )}
    </div>
  )
}

/* ── App screens ────────────────────────────── */

function CalendarScreen() {
  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">
      <div className="px-4 pt-2 pb-3 border-b border-white/8">
        <p className="text-white text-[11px] font-bold">Julio 2026</p>
        <p className="text-white/40 text-[9px]">3 eventos esta semana</p>
      </div>
      {/* Week strip */}
      <div className="flex gap-1 px-3 py-2">
        {[{d:"L",n:"21",act:true},{d:"M",n:"22"},{d:"X",n:"23",ev:true},{d:"J",n:"24"},{d:"V",n:"25"},{d:"S",n:"26",ev:true},{d:"D",n:"27"}].map(day=>(
          <div key={day.n} className={`flex-1 flex flex-col items-center py-1.5 rounded-xl ${day.act ? "bg-[#0B5CFF]" : ""}`}>
            <p className={`text-[7px] font-semibold ${day.act ? "text-white/70" : "text-white/30"}`}>{day.d}</p>
            <p className={`text-[10px] font-bold ${day.act ? "text-white" : "text-white/60"}`}>{day.n}</p>
            {day.ev && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
          </div>
        ))}
      </div>
      {/* Events */}
      <div className="flex-1 px-3 space-y-2 overflow-hidden">
        {[
          { time:"16:00", title:"Sub-15 · Entrenamiento", place:"Cancha principal", color:"#0B5CFF" },
          { time:"18:30", title:"Sub-13 · Entrenamiento", place:"Cancha 2", color:"#10b981" },
          { time:"—", title:"Sub-18 · Partido amistoso", place:"Sáb 26 · 10:00", color:"#f59e0b", muted:true },
        ].map(e=>(
          <div key={e.title} className={`flex gap-2.5 p-2.5 rounded-xl ${e.muted ? "bg-white/3 opacity-60" : "bg-white/6"} border border-white/8`}>
            <div className="w-0.5 rounded-full self-stretch shrink-0" style={{background: e.color}} />
            <div>
              <p className="text-white text-[9px] font-bold leading-tight">{e.title}</p>
              <p className="text-white/40 text-[8px] mt-0.5">{e.place}</p>
            </div>
            <p className="ml-auto text-[8px] font-semibold text-white/40 shrink-0">{e.time}</p>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex border-t border-white/8 py-2">
        {["Hoy","Equipo","Notif.","Perfil"].map((n,i)=>(
          <div key={n} className="flex-1 flex flex-col items-center gap-0.5">
            <div className={`w-3.5 h-3.5 rounded ${i===0?"bg-[#0B5CFF]":"bg-white/10"}`} />
            <p className={`text-[6px] ${i===0?"text-[#0B5CFF] font-bold":"text-white/30"}`}>{n}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlayersScreen() {
  const players = [
    { name:"Mateo García", pos:"POR", cat:"Sub-15", score:88, up:true },
    { name:"Lucas Pérez",  pos:"DFC", cat:"Sub-15", score:82, up:true },
    { name:"Emma Torres",  pos:"LI",  cat:"Sub-13", score:79, up:false },
    { name:"Diego Ruiz",   pos:"MCD", cat:"Sub-18", score:91, up:true },
    { name:"Sara Molina",  pos:"MC",  cat:"Sub-15", score:76, up:false },
  ]
  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">
      <div className="px-4 pt-2 pb-2 border-b border-white/8">
        <p className="text-white text-[11px] font-bold">Jugadores</p>
        <div className="flex items-center gap-1.5 mt-1.5 bg-white/5 rounded-lg px-2 py-1.5">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <p className="text-white/30 text-[8px]">Buscar...</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-2 space-y-1.5">
        {players.map(p=>(
          <div key={p.name} className="flex items-center gap-2.5 bg-white/4 rounded-xl p-2 border border-white/6">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 text-[8px] font-black shrink-0">
              {p.pos}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[9px] font-semibold truncate">{p.name}</p>
              <p className="text-white/30 text-[8px]">{p.pos} · {p.cat}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[11px] font-black ${p.score>=85?"text-emerald-400":"text-white/70"}`}>{p.score}</p>
              <p className={`text-[7px] ${p.up?"text-emerald-400":"text-red-400"}`}>{p.up?"↑":"↓"}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex border-t border-white/8 py-2">
        {["Hoy","Equipo","Notif.","Perfil"].map((n,i)=>(
          <div key={n} className="flex-1 flex flex-col items-center gap-0.5">
            <div className={`w-3.5 h-3.5 rounded ${i===1?"bg-[#0B5CFF]":"bg-white/10"}`} />
            <p className={`text-[6px] ${i===1?"text-[#0B5CFF] font-bold":"text-white/30"}`}>{n}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConvocatoriaScreen() {
  const players = [
    { name:"Mateo",  pos:"POR", x:50, y:10, confirmed: true },
    { name:"Emma",   pos:"LI",  x:18, y:35, confirmed: true },
    { name:"Lucas",  pos:"DFC", x:38, y:32, confirmed: true },
    { name:"Diego",  pos:"DFC", x:62, y:32, confirmed: true },
    { name:"Sofía",  pos:"LD",  x:82, y:35, confirmed: true },
    { name:"Tomás",  pos:"MC",  x:28, y:55, confirmed: true },
    { name:"Sara",   pos:"MCD", x:50, y:52, confirmed: false },
    { name:"Nico",   pos:"MC",  x:72, y:55, confirmed: true },
    { name:"Bruno",  pos:"DC",  x:50, y:75, confirmed: true },
    { name:"Ale",    pos:"EXI", x:18, y:73, confirmed: true },
    { name:"Mia",    pos:"EXD", x:82, y:73, confirmed: false },
  ]
  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">
      <div className="px-4 pt-2 pb-2 border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-white text-[10px] font-bold">Convocatoria</p>
          <p className="text-white/30 text-[8px]">Sáb 26 · 10:00 · 4-3-3</p>
        </div>
        <div className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">9/11 ✓</div>
      </div>
      {/* Pitch */}
      <div className="flex-1 relative mx-3 my-2 rounded-xl overflow-hidden" style={{background:"#1a5c35"}}>
        <div className="absolute inset-0">
          {/* Field lines */}
          <div className="absolute inset-x-[20%] top-[48%] bottom-[48%] border border-white/20 rounded-full" />
          <div className="absolute inset-x-[35%] top-[3%] h-[15%] border border-white/20" />
          <div className="absolute inset-x-[35%] bottom-[3%] h-[15%] border border-white/20" />
          {/* Players */}
          {players.map(p=>(
            <div key={p.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:`${p.x}%`,top:`${p.y}%`}}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[6px] font-black shadow-md ${p.confirmed ? "bg-[#0B5CFF] border-white text-white" : "bg-red-500 border-red-300 text-white"}`}>
                {p.pos.slice(0,2)}
              </div>
              <p className="text-white text-[5.5px] font-bold text-center mt-0.5 drop-shadow">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex border-t border-white/8 py-2">
        {["Hoy","Equipo","Notif.","Perfil"].map((n,i)=>(
          <div key={n} className="flex-1 flex flex-col items-center gap-0.5">
            <div className={`w-3.5 h-3.5 rounded ${i===1?"bg-[#0B5CFF]":"bg-white/10"}`} />
            <p className={`text-[6px] ${i===1?"text-[#0B5CFF] font-bold":"text-white/30"}`}>{n}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Floating elements ──────────────────────── */
const CalendarFloat = (
  <div className="bg-white rounded-2xl shadow-xl px-4 py-3 w-44 border border-slate-100">
    <p className="text-slate-800 text-[11px] font-bold mb-2">Entrenamiento confirmado</p>
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={10} className="text-emerald-600" /></div>
      <p className="text-slate-500 text-[10px]">Mateo García</p>
    </div>
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={10} className="text-emerald-600" /></div>
      <p className="text-slate-500 text-[10px]">Lucas Pérez</p>
    </div>
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><X size={10} className="text-red-500" /></div>
      <p className="text-slate-500 text-[10px]">Emma Torres</p>
    </div>
  </div>
)

const ConvocatoriaFloat = (
  <div className="bg-white rounded-2xl shadow-xl px-4 py-3 w-48 border border-slate-100">
    <p className="text-slate-800 text-[11px] font-bold mb-1">¿Estás disponible para el partido del sábado?</p>
    <div className="flex gap-2 mt-2">
      <button className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">Sí</button>
      <button className="flex-1 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">No</button>
    </div>
  </div>
)

/* ── Feature rows ───────────────────────────── */
const FEATURES = [
  {
    icon: Calendar,
    label: "Calendario",
    title: "Planifica los eventos de tu academia con tranquilidad.",
    desc: "Partidos, entrenamientos y torneos en un solo lugar. Todo el cuerpo técnico y los jugadores ven el calendario en tiempo real.",
    bullets: [
      "Crea eventos en segundos con fecha, hora y categoría",
      "Los jugadores reciben notificación push automática",
      "Cancela o reprograma notificando a todos al instante",
    ],
    screen: <CalendarScreen />,
    float: CalendarFloat,
    reverse: false,
  },
  {
    icon: Users,
    label: "Jugadores",
    title: "Conoce el estado real de cada jugador de tu plantel.",
    desc: "Perfil completo por jugador con evaluaciones físicas, historial de actividades y evolución semana a semana.",
    bullets: [
      "Score general basado en evaluaciones reales por categoría",
      "Identifica automáticamente quién necesita atención",
      "Filtra por posición, categoría o rendimiento",
    ],
    screen: <PlayersScreen />,
    float: undefined,
    reverse: true,
  },
  {
    icon: ClipboardList,
    label: "Convocatorias & Asistencias",
    title: "Un control absoluto sobre la asistencia de tus jugadores.",
    desc: "Adiós a las convocatorias por WhatsApp sin respuesta. El jugador confirma o declina desde la app y tú ves el estado en tiempo real.",
    bullets: [
      "Convoca a tu equipo en 1 clic desde el tablero táctico",
      "El jugador confirma directamente desde su celular",
      "Sigue en tiempo real quién viene y quién no",
    ],
    screen: <ConvocatoriaScreen />,
    float: ConvocatoriaFloat,
    reverse: false,
  },
]

export default function FeatureShowcase() {
  return (
    <div className="space-y-28 md:space-y-36">
      {FEATURES.map((f) => {
        const Icon = f.icon
        return (
          <div
            key={f.label}
            className={`flex flex-col ${f.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16 lg:gap-24`}
          >
            {/* Phone */}
            <div className="shrink-0 flex justify-center" style={{ minWidth: 280 }}>
              <Phone float={f.float}>
                {f.screen}
              </Phone>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-5">
                <Icon size={16} className="text-white/50" />
                <span className="text-sm font-semibold text-white/50">{f.label}</span>
              </div>
              <h3 className="text-2xl md:text-[1.75rem] font-black text-white leading-snug mb-4">{f.title}</h3>
              <p className="text-white/50 text-base leading-relaxed mb-7">{f.desc}</p>
              <ul className="space-y-3.5">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-start gap-3">
                    <ChevronRight size={15} className="text-white/30 mt-0.5 shrink-0" />
                    <span className="text-sm text-white/70 leading-snug">{b}</span>
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
