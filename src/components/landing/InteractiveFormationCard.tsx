"use client"
import { useState } from "react"

const FORMATIONS: Record<string, { x: number; y: number }[]> = {
  "4-3-3": [
    { x: 50, y: 8 },
    { x: 82, y: 28 }, { x: 61, y: 25 }, { x: 39, y: 25 }, { x: 18, y: 28 },
    { x: 75, y: 50 }, { x: 50, y: 47 }, { x: 25, y: 50 },
    { x: 82, y: 74 }, { x: 50, y: 80 }, { x: 18, y: 74 },
  ],
  "4-4-2": [
    { x: 50, y: 8 },
    { x: 82, y: 28 }, { x: 61, y: 25 }, { x: 39, y: 25 }, { x: 18, y: 28 },
    { x: 82, y: 52 }, { x: 61, y: 50 }, { x: 39, y: 50 }, { x: 18, y: 52 },
    { x: 62, y: 78 }, { x: 38, y: 78 },
  ],
  "4-2-3-1": [
    { x: 50, y: 8 },
    { x: 82, y: 27 }, { x: 61, y: 24 }, { x: 39, y: 24 }, { x: 18, y: 27 },
    { x: 63, y: 44 }, { x: 37, y: 44 },
    { x: 82, y: 62 }, { x: 50, y: 60 }, { x: 18, y: 62 },
    { x: 50, y: 80 },
  ],
  "3-5-2": [
    { x: 50, y: 8 },
    { x: 70, y: 24 }, { x: 50, y: 22 }, { x: 30, y: 24 },
    { x: 88, y: 50 }, { x: 68, y: 48 }, { x: 50, y: 46 }, { x: 32, y: 48 }, { x: 12, y: 50 },
    { x: 63, y: 78 }, { x: 37, y: 78 },
  ],
}

const KEYS = Object.keys(FORMATIONS)

export default function InteractiveFormationCard() {
  const [active, setActive] = useState(KEYS[0])
  const positions = FORMATIONS[active]

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="rounded-xl bg-emerald-700 p-3 mb-4 aspect-[4/3] relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="4" y="4" width="92" height="92" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
          <rect x="30" y="4" width="40" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
          <rect x="30" y="82" width="40" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
        </svg>
        {positions.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0B5CFF] border border-white shadow transition-all duration-500 ease-out"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-white/40 uppercase tracking-widest transition-all">
          {active}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {KEYS.map(k => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`h-6 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
              active === k ? "bg-[#0B5CFF] text-white" : "bg-white/10 text-blue-100/60 hover:bg-white/20"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-bold mb-1">Formaciones profesionales</h3>
      <p className="text-xs text-blue-100/60">F11, F8, F7 y F5, con posición ajustable de cada jugador. Toca una formación arriba y mira cómo se acomoda el equipo.</p>
    </div>
  )
}
