"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import ConvocatoriaPitch from "@/components/ConvocatoriaPitch"
import { ArrowLeft, Check, Users, MessageSquare, X, Send } from "lucide-react"
import { avatarUrl, formatDate, cn } from "@/lib/utils"
import type { ConvocatoriaPlayer, Player } from "@/lib/types"
import { supabase } from "@/lib/supabase"

const POSITIONS: Record<string, string> = {
  "Portero": "POR", "Defensa Central": "DFC", "Lateral Derecho": "LTD",
  "Lateral Izquierdo": "LTI", "Mediocampista Defensivo": "MCD",
  "Mediocampista Central": "MC", "Mediocampista Ofensivo": "MCO",
  "Extremo Derecho": "EXD", "Extremo Izquierdo": "EXI",
  "Delantero Centro": "DC", "Segundo Delantero": "SD",
}

type Role = "GK" | "DEF" | "MID" | "FWD"
interface PosDef { label: string; x: number; y: number; role: Role }

const FORMATIONS: Record<string, PosDef[]> = {
  "F11 · 4-3-3": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "LD",  x: 82, y: 28, role: "DEF" }, { label: "DFC", x: 61, y: 25, role: "DEF" },
    { label: "DFC", x: 39, y: 25, role: "DEF" }, { label: "LI",  x: 18, y: 28, role: "DEF" },
    { label: "MC",  x: 75, y: 50, role: "MID" }, { label: "MCD", x: 50, y: 47, role: "MID" }, { label: "MC",  x: 25, y: 50, role: "MID" },
    { label: "EXD", x: 82, y: 74, role: "FWD" }, { label: "DC",  x: 50, y: 80, role: "FWD" }, { label: "EXI", x: 18, y: 74, role: "FWD" },
  ],
  "F11 · 4-4-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "LD",  x: 82, y: 28, role: "DEF" }, { label: "DFC", x: 61, y: 25, role: "DEF" },
    { label: "DFC", x: 39, y: 25, role: "DEF" }, { label: "LI",  x: 18, y: 28, role: "DEF" },
    { label: "EXD", x: 82, y: 52, role: "MID" }, { label: "MC",  x: 61, y: 50, role: "MID" },
    { label: "MC",  x: 39, y: 50, role: "MID" }, { label: "EXI", x: 18, y: 52, role: "MID" },
    { label: "DC",  x: 62, y: 78, role: "FWD" }, { label: "DC",  x: 38, y: 78, role: "FWD" },
  ],
  "F11 · 4-2-3-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "LD",  x: 82, y: 27, role: "DEF" }, { label: "DFC", x: 61, y: 24, role: "DEF" },
    { label: "DFC", x: 39, y: 24, role: "DEF" }, { label: "LI",  x: 18, y: 27, role: "DEF" },
    { label: "MCD", x: 63, y: 44, role: "MID" }, { label: "MCD", x: 37, y: 44, role: "MID" },
    { label: "EXD", x: 82, y: 62, role: "MID" }, { label: "MCO", x: 50, y: 60, role: "MID" }, { label: "EXI", x: 18, y: 62, role: "MID" },
    { label: "DC",  x: 50, y: 80, role: "FWD" },
  ],
  "F11 · 3-5-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 70, y: 24, role: "DEF" }, { label: "DFC", x: 50, y: 22, role: "DEF" }, { label: "DFC", x: 30, y: 24, role: "DEF" },
    { label: "MD",  x: 88, y: 50, role: "MID" }, { label: "MC",  x: 68, y: 48, role: "MID" },
    { label: "MCD", x: 50, y: 46, role: "MID" }, { label: "MC",  x: 32, y: 48, role: "MID" }, { label: "MI",  x: 12, y: 50, role: "MID" },
    { label: "DC",  x: 63, y: 78, role: "FWD" }, { label: "DC",  x: 37, y: 78, role: "FWD" },
  ],
  "F11 · 3-4-3": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 70, y: 24, role: "DEF" }, { label: "DFC", x: 50, y: 22, role: "DEF" }, { label: "DFC", x: 30, y: 24, role: "DEF" },
    { label: "MD",  x: 82, y: 48, role: "MID" }, { label: "MC",  x: 61, y: 46, role: "MID" },
    { label: "MC",  x: 39, y: 46, role: "MID" }, { label: "MI",  x: 18, y: 48, role: "MID" },
    { label: "EXD", x: 80, y: 74, role: "FWD" }, { label: "DC",  x: 50, y: 78, role: "FWD" }, { label: "EXI", x: 20, y: 74, role: "FWD" },
  ],
  // Fútbol 8
  "F8 · 3-2-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 70, y: 28, role: "DEF" }, { label: "DFC", x: 50, y: 26, role: "DEF" }, { label: "DFC", x: 30, y: 28, role: "DEF" },
    { label: "MC",  x: 65, y: 52, role: "MID" }, { label: "MC",  x: 35, y: 52, role: "MID" },
    { label: "DC",  x: 65, y: 76, role: "FWD" }, { label: "DC",  x: 35, y: 76, role: "FWD" },
  ],
  "F8 · 2-3-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 28, role: "DEF" }, { label: "DFC", x: 35, y: 28, role: "DEF" },
    { label: "MC",  x: 75, y: 50, role: "MID" }, { label: "MC",  x: 50, y: 48, role: "MID" }, { label: "MC",  x: 25, y: 50, role: "MID" },
    { label: "DC",  x: 65, y: 76, role: "FWD" }, { label: "DC",  x: 35, y: 76, role: "FWD" },
  ],
  "F8 · 3-3-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 70, y: 28, role: "DEF" }, { label: "DFC", x: 50, y: 26, role: "DEF" }, { label: "DFC", x: 30, y: 28, role: "DEF" },
    { label: "MC",  x: 70, y: 52, role: "MID" }, { label: "MC",  x: 50, y: 50, role: "MID" }, { label: "MC",  x: 30, y: 52, role: "MID" },
    { label: "DC",  x: 50, y: 78, role: "FWD" },
  ],
  "F8 · 2-2-3": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 28, role: "DEF" }, { label: "DFC", x: 35, y: 28, role: "DEF" },
    { label: "MC",  x: 65, y: 50, role: "MID" }, { label: "MC",  x: 35, y: 50, role: "MID" },
    { label: "EXD", x: 78, y: 74, role: "FWD" }, { label: "DC",  x: 50, y: 78, role: "FWD" }, { label: "EXI", x: 22, y: 74, role: "FWD" },
  ],
  // Fútbol 7
  "F7 · 2-3-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 28, role: "DEF" }, { label: "DFC", x: 35, y: 28, role: "DEF" },
    { label: "MC",  x: 75, y: 52, role: "MID" }, { label: "MC",  x: 50, y: 50, role: "MID" }, { label: "MC",  x: 25, y: 52, role: "MID" },
    { label: "DC",  x: 50, y: 78, role: "FWD" },
  ],
  "F7 · 3-2-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 70, y: 28, role: "DEF" }, { label: "DFC", x: 50, y: 26, role: "DEF" }, { label: "DFC", x: 30, y: 28, role: "DEF" },
    { label: "MC",  x: 65, y: 52, role: "MID" }, { label: "MC",  x: 35, y: 52, role: "MID" },
    { label: "DC",  x: 50, y: 78, role: "FWD" },
  ],
  "F7 · 2-2-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 28, role: "DEF" }, { label: "DFC", x: 35, y: 28, role: "DEF" },
    { label: "MC",  x: 65, y: 52, role: "MID" }, { label: "MC",  x: 35, y: 52, role: "MID" },
    { label: "DC",  x: 65, y: 76, role: "FWD" }, { label: "DC",  x: 35, y: 76, role: "FWD" },
  ],
  "F7 · 1-3-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 50, y: 26, role: "DEF" },
    { label: "MC",  x: 75, y: 48, role: "MID" }, { label: "MC",  x: 50, y: 46, role: "MID" }, { label: "MC",  x: 25, y: 48, role: "MID" },
    { label: "DC",  x: 65, y: 76, role: "FWD" }, { label: "DC",  x: 35, y: 76, role: "FWD" },
  ],
  // Fútbol 5 / Futsal
  "F5 · 1-2-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 50, y: 30, role: "DEF" },
    { label: "MC",  x: 68, y: 55, role: "MID" }, { label: "MC",  x: 32, y: 55, role: "MID" },
    { label: "DC",  x: 50, y: 78, role: "FWD" },
  ],
  "F5 · 2-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 32, role: "DEF" }, { label: "DFC", x: 35, y: 32, role: "DEF" },
    { label: "DC",  x: 65, y: 72, role: "FWD" }, { label: "DC",  x: 35, y: 72, role: "FWD" },
  ],
  "F5 · 2-1-1": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 65, y: 30, role: "DEF" }, { label: "DFC", x: 35, y: 30, role: "DEF" },
    { label: "MC",  x: 50, y: 54, role: "MID" },
    { label: "DC",  x: 50, y: 78, role: "FWD" },
  ],
  "F5 · 1-1-2": [
    { label: "POR", x: 50, y: 8,  role: "GK" },
    { label: "DFC", x: 50, y: 30, role: "DEF" },
    { label: "MC",  x: 50, y: 52, role: "MID" },
    { label: "DC",  x: 65, y: 76, role: "FWD" }, { label: "DC",  x: 35, y: 76, role: "FWD" },
  ],
}

const FORMAT_KEYS = ["F11", "F8", "F7", "F5"] as const
type FormatKey = typeof FORMAT_KEYS[number]

const ROLE_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

function positionRole(position: string): Role {
  if (position === "Portero") return "GK"
  if (position.includes("Defensa") || position.includes("Lateral")) return "DEF"
  if (position.includes("Mediocampista") || position.includes("Extremo")) return "MID"
  return "FWD"
}

export default function ConvocatoriaPage() {
  const { id } = useParams<{ id: string }>()
  const { matches, players, convocatorias, getConvocatoria, refreshConvocatoria, saveConvocatoria } = useApp()

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
  const [activeTab, setActiveTab] = useState<"players" | "pitch">("players")
  const [activeFormat, setActiveFormat] = useState<FormatKey>("F11")
  const [selectedFormation, setSelectedFormation] = useState<string>("")

  const formationKeys = Object.keys(FORMATIONS).filter(k => k.startsWith(activeFormat))

  useEffect(() => { refreshConvocatoria(id) }, [id, refreshConvocatoria])

  useEffect(() => {
    const existing = getConvocatoria(id)
    if (existing) {
      setSelectedIds(new Set(existing.players.map(p => p.player_id)))
      setPitchPlayers(existing.players)
      setNotes(existing.notes || "")
      // Restore formation if saved
      if (existing.formation && existing.formation !== "custom") {
        setSelectedFormation(existing.formation)
        const fmt = existing.formation.split(" · ")[0] as FormatKey
        if (FORMAT_KEYS.includes(fmt)) setActiveFormat(fmt)
      }
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

  function handleMovePlayer(ppId: string, x: number, y: number) {
    setPitchPlayers(pp => pp.map(p => p.id === ppId ? { ...p, x, y } : p))
  }

  function applyFormation(formationKey: string) {
    const posDefs = FORMATIONS[formationKey]
    if (!posDefs) return
    setSelectedFormation(formationKey)

    // Sort selected players by role
    const selected = Array.from(selectedIds)
      .map(pid => players.find(p => p.id === pid))
      .filter(Boolean) as Player[]
    selected.sort((a, b) => {
      const ra = ROLE_ORDER[positionRole(a.position)] ?? 4
      const rb = ROLE_ORDER[positionRole(b.position)] ?? 4
      return ra - rb
    })

    // Map sorted players to formation positions (up to posDefs.length)
    const now = new Date().toISOString()
    const updated: ConvocatoriaPlayer[] = posDefs.slice(0, selected.length).map((pos, i) => {
      const player = selected[i]
      const existing = pitchPlayers.find(pp => pp.player_id === player.id)
      return {
        id: existing?.id ?? crypto.randomUUID(),
        convocatoria_id: existing?.convocatoria_id ?? "",
        player_id: player.id,
        position_label: pos.label,
        x: pos.x,
        y: pos.y,
        instruction: existing?.instruction ?? "",
        confirmed: existing?.confirmed ?? null,
        created_at: existing?.created_at ?? now,
      }
    })

    // Keep players not in formation with their current positions
    const assignedIds = new Set(updated.map(p => p.player_id))
    const rest = pitchPlayers.filter(pp => !assignedIds.has(pp.player_id) && selectedIds.has(pp.player_id))
    setPitchPlayers([...updated, ...rest])
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
    const formation = selectedFormation || "custom"
    const error = await saveConvocatoria(id, formation, notes, pitchPlayers)
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

        {/* Confirmation summary */}
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

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab("players")}
            className={cn(
              "flex-1 h-8 rounded-lg text-sm font-semibold transition-colors",
              activeTab === "players"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Users size={14} className="inline mr-1.5" />
            Jugadores {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
          <button
            onClick={() => setActiveTab("pitch")}
            className={cn(
              "flex-1 h-8 rounded-lg text-sm font-semibold transition-colors",
              activeTab === "pitch"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            Cancha / Formación
          </button>
        </div>

        {/* Tab: Players */}
        {activeTab === "players" && (
          <>
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
                        <button onClick={() => togglePlayer(player.id)} className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", selected ? "bg-[#0B5CFF] border-[#0B5CFF]" : "border-slate-300 dark:border-slate-600")}>
                          {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                        </button>
                        <img src={player.photo_url || avatarUrl(player.name, player.id)} alt={player.name} className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{player.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{player.position}</p>
                        </div>
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
          </>
        )}

        {/* Tab: Pitch / Formation */}
        {activeTab === "pitch" && (
          <div className="mb-4 space-y-4">
            {selectedIds.size === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <p className="font-semibold text-sm">Selecciona jugadores primero</p>
                <p className="text-xs mt-1">Vuelve a la pestaña Jugadores y elige el equipo</p>
              </div>
            ) : (
              <>
                {/* Format selector */}
                <div className="flex gap-2">
                  {FORMAT_KEYS.map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setActiveFormat(fmt)}
                      className={cn(
                        "flex-1 h-9 rounded-xl text-sm font-bold transition-colors",
                        activeFormat === fmt
                          ? "bg-[#0B5CFF] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                {/* Formation selector — grid of pills */}
                <div className="grid grid-cols-2 gap-2">
                  {formationKeys.map(key => (
                    <button
                      key={key}
                      onClick={() => applyFormation(key)}
                      className={cn(
                        "h-11 rounded-xl text-sm font-bold transition-colors border",
                        selectedFormation === key
                          ? "bg-[#0B5CFF] text-white border-[#0B5CFF]"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {key.split(" · ")[1]}
                      <span className="block text-[10px] font-normal opacity-60">{FORMATIONS[key].length} jugadores</span>
                    </button>
                  ))}
                </div>

                {/* Pitch */}
                <ConvocatoriaPitch pitchPlayers={pitchPlayers} players={players} onMove={handleMovePlayer} editable />
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center -mt-2">Arrastra a un jugador para ajustar su posición</p>

                {/* Formation legend */}
                {selectedFormation && pitchPlayers.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{selectedFormation}</p>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {pitchPlayers.map(pp => {
                        const player = players.find(p => p.id === pp.player_id)
                        return (
                          <div key={pp.id} className="flex items-center gap-3 px-3 py-2">
                            <span className="w-8 text-center text-[11px] font-black text-[#0B5CFF] bg-blue-50 dark:bg-blue-500/10 rounded-lg py-0.5">{pp.position_label}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{player?.name ?? "—"}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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
