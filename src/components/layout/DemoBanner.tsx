"use client"

import Link from "next/link"
import { AlertCircle, X } from "lucide-react"
import { useState } from "react"

interface DemoBannerProps {
  daysLeft: number | null
}

export default function DemoBanner({ daysLeft }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!daysLeft || daysLeft === 0 || dismissed) return null

  const urgent = daysLeft <= 4

  return (
    <div className={`${
      urgent
        ? "bg-gradient-to-r from-red-500 to-orange-500"
        : "bg-gradient-to-r from-lime-400 to-lime-300"
    } text-${urgent ? "white" : "[#05122F]"} px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center gap-3 max-w-3xl mx-auto flex-1">
        <AlertCircle size={18} className="shrink-0" />
        <div className="text-sm font-semibold">
          {urgent ? (
            <>
              ⚠️ <span className="ml-1">Tu demo vence en {daysLeft} {daysLeft === 1 ? "día" : "días"}</span>
            </>
          ) : (
            <>
              🎁 <span className="ml-1">Acceso de demo — {daysLeft} {daysLeft === 1 ? "día" : "días"} restantes</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/subscribe"
          className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
            urgent
              ? "bg-white text-red-600 hover:bg-red-50"
              : "bg-white/20 hover:bg-white/30 text-inherit"
          }`}
        >
          {urgent ? "Suscribir ahora" : "Ver planes"}
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`p-1 hover:opacity-70 transition-opacity`}
          title="Descartar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
