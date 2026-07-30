"use client"

import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

const WHATSAPP_URL = "https://wa.me/56992103974?text=" + encodeURIComponent("Hola, quiero información sobre Metrikas para mi academia")

export default function HeroImpactante() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; opacity: number }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.fillStyle = `rgba(163, 230, 53, ${p.opacity})`
        ctx.fillRect(p.x, p.y, p.r, p.r)
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05122F] flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071B4D] via-[#05122F] to-[#020818]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 backdrop-blur rounded-full px-4 py-1.5 mb-7">
              <Zap size={14} className="text-lime-400" />
              <span className="text-white/70 text-xs font-semibold tracking-wide">Datos que transforman</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-black leading-[0.9] mb-6">
              <span className="text-white">MÉTRICAS</span>
              <br />
              <span className="bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">QUE TRANSFORMAN</span>
              <br />
              <span className="text-white">ACADEMIAS</span>
            </h1>

            <p className="text-blue-100/60 text-lg font-medium mb-8 max-w-lg leading-relaxed">
              Planifica, analiza y potencia el rendimiento de tus jugadores. Datos en tiempo real. Decisiones más inteligentes. Resultados mejores.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-7 rounded-xl bg-lime-400 text-[#05122F] text-sm font-bold flex items-center justify-center gap-2 hover:bg-lime-300 transition-all shadow-lg shadow-lime-900/50"
              >
                Solicitar demo <ArrowRight size={16} />
              </a>
              <Link
                href="/login"
                className="h-12 px-6 rounded-xl border border-white/15 text-white text-sm font-semibold flex items-center hover:bg-white/5 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="relative h-full min-h-[500px] md:min-h-[600px]">
            {/* Card 1: Rendimiento */}
            <div className="absolute top-0 right-0 w-80 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-lime-500/20 transition-all duration-500 hover:border-lime-400/50 animate-in fade-in slide-in-from-right-4 duration-700">
              <p className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-4">Rendimiento</p>
              <div className="space-y-4">
                {[
                  { label: "Físico", value: 85 },
                  { label: "Técnico", value: 88 },
                  { label: "Táctico", value: 90 },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-white/60">{stat.label}</span>
                      <span className="text-xs font-bold text-lime-400">{stat.value}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-400 to-lime-300 rounded-full"
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Rating */}
            <div className="absolute top-60 left-0 w-72 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-lime-500/20 transition-all duration-500 hover:border-lime-400/50 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Rating</p>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#grad1)"
                      strokeWidth="8"
                      strokeDasharray="235"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="100%" stopColor="#84cc16" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-black text-white">87</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 text-center">En aumento 📈</p>
            </div>

            {/* Card 3: Táctica 4-4-2 */}
            <div className="absolute bottom-0 right-10 w-72 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-lime-500/20 transition-all duration-500 hover:border-lime-400/50 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
              <p className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-4">Formación 4-4-2</p>
              <div className="relative w-full aspect-square bg-white/5 rounded-lg border border-white/20 p-2">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Campo */}
                  <rect x="20" y="20" width="160" height="160" fill="none" stroke="rgba(163, 230, 53, 0.2)" strokeWidth="2" />
                  {/* Centro */}
                  <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(163, 230, 53, 0.1)" strokeWidth="1" />
                  {/* Defensas */}
                  {[45, 80, 120, 155].map((x, i) => (
                    <circle key={`d-${i}`} cx={x} cy={55} r="4" fill="#a3e635" />
                  ))}
                  {/* Mediocampistas */}
                  {[45, 80, 120, 155].map((x, i) => (
                    <circle key={`m-${i}`} cx={x} cy={100} r="4" fill="#a3e635" opacity="0.7" />
                  ))}
                  {/* Delanteros */}
                  {[80, 120].map((x, i) => (
                    <circle key={`f-${i}`} cx={x} cy={155} r="4" fill="#a3e635" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 animate-bounce">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
