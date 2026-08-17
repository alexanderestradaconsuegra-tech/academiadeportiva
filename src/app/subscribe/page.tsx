"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import { CheckCircle2, Sparkles, ArrowRight, MessageCircle, LogIn } from "lucide-react"
import { MP_PRICES } from "@/lib/mercadopago"

const WHATSAPP_URL = "https://wa.me/56992103974?text=" + encodeURIComponent("Hola, necesito ayuda con el pago de Metrikas")

const PLAN_FEATURES = [
  "Jugadores y categorías ilimitadas",
  "Convocatoria con confirmación individual",
  "Evaluaciones físicas y gráficas de progreso",
  "Pagos y mensualidades automáticas",
  "Notificaciones push al celular",
  "Un acceso por categoría",
  "Reportes en PDF",
]

export default function SubscribePage() {
  const { teamSettings, isAuthenticated, authReady } = useApp()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null)
  const [error, setError] = useState("")

  const monthlyPrice = 14250 // ~$15 USD in CLP
  const annualPrice = 119700 // ~$126 USD in CLP
  const annualMonthly = (annualPrice / 12).toFixed(0)

  async function handleSubscribe(plan: "monthly" | "annual") {
    if (!teamSettings?.id) {
      setError("Debes iniciar sesión primero para suscribirte.")
      return
    }
    setLoading(plan)
    setError("")
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, academy_id: teamSettings.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? "Error al iniciar el pago. Intenta de nuevo.")
        setLoading(null)
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(null)
    }
  }

  const isBlocked = teamSettings?.subscription_status === "suspended" ||
    teamSettings?.subscription_status === "canceled"

  if (authReady && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05122F] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-400 mb-6 mx-auto">
            <LogIn size={28} className="text-[#05122F]" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Inicia sesión para suscribirte</h1>
          <p className="text-blue-100/60 text-sm mb-8">
            Necesitas una cuenta de Metrikas para completar el pago. Si aún no tienes una, escríbenos por WhatsApp.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full h-12 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold flex items-center justify-center gap-2 hover:bg-lime-600 transition-all"
            >
              Iniciar sesión <ArrowRight size={16} />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
            >
              <MessageCircle size={16} /> Crear cuenta por WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05122F] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-5">
            <span className="text-amber-300 text-xs font-bold">
              {isBlocked ? "Cuenta suspendida" : "Tu período de prueba terminó"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Elige tu plan para continuar
          </h1>
          <p className="text-blue-100/60 text-base max-w-md mx-auto">
            Todos los módulos incluidos. Sin límite de jugadores. Cancela cuando quieras.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {/* Monthly */}
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-7 flex flex-col">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Plan mensual</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-black text-white">${monthlyPrice.toLocaleString('es-CL')}</span>
              <span className="text-blue-100/50 mb-1.5">/mes</span>
            </div>
            <p className="text-blue-100/40 text-sm mb-6">por academia · acceso por 30 días</p>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null}
              className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "monthly" ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <ArrowRight size={16} />}
              Pagar con MercadoPago
            </button>
          </div>

          {/* Annual — recommended */}
          <div className="bg-lime-400 rounded-3xl p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold text-[#05122F]/70 uppercase tracking-widest">Plan anual</p>
                <span className="text-[10px] font-black bg-white text-lime-700 px-2 py-0.5 rounded-full">AHORRA 30%</span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-[#05122F]">${parseInt(annualMonthly).toLocaleString('es-CL')}</span>
                <span className="text-[#05122F]/70 mb-1.5">/mes</span>
              </div>
              <p className="text-[#05122F]/70 text-sm mb-1">${annualPrice.toLocaleString('es-CL')}/año · acceso por 12 meses</p>
              <p className="text-[#05122F]/60 text-xs mb-6">equivale a 2 meses gratis</p>
              <button
                onClick={() => handleSubscribe("annual")}
                disabled={loading !== null}
                className="w-full h-12 rounded-xl bg-white text-lime-700 text-sm font-bold hover:bg-lime-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "annual" ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Sparkles size={16} />}
                Pagar año completo
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 mb-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incluido en ambos planes</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {PLAN_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-blue-100/70">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 rounded-xl px-4 py-3 mb-4 flex flex-col gap-2">
            <p className="text-red-400 text-sm text-center">{error}</p>
            {!isAuthenticated && (
              <Link href="/login" className="text-xs text-center text-lime-400 font-bold underline">
                Ir al inicio de sesión →
              </Link>
            )}
          </div>
        )}

        {/* Help */}
        <div className="text-center">
          <p className="text-blue-100/40 text-xs mb-2">¿Tienes problemas con el pago?</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
          >
            <MessageCircle size={14} /> Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
