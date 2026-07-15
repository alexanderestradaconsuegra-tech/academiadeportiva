"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { Trophy, Eye, EyeOff, Lock, Mail, AlertCircle, User, Building2 } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { login as loginDict } from "@/lib/i18n/dictionaries/login"
import type { Language } from "@/lib/types"

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
]

export default function LoginPage() {
  const { login, isAuthenticated, isOnboarding, authReady } = useApp()
  const router = useRouter()
  const t = useT(loginDict)

  const [tab, setTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [academyName, setAcademyName] = useState("")
  const [language, setLanguage] = useState<Language>("es")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authReady) return
    if (isAuthenticated && !isOnboarding) router.replace("/dashboard")
    if (isAuthenticated && isOnboarding) router.replace("/onboarding")
  }, [authReady, isAuthenticated, isOnboarding, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const loginError = await login(email, password)
    if (loginError) {
      setError(loginError)
      setLoading(false)
    }
    // success: useEffect handles redirect
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    // Use Supabase's built-in signUp — no admin endpoint needed
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      // Generic message — never expose internal Supabase errors to UI
      setError("No se pudo crear la cuenta. Verifica los datos e intenta de nuevo.")
      setLoading(false)
      return
    }
    // After signUp the user is authenticated; createAcademy will be called from /onboarding
    // Store pending setup data so onboarding page can pre-fill it
    sessionStorage.setItem("pendingAcademy", JSON.stringify({ academyName, fullName, language }))
    const loginError = await login(email, password)
    if (loginError) {
      setError(loginError)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#071B4D] via-[#0B2E8A] to-[#0B5CFF] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 right-20 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-1/3 left-10 w-60 h-60 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">FutbolMetrics</span>
            <p className="text-blue-200/60 text-xs font-medium">Gestión de academias deportivas</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-white/80 text-xs font-medium">{t("premiumBadge")}</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
            {t("heroTitle1")}<br />
            <span className="text-blue-200">{t("heroTitle2")}</span>
          </h1>
          <p className="text-blue-100/70 text-base max-w-sm leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap gap-2 mt-8">
            {[t("featureRealtime"), t("featureCharts"), t("featureReports"), t("featureSupabase")].map(f => (
              <span key={f} className="bg-white/10 backdrop-blur text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { value: "∞", label: "Academias" },
            { value: "Multi", label: "Idiomas" },
            { value: "100%", label: "Seguro" },
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
            <div className="w-10 h-10 rounded-xl bg-[#0B5CFF] flex items-center justify-center shadow-md shadow-blue-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">FutbolMetrics</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 dark:border-slate-800">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-7 gap-1">
              {(["login", "register"] as const).map(t2 => (
                <button
                  key={t2}
                  onClick={() => { setTab(t2); setError("") }}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${tab === t2 ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {t2 === "login" ? t("welcomeBack") : "Crear academia"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("welcomeBack")}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t("accessPanel")}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">{t("email")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">{t("password")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                        className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2.5">
                      <AlertCircle size={14} />{error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full h-11 bg-[#0B5CFF] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t("signingIn")}</>
                    ) : t("signIn")}
                  </button>
                  <div className="text-center">
                    <a href="/forgot-password" className="text-xs text-slate-400 hover:text-[#0B5CFF] transition-colors">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Crear tu academia</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Configura tu espacio en segundos</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">Nombre de la academia</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={academyName} onChange={e => setAcademyName(e.target.value)} required placeholder="Academia FC"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">Tu nombre</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Juan García"
                          className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">Idioma</label>
                      <select value={language} onChange={e => setLanguage(e.target.value as Language)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer">
                        {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">{t("email")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">{t("password")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                        className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2.5">
                      <AlertCircle size={14} />{error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full h-11 bg-[#0B5CFF] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creando academia...</>
                    ) : "Crear mi academia"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            © 2024 FutbolMetrics · {t("footer")}
          </p>
        </div>
      </div>
    </div>
  )
}
