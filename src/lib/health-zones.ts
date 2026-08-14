import type { HRZone } from "@/lib/types"

export const HR_ZONES: Record<HRZone, { color: string; bg: string; pctLow: number; pctHigh: number }> = {
  reposo:        { color: "#94A3B8", bg: "#F1F5F9", pctLow: 0,   pctHigh: 0.5  },
  calentamiento: { color: "#3B82F6", bg: "#EFF6FF", pctLow: 0.5, pctHigh: 0.6  },
  aeróbica:      { color: "#10B981", bg: "#ECFDF5", pctLow: 0.6, pctHigh: 0.7  },
  anaeróbica:    { color: "#F59E0B", bg: "#FFFBEB", pctLow: 0.7, pctHigh: 0.85 },
  máxima:        { color: "#EF4444", bg: "#FEF2F2", pctLow: 0.85, pctHigh: 1   },
}

export function getZone(bpm: number, maxHR: number): HRZone {
  const pct = bpm / maxHR
  if (pct < 0.5)  return "reposo"
  if (pct < 0.6)  return "calentamiento"
  if (pct < 0.7)  return "aeróbica"
  if (pct < 0.85) return "anaeróbica"
  return "máxima"
}

export function calcCalories(avgHR: number, durationMin: number, weightKg: number): number {
  return Math.round(durationMin * 0.014 * avgHR * weightKg * 0.001 * 60)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
