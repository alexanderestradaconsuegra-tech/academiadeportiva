"use client"
import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import { Trophy, MessageCircle, KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

const WHATSAPP_NUMBER = "56992103974"
const WHATSAPP_MSG = encodeURIComponent("Hola, quiero activar mi academia en Metrikas. Mi prueba de 7 días terminó.")
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`

export default function ExpiredPage() {
  const { activateWithCode, teamSettings } = useApp()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const err = await activateWithCode(code)
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess(true)
    setTimeout(() => router.replace("/dashboard"), 1800)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/40">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2">¡Academia activada!</h1>
          <p className="text-blue-200/80">Redirigiendo al panel…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Trophy size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Tu prueba de 7 días terminó</h1>
          <p className="text-slate-500 text-sm">
            {teamSettings?.name ? `${teamSettings.name} · ` : ""}Tu período de prueba gratuita ha concluido.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* CTA WhatsApp */}
          <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] p-6 text-white text-center">
            <p className="text-sm text-blue-200/80 mb-3">
              Escríbenos y te enviamos el código de activación
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/30"
            >
              <MessageCircle size={18} /> Contactar por WhatsApp
            </a>
          </div>

          {/* Code input */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={16} className="text-[#0B5CFF]" />
              <p className="text-sm font-semibold text-slate-700">¿Ya tienes tu código? Ingrésalo aquí</p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full h-14 rounded-xl border-2 border-slate-200 text-center text-2xl font-black tracking-[0.5em] text-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full h-12 bg-[#0B5CFF] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verificando…</> : "Activar academia →"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Todos los datos que creaste durante la prueba se conservan.
        </p>
      </div>
    </div>
  )
}
