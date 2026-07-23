import Link from "next/link"
import type { Metadata } from "next"
import {
  Trophy, Users, CalendarDays, CreditCard, Heart, Bell, Languages,
  ShieldCheck, CheckCircle2, ArrowRight, BarChart3,
  Video, UserCog, Star, Smartphone, MessageCircle, ChevronDown, Sparkles,
} from "lucide-react"
import FifaPlayerCard from "@/components/landing/FifaPlayerCard"
import InteractivePitchBuilder from "@/components/landing/InteractivePitchBuilder"
import ProgressShowcase from "@/components/landing/ProgressShowcase"
import FeatureShowcase from "@/components/landing/FeatureShowcase"

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


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05122F] text-white overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#05122F]/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-metrikas.png" alt="Metrikas" className="h-16 w-auto max-w-[200px] object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-blue-100/70">
            <a href="#caracteristicas" className="hover:text-white transition-colors">Características</a>
            <a href="#producto" className="hover:text-white transition-colors">Ejercicios</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#preguntas" className="hover:text-white transition-colors">Preguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 px-3.5 rounded-xl border border-white/15 text-white text-sm font-semibold items-center gap-1.5 hover:bg-white/5 transition-colors"
            >
              <svg viewBox="0 0 32 32" className="w-4 h-4" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.75A13.93 13.93 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.46 11.46 0 01-5.83-1.6l-.42-.25-4.45 1.04 1.06-4.33-.28-.45A11.5 11.5 0 1116 27.5zm6.3-8.6c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.37-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.42.52-.62.17-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.17-.78-1.88-1.07-2.57-.28-.68-.57-.59-.78-.6l-.66-.01c-.23 0-.6.09-.92.42-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.54c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.82.29-1.52.2-1.66-.08-.15-.31-.23-.66-.4z"/></svg>
              WhatsApp
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
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-xl shadow-emerald-900/40 flex items-center justify-center transition-all hover:scale-105"
        title="Escríbenos por WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.75A13.93 13.93 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.46 11.46 0 01-5.83-1.6l-.42-.25-4.45 1.04 1.06-4.33-.28-.45A11.5 11.5 0 1116 27.5zm6.3-8.6c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.37-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.42.52-.62.17-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.17-.78-1.88-1.07-2.57-.28-.68-.57-.59-.78-.6l-.66-.01c-.23 0-.6.09-.92.42-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.54c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.82.29-1.52.2-1.66-.08-.15-.31-.23-.66-.4z"/>
        </svg>
      </a>

      {/* Hero — with interactive pitch */}
      <section className="relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 relative z-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                  <span className="text-white/80 text-xs font-medium">Interactivo · pruébalo ahora →</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur rounded-full px-4 py-1.5">
                  <span className="text-emerald-300 text-xs font-bold">🎁 7 días gratis · sin tarjeta</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.05] mb-5">
                Arma tu equipo. <span className="bg-gradient-to-r from-[#0B5CFF] via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Mide el progreso.</span> Profesionaliza tu academia.
              </h1>
              <p className="text-blue-100/70 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Convocatoria con formaciones reales, evaluaciones físicas, biblioteca de ejercicios en video, pagos
                automáticos y comunicación con jugadores — todo desde una sola plataforma.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
                >
                  Probar gratis 7 días <ArrowRight size={16} />
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
            <InteractivePitchBuilder />
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="bg-white text-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">El antes y el después</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">¿Por qué las academias cambian a Metrikas?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sin Metrikas */}
            <div className="rounded-3xl border-2 border-red-100 bg-red-50/40 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 font-black text-sm">✕</span>
                </div>
                <p className="text-sm font-black text-red-500 uppercase tracking-widest">Sin Metrikas</p>
              </div>
              <ul className="space-y-4">
                {[
                  "Convocatorias por grupos de WhatsApp que nadie confirma",
                  "Hojas de Excel dispersas para pagos y asistencia",
                  "Sin forma clara de mostrar el progreso de un jugador",
                  "Un solo usuario compartido entre todos los profesores",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-200 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">✕</span>
                    <span className="text-slate-600 text-sm leading-snug">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Con Metrikas */}
            <div className="rounded-3xl border-2 border-[#0B5CFF]/20 bg-[#0B5CFF]/[0.04] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#0B5CFF]/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-8 h-8 rounded-full bg-[#0B5CFF] flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <p className="text-sm font-black text-[#0B5CFF] uppercase tracking-widest">Con Metrikas</p>
              </div>
              <ul className="space-y-4 relative">
                {[
                  "Convocatoria con confirmación individual y notificación push",
                  "Pagos y mensualidades generados y controlados automáticamente",
                  "Evaluaciones y gráficas que demuestran la evolución real",
                  "Un profesor por categoría, con su propio acceso controlado",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#0B5CFF] shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm leading-snug font-medium">{t}</span>
                  </li>
                ))}
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

      {/* Feature showcase */}
      <section id="producto" className="relative bg-slate-100 text-slate-900 overflow-hidden">
        <div className="absolute top-0 -left-60 w-[500px] h-[500px] bg-[#0B5CFF]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0B5CFF]/4 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-28 relative">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Todo en una sola plataforma</p>
            <h2 className="text-3xl md:text-5xl font-black leading-[1.05] text-slate-900">
              Cada módulo diseñado para <span className="bg-gradient-to-r from-[#0B5CFF] to-cyan-500 bg-clip-text text-transparent">simplificar tu trabajo.</span>
            </h2>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* Exercise videos — compact strip */}
      <section className="relative bg-[#050e2e] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 relative">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Biblioteca de ejercicios</p>
              <h2 className="text-2xl md:text-4xl font-black leading-tight mb-4">
                El deportista sabe <span className="text-amber-400">exactamente</span> cómo entrenar.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-7 max-w-lg">
                Cada ejercicio incluye un video guía para que el jugador vea la técnica correcta antes de ejecutar.
                Sprint, fuerza, pliometría, agilidad — todo documentado con su video y unidad de medida.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { emoji: "🎬", title: "Video por ejercicio", desc: "YouTube o Vimeo embebido. El jugador lo ve directo en su app." },
                  { emoji: "📊", title: "Registro de intentos", desc: "Guarda el resultado de cada serie. Compara sesión a sesión." },
                ].map(item => (
                  <div key={item.title} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4">
                    <p className="text-xl mb-2">{item.emoji}</p>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Video */}
            <div className="flex justify-center lg:justify-end shrink-0">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ width: 160, aspectRatio: "9/16" }}>
                <iframe
                  src="https://www.youtube.com/embed/AW6mpDDb12s"
                  title="Ejemplo — Sprint 40m"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIFA player card showcase */}
      <section className="relative bg-[#050a20] text-white overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3">Ficha del jugador</p>
              <h2 className="text-3xl md:text-5xl font-black leading-[1.05] mb-4">
                Estadísticas <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">estilo videojuego</span> con datos reales
              </h2>
              <p className="text-blue-100/70 text-lg leading-relaxed mb-6">
                Cada evaluación genera una ficha con 6 atributos, un rating general y una insignia de nivel. El jugador
                la ve en su celular. Los padres ven el crecimiento. La academia demuestra su trabajo.
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Velocidad, Fuerza, Técnica, Resistencia, Potencia y Agilidad" },
                  { label: "Rating general que sube con cada evaluación" },
                  { label: "Insignia PRO / TOP / ELITE según el nivel alcanzado" },
                  { label: "Efecto holográfico moderno — pasa el mouse sobre la tarjeta" },
                ].map(item => (
                  <li key={item.label} className="flex items-start gap-2.5 text-sm text-blue-100/80">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> {item.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <FifaPlayerCard />
            </div>
          </div>
        </div>
      </section>

      {/* Progress — colorful animated section */}
      <section className="relative bg-gradient-to-b from-[#050e2e] to-[#0a1745] text-white overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-3">Crecimiento medible</p>
            <h2 className="text-3xl md:text-5xl font-black leading-[1.05] mb-4">
              Demuestra el <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">progreso real</span> de cada deportista
            </h2>
            <p className="text-blue-100/60 text-lg">Números concretos, mes a mes. Nada que los padres puedan discutir.</p>
          </div>
          <ProgressShowcase />
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

      {/* Testimonios */}
      <section className="bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-24">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-2">Lo que dicen las academias</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Resultados reales en el campo</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Testimonio 1 */}
            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-100 flex flex-col gap-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={15} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 text-base leading-relaxed flex-1">
                &ldquo;Desde que usamos Metrikas podemos ver el progreso de cada jugador semana a semana. Antes llevábamos todo en papel y se nos perdía información clave. Ahora el cuerpo técnico tiene todo en el celular y tomamos mejores decisiones en los entrenamientos.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] flex items-center justify-center text-white font-black text-lg shrink-0">
                  L
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Director Técnico</p>
                  <p className="text-xs text-[#0B5CFF] font-semibold">Leones de Cartagena FC</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-100 flex flex-col gap-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={15} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 text-base leading-relaxed flex-1">
                &ldquo;Lo que más nos gustó fue que los mismos jugadores pueden ver su ficha y su convocatoria desde el teléfono. Eso genera más compromiso. En tres meses notamos una mejora real en la asistencia a entrenamientos y los chicos están más motivados.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center text-white font-black text-lg shrink-0">
                  D
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Entrenador Principal</p>
                  <p className="text-xs text-emerald-600 font-semibold">Dragones de Macul</p>
                </div>
              </div>
            </div>
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
          <div className="flex items-center">
            <img src="/logo-metrikas.png" alt="Metrikas" className="h-14 w-auto max-w-[180px] object-contain" />
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
