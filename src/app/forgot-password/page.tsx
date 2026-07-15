"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trophy, Mail, AlertCircle, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError("No se pudo enviar el correo. Verifica el email e intenta de nuevo.")
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071B4D] via-[#0B2E8A] to-[#0B5CFF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur mx-auto flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">FutbolMetrics</h1>
          <p className="text-blue-200/70 text-sm">Recuperar contraseña</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Correo enviado</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Revisa tu bandeja de entrada. El enlace expira en 1 hora.
              </p>
              <button
                onClick={() => router.push("/")}
                className="text-sm text-[#0B5CFF] hover:underline font-medium"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">¿Olvidaste tu contraseña?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Escribe tu email y te enviamos un enlace para restablecerla.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      required placeholder="tu@email.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} />{error}
                  </div>
                )}
                <button
                  type="submit" disabled={loading}
                  className="w-full h-11 bg-[#0B5CFF] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Enviando...</>
                  ) : "Enviar enlace"}
                </button>
              </form>
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                <button onClick={() => router.push("/")} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
