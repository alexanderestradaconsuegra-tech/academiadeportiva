"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { cn, formatDate } from "@/lib/utils"
import type { HRSample, SpeedSample, HRZone, LiveSession } from "@/lib/types"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts"
import {
  Heart, Bluetooth, BluetoothConnected, BluetoothOff,
  Zap, Timer, Flame, MapPin, Play, Square, Pause,
  Activity, AlertCircle, CheckCircle, Gauge, Wind, TrendingUp
} from "lucide-react"

// ── HR Zone config ───────────────────────────────────────────────────────
const HR_ZONES: Record<HRZone, { label: string; color: string; bg: string; desc: string; pctLow: number; pctHigh: number }> = {
  reposo:        { label: "Reposo",       color: "#94A3B8", bg: "#F1F5F9", desc: "< 50% FC máx",     pctLow: 0,   pctHigh: 0.5  },
  calentamiento: { label: "Calentamiento",color: "#3B82F6", bg: "#EFF6FF", desc: "50–60% FC máx",    pctLow: 0.5, pctHigh: 0.6  },
  aeróbica:      { label: "Aeróbica",     color: "#10B981", bg: "#ECFDF5", desc: "60–70% FC máx",    pctLow: 0.6, pctHigh: 0.7  },
  anaeróbica:    { label: "Anaeróbica",   color: "#F59E0B", bg: "#FFFBEB", desc: "70–85% FC máx",    pctLow: 0.7, pctHigh: 0.85 },
  máxima:        { label: "Máxima",       color: "#EF4444", bg: "#FEF2F2", desc: "> 85% FC máx",     pctLow: 0.85, pctHigh: 1   },
}

function getZone(bpm: number, maxHR: number): HRZone {
  const pct = bpm / maxHR
  if (pct < 0.5)  return "reposo"
  if (pct < 0.6)  return "calentamiento"
  if (pct < 0.7)  return "aeróbica"
  if (pct < 0.85) return "anaeróbica"
  return "máxima"
}

function calcCalories(avgHR: number, durationMin: number, weightKg: number): number {
  return Math.round(durationMin * 0.014 * avgHR * weightKg * 0.001 * 60)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"
type SessionState = "idle" | "running" | "paused" | "finished"

const DEVICE_TYPES = [
  { id: "polar_h10", name: "Polar H10", icon: "🫀", desc: "Banda pectoral, máxima precisión" },
  { id: "wahoo_tickr", name: "Wahoo TICKR", icon: "💓", desc: "Banda pectoral Bluetooth" },
  { id: "garmin_hrm", name: "Garmin HRM-Pro", icon: "⌚", desc: "Banda + acelerómetro" },
  { id: "generic_ble", name: "Banda BLE genérica", icon: "📡", desc: "Cualquier monitor BLE" },
  { id: "manual", name: "Entrada manual", icon: "✍️", desc: "Simula datos para demo" },
]

export default function HealthPage() {
  const { players, addLiveSession, liveSessions } = useApp()
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id ?? "")
  const [selectedDevice, setSelectedDevice] = useState("manual")
  const [btStatus, setBtStatus] = useState<ConnectionStatus>("disconnected")
  const [btDevice, setBtDevice] = useState<string | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [currentHR, setCurrentHR] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [hrSamples, setHrSamples] = useState<HRSample[]>([])
  const [speedSamples, setSpeedSamples] = useState<SpeedSample[]>([])
  const [manualHR, setManualHR] = useState("")
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const [showSavedMsg, setShowSavedMsg] = useState(false)

  const btCharRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const simulRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gpsWatchRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const player = players.find(p => p.id === selectedPlayer)
  const health = player ? { resting_hr: 58, max_hr: 203 } : null // simplified

  // Live stats computed
  const avgHR = hrSamples.length
    ? Math.round(hrSamples.reduce((a, b) => a + b.bpm, 0) / hrSamples.length)
    : 0
  const maxHR = hrSamples.length ? Math.max(...hrSamples.map(s => s.bpm)) : 0
  const minHR = hrSamples.length ? Math.min(...hrSamples.map(s => s.bpm)) : 0
  const currentZone = currentHR > 0 ? getZone(currentHR, health?.max_hr ?? 200) : null
  const zoneConfig = currentZone ? HR_ZONES[currentZone] : null
  const calories = avgHR > 0 ? calcCalories(avgHR, elapsed / 60, player?.weight ?? 70) : 0

  // Zone distribution
  const zoneDist = Object.keys(HR_ZONES).reduce((acc, z) => {
    acc[z as HRZone] = hrSamples.filter(s => s.zone === z).length
    return acc
  }, {} as Record<HRZone, number>)

  // Recent samples for live chart (last 60)
  const liveChartData = hrSamples.slice(-60).map((s, i, arr) => ({
    t: formatDuration(s.ts),
    hr: s.bpm,
    speed: speedSamples.find(sp => sp.ts === s.ts)?.kmh ?? 0,
  }))

  // Timer
  useEffect(() => {
    if (sessionState === "running") {
      startTimeRef.current = startTimeRef.current || Date.now() - elapsed * 1000
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 500)
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionState])

  // Simulate HR if manual mode
  useEffect(() => {
    if (sessionState === "running" && selectedDevice === "manual") {
      const maxHR = health?.max_hr ?? 200
      const restHR = health?.resting_hr ?? 60
      simulRef.current = setInterval(() => {
        setElapsed(prev => {
          const t = prev
          const phase = Math.min(t / 2700, 1)
          let target = phase < 0.1 ? restHR + 30 :
                       phase < 0.5 ? restHR + 70 + (maxHR - restHR - 70) * ((phase - 0.1) / 0.4) :
                       phase < 0.8 ? maxHR * 0.88 + Math.random() * 10 :
                       restHR + 50 - (phase - 0.8) / 0.2 * 30
          const bpm = Math.max(restHR - 5, Math.min(maxHR, Math.round(target + (Math.random() - 0.5) * 6)))
          const zone = getZone(bpm, maxHR)
          setCurrentHR(bpm)
          setHrSamples(prev => [...prev, { ts: t, bpm, zone }])
          // Simulate speed
          const spd = phase < 0.1 ? 5 + Math.random() * 3 :
                      phase < 0.5 ? 10 + Math.random() * 12 :
                      phase < 0.8 ? 14 + Math.random() * 18 :
                      8 + Math.random() * 6
          setCurrentSpeed(parseFloat(spd.toFixed(1)))
          setSpeedSamples(prev => [...prev, { ts: t, kmh: parseFloat(spd.toFixed(1)) }])
          return prev
        })
      }, 1000)
    } else {
      if (simulRef.current) { clearInterval(simulRef.current); simulRef.current = null }
    }
    return () => { if (simulRef.current) clearInterval(simulRef.current) }
  }, [sessionState, selectedDevice, health])

  // GPS speed
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError("Geolocalización no disponible en este dispositivo"); return }
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const kmh = pos.coords.speed ? parseFloat((pos.coords.speed * 3.6).toFixed(1)) : 0
        setCurrentSpeed(kmh)
        setSpeedSamples(prev => [...prev, { ts: elapsed, kmh, lat: pos.coords.latitude, lng: pos.coords.longitude }])
        setGpsEnabled(true)
        setGpsError("")
      },
      (err) => setGpsError(`GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 1000 }
    )
  }, [elapsed])

  const stopGPS = useCallback(() => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current)
      gpsWatchRef.current = null
      setGpsEnabled(false)
    }
  }, [])

  // Web Bluetooth HR
  const connectBluetooth = useCallback(async () => {
    if (!("bluetooth" in navigator)) {
      alert("Tu navegador no soporta Web Bluetooth. Usa Chrome en desktop o Android.")
      return
    }
    setBtStatus("connecting")
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["heart_rate"],
      })
      setBtDevice(device.name ?? "Dispositivo BLE")
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService("heart_rate")
      const char = await service.getCharacteristic("heart_rate_measurement")
      btCharRef.current = char
      await char.startNotifications()
      char.addEventListener("characteristicvaluechanged", (event: any) => {
        const value = event.target.value
        const flags = value.getUint8(0)
        const bpm = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1)
        const zone = getZone(bpm, health?.max_hr ?? 200)
        setCurrentHR(bpm)
        setHrSamples(prev => [...prev, { ts: elapsed, bpm, zone }])
      })
      device.addEventListener("gattserverdisconnected", () => {
        setBtStatus("disconnected")
        setBtDevice(null)
      })
      setBtStatus("connected")
    } catch (err: any) {
      setBtStatus(err.name === "NotFoundError" ? "disconnected" : "error")
    }
  }, [elapsed, health])

  const disconnectBluetooth = useCallback(async () => {
    if (btCharRef.current) {
      try { await btCharRef.current.stopNotifications() } catch {}
      btCharRef.current = null
    }
    setBtStatus("disconnected")
    setBtDevice(null)
  }, [])

  function startSession() {
    setHrSamples([])
    setSpeedSamples([])
    setElapsed(0)
    setCurrentHR(0)
    setCurrentSpeed(0)
    startTimeRef.current = Date.now()
    setSessionState("running")
  }

  function pauseSession() { setSessionState("paused") }
  function resumeSession() { setSessionState("running") }

  function finishSession() {
    setSessionState("finished")
    stopGPS()
    const avgSpd = speedSamples.length ? speedSamples.reduce((a, b) => a + b.kmh, 0) / speedSamples.length : 0
    const maxSpd = speedSamples.length ? Math.max(...speedSamples.map(s => s.kmh)) : 0
    const totalDist = speedSamples.reduce((a, b) => a + (b.kmh / 3.6), 0)
    addLiveSession({
      player_id: selectedPlayer,
      started_at: new Date(Date.now() - elapsed * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      device_name: btDevice ?? selectedDevice,
      device_type: selectedDevice as LiveSession["device_type"],
      hr_samples: hrSamples,
      speed_samples: speedSamples,
      avg_hr: avgHR, max_hr_session: maxHR, min_hr_session: minHR,
      avg_speed_kmh: parseFloat(avgSpd.toFixed(1)),
      max_speed_kmh: parseFloat(maxSpd.toFixed(1)),
      distance_m: Math.round(totalDist),
      duration_s: elapsed,
      calories_est: calories,
      notes: "",
    })
    setShowSavedMsg(true)
    setTimeout(() => setShowSavedMsg(false), 3000)
  }

  function resetSession() {
    setSessionState("idle")
    setHrSamples([])
    setSpeedSamples([])
    setElapsed(0)
    setCurrentHR(0)
    setCurrentSpeed(0)
    startTimeRef.current = 0
  }

  const playerSessions = liveSessions.filter(s => s.player_id === selectedPlayer)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

  return (
    <AppShell>
      <div className="p-6 xl:p-8 animate-fade-in">
        <PageHeader
          title="Salud en Vivo"
          subtitle="Monitor de ritmo cardíaco, velocidad y métricas biométricas en tiempo real"
        >
          {showSavedMsg && (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
              <CheckCircle size={14} /> Sesión guardada
            </div>
          )}
        </PageHeader>

        {/* Tabs: Setup / Live / Historial */}
        {sessionState === "idle" || sessionState === "finished" ? (
          <SetupPanel
            players={players}
            selectedPlayer={selectedPlayer}
            onPlayerChange={setSelectedPlayer}
            selectedDevice={selectedDevice}
            onDeviceChange={setSelectedDevice}
            btStatus={btStatus}
            btDevice={btDevice}
            onConnectBT={connectBluetooth}
            onDisconnectBT={disconnectBluetooth}
            gpsEnabled={gpsEnabled}
            gpsError={gpsError}
            onStartGPS={startGPS}
            onStopGPS={stopGPS}
            onStart={startSession}
            sessions={playerSessions}
          />
        ) : (
          <LivePanel
            player={player}
            health={health}
            sessionState={sessionState}
            elapsed={elapsed}
            currentHR={currentHR}
            currentSpeed={currentSpeed}
            currentZone={currentZone}
            zoneConfig={zoneConfig}
            avgHR={avgHR}
            maxHR={maxHR}
            minHR={minHR}
            calories={calories}
            hrSamples={hrSamples}
            liveChartData={liveChartData}
            zoneDist={zoneDist}
            totalSamples={hrSamples.length}
            selectedDevice={selectedDevice}
            btStatus={btStatus}
            gpsEnabled={gpsEnabled}
            manualHR={manualHR}
            onManualHR={setManualHR}
            onSubmitManualHR={() => {
              const bpm = parseInt(manualHR)
              if (bpm > 30 && bpm < 250) {
                const zone = getZone(bpm, health?.max_hr ?? 200)
                setCurrentHR(bpm)
                setHrSamples(prev => [...prev, { ts: elapsed, bpm, zone }])
                setManualHR("")
              }
            }}
            onPause={pauseSession}
            onResume={resumeSession}
            onFinish={finishSession}
          />
        )}
      </div>
    </AppShell>
  )
}

// ── Setup Panel ──────────────────────────────────────────────────────────
function SetupPanel({
  players, selectedPlayer, onPlayerChange, selectedDevice, onDeviceChange,
  btStatus, btDevice, onConnectBT, onDisconnectBT,
  gpsEnabled, gpsError, onStartGPS, onStopGPS, onStart, sessions,
}: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Config */}
      <div className="xl:col-span-2 space-y-5">
        {/* Player */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0B5CFF] text-xs font-black flex items-center justify-center">1</span>
            Seleccionar Jugador
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((p: any) => (
              <button
                key={p.id}
                onClick={() => onPlayerChange(p.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  selectedPlayer === p.id
                    ? "border-[#0B5CFF] bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <img src={p.photo_url} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-slate-400">{p.position.split(" ").slice(-1)[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Device */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0B5CFF] text-xs font-black flex items-center justify-center">2</span>
            Tipo de Dispositivo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {DEVICE_TYPES.map(d => (
              <button
                key={d.id}
                onClick={() => onDeviceChange(d.id)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                  selectedDevice === d.id
                    ? "border-[#0B5CFF] bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="text-2xl">{d.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{d.name}</p>
                  <p className="text-[10px] text-slate-400">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* BLE connect */}
          {selectedDevice !== "manual" && (
            <div className={cn("rounded-xl p-4 border flex items-center gap-4", {
              "bg-slate-50 border-slate-200": btStatus === "disconnected",
              "bg-blue-50 border-blue-200": btStatus === "connecting",
              "bg-emerald-50 border-emerald-200": btStatus === "connected",
              "bg-red-50 border-red-200": btStatus === "error",
            })}>
              {btStatus === "connected" ? (
                <BluetoothConnected size={20} className="text-emerald-600 shrink-0" />
              ) : btStatus === "error" ? (
                <BluetoothOff size={20} className="text-red-500 shrink-0" />
              ) : (
                <Bluetooth size={20} className={cn("shrink-0", btStatus === "connecting" ? "text-blue-500 animate-pulse" : "text-slate-400")} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  {btStatus === "connected" ? btDevice : btStatus === "connecting" ? "Buscando dispositivos..." : "Conectar vía Bluetooth"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {btStatus === "connected" ? "Dispositivo conectado y listo" :
                   btStatus === "error" ? "Error de conexión. Intenta de nuevo." :
                   "Requiere Chrome en desktop o Android"}
                </p>
              </div>
              {btStatus === "connected" ? (
                <Button variant="danger" size="sm" onClick={onDisconnectBT}>Desconectar</Button>
              ) : (
                <Button size="sm" onClick={onConnectBT} loading={btStatus === "connecting"}>
                  <Bluetooth size={13} /> Conectar
                </Button>
              )}
            </div>
          )}

          {/* GPS */}
          <div className={cn("rounded-xl p-4 border flex items-center gap-4 mt-3", gpsEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200")}>
            <MapPin size={20} className={cn("shrink-0", gpsEnabled ? "text-emerald-600" : "text-slate-400")} />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">Velocidad GPS</p>
              <p className="text-[10px] text-slate-500">{gpsEnabled ? "GPS activo — velocidad en tiempo real" : gpsError || "Usa el GPS del teléfono para medir velocidad"}</p>
            </div>
            {gpsEnabled ? (
              <Button variant="secondary" size="sm" onClick={onStopGPS}>Desactivar</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onStartGPS}>Activar GPS</Button>
            )}
          </div>
        </div>

        {/* Start btn */}
        <button
          onClick={onStart}
          className="w-full h-14 bg-gradient-to-r from-[#0B5CFF] to-[#071B4D] text-white rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
        >
          <Play size={20} fill="white" /> Iniciar Sesión en Vivo
        </button>
      </div>

      {/* Recent sessions */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Sesiones Anteriores</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Sin sesiones registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <SessionHistoryCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>

        {/* Device guide */}
        <div className="bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-blue-200" />
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wide">Dispositivos Recomendados</span>
          </div>
          {[
            { name: "Polar H10", detail: "La más precisa · ~$80", highlight: true },
            { name: "Wahoo TICKR X", detail: "Buena relación calidad · ~$50" },
            { name: "Garmin HRM-Pro+", detail: "HR + acelerómetro · ~$120" },
            { name: "STATSports Apex", detail: "GPS profesional · ~$400" },
          ].map(d => (
            <div key={d.name} className={cn("flex items-center justify-between py-2 border-b border-white/10 last:border-0", d.highlight && "")}>
              <div>
                <p className={cn("text-xs font-semibold", d.highlight ? "text-white" : "text-blue-100")}>{d.name}</p>
                <p className="text-[10px] text-blue-200/60">{d.detail}</p>
              </div>
              {d.highlight && <span className="text-[9px] font-bold bg-white/15 text-white px-2 py-0.5 rounded">TOP</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Live Panel ───────────────────────────────────────────────────────────
function LivePanel({
  player, health, sessionState, elapsed, currentHR, currentSpeed,
  currentZone, zoneConfig, avgHR, maxHR, minHR, calories,
  hrSamples, liveChartData, zoneDist, totalSamples,
  selectedDevice, btStatus, gpsEnabled, manualHR, onManualHR, onSubmitManualHR,
  onPause, onResume, onFinish,
}: any) {

  const hrPct = health ? Math.round((currentHR / health.max_hr) * 100) : 0
  const zoneKeys = Object.keys(HR_ZONES) as HRZone[]

  return (
    <div className="space-y-5">
      {/* Live HUD */}
      <div className={cn(
        "rounded-2xl p-6 border transition-all duration-500 relative overflow-hidden",
        zoneConfig ? `border-2` : "border-slate-200 bg-white"
      )} style={{ borderColor: zoneConfig?.color ?? "#E2E8F0", background: zoneConfig ? `${zoneConfig.bg}` : "#fff" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: zoneConfig?.color }} />

        {/* Status row */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className={cn("w-2.5 h-2.5 rounded-full", sessionState === "running" ? "bg-red-500 animate-pulse" : "bg-amber-400")} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {sessionState === "running" ? "GRABANDO" : "PAUSADO"}
            </span>
            {player && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-500">{player.name.split(" ")[0]} {player.name.split(" ")[1]}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedDevice !== "manual" && (
              <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg",
                btStatus === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                <BluetoothConnected size={11} />
                {btStatus === "connected" ? "BLE" : "Sin BT"}
              </div>
            )}
            {gpsEnabled && (
              <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                <MapPin size={11} /> GPS
              </div>
            )}
            <div className="text-2xl font-black text-slate-800 tabular-nums">{formatDuration(elapsed)}</div>
          </div>
        </div>

        {/* Big metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5 relative z-10">
          {/* HR */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Heart size={14} className="text-red-500" fill="#EF4444" />
              <span className="text-xs font-semibold text-slate-500">Ritmo Cardíaco</span>
            </div>
            <div className="text-4xl font-black tabular-nums" style={{ color: zoneConfig?.color ?? "#94A3B8" }}>
              {currentHR || "—"}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">bpm</div>
            {zoneConfig && (
              <div className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block" style={{ color: zoneConfig.color, background: `${zoneConfig.color}20` }}>
                Zona {zoneConfig.label}
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Gauge size={14} className="text-[#0B5CFF]" />
              <span className="text-xs font-semibold text-slate-500">Velocidad</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-[#0B5CFF]">{currentSpeed || "—"}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">km/h</div>
            {!gpsEnabled && selectedDevice === "manual" && (
              <div className="mt-2 text-[9px] text-slate-400">Simulado</div>
            )}
          </div>

          {/* Calories */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-slate-500">Calorías</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-orange-500">{calories || "—"}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">kcal</div>
          </div>

          {/* Max HR */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-purple-500" />
              <span className="text-xs font-semibold text-slate-500">Pico Máximo</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-purple-500">{maxHR || "—"}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">bpm máx</div>
          </div>
        </div>

        {/* HR progress bar */}
        {health && currentHR > 0 && (
          <div className="relative z-10 mb-4">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1.5">
              <span>{health.resting_hr} bpm</span>
              <span className="font-bold" style={{ color: zoneConfig?.color }}>{hrPct}% FC máx</span>
              <span>{health.max_hr} bpm</span>
            </div>
            <div className="h-3 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${hrPct}%`, background: `linear-gradient(90deg, #3B82F6, ${zoneConfig?.color ?? "#EF4444"})` }} />
            </div>
            <div className="flex justify-between mt-1">
              {zoneKeys.map(z => (
                <div key={z} className="flex-1 text-center">
                  <div className="h-1 rounded-full mx-0.5" style={{ background: HR_ZONES[z].color, opacity: currentZone === z ? 1 : 0.25 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual HR input */}
        {selectedDevice === "manual" && sessionState === "running" && (
          <div className="relative z-10 bg-white/60 rounded-xl p-3 flex items-center gap-3">
            <Heart size={14} className="text-red-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Ingresar HR manual:</span>
            <input
              type="number" min={30} max={250} placeholder="ej. 165"
              value={manualHR} onChange={e => onManualHR(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSubmitManualHR()}
              className="h-8 w-24 rounded-lg border border-slate-200 px-3 text-sm font-bold text-center outline-none focus:border-[#0B5CFF]"
            />
            <Button size="sm" onClick={onSubmitManualHR} disabled={!manualHR}>Registrar</Button>
            <span className="text-[10px] text-slate-400 ml-auto">Los datos se simulan automáticamente también</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mt-5 relative z-10">
          {sessionState === "running" ? (
            <button onClick={onPause} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors">
              <Pause size={16} /> Pausar
            </button>
          ) : (
            <button onClick={onResume} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-sm hover:bg-emerald-200 transition-colors">
              <Play size={16} /> Reanudar
            </button>
          )}
          <button onClick={onFinish} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-200">
            <Square size={14} fill="currentColor" /> Finalizar sesión
          </button>
          <div className="ml-auto text-xs text-slate-400">
            {totalSamples} muestras · {(hrSamples as HRSample[]).filter((s: HRSample) => s.zone === "máxima").length} en zona máxima
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Live HR chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Ritmo Cardíaco en Tiempo Real</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              En vivo
            </div>
          </div>
          {liveChartData.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Heart size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Esperando datos de ritmo cardíaco...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={liveChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[40, 210]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [name === "hr" ? `${v} bpm` : `${v} km/h`, name === "hr" ? "Frecuencia" : "Velocidad"]}
                />
                <Area type="monotone" dataKey="hr" stroke="#EF4444" strokeWidth={2} fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: "#EF4444" }} />
                <Line type="monotone" dataKey="speed" stroke="#0B5CFF" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Zone distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Distribución por Zona</h2>
          <div className="space-y-2.5">
            {zoneKeys.map(z => {
              const zc = HR_ZONES[z]
              const count = zoneDist[z] ?? 0
              const pct = totalSamples > 0 ? Math.round((count / totalSamples) * 100) : 0
              return (
                <div key={z} className={cn("rounded-xl p-3 transition-all", currentZone === z ? "ring-2" : "")}
                  style={{ background: `${zc.color}10`, outline: currentZone === z ? `2px solid ${zc.color}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: zc.color }} />
                      <span className="text-xs font-semibold text-slate-700">{zc.label}</span>
                      {currentZone === z && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zc.color}25`, color: zc.color }}>ACTIVO</span>}
                    </div>
                    <span className="text-xs font-bold" style={{ color: zc.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: zc.color }} />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">{zc.desc}</p>
                </div>
              )
            })}
          </div>
          {totalSamples > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-sm font-bold text-slate-800">{avgHR}</p><p className="text-[10px] text-slate-400">Prom</p></div>
                <div><p className="text-sm font-bold text-red-500">{maxHR}</p><p className="text-[10px] text-slate-400">Máx</p></div>
                <div><p className="text-sm font-bold text-blue-500">{minHR}</p><p className="text-[10px] text-slate-400">Mín</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Session History Card ─────────────────────────────────────────────────
function SessionHistoryCard({ session }: { session: LiveSession }) {
  const deviceIcons: Record<string, string> = {
    polar_h10: "🫀", wahoo_tickr: "💓", garmin_hrm: "⌚", generic_ble: "📡", manual: "✍️"
  }
  const dur = session.duration_s
  const h = Math.floor(dur / 3600), m = Math.floor((dur % 3600) / 60)
  const durStr = h > 0 ? `${h}h ${m}m` : `${m}m`
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{deviceIcons[session.device_type] ?? "📡"}</span>
          <div>
            <p className="text-xs font-bold text-slate-900">{session.device_name ?? session.device_type}</p>
            <p className="text-[10px] text-slate-400">{formatDate(session.started_at.split("T")[0])} · {durStr}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-red-500">{session.avg_hr}</p>
          <p className="text-[9px] text-slate-400">bpm prom</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "⚡", label: "Máx HR", value: `${session.max_hr_session} bpm` },
          { icon: "🔥", label: "Calorías", value: `${session.calories_est} kcal` },
          { icon: "📍", label: "Distancia", value: `${(session.distance_m / 1000).toFixed(1)} km` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg p-2 text-center border border-slate-100">
            <p className="text-[9px] text-slate-400">{s.icon} {s.label}</p>
            <p className="text-xs font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
