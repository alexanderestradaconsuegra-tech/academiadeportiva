"use client"
import { useEffect, useRef, useState } from "react"
import { User, Zap } from "lucide-react"

const PLAYER = {
  name: "THIAGO E.",
  position: "EI",
  category: "SUB-13",
  photoUrl: "https://lh3.googleusercontent.com/d/1Ht2izdMUdsY1j1SzKDLuFFiHeZnXMNdW" as string | null,
  stats: [
    { key: "VEL", value: 93 },
    { key: "FUE", value: 82 },
    { key: "TEC", value: 94 },
    { key: "RES", value: 88 },
    { key: "POT", value: 87 },
    { key: "AGI", value: 95 },
  ],
}

const OVR = Math.round(PLAYER.stats.reduce((s, x) => s + x.value, 0) / PLAYER.stats.length)

export default function FifaPlayerCard() {
  const [progress, setProgress] = useState(0)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min(1, (now - start) / 900)
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
    setTilt({ rx: py * -12, ry: px * 14, mx: ((e.clientX - rect.left) / rect.width) * 100, my: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  return (
    <div style={{ perspective: "1400px" }} className="flex justify-center w-full">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })}
        className="relative w-[260px] rounded-3xl overflow-hidden select-none cursor-pointer shrink-0"
        style={{
          height: "420px",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 200ms cubic-bezier(0.03,0.98,0.52,0.99)",
          transformStyle: "preserve-3d",
          background: "linear-gradient(175deg, #0f1f60 0%, #080d2e 40%, #030812 100%)",
          boxShadow: "0 32px 80px -12px rgba(11,92,255,0.65), 0 0 0 1px rgba(255,255,255,0.07) inset, 0 0 50px -8px rgba(251,191,36,0.12)",
        }}
      >
        {/* Holographic sheen */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60 z-10"
          style={{ background: `radial-gradient(ellipse at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)` }} />
        {/* Rainbow shimmer */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35 z-10"
          style={{ background: `linear-gradient(${105 + tilt.ry * 5}deg, transparent 35%, rgba(255,200,60,0.5) 44%, rgba(255,80,200,0.4) 52%, rgba(60,200,255,0.5) 60%, transparent 70%)` }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        {/* Gold inner border */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none z-20"
          style={{ boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.2)" }} />

        {/* ── HEADER: OVR + POSITION left | ELITE badge right ── */}
        <div className="relative z-30 flex items-start justify-between px-5 pt-5">
          {/* Left: OVR + position */}
          <div className="flex flex-col items-center leading-none">
            <span
              className="text-[52px] font-black text-white leading-none tabular-nums"
              style={{ textShadow: "0 0 24px rgba(11,92,255,0.9), 0 2px 8px rgba(0,0,0,0.7)" }}
            >
              {Math.round(OVR * progress)}
            </span>
            <span className="text-[13px] font-bold text-white/80 mt-1 tracking-[0.2em]">{PLAYER.position}</span>
            <div className="w-7 h-px bg-amber-400/40 my-1.5" />
            <span className="text-[9px] font-semibold text-amber-300/60 tracking-widest">{PLAYER.category}</span>
          </div>

          {/* Right: ELITE badge */}
          <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/35 rounded-xl px-2.5 py-1.5 backdrop-blur">
            <Zap size={11} className="text-amber-300" fill="currentColor" />
            <span className="text-[10px] font-black text-amber-300 tracking-widest">ELITE</span>
          </div>
        </div>

        {/* ── PHOTO ── */}
        <div className="relative z-30 flex justify-center mt-1">
          {/* Glow behind photo */}
          <div className="absolute w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(11,92,255,0.9) 0%, transparent 70%)" }} />
          <div
            className="relative w-[148px] h-[148px] rounded-full overflow-hidden flex items-center justify-center"
            style={{
              border: "2px solid rgba(255,255,255,0.25)",
              boxShadow: "0 0 0 1px rgba(251,191,36,0.25), 0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(11,92,255,0.4)",
              background: "rgba(255,255,255,0.07)",
            }}
          >
            {PLAYER.photoUrl ? (
              <img src={PLAYER.photoUrl} alt={PLAYER.name} className="w-full h-full object-cover" />
            ) : (
              <User size={60} className="text-white/50" />
            )}
          </div>
        </div>

        {/* ── NAME ── */}
        <p
          className="relative z-30 text-center text-[17px] font-black text-white tracking-[0.18em] uppercase mt-3"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
        >
          {PLAYER.name}
        </p>

        {/* ── DIVIDER ── */}
        <div className="relative z-30 flex items-center gap-2 px-6 mt-2.5 mb-3">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(251,191,36,0.4),transparent)" }} />
          <div className="w-1 h-1 rounded-full bg-amber-400/50" />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(251,191,36,0.4),transparent)" }} />
        </div>

        {/* ── STATS: 2 columns, 3 rows ── */}
        <div className="relative z-30 grid grid-cols-2 gap-x-4 gap-y-2 px-5">
          {PLAYER.stats.map((s) => {
            const v = Math.round(s.value * progress)
            const pct = s.value * progress
            const color = s.value >= 90 ? "#facc15" : s.value >= 85 ? "#34d399" : "#38bdf8"
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className="text-[13px] font-black text-white tabular-nums w-6 text-right">{v}</span>
                <span className="text-[9px] font-bold text-white/45 w-6 shrink-0">{s.key}</span>
                <div className="flex-1 h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color, transition: "width 0.6s ease-out", boxShadow: `0 0 6px ${color}80` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Footer brand ── */}
        <p className="relative z-30 text-center text-[8px] font-bold text-white/20 tracking-[0.3em] mt-3">METRIKAS · PRO</p>
      </div>
    </div>
  )
}
