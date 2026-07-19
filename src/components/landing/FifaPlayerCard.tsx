"use client"
import { useState, useEffect, useRef } from "react"
import { User, ChevronLeft, ChevronRight } from "lucide-react"

interface StatPlayer {
  name: string
  position: string
  category: string
  stats: { label: string; key: string; value: number }[]
}

const PLAYERS: StatPlayer[] = [
  {
    name: "Mateo R.", position: "DC", category: "Sub-15",
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

export default function FifaPlayerCard() {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const player = PLAYERS[index]
  const ovr = ovrOf(player)

  useEffect(() => {
    setProgress(0)
    let raf: number
    const start = performance.now()
    const DURATION = 700
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
    setTilt({ rx: py * -10, ry: px * 12 })
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 })
  }

  function change(dir: 1 | -1) {
    setIndex(i => (i + dir + PLAYERS.length) % PLAYERS.length)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-2xl p-4 mb-4 overflow-hidden select-none"
        style={{
          aspectRatio: "4/5",
          background: "linear-gradient(145deg, #0B5CFF 0%, #071B4D 55%, #04102b 100%)",
          transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale3d(1.01,1.01,1.01)`,
          transition: "transform 250ms ease-out",
          boxShadow: "0 20px 40px -10px rgba(11,92,255,0.5)",
        }}
      >
        {/* shine sweep */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `linear-gradient(${115 + tilt.ry * 3}deg, transparent 30%, rgba(255,255,255,0.25) 45%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

        {/* Top: OVR + position + nav */}
        <div className="relative flex items-start justify-between">
          <button onClick={() => change(-1)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            <ChevronLeft size={13} className="text-white" />
          </button>
          <div className="text-center leading-none">
            <p className="text-3xl font-black text-white tabular-nums">{Math.round(ovr * progress)}</p>
            <p className="text-[10px] font-bold text-blue-200 mt-1">{player.position}</p>
            <div className="w-6 h-px bg-blue-300/40 mx-auto mt-1" />
            <p className="text-[8px] font-semibold text-blue-200/70 mt-1">{player.category}</p>
          </div>
          <button onClick={() => change(1)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            <ChevronRight size={13} className="text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="relative flex justify-center my-2">
          <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
            <User size={38} className="text-white/70" />
          </div>
        </div>

        <p className="relative text-center text-sm font-black text-white tracking-wide">{player.name}</p>
        <div className="relative w-10 h-px bg-blue-300/30 mx-auto my-2" />

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
          {player.stats.map(s => (
            <div key={s.key} className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-bold text-white tabular-nums w-6">{Math.round(s.value * progress)}</span>
              <span className="text-[9px] font-semibold text-blue-200/70 flex-1">{s.key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-3">
        {PLAYERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-[#0B5CFF]" : "w-1.5 bg-white/20"}`}
          />
        ))}
      </div>

      <h3 className="text-sm font-bold mb-1">Ficha de rendimiento</h3>
      <p className="text-xs text-blue-100/60">Cada evaluación genera una ficha con números reales — toca los puntos para ver otro jugador de ejemplo.</p>
    </div>
  )
}
