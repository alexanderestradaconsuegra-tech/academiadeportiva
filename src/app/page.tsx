"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { Trophy, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { login, isAuthenticated, teamSettings } = useApp()
  const teamName = teamSettings?.name || "FutbolMetrics"
  const router = useRouter()
  const [email, setEmail] = useState("entrenador@futbolmetrics.com")
  const [password, setPassword] = useState("coach2024")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard")
  }, [isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const ok = login(email, password)
    if (ok) {
      router.push("/dashboard")
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#071B4D] via-[#0B2E8A] to-[#0B5CFF] relative overflow-hidden flex-col justify-between p-12">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Floating shapes */}
        <div className="absolute top-1/4 right-20 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-1/3 left-10 w-60 h-60 rounded-full bg-blue-400/10 blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center overflow-hidden shrink-0">
            {teamSettings?.logo_url ? (
              <img src={teamSettings.logo_url} alt={teamName} className="w-full h-full object-cover" />
            ) : (
              <Trophy className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">{teamName}</span>
            <p className="text-blue-200/60 text-xs font-medium">{teamSettings?.description || "Academia Deportiva"}</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-white/80 text-xs font-medium">Sistema Premium para Entrenadores</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
            Lleva el rendimiento<br />
            <span className="text-blue-200">al siguiente nivel.</span>
          </h1>
          <p className="text-blue-100/70 text-base max-w-sm leading-relaxed">
            Monitorea el progreso de tus jugadores, registra actividades y visualiza la evolución con métricas de alto rendimiento.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["Métricas en tiempo real", "Gráficos avanzados", "Reportes detallados", "Supabase Ready"].map(f => (
              <span key={f} className="bg-white/10 backdrop-blur text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { value: "6+", label: "Jugadores" },
            { value: "14+", label: "Actividades" },
            { value: "6", label: "Evaluaciones" },
          ].map(s => (
            <div key={s.label} className="bg-white/8 backdrop-blur rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-blue-200/60 text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F7FB]">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#0B5CFF] flex items-center justify-center shadow-md shadow-blue-200 overflow-hidden shrink-0">
              {teamSettings?.logo_url ? (
                <img src={teamSettings.logo_url} alt={teamName} className="w-full h-full object-cover" />
              ) : (
                <Trophy className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-slate-900">{teamName}</span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de vuelta</h2>
              <p className="text-slate-500 text-sm mt-1">Accede a tu panel de entrenador</p>
            </div>

            {/* Hint */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#0B5CFF] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <strong className="text-[#0B5CFF]">Demo:</strong> Los campos ya están precargados. Solo presiona Ingresar.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full h-11 bg-[#0B5CFF] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ingresando...
                  </>
                ) : "Ingresar al panel"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2024 {teamName} · Sistema para academias de fútbol
          </p>
        </div>
      </div>
    </div>
  )
}
