"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
]

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get("plan") as "monthly" | "annual" | null

  const [academyName, setAcademyName] = useState("")
  const [coachName, setCoachName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [language, setLanguage] = useState<"es" | "en" | "pt">("es")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!academyName.trim() || !coachName.trim() || !email.trim() || !password) {
      setError("Completa todos los campos.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.session) {
      setError("Revisa tu correo para confirmar tu cuenta y luego inicia sesión.")
      setLoading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcError } = await (supabase as any).rpc("create_academy_free", {
      p_name: academyName.trim(),
      p_coach_name: coachName.trim(),
      p_language: language,
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }

    if (plan === "monthly" || plan === "annual") {
      window.location.href = "/subscribe"
    } else {
      window.location.href = "/dashboard"
    }
  }

  const planLabel = plan === "annual"
    ? "Plan Anual — US$126/año (ahorra 30%)"
    : plan === "monthly"
    ? "Plan Mensual — US$15/mes"
    : "7 días gratis · sin tarjeta · sin contrato"

  return (
    <div className="min-h-screen bg-[#05122F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-metrikas.png" alt="Metrikas" className="h-20 w-auto mx-auto object-contain mb-4" />
          <h1 className="text-2xl font-black text-white">
            {plan ? "Crea tu cuenta para continuar" : "Crea tu academia gratis"}
          </h1>
          <p className="text-blue-100/50 text-sm mt-1">{planLabel}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-blue-100/60 mb-1.5">Nombre de tu academia</label>
            <input
              type="text"
              value={academyName}
              onChange={e => setAcademyName(e.target.value)}
              placeholder="Ej. Academia Deportiva FC"
              className="w-full h-12 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 px-4 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-100/60 mb-1.5">Tu nombre completo</label>
            <input
              type="text"
              value={coachName}
              onChange={e => setCoachName(e.target.value)}
              placeholder="Carlos García"
              className="w-full h-12 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 px-4 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-100/60 mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full h-12 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 px-4 text-sm focus:outline-none focus:border-blue-400 transition-colors"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-100/60 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full h-12 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 px-4 text-sm focus:outline-none focus:border-blue-400 transition-colors"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-100/60 mb-1.5">Idioma de la app</label>
            <div className="flex gap-2">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code as "es" | "en" | "pt")}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold border transition-all ${
                    language === l.code
                      ? "bg-[#0B5CFF] border-[#0B5CFF] text-white"
                      : "bg-white/[0.07] border-white/15 text-white/60 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creando academia…
              </>
            ) : plan ? "Crear cuenta y pagar →" : "Crear academia gratis →"}
          </button>
        </form>

        <p className="text-center text-xs text-blue-100/40 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Iniciar sesión
          </Link>
        </p>

        {!plan && (
          <p className="text-center text-xs text-blue-100/25 mt-3">
            Sin tarjeta · Sin contrato · Cancela cuando quieras
          </p>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
