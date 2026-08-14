"use client"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { HRSample, HRZone } from "@/lib/types"
import { HR_ZONES, formatDuration } from "@/lib/health-zones"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line,
} from "recharts"
import { Heart, BluetoothConnected, MapPin, Gauge, Flame, TrendingUp, Pause, Play, Square } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { health as healthDict } from "@/lib/i18n/dictionaries/health"

const HR_ZONE_LABEL_KEY: Record<HRZone, "zoneReposo" | "zoneCalentamiento" | "zoneAerobica" | "zoneAnaerobica" | "zoneMaxima"> = {
  reposo: "zoneReposo",
  calentamiento: "zoneCalentamiento",
  aeróbica: "zoneAerobica",
  anaeróbica: "zoneAnaerobica",
  máxima: "zoneMaxima",
}

const HR_ZONE_DESC_KEY: Record<HRZone, "zoneDescReposo" | "zoneDescCalentamiento" | "zoneDescAerobica" | "zoneDescAnaerobica" | "zoneDescMaxima"> = {
  reposo: "zoneDescReposo",
  calentamiento: "zoneDescCalentamiento",
  aeróbica: "zoneDescAerobica",
  anaeróbica: "zoneDescAnaerobica",
  máxima: "zoneDescMaxima",
}

export default function LivePanel({
  player, health, sessionState, elapsed, currentHR, currentSpeed,
  currentZone, zoneConfig, avgHR, maxHR, minHR, calories,
  hrSamples, liveChartData, zoneDist, totalSamples,
  selectedDevice, btStatus, gpsEnabled, manualHR, onManualHR, onSubmitManualHR,
  onPause, onResume, onFinish,
}: any) {
  const t = useT(healthDict)
  const hrPct = health ? Math.round((currentHR / health.max_hr) * 100) : 0
  const zoneKeys = Object.keys(HR_ZONES) as HRZone[]

  return (
    <div className="space-y-5">
      {/* Live HUD */}
      <div className={cn(
        "rounded-2xl p-6 border transition-all duration-500 relative overflow-hidden",
        zoneConfig ? `border-2` : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      )} style={{ borderColor: zoneConfig?.color ?? "#E2E8F0", background: zoneConfig ? `${zoneConfig.bg}` : "#fff" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: zoneConfig?.color }} />

        {/* Status row */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className={cn("w-2.5 h-2.5 rounded-full", sessionState === "running" ? "bg-red-500 animate-pulse" : "bg-amber-400")} />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {sessionState === "running" ? t("recording") : t("paused")}
            </span>
            {player && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{player.name.split(" ")[0]} {player.name.split(" ")[1]}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedDevice !== "manual" && (
              <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg",
                btStatus === "connected" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                <BluetoothConnected size={11} />
                {btStatus === "connected" ? t("ble") : t("noBt")}
              </div>
            )}
            {gpsEnabled && (
              <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700">
                <MapPin size={11} /> GPS
              </div>
            )}
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{formatDuration(elapsed)}</div>
          </div>
        </div>

        {/* Big metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5 relative z-10">
          {/* HR */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Heart size={14} className="text-red-500" fill="#EF4444" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("heartRate")}</span>
            </div>
            <div className="text-4xl font-black tabular-nums" style={{ color: zoneConfig?.color ?? "#94A3B8" }}>
              {currentHR || "—"}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">bpm</div>
            {zoneConfig && (
              <div className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block" style={{ color: zoneConfig.color, background: `${zoneConfig.color}20` }}>
                {t("zoneLabel")} {t(HR_ZONE_LABEL_KEY[currentZone as HRZone])}
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Gauge size={14} className="text-[#0B5CFF]" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("speed")}</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-[#0B5CFF]">{currentSpeed || "—"}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">km/h</div>
            {!gpsEnabled && selectedDevice === "manual" && (
              <div className="mt-2 text-[9px] text-slate-400 dark:text-slate-500">{t("simulated")}</div>
            )}
          </div>

          {/* Calories */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("calories")}</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-orange-500">{calories || "—"}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">kcal</div>
          </div>

          {/* Max HR */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-purple-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("peakMax")}</span>
            </div>
            <div className="text-4xl font-black tabular-nums text-purple-500">{maxHR || "—"}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{t("maxHrBpm")}</div>
          </div>
        </div>

        {/* HR progress bar */}
        {health && currentHR > 0 && (
          <div className="relative z-10 mb-4">
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-1.5">
              <span>{health.resting_hr} bpm</span>
              <span className="font-bold" style={{ color: zoneConfig?.color }}>{hrPct}% {t("maxHrPercent")}</span>
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
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("enterManualHr")}</span>
            <input
              type="number" min={30} max={250} placeholder="ej. 165"
              value={manualHR} onChange={e => onManualHR(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSubmitManualHR()}
              className="h-8 w-24 rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-sm font-bold text-center outline-none focus:border-[#0B5CFF]"
            />
            <Button size="sm" onClick={onSubmitManualHR} disabled={!manualHR}>{t("register")}</Button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">{t("dataAlsoSimulated")}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mt-5 relative z-10">
          {sessionState === "running" ? (
            <button onClick={onPause} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors">
              <Pause size={16} /> {t("pause")}
            </button>
          ) : (
            <button onClick={onResume} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 font-semibold text-sm hover:bg-emerald-200 transition-colors">
              <Play size={16} /> {t("resume")}
            </button>
          )}
          <button onClick={onFinish} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-200">
            <Square size={14} fill="currentColor" /> {t("finishSession")}
          </button>
          <div className="ml-auto text-xs text-slate-400 dark:text-slate-500">
            {totalSamples} {t("samples")} · {(hrSamples as HRSample[]).filter((s: HRSample) => s.zone === "máxima").length} {t("inMaxZone")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Live HR chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("heartRateRealtime")}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {t("live")}
            </div>
          </div>
          {liveChartData.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="text-center">
                <Heart size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("waitingHrData")}</p>
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
                  formatter={(v: number, name: string) => [name === "hr" ? `${v} bpm` : `${v} km/h`, name === "hr" ? t("frequency") : t("speed")]}
                />
                <Area type="monotone" dataKey="hr" stroke="#EF4444" strokeWidth={2} fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: "#EF4444" }} />
                <Line type="monotone" dataKey="speed" stroke="#0B5CFF" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Zone distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("zoneDistribution")}</h2>
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
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t(HR_ZONE_LABEL_KEY[z])}</span>
                      {currentZone === z && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zc.color}25`, color: zc.color }}>{t("active")}</span>}
                    </div>
                    <span className="text-xs font-bold" style={{ color: zc.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: zc.color }} />
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{t(HR_ZONE_DESC_KEY[z])}</p>
                </div>
              )
            })}
          </div>
          {totalSamples > 0 && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{avgHR}</p><p className="text-[10px] text-slate-400 dark:text-slate-500">{t("avg")}</p></div>
                <div><p className="text-sm font-bold text-red-500">{maxHR}</p><p className="text-[10px] text-slate-400 dark:text-slate-500">{t("max")}</p></div>
                <div><p className="text-sm font-bold text-blue-500">{minHR}</p><p className="text-[10px] text-slate-400 dark:text-slate-500">{t("min")}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
