"use client"
import { useState, useEffect, useRef } from "react"
import { cn, avatarUrl } from "@/lib/utils"
import type { ConvocatoriaPlayer, Player } from "@/lib/types"

export default function ConvocatoriaPitch({ pitchPlayers, players, onMove, editable, highlightPlayerId }: {
  pitchPlayers: ConvocatoriaPlayer[]
  players: Player[]
  onMove?: (id: string, x: number, y: number) => void
  editable?: boolean
  highlightPlayerId?: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function toPercent(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    const x = Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(3, Math.min(97, ((clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }

  function handlePointerDown(id: string, e: React.PointerEvent) {
    if (!editable) return
    e.stopPropagation()
    e.preventDefault()
    setDraggingId(id)
  }

  useEffect(() => {
    if (!draggingId) return
    function handleMove(e: PointerEvent) {
      const { x, y } = toPercent(e.clientX, e.clientY)
      onMove?.(draggingId!, x, y)
    }
    function handleUp() { setDraggingId(null) }
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [draggingId, onMove])

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden touch-none select-none" style={{ aspectRatio: "10/16" }}>
      {/* Green background with stripes */}
      <div className="absolute inset-0 bg-emerald-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0"
            style={{
              left: `${i * 12.5}%`,
              width: "12.5%",
              background: i % 2 === 0 ? "rgba(0,0,0,0.06)" : "transparent",
            }}
          />
        ))}
      </div>
      {/* Field lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 160" preserveAspectRatio="none">
        {/* Outer border */}
        <rect x="3" y="4" width="94" height="152" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        {/* Center line */}
        <line x1="3" y1="80" x2="97" y2="80" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        {/* Center circle */}
        <circle cx="50" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <circle cx="50" cy="80" r="1" fill="rgba(255,255,255,0.5)" />
        {/* Top penalty area */}
        <rect x="22" y="4" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <rect x="34" y="4" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        {/* Bottom penalty area */}
        <rect x="22" y="134" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <rect x="34" y="146" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        {/* Top goal */}
        <rect x="38" y="2" width="24" height="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        {/* Bottom goal */}
        <rect x="38" y="154" width="24" height="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        {/* Penalty spots */}
        <circle cx="50" cy="18" r="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="50" cy="142" r="1" fill="rgba(255,255,255,0.5)" />
      </svg>
      {/* Labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/50 uppercase tracking-widest z-10">Ellos</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/50 uppercase tracking-widest z-10">Nosotros</div>
      {/* Players */}
      {pitchPlayers.map(pp => {
        const player = players.find(p => p.id === pp.player_id)
        const firstName = player?.name.split(" ")[0] ?? "?"
        const isMe = highlightPlayerId != null && pp.player_id === highlightPlayerId
        return (
          <div
            key={pp.id}
            onPointerDown={e => handlePointerDown(pp.id, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-20"
            style={{
              left: `${pp.x}%`, top: `${pp.y}%`,
              touchAction: "none",
              cursor: editable ? (draggingId === pp.id ? "grabbing" : "grab") : "default",
            }}
          >
            <div className={cn(
              "relative w-11 h-11 rounded-full shadow-lg transition-transform",
              isMe && "scale-110",
              draggingId === pp.id && "scale-110 shadow-2xl"
            )}>
              <div className={cn(
                "w-full h-full rounded-full border-2 overflow-hidden bg-slate-200",
                isMe ? "border-amber-400 ring-2 ring-amber-300" : "border-white"
              )}>
                <img
                  src={player?.photo_url || avatarUrl(player?.name ?? "?", pp.player_id)}
                  alt={player?.name ?? "?"}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              {pp.position_label && (
                <span className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-white px-1.5 py-px rounded-full leading-tight border border-white whitespace-nowrap",
                  isMe ? "bg-amber-600" : "bg-[#0B5CFF]"
                )}>
                  {pp.position_label.substring(0, 3)}
                </span>
              )}
            </div>
            <span className={cn(
              "text-white text-[8px] font-bold px-1.5 py-px rounded-full max-w-14 truncate leading-none",
              isMe ? "bg-amber-600" : "bg-black/50"
            )}>
              {isMe ? `${firstName} (tú)` : firstName}
            </span>
          </div>
        )
      })}
    </div>
  )
}
