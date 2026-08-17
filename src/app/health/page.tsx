"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import ChartSkeleton from "@/components/ui/ChartSkeleton"
import { cn, formatDate } from "@/lib/utils"
import type { HRSample, SpeedSample, HRZone, LiveSession } from "@/lib/types"
import { HR_ZONES, getZone, calcCalories, formatDuration } from "@/lib/health-zones"
import {
  Heart, Bluetooth, BluetoothConnected, BluetoothOff,
  Timer, MapPin, Play, PenLine, Flame,
  Activity, CheckCircle
} from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { health as healthDict } from "@/lib/i18n/dictionaries/health"

const LivePanel = dynamic(() => import("@/components/health/LivePanel"), {
  ssr: false,
  loading: () => <div className="space-y-5"><div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" /><ChartSkeleton /></div>,
})

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"
type SessionState = "idle" | "running" | "paused" | "finished"

const DEVICE_TYPES = [
  { id: "polar_h10", nameKey: "devicePolarName", descKey: "devicePolarDesc" },
  { id: "wahoo_tickr", nameKey: "deviceWahooName", descKey: "deviceWahooDesc" },
  { id: "garmin_hrm", nameKey: "deviceGarminName", descKey: "deviceGarminDesc" },
  { id: "generic_ble", nameKey: "deviceGenericName", descKey: "deviceGenericDesc" },
  { id: "manual", nameKey: "deviceManualName", descKey: "deviceManualDesc" },
] as const

export default function HealthPage() {
  const { players, addLiveSession, liveSessions, currentUser } = useApp()
  const t = useT(healthDict)
  const isPlayer = currentUser?.role === "player"
  const ownPlayerId = currentUser?.player_id ?? null
  const [selectedPlayer, setSelectedPlayer] = useState(
    isPlayer && ownPlayerId ? ownPlayerId : (players[0]?.id ?? "")
  )
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
  const [dbSessions, setDbSessions] = useState<LiveSession[]>([])
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split("T")[0],
    durationH: "", durationM: "", durationS: "",
    distanceKm: "", avgHr: "", maxHr: "", minHr: "",
    spo2: "", calories: "", notes: "",
  })
  const [manualSaving, setManualSaving] = useState(false)

  // Load sessions directly from Supabase so GPX-uploaded sessions appear immediately
  useEffect(() => {
    if (!selectedPlayer) return
    supabase.from("live_sessions")
      .select("*")
      .eq("player_id", selectedPlayer)
      .order("started_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setDbSessions(data as unknown as LiveSession[]) })
  }, [selectedPlayer, showSavedMsg])

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
    if (!navigator.geolocation) { setGpsError(t("geolocationNotAvailable")); return }
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
  }, [elapsed, t])

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
      alert(t("webBluetoothNotSupported"))
      return
    }
    setBtStatus("connecting")
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["heart_rate"],
      })
      setBtDevice(device.name ?? t("bleDeviceFallback"))
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
  }, [elapsed, health, t])

  const disconnectBluetooth = useCallback(async () => {
    if (btCharRef.current) {
      try { await btCharRef.current.stopNotifications() } catch {}
      btCharRef.current = null
    }
    setBtStatus("disconnected")
    setBtDevice(null)
  }, [])

  async function saveManualEntry() {
    setManualSaving(true)
    const durationS = (parseInt(manualForm.durationH || "0") * 3600) +
                      (parseInt(manualForm.durationM || "0") * 60) +
                      (parseInt(manualForm.durationS || "0"))
    const distanceM = manualForm.distanceKm ? Math.round(parseFloat(manualForm.distanceKm) * 1000) : 0
    const avgHr = manualForm.avgHr ? parseInt(manualForm.avgHr) : null
    const maxHr = manualForm.maxHr ? parseInt(manualForm.maxHr) : null
    const minHr = manualForm.minHr ? parseInt(manualForm.minHr) : null
    const spo2 = manualForm.spo2 ? parseFloat(manualForm.spo2) : null
    const calories = manualForm.calories ? parseInt(manualForm.calories) : null
    const avgSpeed = durationS > 0 && distanceM > 0 ? parseFloat(((distanceM / durationS) * 3.6).toFixed(1)) : null
    const started = new Date(manualForm.date + "T12:00:00").toISOString()
    const ended = durationS > 0 ? new Date(new Date(started).getTime() + durationS * 1000).toISOString() : null
    const notes = [
      manualForm.notes,
      spo2 ? `SpO2: ${spo2}%` : null,
    ].filter(Boolean).join(" · ") || null

    await supabase.from("live_sessions").insert({
      player_id: selectedPlayer,
      started_at: started,
      ended_at: ended,
      device_name: "Entrada manual",
      device_type: "manual" as const,
      hr_samples: [], speed_samples: [],
      avg_hr: avgHr, max_hr_session: maxHr, min_hr_session: minHr,
      avg_speed_kmh: avgSpeed, max_speed_kmh: null,
      distance_m: distanceM || null,
      duration_s: durationS || null,
      calories_est: calories,
      notes,
    })
    // Refresh sessions
    const { data } = await supabase.from("live_sessions")
      .select("*").eq("player_id", selectedPlayer)
      .order("started_at", { ascending: false }).limit(50)
    if (data) setDbSessions(data as unknown as LiveSession[])
    setManualForm({ date: new Date().toISOString().split("T")[0], durationH: "", durationM: "", durationS: "", distanceKm: "", avgHr: "", maxHr: "", minHr: "", spo2: "", calories: "", notes: "" })
    setShowManualForm(false)
    setManualSaving(false)
    setShowSavedMsg(true)
    setTimeout(() => setShowSavedMsg(false), 3000)
  }

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

  const playerSessions = dbSessions

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader
          title={t("pageTitle")}
          subtitle={t("pageSubtitle")}
        >
          {showSavedMsg && (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 rounded-xl px-4 py-2">
              <CheckCircle size={14} /> {t("sessionSaved")}
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
            isPlayer={isPlayer}
            showManualForm={showManualForm}
            onToggleManualForm={() => setShowManualForm(v => !v)}
            manualForm={manualForm}
            onManualFormChange={(k: string, v: string) => setManualForm(f => ({ ...f, [k]: v }))}
            onSaveManual={saveManualEntry}
            manualSaving={manualSaving}
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
  gpsEnabled, gpsError, onStartGPS, onStopGPS, onStart, sessions, isPlayer,
  showManualForm, onToggleManualForm, manualForm, onManualFormChange, onSaveManual, manualSaving,
}: any) {
  const t = useT(healthDict)
  const stepOffset = isPlayer ? 1 : 0
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Config */}
      <div className="xl:col-span-2 space-y-5">
        {/* Player selector — hidden for player role (they only see own data) */}
        {!isPlayer && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 text-xs font-black flex items-center justify-center">1</span>
            {t("selectPlayerStep")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((p: any) => (
              <button
                key={p.id}
                onClick={() => onPlayerChange(p.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  selectedPlayer === p.id
                    ? "border-lime-600 dark:border-lime-400 bg-lime-50 dark:bg-lime-500/10 ring-2 ring-lime-100"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <img src={p.photo_url} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{p.position.split(" ").slice(-1)[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Device */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 text-xs font-black flex items-center justify-center">{isPlayer ? 1 : 2}</span>
            {t("deviceTypeStep")}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {DEVICE_TYPES.map(d => (
              <button
                key={d.id}
                onClick={() => onDeviceChange(d.id)}
                title={t(d.descKey)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all",
                  selectedDevice === d.id
                    ? "border-lime-600 dark:border-lime-400 bg-lime-50 dark:bg-lime-500/10 ring-2 ring-lime-100"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {d.id === "manual" ? <PenLine size={18} className="text-slate-500 dark:text-slate-400" /> : <Bluetooth size={18} className="text-slate-500 dark:text-slate-400" />}
                <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{t(d.nameKey)}</p>
              </button>
            ))}
          </div>

          {/* BLE connect */}
          {selectedDevice !== "manual" && (
            <div className={cn("rounded-xl p-4 border flex items-center gap-4", {
              "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700": btStatus === "disconnected",
              "bg-blue-50 dark:bg-blue-500/10 border-blue-200": btStatus === "connecting",
              "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200": btStatus === "connected",
              "bg-red-50 dark:bg-red-500/10 border-red-200": btStatus === "error",
            })}>
              {btStatus === "connected" ? (
                <BluetoothConnected size={20} className="text-emerald-600 shrink-0" />
              ) : btStatus === "error" ? (
                <BluetoothOff size={20} className="text-red-500 shrink-0" />
              ) : (
                <Bluetooth size={20} className={cn("shrink-0", btStatus === "connecting" ? "text-blue-500 animate-pulse" : "text-slate-400 dark:text-slate-500")} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {btStatus === "connected" ? btDevice : btStatus === "connecting" ? t("searchingDevices") : t("connectViaBluetooth")}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {btStatus === "connected" ? t("deviceConnectedReady") :
                   btStatus === "error" ? t("connectionError") :
                   t("requiresChrome")}
                </p>
              </div>
              {btStatus === "connected" ? (
                <Button variant="danger" size="sm" onClick={onDisconnectBT}>{t("disconnect")}</Button>
              ) : (
                <Button size="sm" onClick={onConnectBT} loading={btStatus === "connecting"}>
                  <Bluetooth size={13} /> {t("connect")}
                </Button>
              )}
            </div>
          )}

          {/* GPS */}
          <div className={cn("rounded-xl p-4 border flex items-center gap-4 mt-3", gpsEnabled ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700")}>
            <MapPin size={20} className={cn("shrink-0", gpsEnabled ? "text-emerald-600" : "text-slate-400 dark:text-slate-500")} />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t("gpsSpeed")}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{gpsEnabled ? t("gpsActiveRealtime") : gpsError || t("gpsUsePhoneHint")}</p>
            </div>
            {gpsEnabled ? (
              <Button variant="secondary" size="sm" onClick={onStopGPS}>{t("deactivate")}</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onStartGPS}>{t("activateGps")}</Button>
            )}
          </div>
        </div>

        {/* Start btn */}
        <button
          onClick={onStart}
          className="w-full h-14 bg-[#05122F] text-white rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-lg shadow-lime-200 flex items-center justify-center gap-3"
        >
          <Play size={20} fill="white" /> {t("startLiveSession")}
        </button>
      </div>

      {/* Recent sessions */}
      <div className="space-y-4">
        {/* Manual entry form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button
            onClick={onToggleManualForm}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <PenLine size={15} className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Agregar datos manualmente</span>
            </div>
            <span className="text-slate-400 text-lg">{showManualForm ? "−" : "+"}</span>
          </button>
          {showManualForm && (
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Fecha</label>
                  <input type="date" value={manualForm.date} onChange={e => onManualFormChange("date", e.target.value)}
                    className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Distancia (km)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={manualForm.distanceKm} onChange={e => onManualFormChange("distanceKm", e.target.value)}
                    className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Duración</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[["durationH","Horas"],["durationM","Minutos"],["durationS","Segundos"]].map(([k,lbl]) => (
                    <div key={k}>
                      <input type="number" min="0" placeholder="0" value={manualForm[k]} onChange={e => onManualFormChange(k, e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-300" />
                      <p className="text-[9px] text-slate-400 text-center mt-0.5">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["avgHr","FC Media (bpm)"],["maxHr","FC Máx (bpm)"],["minHr","FC Mín (bpm)"]].map(([k,lbl]) => (
                  <div key={k}>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{lbl}</label>
                    <input type="number" placeholder="—" value={manualForm[k]} onChange={e => onManualFormChange(k, e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">SpO2 / Oxígeno (%)</label>
                  <input type="number" min="50" max="100" step="0.1" placeholder="98.0" value={manualForm.spo2} onChange={e => onManualFormChange("spo2", e.target.value)}
                    className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Calorías (kcal)</label>
                  <input type="number" placeholder="—" value={manualForm.calories} onChange={e => onManualFormChange("calories", e.target.value)}
                    className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Notas (opcional)</label>
                <input type="text" placeholder="Ej: Carrera matutina, desnivel +150m..." value={manualForm.notes} onChange={e => onManualFormChange("notes", e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <button
                onClick={onSaveManual}
                disabled={manualSaving}
                className="w-full py-3 bg-lime-400 text-[#05122F] rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {manualSaving ? "Guardando..." : "Guardar sesión"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("previousSessions")}</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Activity size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">{t("noSessionsRecorded")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <SessionHistoryCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Live Panel ───────────────────────────────────────────────────────────
// ── Session History Card ─────────────────────────────────────────────────
function SessionHistoryCard({ session }: { session: LiveSession }) {
  const dur = session.duration_s ?? 0
  const h = Math.floor(dur / 3600), m = Math.floor((dur % 3600) / 60), s = dur % 60
  const durStr = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
  const hasHr = session.avg_hr != null && session.avg_hr > 0
  const hasDistance = session.distance_m != null && session.distance_m > 0
  const hasSpeed = session.avg_speed_kmh != null && session.avg_speed_kmh > 0

  // The 3-4 stats that matter at a glance — avg HR already has its own spot in the header
  const stats = [
    hasDistance && { icon: MapPin, label: "Distancia", value: `${(session.distance_m! / 1000).toFixed(2)} km` },
    { icon: Timer, label: "Duración", value: durStr },
    hasSpeed && { icon: Activity, label: "Vel. media", value: `${session.avg_speed_kmh!.toFixed(1)} km/h` },
    session.calories_est && { icon: Flame, label: "Calorías", value: `${session.calories_est} kcal` },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[]

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        {session.device_type === "manual" ? <PenLine size={16} className="text-slate-400 shrink-0" /> : <Bluetooth size={16} className="text-slate-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{session.device_name ?? session.device_type}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(session.started_at.split("T")[0])}</p>
        </div>
        {hasHr && (
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-red-500">{session.avg_hr}</p>
            <p className="text-[9px] text-slate-400">bpm prom</p>
          </div>
        )}
      </div>
      {session.notes && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-2 font-medium">{session.notes}</p>
      )}
      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1"><s.icon size={10} /> {s.label}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-slate-400">Sin datos registrados</p>
      )}
    </div>
  )
}
