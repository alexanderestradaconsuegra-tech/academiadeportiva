"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import { ArrowLeft, Save, Check, Users, MessageSquare, X, Send } from "lucide-react"
import { avatarUrl, formatDate } from "@/lib/utils"
import type { ConvocatoriaPlayer } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const POSITIONS: Record<string, string> = {
  "Portero": "POR", "Defensa Central": "DFC", "Lateral Derecho": "LTD",
  "Lateral Izquierdo": "LTI", "Mediocampista Defensivo": "MCD",
  "Mediocampista Central": "MC", "Mediocampista Ofensivo": "MCO",
  "Extremo Derecho": "EXD", "Extremo Izquierdo": "EXI",
  "Delantero Centro": "DC", "Segundo Delantero": "SD",
}

export default function ConvocatoriaPage() {
  const { id } = useParams<{ id: string }>()
  const { matches, players, convocatorias, getConvocatoria, saveConvocatoria } = useApp()

  const match = matches.find(m => m.id === id)
  const eligiblePlayers = match?.category
    ? players.filter(p => p.category === match.category)
    : players

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pitchPlayers, setPitchPlayers] = useState<ConvocatoriaPlayer[]>([])
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing = getConvocatoria(id)
    if (existing) {
      setSelectedIds(new Set(existing.players.map(p => p.player_id)))
      setPitchPlayers(existing.players)
      setNotes(existing.notes || "")
    }
  }, [id, convocatorias]) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlayer(playerId: string) {
    const next = new Set(selectedIds)
    if (next.has(playerId)) {
      next.delete(playerId)
      setPitchPlayers(pp => pp.filter(p => p.player_id !== playerId))
    } else {
      next.add(playerId)
      const player = players.find(p => p.id === playerId)
      const posLabel = POSITIONS[player?.position ?? ""] ?? (player?.position?.substring(0, 3).toUpperCase() ?? "")
      const newP: ConvocatoriaPlayer = {
        id: crypto.randomUUID(),
        convocatoria_id: "",
        player_id: playerId,
        position_label: posLabel,
        x: 50,
        y: 50,
        instruction: "",
        confirmed: null,
        created_at: new Date().toISOString(),
      }
      setPitchPlayers(pp => [...pp, newP])
    }
    setSelectedIds(next)
  }

  function openInstruction(playerId: string) {
    const pp = pitchPlayers.find(p => p.player_id === playerId)
    if (!pp) return
    setEditingId(playerId)
    setEditInstruction(pp.instruction)
  }

  function saveInstruction() {
    if (!editingId) return
    setPitchPlayers(pp => pp.map(p => p.player_id === editingId ? { ...p, instruction: editInstruction } : p))
    setEditingId(null)
  }

  async function handleSave() {
    if (!match) return
    setSaving(true)
    const error = await saveConvocatoria(id, "custom", notes, pitchPlayers)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      try {
        const session = (await supabase.auth.getSession()).data.session
        if (session) {
          fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({
              title: "¡Estás convocado! ⚽",
              body: `${match.is_home ? "vs" : "@"} ${match.opponent} · ${formatDate(match.date)}`,
              url: `/matches/${match.id}/convocatoria/view`,
              category: match.category || null,
            }),
          }).catch(() => {})
        }
      } catch {}
    }
  }

  const existing = getConvocatoria(id)
  const confirmedCount = existing?.players.filter(p => p.confirmed === true).length ?? 0
  const declinedCount = existing?.players.filter(p => p.confirmed === false).length ?? 0
  const pendingCount = existing?.players.filter(p => p.confirmed === null).length ?? 0

  if (!match) {
    return (
      <AppShell>
        <div className="p-6">
          <Link href="/matches" className="text-sm text-slate-500 hover:text-[#0B5CFF] flex items-center gap-1.5">
            <ArrowLeft size={15} /> Partidos
          </Link>
          <p className="text-slate-400 mt-8 text-center">Partido no encontrado</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href={`/matches/${id}`} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">Convocatoria</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {match.is_home ? "vs" : "@"} {match.opponent} · {formatDate(match.date)}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selectedIds.size === 0}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50",
              saved ? "bg-emerald-500" : "bg-[#0B5CFF] hover:bg-blue-700"
            )}
          >
            {saved ? <Check size={15} /> : <Send size={15} />}
            {saving ? "Guardando…" : saved ? "¡Enviado!" : "Guardar y notificar"}
          </button>
        </div>

        {/* Confirmation summary (if already sent) */}
        {existing && existing.players.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{confirmedCount}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium mt-0.5">Confirmaron</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-slate-500 dark:text-slate-400">{pendingCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Pendientes</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-red-500">{declinedCount}</p>
              <p className="text-xs text-red-400 font-medium mt-0.5">No pueden</p>
            </div>
          </div>
        )}

        {/* Player list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-4">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#0B5CFF]" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Jugadores {match.category ? `· ${match.category}` : ""}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#0B5CFF] bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg">
              {selectedIds.size} convocados
            </span>
          </div>

          {eligiblePlayers.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">No hay jugadores en esta categoría</p>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {eligiblePlayers.map(player => {
                const selected = selectedIds.has(player.id)
                const pp = pitchPlayers.find(p => p.player_id === player.id)
                const confirmed = pp ? existing?.players.find(ep => ep.player_id === player.id)?.confirmed ?? null : null

                return (
                  <div key={player.id} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", selected ? "bg-blue-50/50 dark:bg-blue-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/60")}>
                    {/* Checkbox */}
                    <button onClick={() => togglePlayer(player.id)} className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", selected ? "bg-[#0B5CFF] border-[#0B5CFF]" : "border-slate-300 dark:border-slate-600")}>
                      {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </button>

                    {/* Avatar */}
                    <img src={player.photo_url || avatarUrl(player.name, player.id)} alt={player.name} className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100" />

                    {/* Name + position */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{player.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{player.position}</p>
                    </div>

                    {/* Confirmation badge (only if selected and convocatoria was already saved) */}
                    {selected && existing && (
                      <span className={cn(
                        "shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full",
                        confirmed === true  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        confirmed === false ? "bg-red-50 dark:bg-red-500/10 text-red-500" :
                                              "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}>
                        {confirmed === true ? "✓ Confirmó" : confirmed === false ? "✗ No puede" : "Pendiente"}
                      </span>
                    )}

                    {/* Instruction button */}
                    {selected && (
                      <button
                        onClick={() => openInstruction(player.id)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          pp?.instruction
                            ? "bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF]"
                            : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        title="Instrucción individual"
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Notas generales del partido
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Instrucciones tácticas, concentración, horario de llegada…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#0B5CFF] outline-none resize-none transition-colors"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || selectedIds.size === 0}
          className={cn(
            "w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50",
            saved ? "bg-emerald-500" : "bg-[#0B5CFF] hover:bg-blue-700"
          )}
        >
          {saved ? <Check size={16} /> : <Send size={16} />}
          {saving ? "Guardando…" : saved ? "¡Convocatoria enviada!" : selectedIds.size === 0 ? "Selecciona jugadores" : `Guardar y notificar (${selectedIds.size} jugadores)`}
        </button>
      </div>

      {/* Instruction modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {players.find(p => p.id === editingId)?.name}
                </p>
                <p className="text-xs text-slate-400">Instrucción individual</p>
              </div>
              <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                autoFocus
                placeholder="Tarea específica para este jugador…"
                rows={4}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B5CFF] outline-none resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingId(null)} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button onClick={saveInstruction} className="flex-1 h-9 rounded-xl bg-[#0B5CFF] text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
