"use client"
import { useEffect, useRef, useState } from "react"
import { User, Zap } from "lucide-react"

const THIAGO = {
  name: "Thiago E.",
  position: "EI",
  category: "SUB-16",
  photoUrl: null as string | null,
  jerseyColor: "from-blue-500 via-blue-600 to-indigo-700",
  stats: [
    { label: "Velocidad", key: "VEL", value: 93 },
    { label: "Fuerza",   key: "FUE", value: 82 },
    { label: "Técnica",  key: "TEC", value: 94 },
    { label: "Resistencia", key: "RES", value: 88 },
    { label: "Potencia", key: "POT", value: 87 },
    { label: "Agilidad", key: "AGI", value: 95 },
  ],
}

const OVR = Math.round(THIAGO.stats.reduce((s, x) => s + x.value, 0) / THIAGO.stats.length)

export default function FifaPlayerCard() {
  const [progress, setProgress] = useState(0)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProgress(0)
    let raf: number
    const start = performance.now()
    const DURATION = 1000
    function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: py * -14, ry: px * 16, mx: ((e.clientX - rect.left) / rect.width) * 100, my: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  return (
    <div style={{ perspective: "1200px" }} className="flex justify-center">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })}
        className="relative w-full max-w-[300px] rounded-[32px] overflow-hidden select-none cursor-pointer"
        style={{
          aspectRatio: "3/4.4",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 200ms cubic-bezier(0.03,0.98,0.52,0.99)",
          transformStyle: "preserve-3d",
          background: "linear-gradient(160deg, #0e1e5c 0%, #050a20 55%, #01050f 100%)",
          boxShadow: "0 40px 100px -20px rgba(11,92,255,0.8), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 60px -10px rgba(251,191,36,0.15)",
        }}
      >
        {/* Holographic sheen */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
          style={{ background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 25%, transparent 55%)` }} />

        {/* Rainbow strip */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
          style={{ background: `linear-gradient(${100 + tilt.ry * 4}deg, transparent 30%, rgba(255,200,60,0.5) 42%, rgba(255,80,200,0.4) 50%, rgba(80,200,255,0.5) 58%, transparent 70%)` }} />

        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

        {/* Gold border accent */}
        <div className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(251,191,36,0.25)" }} />

        {/* Top: OVR + ELITE badge */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-5">
          <div className="flex flex-col items-center leading-none">
            <p className="text-6xl font-black text-white tabular-nums" style={{ textShadow: "0 0 30px rgba(11,92,255,0.8), 0 2px 12px rgba(0,0,0,0.6)" }}>
              {Math.round(OVR * progress)}
            </p>
            <p className="text-[12px] font-bold text-white/90 mt-2 tracking-[0.2em]">{THIAGO.position}</p>
            <div className="w-8 h-px bg-amber-400/40 mx-auto my-1.5" />
            <p className="text-[9px] font-semibold text-amber-300/70 tracking-widest">{THIAGO.category}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400/15 backdrop-blur border border-amber-400/40">
              <Zap size={12} className="text-amber-300" fill="currentColor" />
              <span className="text-[10px] font-black text-amber-300 tracking-widest">ELITE</span>
            </div>
            <div className="text-[9px] font-bold text-white/30 tracking-widest text-right">METRIKAS</div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative z-10 flex justify-center mt-3 mb-1">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${THIAGO.jerseyColor} opacity-30 blur-2xl scale-110`} />
            <div className="absolute inset-0 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)" }} />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/30 flex items-center justify-center overflow-hidden"
              style={{ boxShadow: "0 0 30px rgba(11,92,255,0.5), 0 0 0 1px rgba(251,191,36,0.2)" }}>
              {THIAGO.photoUrl ? (
                <img src={THIAGO.photoUrl} alt={THIAGO.name} className="w-full h-full object-cover" />
              ) : (
                <User size={52} className="text-white/60" />
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <p className="relative z-10 text-center text-xl font-black text-white tracking-[0.15em] uppercase"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
          {THIAGO.name}
        </p>

        {/* Divider */}
        <div className="relative z-10 flex items-center gap-2 px-6 my-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-2.5 px-6 pb-6">
          {THIAGO.stats.map((s) => {
            const v = Math.round(s.value * progress)
            const pct = (s.value * progress) / 100
            const color = s.value >= 90 ? "bg-amber-400" : s.value >= 80 ? "bg-emerald-400" : "bg-cyan-400"
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-[12px] font-black text-white tabular-nums w-6 text-right">{v}</span>
                <span className="text-[9px] font-bold text-white/50 w-7">{s.key}</span>
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct * 100}%`, transition: "width 0.5s ease-out" }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
