"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { MousePointer2, PenTool, Plus, Undo2, Eraser, Save, Trash2, FolderOpen, Users, CircleDot, LayoutGrid, Play, Square, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useT } from "@/lib/i18n/useT"
import { tactics } from "@/lib/i18n/dictionaries/tactics"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"

interface Marker { id: string; team: "home" | "away" | "ball"; x: number; y: number; label: string }
interface Line { id: string; points: { x: number; y: number }[]; type: "run" | "pass" }
interface TacticsPlay { id: string; name: string; markers: Marker[]; lines: Line[]; created_at: string }

const W = 105
const H = 68
const ANIM_DURATION = 3000
const ASSIGN_RADIUS = 8

const FORMATIONS: Record<string, { x: number; y: number }[]> = {
  "F11 · 4-4-2": [
    { x: 10, y: 34 },
    { x: 26, y: 10 }, { x: 26, y: 26 }, { x: 26, y: 42 }, { x: 26, y: 58 },
    { x: 45, y: 8 }, { x: 45, y: 26 }, { x: 45, y: 42 }, { x: 45, y: 60 },
    { x: 60, y: 26 }, { x: 60, y: 42 },
  ],
  "F11 · 4-3-3": [
    { x: 10, y: 34 },
    { x: 26, y: 10 }, { x: 26, y: 26 }, { x: 26, y: 42 }, { x: 26, y: 58 },
    { x: 45, y: 18 }, { x: 45, y: 34 }, { x: 45, y: 50 },
    { x: 60, y: 10 }, { x: 60, y: 34 }, { x: 60, y: 58 },
  ],
  "F11 · 3-5-2": [
    { x: 10, y: 34 },
    { x: 26, y: 16 }, { x: 26, y: 34 }, { x: 26, y: 52 },
    { x: 45, y: 6 }, { x: 45, y: 22 }, { x: 45, y: 34 }, { x: 45, y: 46 }, { x: 45, y: 62 },
    { x: 60, y: 26 }, { x: 60, y: 42 },
  ],
  "F11 · 4-2-3-1": [
    { x: 10, y: 34 },
    { x: 26, y: 10 }, { x: 26, y: 26 }, { x: 26, y: 42 }, { x: 26, y: 58 },
    { x: 40, y: 24 }, { x: 40, y: 44 },
    { x: 52, y: 10 }, { x: 52, y: 34 }, { x: 52, y: 58 },
    { x: 64, y: 34 },
  ],
  "F8 · 3-2-2": [
    { x: 10, y: 34 },
    { x: 26, y: 14 }, { x: 26, y: 34 }, { x: 26, y: 54 },
    { x: 45, y: 24 }, { x: 45, y: 44 },
    { x: 60, y: 24 }, { x: 60, y: 44 },
  ],
  "F8 · 2-3-2": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 45, y: 14 }, { x: 45, y: 34 }, { x: 45, y: 54 },
    { x: 60, y: 24 }, { x: 60, y: 44 },
  ],
  "F8 · 3-3-1": [
    { x: 10, y: 34 },
    { x: 26, y: 14 }, { x: 26, y: 34 }, { x: 26, y: 54 },
    { x: 45, y: 14 }, { x: 45, y: 34 }, { x: 45, y: 54 },
    { x: 60, y: 34 },
  ],
  "F8 · 2-2-3": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 45, y: 24 }, { x: 45, y: 44 },
    { x: 60, y: 14 }, { x: 60, y: 34 }, { x: 60, y: 54 },
  ],
  "F7 · 2-3-1": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 45, y: 14 }, { x: 45, y: 34 }, { x: 45, y: 54 },
    { x: 60, y: 34 },
  ],
  "F7 · 3-2-1": [
    { x: 10, y: 34 },
    { x: 26, y: 14 }, { x: 26, y: 34 }, { x: 26, y: 54 },
    { x: 45, y: 24 }, { x: 45, y: 44 },
    { x: 60, y: 34 },
  ],
  "F7 · 2-2-2": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 45, y: 24 }, { x: 45, y: 44 },
    { x: 60, y: 24 }, { x: 60, y: 44 },
  ],
  "F7 · 1-3-2": [
    { x: 10, y: 34 },
    { x: 26, y: 34 },
    { x: 45, y: 14 }, { x: 45, y: 34 }, { x: 45, y: 54 },
    { x: 60, y: 24 }, { x: 60, y: 44 },
  ],
  "F5 · 1-2-1": [
    { x: 10, y: 34 },
    { x: 26, y: 34 },
    { x: 45, y: 24 }, { x: 45, y: 44 },
    { x: 60, y: 34 },
  ],
  "F5 · 2-2": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 60, y: 20 }, { x: 60, y: 48 },
  ],
  "F5 · 2-1-1": [
    { x: 10, y: 34 },
    { x: 26, y: 20 }, { x: 26, y: 48 },
    { x: 45, y: 34 },
    { x: 60, y: 34 },
  ],
  "F5 · 1-1-2": [
    { x: 10, y: 34 },
    { x: 26, y: 34 },
    { x: 45, y: 34 },
    { x: 60, y: 20 }, { x: 60, y: 48 },
  ],
}

const FORMAT_KEYS = ["F11", "F8", "F7", "F5"] as const
type FormatKey = typeof FORMAT_KEYS[number]

function interpolatePath(points: { x: number; y: number }[], t: number) {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 }
  const idx = t * (points.length - 1)
  const i = Math.min(Math.floor(idx), points.length - 2)
  const frac = idx - i
  const p0 = points[i], p1 = points[i + 1]
  return { x: p0.x + (p1.x - p0.x) * frac, y: p0.y + (p1.y - p0.y) * frac }
}

export default function TacticsPage() {
  const t = useT(tactics)
  const { currentUser, teamSettings } = useApp()
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)
  const isCoach = currentUser?.role === "coach" || currentUser?.role === "assistant"

  const [mode, setMode] = useState<"move" | "draw">("move")
  const [lineType, setLineType] = useState<"run" | "pass">("run")
  const [markers, setMarkers] = useState<Marker[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [drawingLine, setDrawingLine] = useState<Line | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [plays, setPlays] = useState<TacticsPlay[]>([])
  const [loadingPlays, setLoadingPlays] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [playName, setPlayName] = useState("")
  const [activeFormat, setActiveFormat] = useState<FormatKey>("F11")

  const [isPlaying, setIsPlaying] = useState(false)
  const [animProgress, setAnimProgress] = useState(0)
  const [animPositions, setAnimPositions] = useState<Record<string, { x: number; y: number }>>({})

  const formationKeys = Object.keys(FORMATIONS).filter(k => k.startsWith(activeFormat))
  const academyId = teamSettings?.id ?? null

  // Load plays from Supabase
  useEffect(() => {
    if (!academyId) return
    setLoadingPlays(true)
    supabase
      .from("tactics_plays")
      .select("*")
      .eq("academy_id", academyId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPlays(data.map(r => ({
          id: r.id,
          name: r.name,
          markers: r.markers as unknown as Marker[],
          lines: r.lines as unknown as Line[],
          created_at: r.created_at,
        })))
        setLoadingPlays(false)
      })
  }, [academyId])

  function toPoint(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = Math.max(0, Math.min(W, ((clientX - rect.left) / rect.width) * W))
    const y = Math.max(0, Math.min(H, ((clientY - rect.top) / rect.height) * H))
    return { x, y }
  }

  function addMarker(team: "home" | "away") {
    const count = markers.filter(m => m.team === team).length
    const x = team === "home" ? 22 : 83
    const y = 8 + (count % 7) * 8.5
    setMarkers(ms => [...ms, { id: crypto.randomUUID(), team, x, y, label: String(count + 1) }])
  }

  function addBall() {
    if (markers.some(m => m.team === "ball")) return
    setMarkers(ms => [...ms, { id: crypto.randomUUID(), team: "ball", x: W / 2, y: H / 2, label: "" }])
  }

  function applyFormation(name: string) {
    const positions = FORMATIONS[name]
    if (!positions) return
    setMarkers(ms => [
      ...ms.filter(m => m.team !== "home"),
      ...positions.map((p, i) => ({ id: crypto.randomUUID(), team: "home" as const, x: p.x, y: p.y, label: String(i + 1) })),
    ])
  }

  function removeMarker(id: string) { setMarkers(ms => ms.filter(m => m.id !== id)) }
  function removeLine(id: string) { setLines(ls => ls.filter(l => l.id !== id)) }
  function undoLine() { setLines(ls => ls.slice(0, -1)) }

  function clearBoard() {
    if (markers.length === 0 && lines.length === 0) return
    if (!confirm(t("confirmClearBoard"))) return
    stopAnimation()
    setMarkers([])
    setLines([])
  }

  function handleMarkerPointerDown(id: string, e: React.PointerEvent) {
    if (mode !== "move" || isPlaying) return
    e.stopPropagation()
    setDraggingId(id)
  }

  function handleSvgPointerDown(e: React.PointerEvent) {
    if (mode !== "draw" || isPlaying) return
    const p = toPoint(e.clientX, e.clientY)
    setDrawingLine({ id: crypto.randomUUID(), points: [p], type: lineType })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (mode === "move" && draggingId) {
      const p = toPoint(e.clientX, e.clientY)
      setMarkers(ms => ms.map(m => m.id === draggingId ? { ...m, ...p } : m))
    } else if (mode === "draw" && drawingLine) {
      const p = toPoint(e.clientX, e.clientY)
      setDrawingLine(line => line ? { ...line, points: [...line.points, p] } : line)
    }
  }

  function endInteraction() {
    if (draggingId) setDraggingId(null)
    if (drawingLine) {
      if (drawingLine.points.length > 1) setLines(ls => [...ls, drawingLine])
      setDrawingLine(null)
    }
  }

  useEffect(() => {
    window.addEventListener("pointerup", endInteraction)
    window.addEventListener("pointercancel", endInteraction)
    return () => {
      window.removeEventListener("pointerup", endInteraction)
      window.removeEventListener("pointercancel", endInteraction)
    }
  }, [draggingId, drawingLine])

  // Build animation assignments:
  // - "run" lines → animate nearest player (non-ball marker)
  // - "pass" lines → animate the ball marker
  function buildAssignments() {
    const usedMarkers = new Set<string>()
    const assignments: Array<{ markerId: string; line: Line }> = []
    const ball = markers.find(m => m.team === "ball")

    for (const line of lines) {
      if (line.points.length < 2) continue

      if (line.type === "pass") {
        if (ball) assignments.push({ markerId: ball.id, line })
      } else {
        const start = line.points[0]
        let nearest: Marker | null = null
        let minDist = ASSIGN_RADIUS
        for (const m of markers) {
          if (m.team === "ball" || usedMarkers.has(m.id)) continue
          const d = Math.hypot(m.x - start.x, m.y - start.y)
          if (d < minDist) { minDist = d; nearest = m }
        }
        if (nearest) {
          assignments.push({ markerId: nearest.id, line })
          usedMarkers.add(nearest.id)
        }
      }
    }
    return assignments
  }

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    setIsPlaying(false)
    setAnimProgress(0)
    setAnimPositions({})
  }, [])

  function togglePlay() {
    if (isPlaying) { stopAnimation(); return }
    const assignments = buildAssignments()
    if (assignments.length === 0) return
    setIsPlaying(true)
    const startTime = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - startTime) / ANIM_DURATION, 1)
      setAnimProgress(progress)
      const positions: Record<string, { x: number; y: number }> = {}
      for (const { markerId, line } of assignments) {
        positions[markerId] = interpolatePath(line.points, progress)
      }
      setAnimPositions(positions)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        setIsPlaying(false)
        setAnimProgress(0)
        setMarkers(ms => ms.map(m => positions[m.id] ? { ...m, ...positions[m.id] } : m))
        setAnimPositions({})
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  async function savePlay() {
    if (!playName.trim() || !academyId) return
    setSaving(true)
    const { data, error } = await supabase
      .from("tactics_plays")
      .insert({ academy_id: academyId, name: playName.trim(), markers: markers as unknown as import("@/lib/database.types").Json, lines: lines as unknown as import("@/lib/database.types").Json })
      .select()
      .single()
    if (!error && data) {
      const play: TacticsPlay = { id: data.id, name: data.name, markers, lines, created_at: data.created_at }
      setPlays(ps => [play, ...ps])
    }
    setPlayName("")
    setShowSaveInput(false)
    setSaving(false)
  }

  function loadPlay(play: TacticsPlay) {
    stopAnimation()
    setMarkers(play.markers)
    setLines(play.lines)
    setMode("move")
  }

  async function deletePlay(id: string) {
    if (!confirm(t("confirmDeletePlay"))) return
    await supabase.from("tactics_plays").delete().eq("id", id)
    setPlays(ps => ps.filter(p => p.id !== id))
  }

  const assignments = buildAssignments()

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 mb-6">
          {/* Toolbar */}
          {isCoach && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Button size="sm" variant={mode === "move" ? "primary" : "outline"} onClick={() => setMode("move")} disabled={isPlaying}>
                <MousePointer2 size={14} /> {t("move")}
              </Button>
              <Button size="sm" variant={mode === "draw" ? "primary" : "outline"} onClick={() => setMode("draw")} disabled={isPlaying}>
                <PenTool size={14} /> {t("draw")}
              </Button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <Button size="sm" variant="outline" onClick={() => addMarker("home")} disabled={isPlaying}>
                <Plus size={14} /> {t("player")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => addMarker("away")} disabled={isPlaying}>
                <Plus size={14} /> {t("opponent")}
              </Button>
              <Button size="sm" variant="outline" onClick={addBall} disabled={markers.some(m => m.team === "ball") || isPlaying}>
                <CircleDot size={14} /> {t("ball")}
              </Button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              {mode === "draw" && !isPlaying && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <Button size="sm" variant={lineType === "run" ? "primary" : "ghost"} onClick={() => setLineType("run")}>
                    {t("movement")}
                  </Button>
                  <Button size="sm" variant={lineType === "pass" ? "primary" : "ghost"} onClick={() => setLineType("pass")}>
                    {t("pass")}
                  </Button>
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={undoLine} disabled={lines.length === 0 || isPlaying}>
                <Undo2 size={14} /> {t("undoLine")}
              </Button>
              <Button size="sm" variant="ghost" onClick={clearBoard} disabled={isPlaying}>
                <Eraser size={14} /> {t("clearAll")}
              </Button>
              <div className="flex items-center gap-2 flex-wrap">
                <LayoutGrid size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {FORMAT_KEYS.map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setActiveFormat(fmt)}
                      disabled={isPlaying}
                      className={`h-6 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                        activeFormat === fmt
                          ? "bg-white dark:bg-slate-900 text-[#0B5CFF] shadow-sm"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <Select
                  options={formationKeys.map(f => ({ value: f, label: f.split(" · ")[1] }))}
                  placeholder={t("formationPlaceholder")}
                  onChange={e => e.target.value && applyFormation(e.target.value)}
                  value=""
                  className="h-8 text-xs w-32"
                />
              </div>
              <div className="flex-1" />

              {/* Play / Stop */}
              <button
                onClick={togglePlay}
                disabled={lines.length === 0}
                title={isPlaying ? "Detener" : assignments.length === 0 ? "Dibuja líneas desde jugadores o el balón" : `Animar ${assignments.length} elemento${assignments.length !== 1 ? "s" : ""}`}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isPlaying
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                }`}
              >
                {isPlaying ? <><Square size={13} fill="white" /> Parar</> : <><Play size={13} fill="white" /> Animar</>}
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

              {showSaveInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("playNamePlaceholder")}
                    value={playName}
                    onChange={e => setPlayName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && savePlay()}
                    className="h-8 text-xs w-44"
                    autoFocus
                  />
                  <Button size="sm" onClick={savePlay} disabled={!playName.trim() || saving}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : t("save")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowSaveInput(false); setPlayName("") }}>{t("cancel")}</Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setShowSaveInput(true)} disabled={isPlaying}>
                  <Save size={14} /> {t("savePlay")}
                </Button>
              )}
            </div>
          )}

          {/* Player: only Play button */}
          {!isCoach && lines.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={togglePlay}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-sm transition-all ${
                  isPlaying
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isPlaying ? <><Square size={13} fill="white" /> Parar</> : <><Play size={13} fill="white" /> Ver jugada</>}
              </button>
              {isPlaying && <span className="text-xs text-slate-500 dark:text-slate-400">Reproduciendo animación…</span>}
            </div>
          )}

          {/* Progress bar */}
          {isPlaying && (
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${animProgress * 100}%`, transition: "none" }} />
            </div>
          )}

          {/* Helper */}
          {isCoach && !isPlaying && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              {mode === "move" ? t("helperMove") : t("helperDraw")}
              {lines.length > 0 && assignments.length === 0 && (
                <span className="ml-2 text-amber-500">· Inicia las líneas de movimiento cerca de un jugador, y las de pase cerca del balón.</span>
              )}
              {assignments.length > 0 && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">· {assignments.length} elemento{assignments.length !== 1 ? "s" : ""} listo{assignments.length !== 1 ? "s" : ""} para animar.</span>
              )}
            </p>
          )}

          {/* Field — slightly more compact */}
          <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 select-none touch-none" style={{ aspectRatio: "105/68", maxHeight: "380px" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="w-full h-full block"
              style={{ touchAction: "none" }}
              onPointerDown={handleSvgPointerDown}
              onPointerMove={handlePointerMove}
            >
              <defs>
                <marker id="arr-run" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#FBBF24" />
                </marker>
                <marker id="arr-pass" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Field markings */}
              <g stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.4} fill="none">
                <rect x={1} y={1} width={W - 2} height={H - 2} />
                <line x1={W / 2} y1={1} x2={W / 2} y2={H - 1} />
                <circle cx={W / 2} cy={H / 2} r={9.15} />
                <circle cx={W / 2} cy={H / 2} r={0.4} fill="#ffffff" />
                <rect x={1} y={13.84} width={16.5} height={40.32} />
                <rect x={1} y={24.84} width={5.5} height={18.32} />
                <circle cx={12} cy={H / 2} r={0.4} fill="#ffffff" />
                <rect x={W - 17.5} y={13.84} width={16.5} height={40.32} />
                <rect x={W - 6.5} y={24.84} width={5.5} height={18.32} />
                <circle cx={W - 12} cy={H / 2} r={0.4} fill="#ffffff" />
              </g>

              {/* Lines */}
              {lines.map(l => (
                <polyline
                  key={l.id}
                  points={l.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={l.type === "pass" ? "#38BDF8" : "#FBBF24"}
                  strokeWidth={0.7}
                  strokeDasharray={l.type === "pass" ? "1.4 1" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={l.type === "pass" ? "url(#arr-pass)" : "url(#arr-run)"}
                  onDoubleClick={() => isCoach && !isPlaying && removeLine(l.id)}
                  style={{ cursor: isCoach && mode === "move" && !isPlaying ? "pointer" : "default", pointerEvents: isCoach && mode === "move" ? "stroke" : "none" }}
                />
              ))}
              {drawingLine && (
                <polyline
                  points={drawingLine.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={drawingLine.type === "pass" ? "#38BDF8" : "#FBBF24"}
                  strokeOpacity={0.7}
                  strokeWidth={0.7}
                  strokeDasharray={drawingLine.type === "pass" ? "1.4 1" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Markers */}
              {markers.map(m => {
                const pos = animPositions[m.id] ?? { x: m.x, y: m.y }
                const isAnimated = !!animPositions[m.id]
                return (
                  <g
                    key={m.id}
                    onPointerDown={e => handleMarkerPointerDown(m.id, e)}
                    onDoubleClick={() => isCoach && !isPlaying && removeMarker(m.id)}
                    style={{ cursor: isCoach && mode === "move" && !isPlaying ? "grab" : "default" }}
                  >
                    {m.team === "ball" ? (
                      <>
                        {isAnimated && <circle cx={pos.x} cy={pos.y} r={2.8} fill="#ffffff" fillOpacity={0.25} />}
                        <circle cx={pos.x} cy={pos.y} r={1.6} fill="#ffffff" stroke="#0F172A" strokeWidth={0.25} />
                        <path
                          d={`M${pos.x - 0.7},${pos.y - 0.3} L${pos.x},${pos.y - 1} L${pos.x + 0.7},${pos.y - 0.3} L${pos.x + 0.4},${pos.y + 0.6} L${pos.x - 0.4},${pos.y + 0.6} Z`}
                          fill="#0F172A"
                        />
                      </>
                    ) : (
                      <>
                        {isAnimated && <circle cx={pos.x} cy={pos.y} r={3.8} fill={m.team === "home" ? "#0B5CFF" : "#EF4444"} fillOpacity={0.25} />}
                        <circle cx={pos.x} cy={pos.y} r={2.6} fill={m.team === "home" ? "#0B5CFF" : "#EF4444"} stroke="#ffffff" strokeWidth={0.3} />
                        <text x={pos.x} y={pos.y} fontSize={2.4} fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central">
                          {m.label}
                        </text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0B5CFF]" /> Equipo</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Rival</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" /> Balón</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400" /> Movimiento (anima jugador)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-400" style={{ backgroundImage: "repeating-linear-gradient(90deg,#38BDF8 0 4px,transparent 4px 7px)" }} /> Pase (anima balón)</span>
          </div>
        </div>

        {/* Saved plays */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-[#0B5CFF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jugadas Guardadas</h3>
          </div>
          {loadingPlays ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
          ) : plays.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{isCoach ? "Aún no has guardado ninguna jugada." : "El entrenador aún no ha compartido jugadas."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plays.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(p.created_at)} · {p.markers.filter(m => m.team !== "ball").length} jugadores · {p.lines.length} movimientos</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => loadPlay(p)}>
                    {isCoach ? "Cargar" : "Ver"}
                  </Button>
                  {isCoach && (
                    <button onClick={() => deletePlay(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
