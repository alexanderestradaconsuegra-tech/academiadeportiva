import Link from "next/link"
import type { Metadata } from "next"
import {
  Trophy, Users, CalendarDays, CreditCard, Heart, PenTool, Bell, Languages,
  ShieldCheck, TrendingUp, CheckCircle2, ArrowRight, BarChart3, Radar as RadarIcon,
  Video, UserCog, Star, Smartphone, MessageCircle, ChevronDown, Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Metrikas — Profesionaliza tu academia de fútbol",
  description: "La plataforma todo-en-uno para academias de fútbol: jugadores, partidos, formaciones, evaluaciones, pagos y comunicación en un solo lugar.",
}

const WHATSAPP_NUMBER = "56992103974"
const WHATSAPP_MSG = encodeURIComponent("Hola, quiero información sobre Metrikas para mi academia")
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`

const PRICE_MONTHLY = 15
const PRICE_ANNUAL = Math.round(PRICE_MONTHLY * 12 * 0.7)

const PLAN_INCLUDES = [
  "Jugadores, categorías y fichas completas ilimitadas",
  "Partidos, convocatoria y formaciones profesionales (11, 8, 7 y 5)",
  "Evaluaciones físicas y gráficas de progreso",
  "Calendario de entrenamientos con asistencia y RSVP",
  "Pagos y mensualidades generados automáticamente",
  "Salud, biometría, lesiones y pruebas físicas",
  "Notificaciones push a jugadores y acudientes",
  "Un profesor por categoría, con acceso controlado",
  "Reportes en PDF y comparativa de jugadores",
  "Español, inglés y portugués",
]

const FAQS = [
  { q: "¿Cuánto cuesta Metrikas?", a: `US$${PRICE_MONTHLY} al mes por academia, sin importar cuántos jugadores tengas. Pagando el año completo obtienes 30% de descuento: US$${PRICE_ANNUAL}/año (equivale a US$${(PRICE_ANNUAL / 12).toFixed(1)}/mes). Empezamos en pesos chilenos y ya trabajamos con academias en toda Latinoamérica y EE.UU.` },
  { q: "¿Hay contrato o permanencia mínima?", a: "No. No hay instalación, ni contratos largos, ni letra chica. Cancelas cuando quieras y sigues teniendo acceso hasta el final del período ya pagado." },
  { q: "¿Funciona en cualquier país?", a: "Sí. Metrikas está disponible en español, inglés y portugués, y funciona igual para una academia en Chile, Colombia, México o Estados Unidos." },
  { q: "¿Qué tan seguros están los datos de mis jugadores?", a: "Cada academia tiene sus datos completamente aislados a nivel de base de datos — ninguna otra academia puede verlos ni acceder a ellos, ni siquiera técnicamente. Las contraseñas se manejan cifradas." },
  { q: "¿Puedo tener un profesor por categoría?", a: "Sí. Puedes crear un acceso independiente para cada profesor, y cada uno solo ve y gestiona los jugadores de su propia categoría — nunca los pagos ni la configuración general de la academia." },
  { q: "¿Qué pasa si un mes no puedo pagar?", a: "Tu academia se suspende temporalmente hasta que se regularice el pago, pero tus datos nunca se borran. En cuanto pagas, todo vuelve a estar disponible tal como lo dejaste." },
  { q: "¿Cómo empiezo?", a: "Escríbenos por WhatsApp o correo, te damos un código de activación y en minutos tienes tu academia funcionando." },
]

const FEATURES = [
  { icon: Users, title: "Jugadores y categorías", desc: "Ficha completa por jugador: datos, posición, categoría, objetivo deportivo y evolución histórica." },
  { icon: Trophy, title: "Partidos y formaciones", desc: "Convocatoria, formaciones profesionales (11, 8, 7 y 5), resultados y estadísticas por partido." },
  { icon: BarChart3, title: "Evaluaciones y progreso", desc: "Mide velocidad, fuerza, técnica y resistencia. Visualiza la evolución real de cada deportista." },
  { icon: CalendarDays, title: "Entrenamientos y asistencia", desc: "Calendario de entrenos con confirmación de asistencia y RSVP directo del jugador." },
  { icon: Heart, title: "Salud y biometría", desc: "Ritmo cardíaco, lesiones, pruebas físicas y sesiones en vivo para un seguimiento serio." },
  { icon: CreditCard, title: "Pagos y mensualidades", desc: "Genera cuotas automáticamente cada mes y controla quién está al día, sin hojas de cálculo." },
  { icon: Bell, title: "Notificaciones push", desc: "Avisa convocatorias, entrenamientos y pagos pendientes directo al celular del jugador." },
  { icon: UserCog, title: "Roles por categoría", desc: "Cada profesor gestiona solo su categoría; el dueño de la academia mantiene el control total." },
  { icon: Languages, title: "Multi-idioma", desc: "Español, inglés y portugués — lista para academias en toda la región." },
]

const ROLES = [
  { title: "Dueño / Entrenador principal", desc: "Control total de la academia: todas las categorías, pagos, suscripción y configuración.", icon: ShieldCheck },
  { title: "Profesor de categoría", desc: "Gestiona su propia categoría — jugadores, partidos, entrenamientos — sin acceso a pagos ni configuración.", icon: UserCog },
  { title: "Jugador / Acudiente", desc: "Ve su perfil, progreso, convocatorias y confirma asistencia desde su propio celular.", icon: Smartphone },
]

function PlaceholderImage({ label, aspect = "16/9" }: { label: string; aspect?: string }) {
  return (
    <div
      className="relative w-full rounded-2xl border-2 border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center gap-2 text-center px-6"
      style={{ aspectRatio: aspect }}
    >
      <Video className="w-8 h-8 text-white/30" />
      <p className="text-xs font-medium text-white/50 max-w-xs">{label}</p>
    </div>
  )
}

const CHALK_DOTS = Array.from({ length: 45 }, (_, i) => ({
  cx: (i * 37 + (i % 7) * 13) % 400,
  cy: (i * 53 + (i % 5) * 29) % 500,
  r: 0.5 + (i % 3) * 0.4,
  o: 0.06 + (i % 4) * 0.03,
}))

function TacticsBoardGraphic() {
  const oPlayers = [
    { x: 140, y: 440 }, { x: 260, y: 440 }, { x: 200, y: 360 },
    { x: 110, y: 260 }, { x: 290, y: 260 }, { x: 200, y: 178 },
  ]
  const xPlayers = [
    { x: 200, y: 400 }, { x: 150, y: 305 }, { x: 250, y: 305 },
    { x: 172, y: 205 }, { x: 232, y: 145 },
  ]
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10" style={{ aspectRatio: "4/5" }}>
      <svg viewBox="0 0 400 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="boardGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e7a42" />
            <stop offset="100%" stopColor="#155c33" />
          </linearGradient>
          <marker id="arrowHead" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(255,255,255,0.85)" />
          </marker>
        </defs>

        <rect width="400" height="500" fill="url(#boardGreen)" />
        {CHALK_DOTS.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#fff" opacity={d.o} />
        ))}

        {/* Pitch markings */}
        <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" fill="none">
          <rect x="30" y="30" width="340" height="440" rx="4" />
          <line x1="30" y1="250" x2="370" y2="250" />
          <circle cx="200" cy="250" r="52" />
          <circle cx="200" cy="250" r="2.2" fill="rgba(255,255,255,0.55)" />
          <rect x="110" y="30" width="180" height="82" />
          <rect x="150" y="30" width="100" height="36" />
          <rect x="110" y="388" width="180" height="82" />
          <rect x="150" y="434" width="100" height="36" />
          <path d="M 30 60 A 30 30 0 0 0 60 30" />
          <path d="M 370 60 A 30 30 0 0 1 340 30" />
          <path d="M 30 440 A 30 30 0 0 1 60 470" />
          <path d="M 370 440 A 30 30 0 0 0 340 470" />
        </g>

        {/* Tactical run arrows */}
        <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeDasharray="7 6" strokeLinecap="round">
          <path d="M 140 440 Q 70 380 110 260" markerEnd="url(#arrowHead)" />
          <path d="M 110 260 Q 90 190 155 130" markerEnd="url(#arrowHead)" />
          <path d="M 200 360 Q 210 260 200 185" markerEnd="url(#arrowHead)" />
          <path d="M 200 178 Q 195 130 192 95" markerEnd="url(#arrowHead)" />
        </g>

        {/* Opponent markers (X) */}
        <g stroke="rgba(255,255,255,0.9)" strokeWidth="2.4" strokeLinecap="round">
          {xPlayers.map((p, i) => (
            <g key={i}>
              <line x1={p.x - 8} y1={p.y - 8} x2={p.x + 8} y2={p.y + 8} />
              <line x1={p.x - 8} y1={p.y + 8} x2={p.x + 8} y2={p.y - 8} />
            </g>
          ))}
        </g>

        {/* Own team markers (O) */}
        <g>
          {oPlayers.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="10" fill="#0B5CFF" stroke="white" strokeWidth="1.5" />
          ))}
        </g>
      </svg>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-5">
        <p className="text-white text-sm font-bold">Tablero táctico en vivo</p>
        <p className="text-white/60 text-xs">Formaciones y jugadas, directo desde la app</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05122F] text-white overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#05122F]/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B5CFF] flex items-center justify-center shrink-0">
              <Trophy className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">Metrikas</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-blue-100/70">
            <a href="#caracteristicas" className="hover:text-white transition-colors">Características</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#roles" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#preguntas" className="hover:text-white transition-colors">Preguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 px-3.5 rounded-xl border border-white/15 text-white text-sm font-semibold items-center gap-1.5 hover:bg-white/5 transition-colors"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
            <Link
              href="/login"
              className="h-9 px-4 rounded-xl bg-white text-[#071B4D] text-sm font-semibold flex items-center hover:bg-blue-50 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Floating WhatsApp button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-900/40 flex items-center justify-center transition-all hover:scale-105"
        title="Escríbenos por WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" fill="white" strokeWidth={1.5} />
      </a>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, white 1px, transparent 1px), radial-gradient(circle at 85% 60%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                <span className="text-white/80 text-xs font-medium">Hecho para academias que quieren crecer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-5">
                La plataforma que <span className="text-blue-300">profesionaliza</span> tu academia de fútbol
              </h1>
              <p className="text-blue-100/70 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Gestiona jugadores, arma tus convocatorias con formaciones reales, mide el progreso físico de cada
                deportista y controla las mensualidades — todo desde una sola plataforma, en tiempo real.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
                >
                  Solicitar acceso <ArrowRight size={16} />
                </a>
                <Link
                  href="/login"
                  className="h-12 px-6 rounded-xl border border-white/20 text-white text-sm font-bold flex items-center hover:bg-white/5 transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-xs text-blue-100/50 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Datos aislados por academia</span>
                <span className="flex items-center gap-1.5"><Smartphone size={14} /> Funciona en el celular</span>
                <span className="flex items-center gap-1.5"><Languages size={14} /> Español, inglés y portugués</span>
              </div>
            </div>
            <TacticsBoardGraphic />
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-slate-50 rounded-3xl p-8">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Sin Metrikas</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">✕</span> Convocatorias por grupos de WhatsApp que nadie confirma</li>
                <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">✕</span> Hojas de Excel dispersas para pagos y asistencia</li>
                <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">✕</span> Sin forma clara de mostrar el progreso de un jugador</li>
                <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">✕</span> Un solo usuario compartido entre todos los profesores</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
              <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Con Metrikas</p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" /> Convocatoria con confirmación individual y notificación push</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" /> Pagos y mensualidades generados y controlados automáticamente</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" /> Evaluaciones y gráficas que demuestran la evolución real</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" /> Un profesor por categoría, con su propio acceso controlado</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Todo lo que necesitas</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Un sistema completo, no diez herramientas sueltas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#0B5CFF]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section id="producto" className="bg-[#071B4D] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">El producto</p>
            <h2 className="text-3xl md:text-4xl font-black">Diseñado como una app profesional, no una hoja de cálculo</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Mock: Dashboard */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="rounded-xl bg-white p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Récord del equipo</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-50 rounded-lg p-2 text-center"><p className="text-lg font-black text-emerald-600">8</p><p className="text-[9px] text-emerald-600/70 font-semibold">Ganados</p></div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center"><p className="text-lg font-black text-amber-600">2</p><p className="text-[9px] text-amber-600/70 font-semibold">Empates</p></div>
                  <div className="bg-red-50 rounded-lg p-2 text-center"><p className="text-lg font-black text-red-500">1</p><p className="text-[9px] text-red-400 font-semibold">Perdidos</p></div>
                </div>
              </div>
              <h3 className="text-sm font-bold mb-1">Panel de control</h3>
              <p className="text-xs text-blue-100/60">Resultados, progreso y alertas de pago en una sola vista.</p>
            </div>

            {/* Mock: Formation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="rounded-xl bg-emerald-700 p-4 mb-4 aspect-[4/3] relative overflow-hidden">
                <div className="absolute inset-3 border border-white/40 rounded" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-4 h-4 rounded-full bg-[#0B5CFF] border border-white" />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-bold mb-1">Formaciones profesionales</h3>
              <p className="text-xs text-blue-100/60">F11, F8, F7 y F5, con posición ajustable de cada jugador.</p>
            </div>

            {/* Mock: Evaluations */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="rounded-xl bg-white p-4 mb-4 aspect-[4/3] flex items-center justify-center">
                <RadarIcon className="w-16 h-16 text-[#0B5CFF]" strokeWidth={1} />
              </div>
              <h3 className="text-sm font-bold mb-1">Evaluaciones físicas</h3>
              <p className="text-xs text-blue-100/60">Velocidad, fuerza, técnica y resistencia — comparables mes a mes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Growth */}
      <section className="bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Crecimiento real</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 leading-tight">
                Demuestra el progreso de tus deportistas, no solo lo prometas
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Cada evaluación queda registrada. Cada partido, cada entrenamiento, cada prueba física. Con el tiempo,
                Metrikas construye una historia medible del crecimiento de cada jugador — algo que puedes mostrarle a
                los padres, y que distingue a tu academia de la competencia.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Reportes en PDF listos para compartir con padres",
                  "Comparativa de jugadores lado a lado",
                  "Historial completo de evaluaciones y partidos",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <TrendingUp size={16} className="text-emerald-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <div className="flex items-end gap-2 h-40">
                {[62, 68, 65, 74, 79, 85, 88].map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#0B5CFF] to-blue-400" style={{ height: `${v}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium">
                <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Ejemplo ilustrativo de evolución de score general</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Un sistema para todo tu cuerpo técnico</h2>
            <p className="text-slate-500 mt-3">Cada persona ve exactamente lo que necesita, ni más ni menos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ROLES.map(r => (
              <div key={r.title} className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <r.icon className="w-6 h-6 text-[#0B5CFF]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="bg-[#071B4D] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Un solo plan, todo incluido</h2>
            <p className="text-blue-100/70">Sin límite de jugadores ni de módulos. Empieza en pesos chilenos, crece a donde quieras.</p>
          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0B5CFF] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  <Sparkles size={12} /> Plan único
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black">US${PRICE_MONTHLY}</span>
                  <span className="text-slate-400 font-medium mb-1.5">/mes</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">por academia, sin importar el número de jugadores</p>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-bold text-emerald-700">Paga el año completo y ahorra 30%</p>
                  <p className="text-xs text-emerald-600/80 mt-1">
                    US${PRICE_ANNUAL}/año — equivale a US${(PRICE_ANNUAL / 12).toFixed(1)}/mes
                  </p>
                </div>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <MessageCircle size={16} /> Solicitar acceso por WhatsApp
                </a>
                <p className="text-xs text-slate-400 text-center mt-3">Sin permanencia mínima · Cancela cuando quieras</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Qué incluye la mensualidad</p>
                <ul className="space-y-2.5">
                  {PLAN_INCLUDES.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="bg-white text-slate-900">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Preguntas frecuentes</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Todo lo que quieres saber antes de empezar</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <details key={faq.q} className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-blue-200 open:bg-blue-50/40 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-slate-500 mb-3">¿Tienes otra pregunta?</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle size={16} /> Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-24">
          <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-3xl p-8 md:p-12 text-white grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-lg font-medium leading-relaxed mb-4">
                &ldquo;Espacio reservado para el testimonio real de una academia que ya usa Metrikas.&rdquo;
              </p>
              <p className="text-sm text-blue-200/70">— Nombre, cargo, academia (pendiente)</p>
            </div>
            <PlaceholderImage aspect="4/3" label="Foto real del entrenador/academia para el testimonio — recomendado 800×600px" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contacto" className="bg-[#05122F] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">¿Listo para profesionalizar tu academia?</h2>
          <p className="text-blue-100/70 mb-8 max-w-lg mx-auto">
            Escríbenos y activamos tu academia en Metrikas. Sin compromisos largos, cancela cuando quieras.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/30"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="mailto:alexanderestradaconsuegra@gmail.com?subject=Quiero%20usar%20Metrikas%20en%20mi%20academia"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-all"
            >
              Escribir por correo <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05122F] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold">Metrikas</span>
          </div>
          <p className="text-xs text-blue-100/40">© {new Date().getFullYear()} Metrikas · Gestión deportiva</p>
          <div className="flex items-center gap-4 text-xs text-blue-100/50">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
