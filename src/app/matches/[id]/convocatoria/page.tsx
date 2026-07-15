"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import { ArrowLeft, Save, Check, X, Users, ChevronDown } from "lucide-react"
import { avatarUrl, formatDate } from "@/lib/utils"
import type { ConvocatoriaPlayer } from "@/lib/types"
import { supabase } from "@/lib/supabase"

// Formation position templates (x: 0-100 width %, y: 0-100 height %)
const FORMATIONS: Record<string, Array<{ x: number; y: number }>> = {
  "4-4-2": [
    { x: 8, y: 50 },
    { x: 25, y: 15 }, { x: 25, y: 35 }, { x: 25, y: 65 }, { x: 25, y: 85 },
    { x: 50, y: 15 }, { x: 50, y: 35 }, { x: 50, y: 65 }, { x: 50, y: 85 },
    { x: 72, y: 35 }, { x: 72, y: 65 },
  ],
  "4-3-3": [
    { x: 8, y: 50 },
    { x: 25, y: 15 }, { x: 25, y: 35 }, { x: 25, y: 65 }, { x: 25, y: 85 },
    { x: 52, y: 25 }, { x: 52, y: 50 }, { x: 52, y: 75 },
    { x: 72, y: 15 }, { x: 72, y: 50 }, { x: 72, y: 85 },
  ],
  "3-5-2": [
    { x: 8, y: 50 },
    { x: 25, y: 25 }, { x: 25, y: 50 }, { x: 25, y: 75 },
    { x: 45, y: 10 }, { x: 45, y: 30 }, { x: 45, y: 50 }, { x: 45, y: 70 }, { x: 45, y: 90 },
    { x: 72, y: 35 }, { x: 72, y: 65 },
  ],
  "4-2-3-1": [
    { x: 8, y: 50 },
    { x: 25, y: 15 }, { x: 25, y: 35 }, { x: 25, y: 65 }, { x: 25, y: 85 },
    { x: 42, y: 35 }, { x: 42, y: 65 },
    { x: 58, y: 15 }, { x: 58, y: 50 }, { x: 58, y: 85 },
    { x: 72, y: 50 },
  ],
  "5-3-2": [
    { x: 8, y: 50 },
    { x: 25, y: 10 }, { x: 25, y: 28 }, { x: 25, y: 50 }, { x: 25, y: 72 }, { x: 25, y: 90 },
    { x: 50, y: 25 }, { x: 50, y: 50 }, { x: 50, y: 75 },
    { x: 72, y: 35 }, { x: 72, y: 65 },
  ],
  "Custom": [],
}

const FORMATION_KEYS = Object.keys(FORMATIONS)

function abbreviatePosition(position: string): string {
  const map: Record<string, string> = {
    "Portero": "POR", "Defensa Central": "DFC", "Lateral Derecho": "LTD",
    "Lateral Izquierdo": "LTI", "Mediocampista Defensivo": "MCD",
    "Mediocampista Central": "MC", "Mediocampista Ofensivo": "MCO",
    "Extremo Derecho": "EXD", "Extremo Izquierdo": "EXI",
    "Delantero Centro": "DC", "Segundo Delantero": "SD",
  }
  return map[position] ?? position.substring(0, 3).toUpperCase()
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

// The pitch SVG component
function FootballPitch({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 65" className="w-full h-full" style={{ display: "block" }}>
      {/* Grass background */}
      <rect width="100" height="65" fill="#1e7a3c" />
      {/* Grass stripes */}
      {[0, 1, 2, 3, 4, 5, 6].map(i =>
        i % 2 === 1 ? <rect key={i} x={i * (100 / 7)} y="0" width={100 / 7} height="65" fill="#1a6e35" /> : null
      )}
      {/* Boundary */}
      <rect x="2" y="2" width="96" height="61" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Center line */}
      <line x1="50" y1="2" x2="50" y2="63" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Center circle */}
      <circle cx="50" cy="32.5" r="9" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Center spot */}
      <circle cx="50" cy="32.5" r="0.7" fill="rgba(255,255,255,0.9)" />
      {/* Left penalty area */}
      <rect x="2" y="13.5" width="16" height="38" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Left goal area */}
      <rect x="2" y="24" width="5.5" height="17" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Left goal */}
      <rect x="0.5" y="28" width="2" height="9" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Left penalty spot */}
      <circle cx="13" cy="32.5" r="0.5" fill="rgba(255,255,255,0.9)" />
      {/* Right penalty area */}
      <rect x="82" y="13.5" width="16" height="38" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Right goal area */}
      <rect x="92.5" y="24" width="5.5" height="17" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Right goal */}
      <rect x="97.5" y="28" width="2" height="9" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      {/* Right penalty spot */}
      <circle cx="87" cy="32.5" r="0.5" fill="rgba(255,255,255,0.9)" />
      {children}
    </svg>
  )
}

export default function ConvocatoriaPage() {
  const { id } = useParams<{ id: string }>()
  const { matches, players, currentUser, convocatorias, getConvocatoria, saveConvocatoria } = useApp()

  const match = matches.find(m => m.id === id)
  const eligiblePlayers = match?.category
    ? players.filter(p => p.category === match.category)
    : players

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pitchPlayers, setPitchPlayers] = useState<ConvocatoriaPlayer[]>([])
  const [formation, setFormation] = useState("4-4-2")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ position_label: "", instruction: "" })

  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef<string | null>(null)
  const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null)
  const isDragRef = useRef(false)

  // Load existing convocatoria on mount
  useEffect(() => {
    const existing = getConvocatoria(id)
    if (existing) {
      setSelectedIds(new Set(existing.players.map(p => p.player_id)))
      setPitchPlayers(existing.players)
      setFormation(existing.formation || "4-4-2")
      setNotes(existing.notes || "")
    }
  }, [id, convocatorias]) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlayer(playerId: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
      setPitchPlayers(pp => pp.filter(p => p.player_id !== playerId))
    } else {
      newSelected.add(playerId)
      const player = players.find(p => p.id === playerId)
      const posLabel = abbreviatePosition(player?.position ?? "")
      const newP: ConvocatoriaPlayer = {
        id: crypto.randomUUID(),
        convocatoria_id: "",
        player_id: playerId,
        position_label: posLabel,
        x: 50,
        y: 50,
        instruction: "",
        created_at: new Date().toISOString(),
      }
      setPitchPlayers(pp => [...pp, newP])
    }
    setSelectedIds(newSelected)
  }

  function applyFormation(f: string) {
    setFormation(f)
    if (f === "Custom") return
    const positions = FORMATIONS[f] ?? []
    setPitchPlayers(pp => pp.map((p, i) => ({
      ...p,
      x: positions[i]?.x ?? p.x,
      y: positions[i]?.y ?? p.y,
    })))
  }

  // SVG coordinate conversion
  function screenToData(clientX: number, clientY: number): { x: number; y: number } {
    const svg = svgRef.current
    if (!svg) return { x: 50, y: 50 }
    const rect = svg.getBoundingClientRect()
    const x = Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(3, Math.min(97, ((clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }

  function handleCirclePointerDown(e: React.PointerEvent, playerId: string) {
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = playerId
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY }
    isDragRef.current = false
    ;(e.currentTarget as SVGElement).setPointerCapture(e.pointerId)
  }

  function handleSvgPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY
    if (!isDragRef.current && Math.sqrt(dx * dx + dy * dy) > 4) {
      isDragRef.current = true
    }
    if (!isDragRef.current) return
    const { x, y } = screenToData(e.clientX, e.clientY)
    const pid = draggingRef.current
    setPitchPlayers(pp => pp.map(p => p.player_id === pid ? { ...p, x, y } : p))
  }

  function handleSvgPointerUp(e: React.PointerEvent) {
    const pid = draggingRef.current
    const wasDrag = isDragRef.current
    draggingRef.current = null
    isDragRef.current = false
    dragStartRef.current = null
    if (!wasDrag && pid) {
      // It's a click — open edit popover
      const pp = pitchPlayers.find(p => p.player_id === pid)
      if (pp) {
        setEditingId(pid)
        setEditForm({ position_label: pp.position_label, instruction: pp.instruction })
      }
    }
  }

  function saveEdit() {
    if (!editingId) return
    setPitchPlayers(pp => pp.map(p => p.player_id === editingId ? { ...p, ...editForm } : p))
    setEditingId(null)
  }

  async function handleSave() {
    if (!match) return
    setSaving(true)
    const error = await saveConvocatoria(id, formation, notes, pitchPlayers)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      // Send push notification
      try {
        const session = (await supabase.auth.getSession()).data.session
        if (session) {
          fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({
              title: "¡Estás convocado! 📋",
              body: `${match.opponent} · ${match.date}`,
              url: `/matches/${match.id}/convocatoria`,
              category: match.category || null,
            }),
          }).catch(() => {})
        }
      } catch {}
    }
  }

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

  // Editing player details
  const editingPlayer = editingId ? players.find(p => p.id === editingId) : null

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        {/* Top bar */}
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
            disabled={saving}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: saved ? "#10b981" : "#0B5CFF" }}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
          </button>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left panel: player list */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-[#0B5CFF]" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Jugadores</span>
                </div>
                <span className="text-xs font-semibold text-[#0B5CFF] bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg">
                  {selectedIds.size} sel.
                </span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[calc(100vh-280px)] overflow-y-auto">
                {eligiblePlayers.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
                    No hay jugadores en esta categoría
                  </p>
                ) : eligiblePlayers.map(player => {
                  const selected = selectedIds.has(player.id)
                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left ${selected ? "bg-blue-50/60 dark:bg-blue-500/5" : ""}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-[#0B5CFF] border-[#0B5CFF]" : "border-slate-300 dark:border-slate-600"}`}>
                        {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <img
                        src={player.photo_url || avatarUrl(player.name, player.id)}
                        alt={player.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{player.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{abbreviatePosition(player.position)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right panel: pitch + controls */}
          <div className="flex-1 space-y-4">
            {/* Pitch */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 overflow-hidden">
              <div
                className="relative w-full"
                style={{ touchAction: "none" }}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 65"
                  className="w-full"
                  style={{ display: "block", userSelect: "none" }}
                  onPointerMove={handleSvgPointerMove}
                  onPointerUp={handleSvgPointerUp}
                >
                  {/* Grass background */}
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

                  {/* Player circles */}
                  {pitchPlayers.map(pp => {
                    const player = players.find(p => p.id === pp.player_id)
                    const cx = pp.x
                    const cy = (pp.y / 100) * 65
                    const initials = getInitials(player?.name ?? "?")
                    const isEditing = editingId === pp.player_id
                    return (
                      <g
                        key={pp.player_id}
                        onPointerDown={(e) => handleCirclePointerDown(e, pp.player_id)}
                        style={{ cursor: "grab" }}
                      >
                        {/* Shadow */}
                        <circle cx={cx} cy={cy + 0.4} r="4.2" fill="rgba(0,0,0,0.3)" />
                        {/* Main circle */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r="4.2"
                          fill={isEditing ? "#f59e0b" : "#0B5CFF"}
                          stroke="white"
                          strokeWidth="0.7"
                        />
                        {/* Initials */}
                        <text
                          x={cx}
                          y={cy + 0.1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="2.4"
                          fontWeight="700"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {initials}
                        </text>
                        {/* Position label below */}
                        <text
                          x={cx}
                          y={cy + 6.2}
                          textAnchor="middle"
                          fill="white"
                          fontSize="2"
                          fontWeight="600"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {pp.position_label}
                        </text>
                        {/* Name above */}
                        <text
                          x={cx}
                          y={cy - 5.5}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.9)"
                          fontSize="2"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {player?.name?.split(" ")[0] ?? ""}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Formation selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Formación</p>
              <div className="flex flex-wrap gap-2">
                {FORMATION_KEYS.map(f => (
                  <button
                    key={f}
                    onClick={() => applyFormation(f)}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                      formation === f
                        ? "bg-[#0B5CFF] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {selectedIds.size > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                  Selecciona una formación para auto-posicionar a los {selectedIds.size} jugadores convocados
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Notas del partido
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Instrucciones generales, táctica del partido…"
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#0B5CFF] outline-none resize-none transition-colors"
              />
            </div>

            {/* Save button (also at bottom for mobile) */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: saved ? "#10b981" : "#0B5CFF" }}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saving ? "Guardando…" : saved ? "Guardado correctamente" : "Guardar convocatoria"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit player popover */}
      {editingId && editingPlayer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={editingPlayer.photo_url || avatarUrl(editingPlayer.name, editingPlayer.id)}
                  alt={editingPlayer.name}
                  className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{editingPlayer.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{editingPlayer.position}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingId(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Posición (etiqueta)
                </label>
                <input
                  type="text"
                  value={editForm.position_label}
                  onChange={e => setEditForm(f => ({ ...f, position_label: e.target.value }))}
                  placeholder="ej: POR, MC, DFC…"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-[#0B5CFF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Instrucción individual
                </label>
                <textarea
                  value={editForm.instruction}
                  onChange={e => setEditForm(f => ({ ...f, instruction: e.target.value }))}
                  placeholder="Tarea específica para este jugador…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B5CFF] outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 h-9 rounded-xl bg-[#0B5CFF] text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
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
