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
import ExerciseLibrary from "@/components/landing/ExerciseLibrary"

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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B5CFF] flex items-center justify-center shrink-0">
              <Trophy className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">Metrikas</span>
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

      {/* Hero — with interactive pitch */}
      <section className="relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, white 1px, transparent 1px), radial-gradient(circle at 85% 60%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 relative z-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                <span className="text-white/80 text-xs font-medium">Interactivo · pruébalo ahora →</span>
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
            <InteractivePitchBuilder />
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

      {/* Exercise library — the differentiator */}
      <section id="producto" className="relative bg-[#050e2e] text-white overflow-hidden">
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-3">Biblioteca de ejercicios</p>
            <h2 className="text-3xl md:text-5xl font-black leading-[1.05]">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-red-400 bg-clip-text text-transparent">Cada ejercicio</span> con su video, sus métricas y su técnica exacta
            </h2>
            <p className="text-blue-100/70 mt-4 text-lg">
              Sprints, pliometría, fuerza, técnica — el cuerpo técnico define cómo se hace y el deportista lo ve
              embebido en su app. Sin adivinar. Sin variantes. Como se practica en clubes profesionales.
            </p>
          </div>

          <ExerciseLibrary />

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <BarChart3 size={18} className="text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Datos históricos por ejercicio</p>
                <p className="text-xs text-blue-100/60 leading-relaxed">Cada intento queda registrado con valor, unidad e intensidad — el jugador ve su propia curva de mejora.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Video size={18} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Video embebido, no un enlace suelto</p>
                <p className="text-xs text-blue-100/60 leading-relaxed">El deportista abre el ejercicio y ve el video reproducido dentro de la app — ideal para reforzar técnica en casa.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center shrink-0">
                <UserCog size={18} className="text-fuchsia-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Biblioteca compartida por la academia</p>
                <p className="text-xs text-blue-100/60 leading-relaxed">El entrenador define los ejercicios una vez. Todos los profesores por categoría los usan sin duplicar trabajo.</p>
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
