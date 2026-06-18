"use client"
import { useMemo, useRef, useState } from "react"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import { useApp } from "@/context/AppContext"
import { Circle, Trash2, Radar, Info } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

const W = 105
const H = 68
const COLS = 21
const ROWS = 14
const SAMPLE_INTERVAL_MS = 120

function heatColor(t: number) {
  const stops: [number, [number, number, number]][] = [
    [0, [59, 130, 246]],
    [0.4, [16, 185, 129]],
    [0.7, [245, 158, 11]],
    [1, [239, 68, 68]],
  ]
  let i = 0
  while (i < stops.length - 1 && t > stops[i + 1][0]) i++
  const [t0, c0] = stops[i]
  const [t1, c1] = stops[Math.min(i + 1, stops.length - 1)]
  const ratio = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
  const c = c0.map((v, idx) => Math.round(v + (c1[idx] - v) * ratio)) as [number, number, number]
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export default function HeatmapPage() {
  const { players, getPlayerPositionSamples, addPositionSample, deletePositionSession } = useApp()
  const svgRef = useRef<SVGSVGElement>(null)
  const lastSampleRef = useRef(0)

  const [playerId, setPlayerId] = useState(players[0]?.id ?? "")
  const [sessionLabel, setSessionLabel] = useState("")
  const [viewSession, setViewSession] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)

  const allSamples = playerId ? getPlayerPositionSamples(playerId) : []

  const sessions = useMemo(() => {
    const map = new Map<string, { count: number; firstDate: string }>()
    for (const s of allSamples) {
      const existing = map.get(s.session_label)
      if (existing) {
        existing.count++
        if (s.created_at < existing.firstDate) existing.firstDate = s.created_at
      } else {
        map.set(s.session_label, { count: 1, firstDate: s.created_at })
      }
    }
    return Array.from(map.entries())
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.firstDate.localeCompare(a.firstDate))
  }, [allSamples])

  const activeLabel = recording ? sessionLabel : (viewSession ?? sessionLabel)
  const activeSamples = allSamples.filter(s => s.session_label === activeLabel)

  const grid = useMemo(() => {
    const cells = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    for (const p of activeSamples) {
      const cx = Math.min(COLS - 1, Math.max(0, Math.floor((p.x / W) * COLS)))
      const cy = Math.min(ROWS - 1, Math.max(0, Math.floor((p.y / H) * ROWS)))
      cells[cy][cx]++
    }
    return cells
  }, [activeSamples])

  const maxCount = Math.max(1, ...grid.flat())

  const zoneStats = useMemo(() => {
    if (activeSamples.length === 0) return null
    const third = W / 3
    let own = 0, mid = 0, rival = 0
    for (const p of activeSamples) {
      if (p.x < third) own++
      else if (p.x < third * 2) mid++
      else rival++
    }
    const total = activeSamples.length
    return {
      own: Math.round((own / total) * 100),
      mid: Math.round((mid / total) * 100),
      rival: Math.round((rival / total) * 100),
    }
  }, [activeSamples])

  function toPoint(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = Math.max(0, Math.min(W, ((clientX - rect.left) / rect.width) * W))
    const y = Math.max(0, Math.min(H, ((clientY - rect.top) / rect.height) * H))
    return { x, y }
  }

  function recordPoint(clientX: number, clientY: number) {
    const now = Date.now()
    if (now - lastSampleRef.current < SAMPLE_INTERVAL_MS) return
    lastSampleRef.current = now
    const p = toPoint(clientX, clientY)
    addPositionSample({ player_id: playerId, session_label: sessionLabel, x: p.x, y: p.y })
  }

  function startRecording() {
    if (!playerId || !sessionLabel.trim()) return
    setViewSession(null)
    setRecording(true)
  }

  function stopRecording() {
    setRecording(false)
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!recording) return
    recordPoint(e.clientX, e.clientY)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!recording || e.buttons !== 1) return
    recordPoint(e.clientX, e.clientY)
  }

  function loadSession(label: string) {
    setRecording(false)
    setViewSession(label)
    setSessionLabel(label)
  }

  function handleDelete(label: string) {
    if (!confirm(`¿Eliminar la sesión "${label}"? Se borrarán todos sus puntos.`)) return
    deletePositionSession(playerId, label)
    if (viewSession === label) setViewSession(null)
  }

  const player = players.find(p => p.id === playerId)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Mapa de Calor" subtitle="Zonas de la cancha donde el jugador estuvo presente" />

        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Info size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Esta función todavía no usa un GPS real. Mientras tanto, puedes <strong>marcar manualmente</strong> dónde
            estuvo el jugador durante un partido o entrenamiento: activa &quot;Grabar&quot; y arrastra el dedo o el mouse
            sobre la cancha para ir marcando su recorrido. Cuando tengas un dispositivo GPS, estos mismos puntos se
            podrán generar automáticamente.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Select
              value={playerId}
              onChange={e => { setPlayerId(e.target.value); setViewSession(null); setRecording(false); setSessionLabel("") }}
              options={players.map(p => ({ value: p.id, label: p.name }))}
              placeholder="Selecciona un jugador"
              className="w-56"
            />
            <Input
              placeholder="Nombre de la sesión (ej: vs Rival FC)"
              value={sessionLabel}
              onChange={e => { setSessionLabel(e.target.value); setViewSession(null) }}
              disabled={recording}
              className="h-10 w-56"
            />
            {recording ? (
              <Button variant="danger" onClick={stopRecording}>
                <Circle size={14} fill="currentColor" /> Detener grabación
              </Button>
            ) : (
              <Button onClick={startRecording} disabled={!playerId || !sessionLabel.trim()}>
                <Radar size={14} /> Grabar
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            {recording
              ? "Mantén presionado y arrastra sobre la cancha para marcar las posiciones del jugador."
              : "Elige un jugador, escribe el nombre de la sesión (ej: el partido de hoy) y presiona Grabar para empezar a marcar."}
          </p>

          <div
            className="relative w-full aspect-[105/68] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 select-none touch-none"
            style={{ cursor: recording ? "crosshair" : "default" }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="w-full h-full block"
              style={{ touchAction: "none" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            >
              <g stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.4} fill="none">
                <rect x={1} y={1} width={W - 2} height={H - 2} />
                <line x1={W / 2} y1={1} x2={W / 2} y2={H - 1} />
                <circle cx={W / 2} cy={H / 2} r={9.15} />
                <circle cx={W / 2} cy={H / 2} r={0.4} fill="#ffffff" />
                <rect x={1} y={13.84} width={16.5} height={40.32} />
                <rect x={1} y={24.84} width={5.5} height={18.32} />
                <rect x={W - 17.5} y={13.84} width={16.5} height={40.32} />
                <rect x={W - 6.5} y={24.84} width={5.5} height={18.32} />
              </g>

              {grid.map((row, ry) =>
                row.map((count, rx) => {
                  if (count === 0) return null
                  const t = count / maxCount
                  const cw = W / COLS
                  const ch = H / ROWS
                  return (
                    <rect
                      key={`${rx}-${ry}`}
                      x={rx * cw}
                      y={ry * ch}
                      width={cw}
                      height={ch}
                      fill={heatColor(t)}
                      fillOpacity={0.18 + 0.55 * t}
                    />
                  )
                })
              )}
            </svg>
          </div>

          {zoneStats && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{zoneStats.own}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tercio propio</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{zoneStats.mid}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Mediocampo</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{zoneStats.rival}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tercio rival</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Sesiones guardadas {player ? `· ${player.name}` : ""}
          </h3>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Radar size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Este jugador todavía no tiene sesiones de mapa de calor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div
                  key={s.label}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                    viewSession === s.label
                      ? "border-[#0B5CFF] bg-blue-50/60 dark:bg-blue-500/10"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(s.firstDate)} · {s.count} puntos</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => loadSession(s.label)}>Ver</Button>
                  <button onClick={() => handleDelete(s.label)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
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
