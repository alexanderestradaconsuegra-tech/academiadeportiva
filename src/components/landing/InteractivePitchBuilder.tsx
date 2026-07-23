"use client"
import { useState, useEffect, useRef } from "react"
import { RotateCcw, Sparkles } from "lucide-react"

interface Spot { id: string; label: string; x: number; y: number; role: "GK" | "DEF" | "MID" | "FWD" }

const FORMATIONS: Record<string, Spot[]> = {
  "4-3-3": [
    { id: "gk", label: "POR", x: 50, y: 8,  role: "GK" },
    { id: "ld", label: "LD",  x: 82, y: 28, role: "DEF" },
    { id: "d1", label: "DFC", x: 61, y: 25, role: "DEF" },
    { id: "d2", label: "DFC", x: 39, y: 25, role: "DEF" },
    { id: "li", label: "LI",  x: 18, y: 28, role: "DEF" },
    { id: "m1", label: "MC",  x: 75, y: 50, role: "MID" },
    { id: "m2", label: "MCD", x: 50, y: 47, role: "MID" },
    { id: "m3", label: "MC",  x: 25, y: 50, role: "MID" },
    { id: "ed", label: "EXD", x: 82, y: 74, role: "FWD" },
    { id: "dc", label: "DC",  x: 50, y: 80, role: "FWD" },
    { id: "ei", label: "EXI", x: 18, y: 74, role: "FWD" },
  ],
  "4-4-2": [
    { id: "gk", label: "POR", x: 50, y: 8,  role: "GK" },
    { id: "ld", label: "LD",  x: 82, y: 28, role: "DEF" },
    { id: "d1", label: "DFC", x: 61, y: 25, role: "DEF" },
    { id: "d2", label: "DFC", x: 39, y: 25, role: "DEF" },
    { id: "li", label: "LI",  x: 18, y: 28, role: "DEF" },
    { id: "med", label: "MD",  x: 82, y: 52, role: "MID" },
    { id: "m1",  label: "MC",  x: 61, y: 50, role: "MID" },
    { id: "m2",  label: "MC",  x: 39, y: 50, role: "MID" },
    { id: "mei", label: "MI",  x: 18, y: 52, role: "MID" },
    { id: "d1c", label: "DC",  x: 62, y: 78, role: "FWD" },
    { id: "d2c", label: "DC",  x: 38, y: 78, role: "FWD" },
  ],
  "4-2-3-1": [
    { id: "gk", label: "POR", x: 50, y: 8,  role: "GK" },
    { id: "ld", label: "LD",  x: 82, y: 27, role: "DEF" },
    { id: "d1", label: "DFC", x: 61, y: 24, role: "DEF" },
    { id: "d2", label: "DFC", x: 39, y: 24, role: "DEF" },
    { id: "li", label: "LI",  x: 18, y: 27, role: "DEF" },
    { id: "mcd1", label: "MCD", x: 63, y: 44, role: "MID" },
    { id: "mcd2", label: "MCD", x: 37, y: 44, role: "MID" },
    { id: "exd",  label: "EXD", x: 82, y: 62, role: "MID" },
    { id: "mco",  label: "MCO", x: 50, y: 60, role: "MID" },
    { id: "exi",  label: "EXI", x: 18, y: 62, role: "MID" },
    { id: "dc",   label: "DC",  x: 50, y: 80, role: "FWD" },
  ],
  "3-5-2": [
    { id: "gk", label: "POR", x: 50, y: 8,  role: "GK" },
    { id: "d1", label: "DFC", x: 70, y: 24, role: "DEF" },
    { id: "d2", label: "DFC", x: 50, y: 22, role: "DEF" },
    { id: "d3", label: "DFC", x: 30, y: 24, role: "DEF" },
    { id: "md", label: "MD",  x: 88, y: 50, role: "MID" },
    { id: "m1", label: "MC",  x: 68, y: 48, role: "MID" },
    { id: "mcd",label: "MCD", x: 50, y: 46, role: "MID" },
    { id: "m2", label: "MC",  x: 32, y: 48, role: "MID" },
    { id: "mi", label: "MI",  x: 12, y: 50, role: "MID" },
    { id: "d1c",label: "DC",  x: 63, y: 78, role: "FWD" },
    { id: "d2c",label: "DC",  x: 37, y: 78, role: "FWD" },
  ],
}

const KEYS = Object.keys(FORMATIONS)

const ROLE_COLORS: Record<Spot["role"], string> = {
  GK: "from-amber-400 to-amber-600",
  DEF: "from-sky-400 to-blue-600",
  MID: "from-emerald-400 to-emerald-600",
  FWD: "from-red-400 to-red-600",
}

const NAMES = ["Mateo", "Sofía", "Diego", "Luca", "Emma", "Nico", "Sara", "Tomás", "Ana", "Iván", "Lía"]

export default function InteractivePitchBuilder() {
  const [formation, setFormation] = useState(KEYS[0])
  const [spots, setSpots] = useState<Spot[]>(FORMATIONS[KEYS[0]])
  const [dragging, setDragging] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSpots(FORMATIONS[formation])
  }, [formation])

  function toPercent(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: Math.max(6, Math.min(94, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100)),
    }
  }

  useEffect(() => {
    if (!dragging) return
    function move(e: PointerEvent) {
      const { x, y } = toPercent(e.clientX, e.clientY)
      setSpots(s => s.map(sp => sp.id === dragging ? { ...sp, x, y } : sp))
    }
    function up() { setDragging(null) }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [dragging])

  function reset() {
    setSpots(FORMATIONS[formation])
  }

  return (
    <div className="relative">
      {/* Format selector */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {KEYS.map(k => (
            <button
              key={k}
              onClick={() => setFormation(k)}
              className={`h-9 px-4 rounded-xl text-sm font-black tracking-wider transition-all ${
                formation === k
                  ? "bg-gradient-to-br from-[#0B5CFF] to-blue-700 text-white shadow-lg shadow-blue-900/40"
                  : "bg-white/5 text-blue-100/60 hover:bg-white/10 border border-white/10"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-blue-100/70 flex items-center gap-1.5 border border-white/10"
        >
          <RotateCcw size={13} /> Reiniciar
        </button>
      </div>

      {/* Pitch */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden touch-none select-none shadow-2xl shadow-emerald-950/50"
        style={{ aspectRatio: "3/4" }}
      >
        {/* Gradient turf */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #10a848 0%, #0f8f3d 50%, #0d7a34 100%)",
          }}
        />
        {/* Stripes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{
              top: `${i * 10}%`,
              height: "10%",
              background: i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent",
            }}
          />
        ))}

        {/* Field markings */}
        <svg viewBox="0 0 100 133" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <g stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" fill="none">
            <rect x="3" y="3" width="94" height="127" />
            <line x1="3" y1="66.5" x2="97" y2="66.5" />
            <circle cx="50" cy="66.5" r="10" />
            <circle cx="50" cy="66.5" r="0.8" fill="rgba(255,255,255,0.8)" />
            <rect x="22" y="3" width="56" height="18" />
            <rect x="34" y="3" width="32" height="8" />
            <rect x="22" y="112" width="56" height="18" />
            <rect x="34" y="122" width="32" height="8" />
            <path d="M 30 21 A 20 20 0 0 0 70 21" />
            <path d="M 30 112 A 20 20 0 0 1 70 112" />
          </g>
        </svg>

        {/* Corner glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-white/5 blur-3xl rounded-full pointer-events-none" />

        {/* Formation label */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur border border-white/10">
          <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Formación</p>
          <p className="text-sm font-black text-white tracking-widest">{formation}</p>
        </div>
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur border border-white/10">
          <Sparkles size={11} className="text-amber-300" />
          <p className="text-[10px] font-bold text-white/90">Arrastra a los jugadores</p>
        </div>

        {/* Players */}
        {spots.map((sp, i) => {
          const isActive = selected === sp.id || dragging === sp.id
          return (
            <div
              key={sp.id}
              onPointerDown={(e) => {
                e.preventDefault()
                setDragging(sp.id)
                setSelected(sp.id)
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                touchAction: "none",
                transition: dragging === sp.id ? "none" : "left 400ms cubic-bezier(0.4, 0, 0.2, 1), top 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${ROLE_COLORS[sp.role]} border-2 border-white shadow-lg flex items-center justify-center ${isActive ? "scale-125 ring-4 ring-white/40" : "scale-100"} transition-transform`}
                  style={{ cursor: dragging === sp.id ? "grabbing" : "grab" }}
                >
                  <span className="text-white text-[10px] font-black tracking-wider">{sp.label}</span>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                </div>
                <span className="text-white text-[10px] font-bold bg-black/60 backdrop-blur px-1.5 py-0.5 rounded-md leading-tight">
                  {NAMES[i % NAMES.length]}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" /><span className="text-white/70">Portero</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-600" /><span className="text-white/70">Defensa</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" /><span className="text-white/70">Medio</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600" /><span className="text-white/70">Delantero</span></span>
      </div>
    </div>
  )
}
