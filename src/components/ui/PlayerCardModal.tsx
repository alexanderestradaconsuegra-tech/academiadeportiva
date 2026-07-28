"use client"
import { useState, useEffect } from "react"
import { X, Download, Loader2, Zap, User } from "lucide-react"
import type { Player, Evaluation } from "@/lib/types"
import { downloadPlayerCardPNG } from "@/lib/generatePlayerPDF"

interface Props {
  player: Player
  academyName: string
  evaluation?: Evaluation
  onClose: () => void
}

export default function PlayerCardModal({ player, academyName, evaluation, onClose }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

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

  const stats = evaluation ? [
    { key: "VEL", value: Math.round(evaluation.speed_score * 10) },
    { key: "FUE", value: Math.round(evaluation.strength_score * 10) },
    { key: "TEC", value: Math.round(evaluation.technique_score * 10) },
    { key: "RES", value: Math.round(evaluation.resistance_score * 10) },
    { key: "POT", value: Math.round(evaluation.power_score * 10) },
    { key: "AGI", value: Math.round(evaluation.agility_score * 10) },
  ] : []

  const ovr = stats.length > 0
    ? Math.round(stats.reduce((s, x) => s + x.value, 0) / stats.length)
    : 0

  const badge = ovr >= 88 ? "ELITE" : ovr >= 75 ? "TOP" : "PRO"

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadPlayerCardPNG({ player, academyName, evaluation })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative flex flex-col items-center gap-5" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X size={14} className="text-slate-700" />
        </button>

        {/* Card */}
        <div
          className="relative w-[280px] rounded-3xl overflow-hidden select-none"
          style={{
            height: "420px",
            background: "linear-gradient(175deg, #0f1f60 0%, #080d2e 40%, #030812 100%)",
            boxShadow: "0 32px 80px -12px rgba(11,92,255,0.65), 0 0 0 1px rgba(255,255,255,0.07) inset, 0 0 50px -8px rgba(251,191,36,0.12)",
          }}
        >
          {/* Holographic sheen */}
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
            style={{ background: "radial-gradient(ellipse at 60% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)" }} />
          {/* Rainbow shimmer */}
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
            style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,200,60,0.4) 44%, rgba(255,80,200,0.3) 52%, rgba(60,200,255,0.4) 60%, transparent 70%)" }} />
          {/* Gold inner border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.22)" }} />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between px-5 pt-5">
            <div className="flex flex-col items-center leading-none">
              <span
                className="text-[52px] font-black text-white leading-none tabular-nums"
                style={{ textShadow: "0 0 24px rgba(11,92,255,0.9), 0 2px 8px rgba(0,0,0,0.7)" }}
              >
                {Math.round(ovr * progress)}
              </span>
              <span className="text-[13px] font-bold text-white/80 mt-1 tracking-[0.2em]">{player.position || "—"}</span>
              <div className="w-7 h-px bg-amber-400/40 my-1.5" />
              <span className="text-[9px] font-semibold text-amber-300/60 tracking-widest">{player.category || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/35 rounded-xl px-2.5 py-1.5 backdrop-blur">
              <Zap size={11} className="text-amber-300" fill="currentColor" />
              <span className="text-[10px] font-black text-amber-300 tracking-widest">{badge}</span>
            </div>
          </div>

          {/* Photo */}
          <div className="relative z-10 flex justify-center mt-1">
            <div className="absolute w-36 h-36 rounded-full opacity-25 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(11,92,255,0.9) 0%, transparent 70%)" }} />
            <div
              className="relative w-[130px] h-[130px] rounded-full overflow-hidden flex items-center justify-center"
              style={{
                border: "2px solid rgba(255,255,255,0.25)",
                boxShadow: "0 0 0 1px rgba(251,191,36,0.25), 0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(11,92,255,0.4)",
                background: "rgba(255,255,255,0.07)",
              }}
            >
              {player.photo_url ? (
                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <User size={52} className="text-white/50" />
              )}
            </div>
          </div>

          {/* Name */}
          <p
            className="relative z-10 text-center text-[15px] font-black text-white tracking-[0.18em] uppercase mt-2"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
          >
            {player.name}
          </p>

          {/* Divider */}
          <div className="relative z-10 flex items-center gap-2 px-6 mt-2 mb-2.5">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(251,191,36,0.4),transparent)" }} />
            <div className="w-1 h-1 rounded-full bg-amber-400/50" />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(251,191,36,0.4),transparent)" }} />
          </div>

          {/* Stats */}
          {stats.length > 0 ? (
            <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2 px-5">
              {stats.map((s) => {
                const v = Math.round(s.value * progress)
                const pct = s.value * progress
                const color = s.value >= 90 ? "#facc15" : s.value >= 80 ? "#34d399" : "#38bdf8"
                return (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-white tabular-nums w-6 text-right">{v}</span>
                    <span className="text-[9px] font-bold text-white/45 w-6 shrink-0">{s.key}</span>
                    <div className="flex-1 h-[3px] rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color, transition: "width 0.3s ease-out", boxShadow: `0 0 6px ${color}80` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="relative z-10 text-center text-[11px] text-white/30 px-5 mt-2">
              Sin evaluación registrada
            </p>
          )}

          {/* Footer */}
          <p className="relative z-10 text-center text-[8px] font-bold text-white/20 tracking-[0.3em] mt-3">
            METRIKAS · {academyName.toUpperCase()}
          </p>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="h-10 px-6 rounded-xl bg-white text-slate-900 text-sm font-semibold flex items-center gap-2 shadow-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Descargar imagen
        </button>
      </div>
    </div>
  )
}
