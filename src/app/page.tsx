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
  title: "Metrikas — La app de gestión para academias de fútbol",
  description: "Convocatorias con confirmación, pagos automáticos, evaluaciones físicas y comunicación con jugadores — todo desde tu celular. Sin Excel ni grupos de WhatsApp.",
}

const WHATSAPP_NUMBER = "56992103974"
const WHATSAPP_MSG = encodeURIComponent("Hola, quiero información sobre Metrikas para mi academia")
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`

const PRICE_MONTHLY = 15
const PRICE_ANNUAL = Math.round(PRICE_MONTHLY * 12 * 0.7)

const PLAN_INCLUDES = [
  "Jugadores y categorías ilimitadas — sin costo extra por crecer",
  "Convocatoria con confirmación individual y formaciones (11, 8, 7 y 5)",
  "Evaluaciones físicas con gráficas de evolución mes a mes",
  "Calendario de entrenamientos con asistencia y RSVP del jugador",
  "Pagos y mensualidades generados automáticamente cada mes",
  "Salud, biometría, lesiones y pruebas físicas completas",
  "Notificaciones push directo al celular del jugador o acudiente",
  "Un acceso por categoría — cada profesor ve solo lo suyo",
  "Reportes en PDF y comparativa de jugadores lado a lado",
  "Disponible en español, inglés y portugués",
]

const FAQS = [
  { q: "¿Cuánto cuesta Metrikas?", a: `US$${PRICE_MONTHLY} al mes por academia, sin importar cuántos jugadores tengas. Si pagas el año completo ahorras 30%: US$${PRICE_ANNUAL}/año (US$${(PRICE_ANNUAL / 12).toFixed(1)}/mes). Es menos de lo que cuesta alquilar una cancha una hora.` },
  { q: "¿Hay contrato o permanencia mínima?", a: "No. Sin instalación, sin contratos largos, sin letra chica. Cancelas cuando quieras y mantienes el acceso hasta el fin del período ya pagado." },
  { q: "¿Cuánto tiempo tarda en funcionar?", a: "Menos de 20 minutos. Te damos un código de activación, creas tu academia, agregas jugadores y ya tienes la primera convocatoria lista. Sin configuraciones complicadas." },
  { q: "¿Funciona en cualquier país?", a: "Sí. Metrikas está disponible en español, inglés y portugués y funciona igual en Chile, Colombia, México, Estados Unidos o donde estés." },
  { q: "¿Qué tan seguros están los datos de mis jugadores?", a: "Cada academia tiene sus datos completamente aislados — ninguna otra academia puede verlos ni acceder a ellos, ni siquiera técnicamente. Las contraseñas van cifradas y nunca las vemos." },
  { q: "¿Puedo tener un acceso por categoría?", a: "Sí. Cada profesor entra con su propia cuenta y solo ve su categoría — no los pagos, no la configuración, no las otras categorías. Tú mantienes el control total." },
  { q: "¿Qué pasa si un mes no puedo pagar?", a: "Tu academia se suspende temporalmente, pero tus datos no se borran. En cuanto pagas, todo vuelve exactamente como lo dejaste." },
]


const FEATURES = [
  { icon: Users, title: "Jugadores y categorías", desc: "Un perfil completo por jugador que los padres pueden consultar desde su celular, sin que tengas que enviarles nada." },
  { icon: Trophy, title: "Partidos y convocatoria", desc: "Arma la nómina, elige la formación (11, 8, 7 o 5) y notifica al equipo. Cada jugador confirma desde su teléfono." },
  { icon: BarChart3, title: "Evaluaciones y progreso", desc: "Velocidad, fuerza, técnica, resistencia. Una gráfica real que muestra cómo crece cada jugador mes a mes." },
  { icon: CalendarDays, title: "Entrenamientos y asistencia", desc: "Publica el calendario y recibe confirmación de cada jugador. Sabes quién va a venir antes de llegar al campo." },
  { icon: Heart, title: "Salud y biometría", desc: "Lesiones, ritmo cardíaco, pruebas físicas y sesiones en vivo. Todo en un solo lugar para decisiones más seguras." },
  { icon: CreditCard, title: "Pagos automáticos", desc: "Las cuotas mensuales se generan solas. En un vistazo ves quién está al día y quién debe — sin hojas de cálculo." },
  { icon: Bell, title: "Notificaciones push", desc: "El jugador recibe convocatoria, recordatorio de entrenamiento o aviso de pago directo en su celular." },
  { icon: UserCog, title: "Un acceso por categoría", desc: "Cada profesor entra con su cuenta y ve solo su categoría. Tú conservas el control completo de la academia." },
  { icon: Languages, title: "Español, inglés y portugués", desc: "Cambia el idioma desde la configuración. Ideal para academias con jugadores o familias extranjeras." },
]

const ROLES = [
  { title: "Dueño / Entrenador principal", desc: "Controla todo: categorías, pagos, suscripción y quién tiene acceso. Nadie ve más de lo que tú permites.", icon: ShieldCheck },
  { title: "Profesor de categoría", desc: "Entra con su propia cuenta y gestiona solo su categoría — jugadores, partidos y entrenos. Sin acceso a pagos ni a otras categorías.", icon: UserCog },
  { title: "Jugador / Acudiente", desc: "Ve su ficha, su progreso, su convocatoria y confirma asistencia desde su celular. Sin descargar nada extra.", icon: Smartphone },
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
          <div className="flex items-center -ml-4">
            <img src="/logo-metrikas.png" alt="Metrikas" className="h-32 w-auto max-w-[260px] object-contain object-left mt-5 md:mt-0" />
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
              className="h-9 px-4 rounded-xl bg-white text-[#071B4D] text-sm font-semibold flex items-center whitespace-nowrap hover:bg-blue-50 transition-colors"
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background depth layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071B4D] via-[#05122F] to-[#020818]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 relative z-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 lg:gap-16 items-center">
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 backdrop-blur rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs font-semibold tracking-wide">Para entrenadores y directores técnicos</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl xl:text-[3.6rem] font-black leading-[1.08] mb-6">
                <span className="text-white">Las academias que forman </span>
                <span className="text-cyan-300">campeones</span>
                <br />
                <span className="text-white">miden cada jugador.</span>
                <br />
                <span className="text-white/45 text-3xl md:text-4xl xl:text-5xl">¿La tuya lo hace?</span>
              </h1>

              <p className="text-blue-100/60 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Convocatoria con confirmación, pagos automáticos, evaluaciones físicas y comunicación con jugadores — todo desde tu celular.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/register"
                  className="h-12 px-7 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/50"
                >
                  Probar gratis 7 días <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="h-12 px-6 rounded-xl border border-white/15 text-white/80 text-sm font-semibold flex items-center hover:bg-white/5 transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2">
                {["Sin contrato ni permanencia", "Funciona en cualquier celular", "Desde US$15/mes"].map(t => (
                  <span key={t} className="text-xs text-white/40 bg-white/5 border border-white/8 rounded-full px-3 py-1 font-medium">{t}</span>
                ))}
              </div>
            </div>

            <InteractivePitchBuilder />
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mt-14 pt-10 border-t border-white/8">
            {[
              { value: "+200", label: "Jugadores activos" },
              { value: "3", label: "Idiomas disponibles" },
              { value: "100%", label: "Datos seguros" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-blue-100/40 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="bg-white text-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">El antes y el después</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">¿Te suena familiar alguno de estos problemas?</h2>
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
                  "Mandas la convocatoria al grupo de WhatsApp y nunca sabes quién va a venir",
                  "Los pagos los llevas en Excel o en un cuaderno — y siempre hay deudas perdidas",
                  "No tienes cómo demostrarle al padre que su hijo mejoró",
                  "Todos los profesores usan la misma contraseña y ven lo que no deben",
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
                  "Cada jugador confirma su asistencia y recibe un aviso en el celular",
                  "Las cuotas se generan solas — en un vistazo ves quién debe y quién está al día",
                  "Gráficas de evolución que los padres entienden a primera vista",
                  "Cada profesor tiene su propio acceso y solo ve su categoría",
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
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Un sistema completo, no diez herramientas parcheadas</h2>
            <p className="text-slate-500 mt-3 text-base">Cada módulo diseñado para el día a día de una academia — no para una empresa.</p>
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
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-slate-900 overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Ficha del jugador</p>
              <h2 className="text-3xl md:text-5xl font-black leading-[1.05] mb-4 text-slate-900">
                Estadísticas <span className="text-[#0B5CFF]">estilo videojuego</span> con datos reales
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Cada evaluación genera una ficha con 6 atributos, un rating general y una insignia de nivel. El jugador
                la ve en su celular. Los padres ven el crecimiento. La academia demuestra su trabajo.
              </p>
              <ul className="space-y-3">
                {[
                  "Velocidad, Fuerza, Técnica, Resistencia, Potencia y Agilidad",
                  "Rating general que sube con cada evaluación",
                  "Insignia PRO / TOP / ELITE según el nivel alcanzado",
                  "Efecto holográfico — pasa el mouse sobre la tarjeta",
                  "Descargable como imagen para compartir con los padres",
                ].map(label => (
                  <li key={label} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {label}
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
              Números concretos que los padres <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">ven a primera vista</span>
            </h2>
            <p className="text-blue-100/60 text-lg">Mes a mes. Sin hojas de cálculo. Sin interpretaciones.</p>
          </div>
          <ProgressShowcase />
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-[#0B5CFF] uppercase tracking-widest mb-3">Roles y accesos</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Cada persona ve solo lo que necesita</h2>
            <p className="text-slate-500 mt-3">Tú controlas quién accede a qué — sin contraseñas compartidas ni datos expuestos.</p>
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
      <section id="precios" className="bg-[#05122F] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Todo incluido. Sin sorpresas.</h2>
            <p className="text-blue-100/50 text-base">Sin límite de jugadores ni de módulos. Menos de lo que cuesta alquilar una cancha.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {/* Monthly */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur p-8 flex flex-col">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-5">Plan mensual</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-6xl font-black text-white">US${PRICE_MONTHLY}</span>
                <span className="text-white/40 text-lg mb-2">/mes</span>
              </div>
              <p className="text-white/30 text-sm mb-8">por academia · acceso por 30 días</p>
              <ul className="space-y-2 mb-8 flex-1">
                {PLAN_INCLUDES.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-white/60">
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=monthly"
                className="w-full h-12 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
              >
                Empezar mensual <ArrowRight size={15} />
              </Link>
            </div>

            {/* Annual — recommended */}
            <div className="rounded-3xl bg-[#0B5CFF] p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Plan anual</p>
                  <span className="text-[10px] font-black bg-white text-[#0B5CFF] px-2.5 py-0.5 rounded-full">AHORRA 30%</span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-6xl font-black text-white">US${(PRICE_ANNUAL / 12).toFixed(0)}</span>
                  <span className="text-blue-200/60 text-lg mb-2">/mes</span>
                </div>
                <p className="text-blue-200/60 text-sm mb-1">US${PRICE_ANNUAL}/año · equivale a 2 meses gratis</p>
                <p className="text-blue-300/50 text-xs mb-8">Acceso garantizado por 12 meses completos</p>
                <ul className="space-y-2 mb-8">
                  {PLAN_INCLUDES.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-blue-100/80">
                      <CheckCircle2 size={13} className="text-white mt-0.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?plan=annual"
                  className="w-full h-12 rounded-xl bg-white text-[#0B5CFF] text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/30"
                >
                  <Sparkles size={15} /> Empezar anual — el mejor valor
                </Link>
              </div>
            </div>
          </div>

          {/* Trial CTA */}
          <div className="text-center">
            <Link href="/register" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors font-medium">
              ¿No estás seguro? Prueba 7 días gratis primero — sin tarjeta <ArrowRight size={14} />
            </Link>
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
          <h2 className="text-3xl md:text-4xl font-black mb-4">Tu academia puede estar funcionando hoy.</h2>
          <p className="text-blue-100/70 mb-8 max-w-lg mx-auto">
            Escríbenos, te damos un código de activación y en menos de 20 minutos tienes tu primera convocatoria lista. Sin contrato ni tarjeta.
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
            <img src="/logo-metrikas.png" alt="Metrikas" className="h-36 w-auto max-w-[240px] object-contain" />
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
