"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import InteractivePitchBuilder from "@/components/landing/InteractivePitchBuilder"
import DemoRequestModal from "@/components/landing/DemoRequestModal"

const WHATSAPP_URL = "https://wa.me/56992103974?text=" + encodeURIComponent("Hola, quiero información sobre Metrikas para mi academia")

export default function HeroImpactante() {
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  return (
    <section className="relative overflow-hidden bg-[#05122F] text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071B4D] via-[#05122F] to-[#020818]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 relative z-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 lg:gap-16 items-center">
          <div>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-lime-400/20 backdrop-blur rounded-full px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-white/70 text-xs font-semibold tracking-wide">Para entrenadores y directores técnicos</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black leading-[1.1] mb-4 text-white">
              Dirige tu academia como un club profesional.
            </h1>

            <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Dedica más tiempo a formar jugadores y menos tiempo a la administración. Metrikas reúne convocatorias, tácticas, evaluaciones, asistencia, pagos, comunicación y métricas de rendimiento en una única plataforma.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="h-12 px-7 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold flex items-center gap-2 hover:bg-lime-300 transition-all shadow-lg shadow-lime-900/50"
              >
                🎁 Solicitar Demo <ArrowRight size={16} />
              </button>
              <Link
                href="/login"
                className="h-12 px-6 rounded-xl border border-white/15 text-white/80 text-sm font-semibold flex items-center hover:bg-white/5 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>

            <DemoRequestModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
          </div>

          <InteractivePitchBuilder />
        </div>
      </div>
    </section>
  )
}
