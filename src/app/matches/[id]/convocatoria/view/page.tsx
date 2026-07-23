"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import { ArrowLeft, MapPin, Clock, Trophy, MessageSquare, Check, X, Loader2 } from "lucide-react"
import { avatarUrl, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function ConvocatoriaViewPage() {
  const { id } = useParams<{ id: string }>()
  const { matches, players, currentUser, getConvocatoria, respondConvocatoria } = useApp()

  const [responding, setResponding] = useState<"confirm" | "decline" | null>(null)

  const match = matches.find(m => m.id === id)
  const convocatoria = getConvocatoria(id)
  const myPlayerId = currentUser?.player_id ?? null

  async function handleRespond(confirmed: boolean) {
    if (!myPlayerId || !convocatoria) return
    const myEntry = convocatoria.players.find(p => p.player_id === myPlayerId)
    if (!myEntry) return
    setResponding(confirmed ? "confirm" : "decline")
    await respondConvocatoria(myEntry.id, confirmed)
    setResponding(null)
  }

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

  const myEntry = myPlayerId ? convocatoria.players.find(p => p.player_id === myPlayerId) : null
  const myPlayer = myPlayerId ? players.find(p => p.id === myPlayerId) : null
  const isConvocated = !!myEntry
  const myConfirmed = myEntry?.confirmed ?? null

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-lg mx-auto space-y-4">
        <Link href={`/matches/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF]">
          <ArrowLeft size={15} /> Volver al partido
        </Link>

        {/* Match header */}
        <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 text-white">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-wide mb-2">Convocatoria oficial</p>
          <h1 className="text-xl font-black">
            {match.is_home ? "vs" : "@"} {match.opponent}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-blue-100/80">
            <span>{formatDate(match.date)}</span>
            {match.time && <span className="flex items-center gap-1"><Clock size={13} /> {match.time}</span>}
            {match.location && <span className="flex items-center gap-1"><MapPin size={13} /> {match.location}</span>}
          </div>
        </div>

        {/* My status card */}
        {isConvocated && myPlayer && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <img src={myPlayer.photo_url || avatarUrl(myPlayer.name, myPlayer.id)} alt={myPlayer.name} className="w-11 h-11 rounded-xl object-cover bg-slate-100" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">¡Estás convocado/a!</p>
                {myEntry?.position_label && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Posición: <span className="font-semibold text-[#0B5CFF]">{myEntry.position_label}</span>
                  </p>
                )}
              </div>
              <span className={cn(
                "shrink-0 text-xs font-bold px-2.5 py-1 rounded-full",
                myConfirmed === true  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                myConfirmed === false ? "bg-red-50 dark:bg-red-500/10 text-red-500" :
                                        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}>
                {myConfirmed === true ? "✓ Confirmado" : myConfirmed === false ? "✗ Rechazado" : "Sin respuesta"}
              </span>
            </div>

            {myEntry?.instruction && (
              <div className="mx-4 mb-4 flex items-start gap-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl px-3 py-2.5">
                <MessageSquare size={14} className="text-[#0B5CFF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#0B5CFF] mb-0.5">Instrucción del entrenador:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{myEntry.instruction}</p>
                </div>
              </div>
            )}

            {/* Confirm / Decline buttons */}
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              <button
                onClick={() => handleRespond(true)}
                disabled={!!responding}
                className={cn(
                  "h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  myConfirmed === true
                    ? "bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-2"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30"
                )}
              >
                {responding === "confirm"
                  ? <Loader2 size={16} className="animate-spin" />
                  : myConfirmed === true ? <Check size={16} /> : <Check size={16} />
                }
                Voy a ir
              </button>
              <button
                onClick={() => handleRespond(false)}
                disabled={!!responding}
                className={cn(
                  "h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  myConfirmed === false
                    ? "bg-red-500 text-white ring-2 ring-red-300 ring-offset-2"
                    : "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30"
                )}
              >
                {responding === "decline"
                  ? <Loader2 size={16} className="animate-spin" />
                  : <X size={16} />
                }
                No puedo ir
              </button>
            </div>
          </div>
        )}

        {/* Not convocated */}
        {myPlayerId && !isConvocated && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No estás en esta convocatoria</p>
          </div>
        )}

        {/* General notes */}
        {convocatoria.notes && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Notas del entrenador</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{convocatoria.notes}</p>
          </div>
        )}

        {/* Formation pitch */}
        {convocatoria.players.some(p => p.x !== undefined && p.y !== undefined) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Formación {convocatoria.formation && convocatoria.formation !== "custom" ? `· ${convocatoria.formation.replace("F11 · ","").replace("F7 · ","")}` : ""}
              </p>
            </div>
            <div className="p-4">
              <div className="relative w-full rounded-xl overflow-hidden" style={{ background: "#2d6a2d", aspectRatio: "2/3" }}>
                {/* Pitch lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150" preserveAspectRatio="none">
                  <rect x="2" y="2" width="96" height="146" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                  <line x1="2" y1="75" x2="98" y2="75" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                  <circle cx="50" cy="75" r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                  <rect x="22" y="2" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                  <rect x="22" y="126" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                  <rect x="35" y="2" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                  <rect x="35" y="138" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                </svg>
                {/* Players */}
                {convocatoria.players.map(pp => {
                  const player = players.find(p => p.id === pp.player_id)
                  const isMe = pp.player_id === myPlayerId
                  return (
                    <div key={pp.player_id}
                      className="absolute flex flex-col items-center gap-0.5"
                      style={{ left: `${pp.x}%`, top: `${pp.y}%`, transform: "translate(-50%,-50%)" }}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black text-white shadow-md",
                        isMe ? "bg-amber-400 border-amber-200 scale-110" : "bg-[#0B5CFF] border-blue-300"
                      )}>
                        {player?.name?.charAt(0) ?? "?"}
                      </div>
                      <span className="text-[8px] font-bold text-white drop-shadow leading-none bg-black/30 px-1 rounded">
                        {pp.position_label || player?.name?.split(" ")[0] || "?"}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/>Tú</span>
                <span className="mx-2">·</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#0B5CFF] inline-block"/>Compañeros</span>
              </p>
            </div>
          </div>
        )}

        {/* Full player list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Equipo convocado ({convocatoria.players.length})
            </p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {convocatoria.players.map(pp => {
              const player = players.find(p => p.id === pp.player_id)
              const isMe = pp.player_id === myPlayerId
              return (
                <div key={pp.player_id} className={cn("flex items-center gap-3 px-4 py-3", isMe ? "bg-blue-50/60 dark:bg-blue-500/5" : "")}>
                  <img src={player?.photo_url || avatarUrl(player?.name ?? "?", pp.player_id)} alt={player?.name ?? "?"} className="w-9 h-9 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", isMe ? "text-[#0B5CFF]" : "text-slate-800 dark:text-slate-100")}>
                      {player?.name ?? "Jugador"}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-[#0B5CFF]/60">(tú)</span>}
                    </p>
                    {pp.position_label && <p className="text-xs text-slate-400 dark:text-slate-500">{pp.position_label}</p>}
                  </div>
                  <span className={cn(
                    "shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full",
                    pp.confirmed === true  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    pp.confirmed === false ? "bg-red-50 dark:bg-red-500/10 text-red-500" :
                                             "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {pp.confirmed === true ? "✓" : pp.confirmed === false ? "✗" : "?"}
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
