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
  Goal, Footprints, Square, Star, Film, Users, ChevronRight, Check,
} from "lucide-react"
import { formatDate, avatarUrl, cn } from "@/lib/utils"
import type { Position, MatchPlayerStat } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { matches as matchesDict } from "@/lib/i18n/dictionaries/matches"
import { useEnumT } from "@/lib/i18n/enums"

const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]

const EMPTY_STAT_FORM = {
  player_id: "", minutes_played: "90", goals: "0", assists: "0",
  yellow_cards: "0", red_cards: "0", rating: "", position_played: "",
  highlight_url: "", notes: "",
}

export default function MatchDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { matches, players, currentUser, getMatchStats, addMatchStat, updateMatchStat, deleteMatchStat, getConvocatoria, updateMatch } = useApp()
  const isOwner = currentUser?.role === "coach"
  const isAssistant = currentUser?.role === "assistant"
  const t = useT(matchesDict)
  const enumT = useEnumT()

  const match = matches.find(m => m.id === id)
  const stats = getMatchStats(id)
  const convocatoria = getConvocatoria(id)

  const [showStatForm, setShowStatForm] = useState(false)
  const [editingStatId, setEditingStatId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_STAT_FORM)

  // Score entry state
  const [scoreForm, setScoreForm] = useState({ our: "", opponent: "" })
  const [editingScore, setEditingScore] = useState(false)
  const [savingScore, setSavingScore] = useState(false)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (!match) {
    return (
      <AppShell>
        <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
          <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-4">
            <ArrowLeft size={15} /> {t("backToMatches")}
          </Link>
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Trophy size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">{t("matchNotFound")}</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const isCoach = isOwner || (isAssistant && match.category === currentUser?.category)
  const matchId = match.id
  const playersWithoutStat = players.filter(p => !stats.some(s => s.player_id === p.id))
  const played = match.our_score !== null && match.opponent_score !== null

  const result = played
    ? match.our_score! > match.opponent_score! ? "win"
      : match.our_score! < match.opponent_score! ? "loss"
      : "draw"
    : null

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
    if (confirm(t("confirmDeleteStat"))) deleteMatchStat(s.id)
  }

  function openScoreEdit() {
    if (!match) return
    setScoreForm({
      our: match.our_score !== null ? String(match.our_score) : "",
      opponent: match.opponent_score !== null ? String(match.opponent_score) : "",
    })
    setEditingScore(true)
  }

  async function handleScoreSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (scoreForm.our === "" || scoreForm.opponent === "") return
    setSavingScore(true)
    updateMatch(id, {
      our_score: Number(scoreForm.our),
      opponent_score: Number(scoreForm.opponent),
    })
    setSavingScore(false)
    setEditingScore(false)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0B5CFF] mb-4">
          <ArrowLeft size={15} /> {t("backToMatches")}
        </Link>

        {/* Match header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {match.category && <Badge variant="blue">{enumT.category(match.category)}</Badge>}
                {match.competition && <Badge>{match.competition}</Badge>}
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {match.is_home ? t("vsHome") : t("vsAway")} {match.opponent}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDate(match.date)}</span>
                {match.time && <span className="flex items-center gap-1"><Clock size={13} /> {match.time}</span>}
                {match.location && <span className="flex items-center gap-1"><MapPin size={13} /> {match.location}</span>}
              </div>
              {match.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{match.notes}</p>}
            </div>
          </div>
          {match.video_url && (
            <div className="mt-4">
              <a href={match.video_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Video size={15} /> {t("watchMatchVideo")}
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Result card (played) */}
        {played && result && (
          <div className={cn(
            "rounded-2xl p-5 mb-4 border",
            result === "win"  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" :
            result === "loss" ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" :
                                "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20"
          )}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest mb-1",
                  result === "win"  ? "text-emerald-600 dark:text-emerald-400" :
                  result === "loss" ? "text-red-500" : "text-amber-600 dark:text-amber-400"
                )}>
                  {result === "win" ? "¡Ganado!" : result === "loss" ? "Perdido" : "Empate"}
                </p>
                <p className={cn(
                  "text-4xl font-black",
                  result === "win"  ? "text-emerald-700 dark:text-emerald-300" :
                  result === "loss" ? "text-red-600 dark:text-red-400" :
                                      "text-amber-700 dark:text-amber-300"
                )}>
                  {match.our_score} – {match.opponent_score}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {match.is_home ? "Local" : "Visitante"} · {match.opponent}
                </p>
              </div>
              {isCoach && !editingScore && (
                <button
                  onClick={openScoreEdit}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
            {isCoach && editingScore && (
              <form onSubmit={handleScoreSubmit} className="mt-4 flex items-center gap-3">
                <input
                  type="number" min={0} max={99}
                  value={scoreForm.our}
                  onChange={e => setScoreForm(f => ({ ...f, our: e.target.value }))}
                  className="w-16 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-lg font-black text-slate-900 dark:text-white outline-none focus:border-[#0B5CFF]"
                  placeholder="0"
                  required
                />
                <span className="text-lg font-black text-slate-400">–</span>
                <input
                  type="number" min={0} max={99}
                  value={scoreForm.opponent}
                  onChange={e => setScoreForm(f => ({ ...f, opponent: e.target.value }))}
                  className="w-16 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-lg font-black text-slate-900 dark:text-white outline-none focus:border-[#0B5CFF]"
                  placeholder="0"
                  required
                />
                <button type="submit" disabled={savingScore}
                  className="h-10 px-4 rounded-xl bg-[#0B5CFF] text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                  <Check size={14} /> Guardar
                </button>
                <button type="button" onClick={() => setEditingScore(false)}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                  <X size={14} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Score entry for unplayed matches (coach only) */}
        {!played && isCoach && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Registrar resultado</p>
            <form onSubmit={handleScoreSubmit} className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Nosotros</p>
                  <input
                    type="number" min={0} max={99}
                    value={scoreForm.our}
                    onChange={e => setScoreForm(f => ({ ...f, our: e.target.value }))}
                    className="w-20 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-3xl font-black text-slate-900 dark:text-white outline-none focus:border-[#0B5CFF] transition-colors"
                    placeholder="0"
                  />
                </div>
                <span className="text-2xl font-black text-slate-300 dark:text-slate-600 mt-5">–</span>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">{match.opponent}</p>
                  <input
                    type="number" min={0} max={99}
                    value={scoreForm.opponent}
                    onChange={e => setScoreForm(f => ({ ...f, opponent: e.target.value }))}
                    className="w-20 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-3xl font-black text-slate-900 dark:text-white outline-none focus:border-[#0B5CFF] transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingScore || scoreForm.our === "" || scoreForm.opponent === ""}
                className="h-11 px-5 rounded-xl bg-[#0B5CFF] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-40 hover:bg-blue-700 transition-colors mt-5"
              >
                <Check size={15} /> Confirmar resultado
              </button>
            </form>
          </div>
        )}

        {/* Convocatoria card */}
        {isCoach ? (
          <Link href={`/matches/${id}/convocatoria`} className="block mb-4">
            <div className={cn(
              "rounded-2xl p-4 flex items-center gap-4 transition-all hover:opacity-90",
              convocatoria ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" : "bg-[#0B5CFF]"
            )}>
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                convocatoria ? "bg-blue-50 dark:bg-blue-500/10" : "bg-white/15"
              )}>
                <Users size={20} className={convocatoria ? "text-[#0B5CFF]" : "text-white"} />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-bold", convocatoria ? "text-slate-900 dark:text-white" : "text-white")}>
                  {convocatoria ? "Convocatoria enviada" : "Convocar jugadores"}
                </p>
                <p className={cn("text-xs mt-0.5", convocatoria ? "text-slate-400 dark:text-slate-500" : "text-blue-100")}>
                  {convocatoria
                    ? `${convocatoria.players.length} jugadores · ${convocatoria.players.filter(p => p.confirmed === true).length} confirmaron`
                    : "Selecciona quiénes juegan y notifícalos"}
                </p>
              </div>
              <ChevronRight size={18} className={convocatoria ? "text-slate-400" : "text-white"} />
            </div>
          </Link>
        ) : convocatoria ? (
          <Link href={`/matches/${id}/convocatoria/view`} className="block mb-4">
            <div className="bg-[#0B5CFF] rounded-2xl p-4 flex items-center gap-4 hover:opacity-90 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Ver mi convocatoria</p>
                <p className="text-xs text-blue-100 mt-0.5">Confirma si puedes ir al partido</p>
              </div>
              <ChevronRight size={18} className="text-white" />
            </div>
          </Link>
        ) : null}

        {/* Player stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("playerStats")}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stats.length} {stats.length !== 1 ? t("playerRegisteredPlural") : t("playerRegisteredSingular")}</p>
            </div>
            {isCoach && playersWithoutStat.length > 0 && (
              <Button size="sm" onClick={openAddStat}>
                <Plus size={14} /> {t("addPlayer")}
              </Button>
            )}
          </div>

          {stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <Footprints size={36} className="mb-3 opacity-30" />
              <p className="font-semibold text-sm">{t("noStatsYet")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.map(s => {
                const player = players.find(p => p.id === s.player_id)
                return (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <img src={player?.photo_url || avatarUrl(player?.name ?? "?", s.player_id)} alt={player?.name ?? "?"} className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{player?.name ?? t("deletedPlayer")}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-400 dark:text-slate-500">
                        <span>{s.minutes_played}&apos;</span>
                        {s.position_played && <><span className="text-slate-200">·</span><span>{enumT.position(s.position_played as Position)}</span></>}
                        {s.highlight_url && (
                          <>
                            <span className="text-slate-200">·</span>
                            <a href={s.highlight_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center gap-1 hover:underline">
                              <Film size={11} /> {t("clip360")}
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
                          <button onClick={() => openEditStat(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t("edit")}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteStat(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" title={t("delete")}>
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingStatId ? t("editStatistic") : t("addPlayerToMatch")}</h2>
              <button onClick={() => setShowStatForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStatSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {!editingStatId && (
                  <div className="col-span-2">
                    <Select label={t("playerLabel")} value={form.player_id} onChange={e => set("player_id", e.target.value)} required
                      placeholder={t("selectPlayerPlaceholder")}
                      options={playersWithoutStat.map(p => ({ value: p.id, label: p.name }))} />
                  </div>
                )}
                <Input label={t("minutesPlayedLabel")} type="number" min={0} max={120} value={form.minutes_played} onChange={e => set("minutes_played", e.target.value)} />
                <Select label={t("positionPlayedLabel")} value={form.position_played} onChange={e => set("position_played", e.target.value)}
                  placeholder={t("unspecified")} options={POSITIONS.map(p => ({ value: p, label: enumT.position(p) }))} />
                <Input label={t("goalsLabel")} type="number" min={0} value={form.goals} onChange={e => set("goals", e.target.value)} />
                <Input label={t("assistsLabel")} type="number" min={0} value={form.assists} onChange={e => set("assists", e.target.value)} />
                <Input label={t("yellowCardsLabel")} type="number" min={0} max={2} value={form.yellow_cards} onChange={e => set("yellow_cards", e.target.value)} />
                <Input label={t("redCardsLabel")} type="number" min={0} max={1} value={form.red_cards} onChange={e => set("red_cards", e.target.value)} />
                <div className="col-span-2">
                  <Input label={t("matchRatingLabel")} type="number" min={0} max={10} step="0.1" placeholder={t("matchRatingPlaceholder")} value={form.rating} onChange={e => set("rating", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input label={t("individualClipLabel")} placeholder={t("individualClipPlaceholder")} value={form.highlight_url} onChange={e => set("highlight_url", e.target.value)} hint={t("individualClipHint")} />
                </div>
                <div className="col-span-2">
                  <Textarea label={t("notesLabel")} placeholder={t("performanceNotesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                {editingStatId && (
                  <Button variant="danger" type="button" onClick={() => {
                    const s = stats.find(st => st.id === editingStatId)
                    if (s) { handleDeleteStat(s); setShowStatForm(false) }
                  }}>
                    {t("delete")}
                  </Button>
                )}
                <Button variant="secondary" type="button" onClick={() => setShowStatForm(false)}>{t("cancel")}</Button>
                <Button type="submit" loading={saving}>{t("save")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
