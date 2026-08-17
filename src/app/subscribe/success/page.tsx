"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

export default function SubscribeSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get("plan")
  const isAnnual = plan === "annual"
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    const r = setTimeout(() => router.replace("/dashboard"), 5000)
    return () => { clearInterval(t); clearTimeout(r) }
  }, [router])

  return (
    <div className="min-h-screen bg-[#05122F] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">¡Pago recibido!</h1>
        <p className="text-blue-100/60 text-base mb-2">
          {isAnnual
            ? "Tu academia tiene acceso por los próximos 12 meses."
            : "Tu academia tiene acceso por los próximos 30 días."}
        </p>
        <p className="text-blue-100/30 text-sm mb-8">
          {isAnnual
            ? "Recibirás un aviso 30 días antes de que venza el año."
            : "Recuerda renovar antes del próximo mes para no perder el acceso."}
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-blue-100/50">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Redirigiendo al panel en {countdown}s…
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.replace("/dashboard")}
            className="text-sm text-lime-400 hover:text-lime-300 font-semibold transition-colors"
          >
            Ir al panel ahora →
          </button>
        </div>
      </div>
    </div>
  )
}
