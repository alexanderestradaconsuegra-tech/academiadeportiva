"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { Lock, Mail, AlertCircle, User, Building2, KeyRound } from "lucide-react"
import { LoginBackground, GlassCard, GlowTitle, GlassInput, GlassPasswordInput, GlassButton } from "@/components/ui/login-glass"
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
  const [activationCode, setActivationCode] = useState("")
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

    // Use admin-side endpoint to create account + academy
    try {
      const res = await fetch("/api/auth/create-academy-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          academyName,
          coachName: fullName,
          language,
          activationCode: activationCode.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta")
        setLoading(false)
        return
      }

      // Now login to trigger auth state update
      const loginError = await login(email, password)
      if (loginError) {
        setError(loginError)
        setLoading(false)
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  const errorBox = error && (
    <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-2.5 text-sm text-red-100">
      <AlertCircle size={15} className="shrink-0" />{error}
    </div>
  )

  return (
    <div className="relative isolate min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-10 bg-[#05122F]">
      <LoginBackground src="/login-cancha.webp" />

      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 flex justify-center">
          <img src="/logo-metrikas-login.webp" alt="Metrikas" width="520" height="83" className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]" />
        </div>

        <GlassCard>
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1" role="tablist">
            {(["login", "register"] as const).map(t2 => (
              <button
                key={t2}
                role="tab"
                aria-selected={tab === t2}
                onClick={() => { setTab(t2); setError("") }}
                className={`h-10 flex-1 rounded-lg text-sm font-semibold transition-all ${tab === t2 ? "bg-white text-[#05122F] shadow" : "text-white/70 hover:text-white"}`}
              >
                {t2 === "login" ? "Iniciar sesión" : "Crear academia"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <>
              <GlowTitle subtitle={t("accessPanel")}>{t("welcomeBack")}</GlowTitle>
              <form onSubmit={handleLogin} className="space-y-4">
                <GlassInput label={t("email")} icon={<Mail size={18} />} type="email" autoComplete="email" inputMode="email"
                  value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@correo.com" />
                <GlassPasswordInput label={t("password")} icon={<Lock size={18} />} autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                <div className="flex justify-end">
                  <a href="/forgot-password" className="text-sm text-white/75 transition-colors hover:text-lime-300">¿Olvidaste tu contraseña?</a>
                </div>
                {errorBox}
                <GlassButton type="submit" loading={loading} loadingText={t("signingIn")}>{t("signIn")}</GlassButton>
              </form>
              <p className="mt-6 text-center text-sm text-white/70">
                ¿Aún no tienes cuenta?{" "}
                <button type="button" onClick={() => { setTab("register"); setError("") }} className="font-semibold text-white transition-colors hover:text-lime-300">Crear academia</button>
              </p>
            </>
          ) : (
            <>
              <GlowTitle subtitle="Configura tu espacio en segundos">Crea tu academia</GlowTitle>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <GlassInput label="Código de activación" icon={<KeyRound size={18} />} type="text" className="font-mono tracking-wider"
                    value={activationCode} onChange={e => setActivationCode(e.target.value.trim())} required placeholder="Te lo envía Metrikas" />
                  <p className="mt-1.5 text-xs text-white/60">¿No tienes código? <a href="https://wa.me/56992103974" target="_blank" rel="noopener noreferrer" className="font-semibold text-lime-300 hover:underline">Escríbenos por WhatsApp</a></p>
                </div>
                <GlassInput label="Nombre de la academia" icon={<Building2 size={18} />} type="text" autoComplete="organization"
                  value={academyName} onChange={e => setAcademyName(e.target.value)} required placeholder="Academia FC" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                  <GlassInput label="Tu nombre" icon={<User size={18} />} type="text" autoComplete="name"
                    value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Juan García" />
                  <div>
                    <label htmlFor="reg-language" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/70">Idioma</label>
                    <select id="reg-language" value={language} onChange={e => setLanguage(e.target.value as Language)}
                      className="h-12 w-full cursor-pointer rounded-xl border border-white/15 bg-white/[0.07] px-3 text-[15px] text-white outline-none focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/25">
                      {LANG_OPTIONS.map(l => <option key={l.value} value={l.value} className="text-slate-900">{l.label}</option>)}
                    </select>
                  </div>
                </div>
                <GlassInput label={t("email")} icon={<Mail size={18} />} type="email" autoComplete="email" inputMode="email"
                  value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@correo.com" />
                <GlassPasswordInput label={t("password")} icon={<Lock size={18} />} autoComplete="new-password" minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" />
                {errorBox}
                <GlassButton type="submit" loading={loading} loadingText="Creando academia...">Crear mi academia</GlassButton>
              </form>
            </>
          )}
        </GlassCard>

        <p className="mt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Metrikas · {t("footer")}
        </p>
      </div>
    </div>
  )
}
