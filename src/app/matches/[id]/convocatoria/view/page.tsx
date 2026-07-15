"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import { ArrowLeft, MapPin, Clock, Trophy, MessageSquare } from "lucide-react"
import { avatarUrl, formatDate } from "@/lib/utils"

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export default function ConvocatoriaViewPage() {
  const { id } = useParams<{ id: string }>()
  const { matches, players, currentUser, getConvocatoria } = useApp()

  const match = matches.find(m => m.id === id)
  const convocatoria = getConvocatoria(id)

  // Find the current player (if viewer is a player)
  const myPlayerId = currentUser?.player_id ?? null

  if (!match) {
    return (
      <AppShell>
        <div className="p-6">
          <Link href="/matches" className="text-sm text-slate-500 hover:text-[#0B5CFF] flex items-center gap-1.5">
            <ArrowLeft size={15} /> Partidos
          </Link>
          <p className="text-slate-400 mt-10 text-center">Partido no encontrado</p>
        </div>
      </AppShell>
    )
  }

  if (!convocatoria) {
    return (
      <AppShell>
        <div className="p-4 md:p-6 animate-fade-in">
          <Link href={`/matches/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-6">
            <ArrowLeft size={15} /> Volver al partido
          </Link>
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Trophy size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">Aún no hay convocatoria publicada</p>
            <p className="text-sm mt-1">El entrenador todavía no ha definido el equipo</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const myPitchPlayer = myPlayerId
    ? convocatoria.players.find(p => p.player_id === myPlayerId)
    : null
  const myPlayer = myPlayerId ? players.find(p => p.id === myPlayerId) : null
  const isInBench = myPlayerId && convocatoria.players.some(p => p.player_id === myPlayerId) && !myPitchPlayer?.x

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in space-y-5">
        {/* Back */}
        <Link href={`/matches/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF]">
          <ArrowLeft size={15} /> Volver al partido
        </Link>

        {/* Match info */}
        <div className="bg-gradient-to-r from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 text-white">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-wide mb-2">Convocatoria oficial</p>
          <h1 className="text-xl font-black">
            {match.is_home ? "vs" : "@"} {match.opponent}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-blue-100/80">
            <span>{formatDate(match.date)}</span>
            {match.time && (
              <span className="flex items-center gap-1"><Clock size={13} /> {match.time}</span>
            )}
            {match.location && (
              <span className="flex items-center gap-1"><MapPin size={13} /> {match.location}</span>
            )}
          </div>
          {match.competition && (
            <span className="inline-block mt-2 text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-lg">
              {match.competition}
            </span>
          )}
        </div>

        {/* My status banner */}
        {myPlayerId && myPitchPlayer && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              {myPlayer && (
                <img
                  src={myPlayer.photo_url || avatarUrl(myPlayer.name, myPlayer.id)}
                  alt={myPlayer.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  ¡Estás convocado/a!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Posición: <strong>{myPitchPlayer.position_label}</strong>
                </p>
              </div>
              <div className="text-2xl">⚽</div>
            </div>
            {myPitchPlayer.instruction && (
              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/30">
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Instrucción del entrenador:</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      {myPitchPlayer.instruction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isInBench && !myPitchPlayer?.x && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-4">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Estás en la banca</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">El entrenador podría llamarte durante el partido</p>
          </div>
        )}

        {/* Pitch visualization */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 px-1">
            Formación: {convocatoria.formation || "—"}
          </p>
          <div className="w-full">
            <svg viewBox="0 0 100 65" className="w-full" style={{ display: "block" }}>
              {/* Grass */}
              <rect width="100" height="65" fill="#1e7a3c" />
              {[0, 1, 2, 3, 4, 5, 6].map(i =>
                i % 2 === 1 ? <rect key={i} x={i * (100 / 7)} y="0" width={100 / 7} height="65" fill="#1a6e35" /> : null
              )}
              <rect x="2" y="2" width="96" height="61" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <line x1="50" y1="2" x2="50" y2="63" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <circle cx="50" cy="32.5" r="9" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <circle cx="50" cy="32.5" r="0.7" fill="rgba(255,255,255,0.9)" />
              <rect x="2" y="13.5" width="16" height="38" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <rect x="2" y="24" width="5.5" height="17" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <rect x="0.5" y="28" width="2" height="9" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <circle cx="13" cy="32.5" r="0.5" fill="rgba(255,255,255,0.9)" />
              <rect x="82" y="13.5" width="16" height="38" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <rect x="92.5" y="24" width="5.5" height="17" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <rect x="97.5" y="28" width="2" height="9" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
              <circle cx="87" cy="32.5" r="0.5" fill="rgba(255,255,255,0.9)" />

              {/* Players */}
              {convocatoria.players.map(pp => {
                const player = players.find(p => p.id === pp.player_id)
                const isMe = pp.player_id === myPlayerId
                const cx = pp.x
                const cy = (pp.y / 100) * 65
                const initials = getInitials(player?.name ?? "?")
                const r = isMe ? 5.5 : 4.2

                return (
                  <g key={pp.player_id}>
                    {/* Shadow */}
                    <circle cx={cx} cy={cy + 0.4} r={r + 0.2} fill="rgba(0,0,0,0.25)" />
                    {/* Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={isMe ? "#f59e0b" : "#0B5CFF"}
                      stroke="white"
                      strokeWidth={isMe ? "1" : "0.7"}
                    />
                    {/* Pulse ring for current player */}
                    {isMe && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r + 1.5}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="0.8"
                        opacity="0.5"
                      />
                    )}
                    {/* Initials */}
                    <text
                      x={cx}
                      y={cy + 0.1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={isMe ? "2.8" : "2.4"}
                      fontWeight="700"
                      style={{ userSelect: "none" }}
                    >
                      {initials}
                    </text>
                    {/* Position label below */}
                    <text
                      x={cx}
                      y={cy + r + 2.5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="1.9"
                      fontWeight="600"
                      style={{ userSelect: "none" }}
                    >
                      {pp.position_label}
                    </text>
                    {/* Name above */}
                    <text
                      x={cx}
                      y={cy - r - 1.5}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.95)"
                      fontSize={isMe ? "2.2" : "1.9"}
                      fontWeight={isMe ? "700" : "400"}
                      style={{ userSelect: "none" }}
                    >
                      {player?.name?.split(" ")[0] ?? ""}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Notes */}
        {convocatoria.notes && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Notas del entrenador
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {convocatoria.notes}
            </p>
          </div>
        )}

        {/* Player list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Jugadores convocados ({convocatoria.players.length})
            </p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {convocatoria.players.map(pp => {
              const player = players.find(p => p.id === pp.player_id)
              const isMe = pp.player_id === myPlayerId
              return (
                <div
                  key={pp.player_id}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-amber-50/60 dark:bg-amber-500/5" : ""}`}
                >
                  <img
                    src={player?.photo_url || avatarUrl(player?.name ?? "?", pp.player_id)}
                    alt={player?.name ?? "?"}
                    className="w-9 h-9 rounded-xl object-cover bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? "text-amber-700 dark:text-amber-300" : "text-slate-800 dark:text-slate-100"}`}>
                      {player?.name ?? "Jugador"}
                      {isMe && <span className="ml-2 text-xs font-normal text-amber-500">(tú)</span>}
                    </p>
                    {pp.instruction && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{pp.instruction}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#0B5CFF] bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg">
                    {pp.position_label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
