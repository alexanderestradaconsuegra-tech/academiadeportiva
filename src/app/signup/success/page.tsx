"use client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"

const WHATSAPP_URL = "https://wa.me/56992103974?text=" + encodeURIComponent("Hola, pagué mi suscripción a Metrikas y no me ha llegado el correo con mis datos de acceso")

export default function SignupSuccessPage() {
  const params = useSearchParams()
  const isAnnual = params.get("plan") === "annual"

  return (
    <div className="min-h-screen bg-[#05122F] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">¡Pago recibido!</h1>
        <p className="text-blue-100/60 text-base mb-2">
          {isAnnual
            ? "Tu academia tiene acceso por los próximos 12 meses."
            : "Tu academia tiene acceso por los próximos 30 días."}
        </p>
        <p className="text-blue-100/70 text-base mb-8">
          Te enviamos un correo con tu usuario y contraseña para entrar — puede tardar uno o dos minutos en llegar mientras confirmamos el pago.
        </p>

        <Link
          href="/login"
          className="inline-block bg-lime-400 text-[#05122F] px-6 py-3 rounded-xl font-bold text-sm hover:bg-lime-500 transition-colors mb-4"
        >
          Ya tengo mis datos — Iniciar sesión
        </Link>

        <p className="text-blue-100/40 text-xs mt-6">
          ¿No te llegó el correo después de unos minutos? Revisa spam, o
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-lime-400 hover:text-lime-300 font-semibold transition-colors mt-1"
        >
          <MessageCircle size={14} /> escríbenos por WhatsApp
        </a>
      </div>
    </div>
  )
}
