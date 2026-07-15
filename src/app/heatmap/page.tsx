"use client"
import { useMemo, useRef, useState } from "react"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import { useApp } from "@/context/AppContext"
import { Circle, Trash2, Radar, Info, MapPin, Upload, CheckCircle2, RotateCcw } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { buildTransform, parseTrackFile, type GeoPoint } from "@/lib/gps"
import { useT } from "@/lib/i18n/useT"
import { heatmap as heatmapDict } from "@/lib/i18n/dictionaries/heatmap"

const W = 105
const H = 68
const COLS = 21
const ROWS = 14
const GPS_SAMPLE_INTERVAL_MS = 1500
const MAX_IMPORT_POINTS = 1500

const CALIB_STEPS: { key: "calib_p0" | "calib_p1" | "calib_p2"; labelKey: "calibStep1Label" | "calibStep2Label" | "calibStep3Label"; hintKey: "calibStep1Hint" | "calibStep2Hint" | "calibStep3Hint" }[] = [
  { key: "calib_p0", labelKey: "calibStep1Label", hintKey: "calibStep1Hint" },
  { key: "calib_p1", labelKey: "calibStep2Label", hintKey: "calibStep2Hint" },
  { key: "calib_p2", labelKey: "calibStep3Label", hintKey: "calibStep3Hint" },
]

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
  const t = useT(heatmapDict)
  const { players, teamSettings, getPlayerPositionSamples, addPositionSample, addPositionSamples, deletePositionSession, updateTeamSettings } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastSampleRef = useRef(0)
  const watchIdRef = useRef<number | null>(null)

  const [playerId, setPlayerId] = useState(players[0]?.id ?? "")
  const [sessionLabel, setSessionLabel] = useState("")
  const [viewSession, setViewSession] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState("")
  const [importedCount, setImportedCount] = useState<number | null>(null)

  const [calibrating, setCalibrating] = useState(false)
  const [calibStep, setCalibStep] = useState(0)
  const [calibPoints, setCalibPoints] = useState<GeoPoint[]>([])
  const [calibBusy, setCalibBusy] = useState(false)
  const [calibError, setCalibError] = useState("")

  const calibrated = !!(
    teamSettings?.calib_p0_lat != null && teamSettings?.calib_p0_lng != null &&
    teamSettings?.calib_p1_lat != null && teamSettings?.calib_p1_lng != null &&
    teamSettings?.calib_p2_lat != null && teamSettings?.calib_p2_lng != null
  )

  const transform = useMemo(() => {
    if (!calibrated || !teamSettings) return null
    return buildTransform({
      p0: { lat: teamSettings.calib_p0_lat!, lng: teamSettings.calib_p0_lng! },
      p1: { lat: teamSettings.calib_p1_lat!, lng: teamSettings.calib_p1_lng! },
      p2: { lat: teamSettings.calib_p2_lat!, lng: teamSettings.calib_p2_lng! },
    }, W, H)
  }, [calibrated, teamSettings])

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

  function startCalibration() {
    setCalibError("")
    setCalibPoints([])
    setCalibStep(0)
    setCalibrating(true)
  }

  function cancelCalibration() {
    setCalibrating(false)
    setCalibBusy(false)
    setCalibError("")
  }

  function markCalibCorner() {
    if (!("geolocation" in navigator)) {
      setCalibError(t("geolocationNotAvailable"))
      return
    }
    setCalibBusy(true)
    setCalibError("")
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCalibBusy(false)
        const point: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const next = [...calibPoints, point]
        setCalibPoints(next)
        if (next.length === CALIB_STEPS.length) {
          updateTeamSettings({
            calib_p0_lat: next[0].lat, calib_p0_lng: next[0].lng,
            calib_p1_lat: next[1].lat, calib_p1_lng: next[1].lng,
            calib_p2_lat: next[2].lat, calib_p2_lng: next[2].lng,
          })
          setCalibrating(false)
        } else {
          setCalibStep(s => s + 1)
        }
      },
      err => {
        setCalibBusy(false)
        setCalibError(t("couldNotGetGpsLocation") + err.message)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  function startGpsRecording() {
    if (!playerId || !sessionLabel.trim() || !transform) return
    if (!("geolocation" in navigator)) {
      setGpsError(t("geolocationNotAvailable"))
      return
    }
    setGpsError("")
    setViewSession(null)
    lastSampleRef.current = 0
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const now = Date.now()
        if (now - lastSampleRef.current < GPS_SAMPLE_INTERVAL_MS) return
        lastSampleRef.current = now
        const point = transform.toPitch({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        if (!point) return
        addPositionSample({ player_id: playerId, session_label: sessionLabel, x: point.x, y: point.y })
      },
      err => {
        setGpsError(t("gpsErrorPrefix") + err.message)
        stopGpsRecording()
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    )
    setRecording(true)
  }

  function stopGpsRecording() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setRecording(false)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!playerId || !sessionLabel.trim()) {
      setImportError(t("choosePlayerAndNameFirst"))
      return
    }
    if (!transform) {
      setImportError(t("calibrateFirst"))
      return
    }
    setImportError("")
    setImportedCount(null)
    setImporting(true)
    try {
      const text = await file.text()
      const points = parseTrackFile(file.name, text)
      if (points.length === 0) {
        setImportError(t("noGpsPointsFound"))
        setImporting(false)
        return
      }
      const step = Math.max(1, Math.ceil(points.length / MAX_IMPORT_POINTS))
      const samples = []
      for (let i = 0; i < points.length; i += step) {
        const p = transform.toPitch(points[i])
        if (p) samples.push({ player_id: playerId, session_label: sessionLabel, x: p.x, y: p.y })
      }
      addPositionSamples(samples)
      setImportedCount(samples.length)
      setViewSession(sessionLabel)
    } catch {
      setImportError(t("couldNotReadFile"))
    }
    setImporting(false)
  }

  function loadSession(label: string) {
    stopGpsRecording()
    setViewSession(label)
    setSessionLabel(label)
  }

  function handleDelete(label: string) {
    if (!confirm(`${t("confirmDeleteSessionBefore")} "${label}"${t("confirmDeleteSessionAfter")}`)) return
    deletePositionSession(playerId, label)
    if (viewSession === label) setViewSession(null)
  }

  const player = players.find(p => p.id === playerId)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />

        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Info size={16} className="text-[#0B5CFF] mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("infoBanner")}
          </p>
        </div>

        {/* Calibración */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 mb-6">
          {!calibrating ? (
            <div className="flex items-center gap-3 flex-wrap justify-between">
              <div className="flex items-center gap-2">
                {calibrated ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <MapPin size={16} className="text-amber-500 shrink-0" />
                )}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {calibrated ? t("courtCalibratedGps") : t("courtNotCalibrated")}
                </p>
              </div>
              <Button size="sm" variant={calibrated ? "outline" : "primary"} onClick={startCalibration}>
                {calibrated ? <><RotateCcw size={13} /> {t("recalibrate")}</> : <><MapPin size={13} /> {t("calibrateCourtGps")}</>}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{t(CALIB_STEPS[calibStep].labelKey)}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">{t(CALIB_STEPS[calibStep].hintKey)}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={markCalibCorner} loading={calibBusy}>
                  <MapPin size={13} /> {t("markThisCorner")}
                </Button>
                <Button size="sm" variant="secondary" onClick={cancelCalibration} disabled={calibBusy}>{t("cancel")}</Button>
              </div>
              {calibError && <p className="text-xs text-red-600 mt-2">{calibError}</p>}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Select
              value={playerId}
              onChange={e => { setPlayerId(e.target.value); setViewSession(null); setSessionLabel(""); setImportedCount(null) }}
              options={players.map(p => ({ value: p.id, label: p.name }))}
              placeholder={t("selectPlayerPlaceholder")}
              className="w-56"
            />
            <Input
              placeholder={t("sessionNamePlaceholder")}
              value={sessionLabel}
              onChange={e => { setSessionLabel(e.target.value); setViewSession(null) }}
              disabled={recording}
              className="h-10 w-56"
            />
            {recording ? (
              <Button variant="danger" onClick={stopGpsRecording}>
                <Circle size={14} fill="currentColor" /> {t("stopRecording")}
              </Button>
            ) : (
              <Button onClick={startGpsRecording} disabled={!playerId || !sessionLabel.trim() || !calibrated}>
                <Radar size={14} /> {t("recordGpsLive")}
              </Button>
            )}
            <input ref={fileInputRef} type="file" accept=".gpx,.csv" className="hidden" onChange={handleImportFile} />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!playerId || !sessionLabel.trim() || !calibrated || importing}
              loading={importing}
            >
              <Upload size={14} /> {t("importFileGpxCsv")}
            </Button>
          </div>

          {!calibrated && (
            <p className="text-xs text-amber-600 mb-3">{t("calibrateBeforeHint")}</p>
          )}
          {gpsError && <p className="text-xs text-red-600 mb-3">{gpsError}</p>}
          {importError && <p className="text-xs text-red-600 mb-3">{importError}</p>}
          {importedCount != null && <p className="text-xs text-emerald-600 mb-3">{t("importedPointsBefore")} {importedCount} {t("importedPointsAfter")}</p>}

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            {recording
              ? t("recordingLiveHint")
              : t("chooseSessionHint")}
          </p>

          <div className="relative w-full aspect-[105/68] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 select-none">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full block">
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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t("thirdOwn")}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{zoneStats.mid}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t("midfield")}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{zoneStats.rival}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t("thirdRival")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            {t("savedSessions")} {player ? `· ${player.name}` : ""}
          </h3>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Radar size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t("noHeatmapSessionsYet")}</p>
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
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(s.firstDate)} · {s.count} {t("points")}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => loadSession(s.label)}>{t("view")}</Button>
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
