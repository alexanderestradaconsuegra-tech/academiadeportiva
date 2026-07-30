"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

const WHATSAPP_URL = "https://wa.me/56992103974?text=" + encodeURIComponent("Hola, quiero información sobre Metrikas para mi academia")

export default function HeroImpactante() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const panels = containerRef.current.querySelectorAll("[data-panel]")
      panels.forEach((panel) => {
        const offset = (panel as HTMLElement).dataset.offset || "5"
        const moveX = (x - 0.5) * parseInt(offset)
        const moveY = (y - 0.5) * parseInt(offset)
        ;(panel as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-[#05122F]">
      {/* Stadium background with gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071B4D] via-[#05122F] to-[#020818]" />
        {/* Stadium lights effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center h-full py-20">
          {/* Left: Text */}
          <div className="flex flex-col justify-center z-20">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 backdrop-blur rounded-full px-4 py-1.5 mb-7 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-white/70 text-xs font-semibold tracking-wide">Datos que transforman</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[0.9] mb-6">
              <span className="text-white">MÉTRICAS QUE</span>
              <br />
              <span className="text-lime-400">TRANSFORMAN</span>
              <br />
              <span className="text-white">ACADEMIAS</span>
            </h1>

            <p className="text-blue-100/60 text-lg md:text-xl font-medium mb-8 max-w-lg">
              Planifica, analiza y potencia el rendimiento de tus jugadores con datos reales. Toma mejores decisiones. Forma mejores futbolistas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-7 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold flex items-center justify-center gap-2 hover:bg-lime-300 transition-all shadow-lg shadow-lime-900/50 w-fit"
              >
                Solicitar una demo <ArrowRight size={16} />
              </a>
              <Link
                href="/login"
                className="h-12 px-6 rounded-xl border border-white/15 text-white text-sm font-semibold flex items-center hover:bg-white/5 transition-colors w-fit"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Right: Player + Data Panels */}
          <div className="relative h-full flex items-center justify-center perspective">
            {/* Player Image */}
            <div className="relative z-10">
              <img
                src="/images/jugador-metrikas.png"
                alt="Jugador Metrikas"
                className="h-[600px] md:h-[700px] w-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Floating Data Panels */}
            {/* Rendimiento Panel - Top Right */}
            <div
              data-panel
              data-offset="15"
              className="absolute top-20 right-0 md:right-10 z-20 transition-transform duration-200 ease-out"
            >
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-5 w-64 shadow-2xl">
                <p className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-3">Rendimiento General</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/60">Físico</span>
                      <span className="text-xs font-bold text-white">85</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-lime-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/60">Técnico</span>
                      <span className="text-xs font-bold text-white">88</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[88%] h-full bg-lime-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/60">Táctico</span>
                      <span className="text-xs font-bold text-white">90</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-lime-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Índice Panel - Top Center-Right */}
            <div
              data-panel
              data-offset="10"
              className="absolute top-40 -right-20 md:right-32 z-20 transition-transform duration-200 ease-out"
            >
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 w-56 shadow-2xl text-center">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Índice General</p>
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#a3e635"
                      strokeWidth="8"
                      strokeDasharray="235"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <text x="60" y="65" textAnchor="middle" className="text-4xl font-black fill-white">
                      87
                    </text>
                  </svg>
                </div>
                <p className="text-xs text-white/60">Rating en aumento</p>
              </div>
            </div>

            {/* Ranking Panel - Bottom Left */}
            <div
              data-panel
              data-offset="12"
              className="absolute bottom-20 -left-10 md:left-20 z-20 transition-transform duration-200 ease-out"
            >
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-5 w-64 shadow-2xl">
                <p className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-4">Top Jugadores</p>
                <div className="space-y-2">
                  {[
                    { pos: 1, name: "Martín Vásquez", rating: 89 },
                    { pos: 2, name: "Thiago Herrera", rating: 87 },
                    { pos: 3, name: "Dylan Ramírez", rating: 82 },
                  ].map(p => (
                    <div key={p.pos} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-[10px]">
                          {p.pos}
                        </span>
                        <span className="text-white/70">{p.name}</span>
                      </div>
                      <span className="font-bold text-white">{p.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactical Analysis - Bottom Right */}
            <div
              data-panel
              data-offset="8"
              className="absolute bottom-10 right-10 md:right-20 z-20 transition-transform duration-200 ease-out"
            >
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-4 w-56 shadow-2xl">
                <p className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-3">Análisis Táctico</p>
                <div className="relative w-full aspect-square bg-white/5 rounded-lg border border-white/10 p-2">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Field outline */}
                    <rect x="15" y="15" width="170" height="170" fill="none" stroke="rgba(163, 230, 53, 0.2)" strokeWidth="2" />
                    {/* Center line */}
                    <line x1="100" y1="15" x2="100" y2="185" stroke="rgba(163, 230, 53, 0.15)" strokeWidth="1" />
                    {/* Formation 4-4-2 */}
                    {/* 4 Defensas (atrás) */}
                    {[40, 70, 130, 160].map((x, i) => (
                      <circle key={`def-${i}`} cx={x} cy={50} r="5" fill="#a3e635" opacity="0.9" />
                    ))}
                    {/* 4 Mediocampistas */}
                    {[40, 70, 130, 160].map((x, i) => (
                      <circle key={`mid-${i}`} cx={x} cy={100} r="5" fill="#a3e635" opacity="0.8" />
                    ))}
                    {/* 2 Delanteros (al frente) */}
                    {[70, 130].map((x, i) => (
                      <circle key={`fwd-${i}`} cx={x} cy={155} r="5" fill="#a3e635" opacity="0.9" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
