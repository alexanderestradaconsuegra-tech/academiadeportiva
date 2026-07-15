"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { Trophy, Building2, User, AlertCircle } from "lucide-react"
import type { Language } from "@/lib/types"

const LANG_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
]

export default function OnboardingPage() {
  const { createAcademy, logout } = useApp()
  const router = useRouter()
  const [academyName, setAcademyName] = useState("")
  const [coachName, setCoachName] = useState("")
  const [language, setLanguage] = useState<Language>("es")

  // Pre-fill from the register form if user came through that flow
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pendingAcademy")
      if (pending) {
        const { academyName: a, fullName: f, language: l } = JSON.parse(pending)
        if (a) setAcademyName(a)
        if (f) setCoachName(f)
        if (l) setLanguage(l)
        sessionStorage.removeItem("pendingAcademy")
      }
    } catch { /* ignore */ }
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const err = await createAcademy(academyName.trim(), language, coachName.trim())
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.replace("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071B4D] via-[#0B2E8A] to-[#0B5CFF] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur mx-auto flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">¡Bienvenido!</h1>
          <p className="text-blue-200/80 text-sm">Configura tu academia para comenzar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Academy name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                Nombre de la academia
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={academyName} onChange={e => setAcademyName(e.target.value)}
                  required placeholder="Academia Fútbol FC"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Coach name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                Tu nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={coachName} onChange={e => setCoachName(e.target.value)}
                  required placeholder="Juan García"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                Idioma de la app
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANG_OPTIONS.map(l => (
                  <button
                    key={l.value} type="button"
                    onClick={() => setLanguage(l.value)}
                    className={`h-11 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${language === l.value ? "border-[#0B5CFF] bg-blue-50 text-[#0B5CFF]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} />{error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full h-12 bg-[#0B5CFF] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creando tu academia...</>
              ) : "Crear academia y comenzar →"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
