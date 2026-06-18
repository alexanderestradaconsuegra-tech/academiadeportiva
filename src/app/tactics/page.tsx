"use client"
import { useEffect, useRef, useState } from "react"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { MousePointer2, PenTool, Plus, Undo2, Eraser, Save, Trash2, FolderOpen, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Marker { id: string; team: "home" | "away"; x: number; y: number; label: string }
interface Line { id: string; points: { x: number; y: number }[] }
interface Play { id: string; name: string; markers: Marker[]; lines: Line[]; created_at: string }

const STORAGE_KEY = "futbolmetrics_tactics_plays"
const W = 105
const H = 68

export default function TacticsPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mode, setMode] = useState<"move" | "draw">("move")
  const [markers, setMarkers] = useState<Marker[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [drawingLine, setDrawingLine] = useState<Line | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [plays, setPlays] = useState<Play[]>([])
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [playName, setPlayName] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPlays(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function persistPlays(next: Play[]) {
    setPlays(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

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

  function removeMarker(id: string) {
    setMarkers(ms => ms.filter(m => m.id !== id))
  }

  function undoLine() {
    setLines(ls => ls.slice(0, -1))
  }

  function clearBoard() {
    if (markers.length === 0 && lines.length === 0) return
    if (!confirm("¿Borrar toda la jugada actual del tablero?")) return
    setMarkers([])
    setLines([])
  }

  function handleMarkerPointerDown(id: string, e: React.PointerEvent) {
    if (mode !== "move") return
    e.stopPropagation()
    setDraggingId(id)
  }

  function handleSvgPointerDown(e: React.PointerEvent) {
    if (mode !== "draw") return
    const p = toPoint(e.clientX, e.clientY)
    setDrawingLine({ id: crypto.randomUUID(), points: [p] })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (mode === "move" && draggingId) {
      const p = toPoint(e.clientX, e.clientY)
      setMarkers(ms => ms.map(m => (m.id === draggingId ? { ...m, x: p.x, y: p.y } : m)))
    } else if (mode === "draw" && drawingLine) {
      const p = toPoint(e.clientX, e.clientY)
      setDrawingLine(line => (line ? { ...line, points: [...line.points, p] } : line))
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

  function savePlay() {
    if (!playName.trim()) return
    const play: Play = { id: crypto.randomUUID(), name: playName.trim(), markers, lines, created_at: new Date().toISOString() }
    persistPlays([play, ...plays])
    setPlayName("")
    setShowSaveInput(false)
  }

  function loadPlay(play: Play) {
    setMarkers(play.markers)
    setLines(play.lines)
    setMode("move")
  }

  function deletePlay(id: string) {
    if (!confirm("¿Eliminar esta jugada guardada?")) return
    persistPlays(plays.filter(p => p.id !== id))
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Tablero Táctico" subtitle="Diseña jugadas, formaciones y movimientos del equipo" />

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 mb-6">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button size="sm" variant={mode === "move" ? "primary" : "outline"} onClick={() => setMode("move")}>
              <MousePointer2 size={14} /> Mover
            </Button>
            <Button size="sm" variant={mode === "draw" ? "primary" : "outline"} onClick={() => setMode("draw")}>
              <PenTool size={14} /> Dibujar
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <Button size="sm" variant="outline" onClick={() => addMarker("home")}>
              <Plus size={14} /> Jugador
            </Button>
            <Button size="sm" variant="outline" onClick={() => addMarker("away")}>
              <Plus size={14} /> Rival
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <Button size="sm" variant="ghost" onClick={undoLine} disabled={lines.length === 0}>
              <Undo2 size={14} /> Deshacer línea
            </Button>
            <Button size="sm" variant="ghost" onClick={clearBoard}>
              <Eraser size={14} /> Borrar todo
            </Button>
            <div className="flex-1" />
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nombre de la jugada"
                  value={playName}
                  onChange={e => setPlayName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && savePlay()}
                  className="h-8 text-xs w-44"
                  autoFocus
                />
                <Button size="sm" onClick={savePlay} disabled={!playName.trim()}>Guardar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowSaveInput(false); setPlayName("") }}>Cancelar</Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowSaveInput(true)}>
                <Save size={14} /> Guardar jugada
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            {mode === "move"
              ? "Arrastra los jugadores para ubicarlos en la cancha. Doble clic sobre un jugador para quitarlo."
              : "Haz clic y arrastra sobre la cancha para dibujar una flecha de movimiento."}
          </p>

          {/* Field */}
          <div className="relative w-full aspect-[105/68] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 select-none touch-none">
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
                <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#FBBF24" />
                </marker>
              </defs>

              {/* Field markings */}
              <g stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.4} fill="none">
                <rect x={1} y={1} width={W - 2} height={H - 2} />
                <line x1={W / 2} y1={1} x2={W / 2} y2={H - 1} />
                <circle cx={W / 2} cy={H / 2} r={9.15} />
                <circle cx={W / 2} cy={H / 2} r={0.4} fill="#ffffff" />
                {/* Left box */}
                <rect x={1} y={13.84} width={16.5} height={40.32} />
                <rect x={1} y={24.84} width={5.5} height={18.32} />
                <circle cx={12} cy={H / 2} r={0.4} fill="#ffffff" />
                {/* Right box */}
                <rect x={W - 17.5} y={13.84} width={16.5} height={40.32} />
                <rect x={W - 6.5} y={24.84} width={5.5} height={18.32} />
                <circle cx={W - 12} cy={H / 2} r={0.4} fill="#ffffff" />
              </g>

              {/* Saved lines */}
              {lines.map(l => (
                <polyline
                  key={l.id}
                  points={l.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth={0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#arrowhead)"
                />
              ))}
              {drawingLine && (
                <polyline
                  points={drawingLine.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#FBBF24"
                  strokeOpacity={0.7}
                  strokeWidth={0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Markers */}
              {markers.map(m => (
                <g
                  key={m.id}
                  onPointerDown={e => handleMarkerPointerDown(m.id, e)}
                  onDoubleClick={() => removeMarker(m.id)}
                  style={{ cursor: mode === "move" ? "grab" : "default" }}
                >
                  <circle cx={m.x} cy={m.y} r={2.6} fill={m.team === "home" ? "#0B5CFF" : "#EF4444"} stroke="#ffffff" strokeWidth={0.3} />
                  <text x={m.x} y={m.y} fontSize={2.4} fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central">
                    {m.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0B5CFF]" /> Equipo</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Rival</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400" /> Movimiento</span>
          </div>
        </div>

        {/* Saved plays */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-[#0B5CFF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mis Jugadas Guardadas</h3>
          </div>
          {plays.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no has guardado ninguna jugada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plays.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(p.created_at)} · {p.markers.length} jugadores · {p.lines.length} movimientos</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => loadPlay(p)}>Cargar</Button>
                  <button onClick={() => deletePlay(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
