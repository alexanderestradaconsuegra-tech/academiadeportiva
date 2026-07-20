"use client"
import { useState, useEffect, useRef } from "react"
import { User, ChevronLeft, ChevronRight, Zap } from "lucide-react"

interface StatPlayer {
  name: string
  position: string
  category: string
  photoUrl?: string | null
  jerseyColor: string
  stats: { label: string; key: string; value: number }[]
}

const PLAYERS: StatPlayer[] = [
  {
    name: "Mateo R.", position: "DC", category: "Sub-15",
    jerseyColor: "from-red-500 via-red-600 to-red-700",
    stats: [
      { label: "Velocidad", key: "VEL", value: 91 },
      { label: "Fuerza", key: "FUE", value: 76 },
      { label: "Técnica", key: "TEC", value: 88 },
      { label: "Resistencia", key: "RES", value: 79 },
      { label: "Potencia", key: "POT", value: 84 },
      { label: "Agilidad", key: "AGI", value: 90 },
    ],
  },
  {
    name: "Sofía L.", position: "MC", category: "Sub-13",
    jerseyColor: "from-fuchsia-500 via-fuchsia-600 to-purple-700",
    stats: [
      { label: "Velocidad", key: "VEL", value: 78 },
      { label: "Fuerza", key: "FUE", value: 70 },
      { label: "Técnica", key: "TEC", value: 93 },
      { label: "Resistencia", key: "RES", value: 88 },
      { label: "Potencia", key: "POT", value: 72 },
      { label: "Agilidad", key: "AGI", value: 85 },
    ],
  },
  {
    name: "Diego P.", position: "DFC", category: "Sub-14",
    jerseyColor: "from-emerald-500 via-emerald-600 to-teal-700",
    stats: [
      { label: "Velocidad", key: "VEL", value: 74 },
      { label: "Fuerza", key: "FUE", value: 89 },
      { label: "Técnica", key: "TEC", value: 75 },
      { label: "Resistencia", key: "RES", value: 85 },
      { label: "Potencia", key: "POT", value: 87 },
      { label: "Agilidad", key: "AGI", value: 71 },
    ],
  },
]

function ovrOf(p: StatPlayer) {
  return Math.round(p.stats.reduce((s, x) => s + x.value, 0) / p.stats.length)
}

function tierOf(ovr: number) {
  if (ovr >= 88) return { label: "ELITE", color: "text-amber-300", ring: "ring-amber-400/60" }
  if (ovr >= 82) return { label: "TOP", color: "text-cyan-300", ring: "ring-cyan-400/60" }
  return { label: "PRO", color: "text-blue-300", ring: "ring-blue-400/60" }
}

export default function FifaPlayerCard() {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 })
  const cardRef = useRef<HTMLDivElement>(null)
  const player = PLAYERS[index]
  const ovr = ovrOf(player)
  const tier = tierOf(ovr)

  useEffect(() => {
    setProgress(0)
    let raf: number
    const start = performance.now()
    const DURATION = 900
    function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [index])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({
      rx: py * -14,
      ry: px * 16,
      mx: ((e.clientX - rect.left) / rect.width) * 100,
      my: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })
  }

  function change(dir: 1 | -1) {
    setIndex(i => (i + dir + PLAYERS.length) % PLAYERS.length)
  }

  return (
    <div className="relative flex flex-col items-center" style={{ perspective: "1200px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[280px] rounded-[28px] overflow-hidden select-none"
        style={{
          aspectRatio: "3/4.4",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 200ms cubic-bezier(0.03,0.98,0.52,0.99)",
          transformStyle: "preserve-3d",
          background: `linear-gradient(160deg, #0e1e5c 0%, #050a20 55%, #01050f 100%)`,
          boxShadow: "0 30px 80px -20px rgba(11,92,255,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        {/* holographic sheen */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 25%, transparent 55%)`,
          }}
        />
        {/* holographic rainbow strip */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
          style={{
            background: `linear-gradient(${100 + tilt.ry * 4}deg, transparent 30%, rgba(255,180,60,0.4) 42%, rgba(255,80,180,0.4) 50%, rgba(80,180,255,0.4) 58%, transparent 70%)`,
          }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        />

        {/* top: OVR + tier badge + position */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-5">
          <div className="flex flex-col items-center leading-none">
            <p className="text-5xl font-black text-white tabular-nums drop-shadow-[0_2px_10px_rgba(11,92,255,0.6)]">
              {Math.round(ovr * progress)}
            </p>
            <p className="text-[11px] font-bold text-white/90 mt-1.5 tracking-widest">{player.position}</p>
            <div className="w-8 h-px bg-white/30 mx-auto my-1.5" />
            <p className="text-[9px] font-semibold text-white/60 tracking-widest">{player.category.toUpperCase()}</p>
          </div>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur ring-1 ${tier.ring}`}>
            <Zap size={11} className={tier.color} fill="currentColor" />
            <span className={`text-[9px] font-black ${tier.color} tracking-wider`}>{tier.label}</span>
          </div>
        </div>

        {/* Player avatar area with jersey glow */}
        <div className="relative z-10 flex justify-center mt-2 mb-1">
          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, rgba(11,92,255,0.35) 0%, transparent 70%)`,
            }}
          >
            <div className={`absolute inset-6 rounded-full bg-gradient-to-br ${player.jerseyColor} opacity-40 blur-xl`} />
            <div className="relative w-24 h-24 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center overflow-hidden backdrop-blur">
              {player.photoUrl ? (
                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <User size={42} className="text-white/70" />
              )}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-center text-lg font-black text-white tracking-wide uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          {player.name}
        </p>
        <div className="relative z-10 w-16 h-px bg-white/25 mx-auto my-3" />

        {/* Stats grid with bars */}
        <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-2 px-6 pb-5">
          {player.stats.map((s) => {
            const displayValue = Math.round(s.value * progress)
            const barPct = (s.value * progress) / 100
            const barColor = s.value >= 85 ? "bg-emerald-400" : s.value >= 75 ? "bg-cyan-400" : "bg-blue-400"
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white tabular-nums w-6 text-right">{displayValue}</span>
                <span className="text-[9px] font-bold text-white/60 w-6">{s.key}</span>
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${barPct * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={() => change(-1)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronLeft size={16} className="text-white" />
        </button>
        <div className="flex items-center gap-1.5">
          {PLAYERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[#0B5CFF]" : "w-2 bg-white/25 hover:bg-white/40"}`}
            />
          ))}
        </div>
        <button
          onClick={() => change(1)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronRight size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
