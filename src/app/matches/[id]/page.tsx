"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import {
  ArrowLeft, Trophy, MapPin, Clock, Video, Plus, X, Pencil, Trash2,
  Goal, Footprints, Square, Star, Film,
} from "lucide-react"
import { formatDate, avatarUrl } from "@/lib/utils"
import type { Position, MatchPlayerStat } from "@/lib/types"

const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]

const EMPTY_STAT_FORM = {
  player_id: "", minutes_played: "90", goals: "0", assists: "0",
  yellow_cards: "0", red_cards: "0", rating: "", position_played: "",
  highlight_url: "", notes: "",
}

export default function MatchDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { matches, players, currentUser, getMatchStats, addMatchStat, updateMatchStat, deleteMatchStat } = useApp()
  const isCoach = currentUser?.role === "coach"

  const match = matches.find(m => m.id === id)
  const stats = getMatchStats(id)

  const [showStatForm, setShowStatForm] = useState(false)
  const [editingStatId, setEditingStatId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_STAT_FORM)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (!match) {
    return (
      <AppShell>
        <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
          <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-4">
            <ArrowLeft size={15} /> Volver a Partidos
          </Link>
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Trophy size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">Partido no encontrado</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const matchId = match.id
  const playersWithoutStat = players.filter(p => !stats.some(s => s.player_id === p.id))
  const played = match.our_score !== null && match.opponent_score !== null

  function openAddStat() {
    setEditingStatId(null)
    setForm({ ...EMPTY_STAT_FORM, player_id: playersWithoutStat[0]?.id ?? "" })
    setShowStatForm(true)
  }

  function openEditStat(s: MatchPlayerStat) {
    setEditingStatId(s.id)
    setForm({
      player_id: s.player_id,
      minutes_played: String(s.minutes_played),
      goals: String(s.goals),
      assists: String(s.assists),
      yellow_cards: String(s.yellow_cards),
      red_cards: String(s.red_cards),
      rating: s.rating === null ? "" : String(s.rating),
      position_played: s.position_played,
      highlight_url: s.highlight_url,
      notes: s.notes,
    })
    setShowStatForm(true)
  }

  async function handleStatSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      minutes_played: Number(form.minutes_played) || 0,
      goals: Number(form.goals) || 0,
      assists: Number(form.assists) || 0,
      yellow_cards: Number(form.yellow_cards) || 0,
      red_cards: Number(form.red_cards) || 0,
      rating: form.rating === "" ? null : Number(form.rating),
      position_played: form.position_played,
      highlight_url: form.highlight_url,
      notes: form.notes,
    }
    if (editingStatId) {
      updateMatchStat(editingStatId, data)
    } else {
      addMatchStat({ match_id: matchId, player_id: form.player_id, ...data })
    }
    setShowStatForm(false)
    setForm(EMPTY_STAT_FORM)
    setSaving(false)
  }

  function handleDeleteStat(s: MatchPlayerStat) {
    if (confirm("¿Eliminar la estadística de este jugador en el partido?")) deleteMatchStat(s.id)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-4">
          <ArrowLeft size={15} /> Volver a Partidos
        </Link>

        {/* Match header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {match.category && <Badge variant="blue">{match.category}</Badge>}
                {match.competition && <Badge>{match.competition}</Badge>}
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {match.is_home ? "FutbolMetrics vs" : "vs (visitante)"} {match.opponent}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDate(match.date)}</span>
                {match.time && <span className="flex items-center gap-1"><Clock size={13} /> {match.time}</span>}
                {match.location && <span className="flex items-center gap-1"><MapPin size={13} /> {match.location}</span>}
              </div>
              {match.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{match.notes}</p>}
            </div>
            {played && (
              <div className="text-3xl font-black text-slate-900 dark:text-white px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {match.our_score} - {match.opponent_score}
              </div>
            )}
          </div>
          {match.video_url && (
            <a href={match.video_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="mt-4">
                <Video size={15} /> Ver video del partido (cámara 360)
              </Button>
            </a>
          )}
        </div>

        {/* Player stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Estadísticas de Jugadores</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stats.length} jugador{stats.length !== 1 ? "es" : ""} registrado{stats.length !== 1 ? "s" : ""}</p>
            </div>
            {isCoach && playersWithoutStat.length > 0 && (
              <Button size="sm" onClick={openAddStat}>
                <Plus size={14} /> Agregar Jugador
              </Button>
            )}
          </div>

          {stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <Footprints size={36} className="mb-3 opacity-30" />
              <p className="font-semibold text-sm">Aún no hay estadísticas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.map(s => {
                const player = players.find(p => p.id === s.player_id)
                return (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <img src={player?.photo_url || avatarUrl(player?.name ?? "?", s.player_id)} alt={player?.name ?? "?"} className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{player?.name ?? "Jugador eliminado"}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-400 dark:text-slate-500">
                        <span>{s.minutes_played}&apos;</span>
                        {s.position_played && <><span className="text-slate-200">·</span><span>{s.position_played}</span></>}
                        {s.highlight_url && (
                          <>
                            <span className="text-slate-200">·</span>
                            <a href={s.highlight_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center gap-1 hover:underline">
                              <Film size={11} /> Clip 360
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {s.goals > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Goal size={13} /> {s.goals}
                        </span>
                      )}
                      {s.assists > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-500">
                          <Footprints size={13} /> {s.assists}
                        </span>
                      )}
                      {s.yellow_cards > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <Square size={13} className="fill-amber-400 text-amber-500" /> {s.yellow_cards}
                        </span>
                      )}
                      {s.red_cards > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                          <Square size={13} className="fill-red-500 text-red-500" /> {s.red_cards}
                        </span>
                      )}
                      {s.rating !== null && (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> {s.rating}
                        </span>
                      )}
                      {isCoach && (
                        <>
                          <button onClick={() => openEditStat(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteStat(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: add/edit player stat */}
      {showStatForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingStatId ? "Editar Estadística" : "Agregar Jugador al Partido"}</h2>
              <button onClick={() => setShowStatForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStatSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {!editingStatId && (
                  <div className="col-span-2">
                    <Select label="Jugador *" value={form.player_id} onChange={e => set("player_id", e.target.value)} required
                      placeholder="Seleccionar jugador..."
                      options={playersWithoutStat.map(p => ({ value: p.id, label: p.name }))} />
                  </div>
                )}
                <Input label="Minutos jugados" type="number" min={0} max={120} value={form.minutes_played} onChange={e => set("minutes_played", e.target.value)} />
                <Select label="Posición jugada" value={form.position_played} onChange={e => set("position_played", e.target.value)}
                  placeholder="Sin especificar" options={POSITIONS.map(p => ({ value: p, label: p }))} />
                <Input label="Goles" type="number" min={0} value={form.goals} onChange={e => set("goals", e.target.value)} />
                <Input label="Asistencias" type="number" min={0} value={form.assists} onChange={e => set("assists", e.target.value)} />
                <Input label="Tarjetas amarillas" type="number" min={0} max={2} value={form.yellow_cards} onChange={e => set("yellow_cards", e.target.value)} />
                <Input label="Tarjetas rojas" type="number" min={0} max={1} value={form.red_cards} onChange={e => set("red_cards", e.target.value)} />
                <div className="col-span-2">
                  <Input label="Calificación del partido (0-10)" type="number" min={0} max={10} step="0.1" placeholder="Ej: 7.5" value={form.rating} onChange={e => set("rating", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input label="Clip individual (cámara 360)" placeholder="Link del highlight de este jugador" value={form.highlight_url} onChange={e => set("highlight_url", e.target.value)} hint="Si la cámara 360 genera clips por jugador, pega aquí el link" />
                </div>
                <div className="col-span-2">
                  <Textarea label="Notas" placeholder="Observaciones del rendimiento..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                {editingStatId && (
                  <Button variant="danger" type="button" onClick={() => {
                    const s = stats.find(st => st.id === editingStatId)
                    if (s) { handleDeleteStat(s); setShowStatForm(false) }
                  }}>
                    Eliminar
                  </Button>
                )}
                <Button variant="secondary" type="button" onClick={() => setShowStatForm(false)}>Cancelar</Button>
                <Button type="submit" loading={saving}>Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
