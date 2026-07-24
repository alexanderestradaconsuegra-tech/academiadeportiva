// Convierte coordenadas GPS reales (lat/lng) a metros sobre la cancha (0-105 x 0-68),
// calibrando con 3 esquinas conocidas. Esto permite usar cualquier dispositivo que
// entregue lat/lng (reloj inteligente, celular, pechera GPS exportando su track).

export interface GeoPoint {
  lat: number
  lng: number
}

export interface FieldCalibration {
  p0: GeoPoint // esquina (0,0): banda izquierda, fondo propio
  p1: GeoPoint // esquina (W,0): banda derecha, fondo propio
  p2: GeoPoint // esquina (0,H): banda izquierda, fondo rival
}

const METERS_PER_DEG_LAT = 111320

function metersPerDegLng(lat: number) {
  return 111320 * Math.cos((lat * Math.PI) / 180)
}

// Aproximación plana (suficiente para distancias de una cancha, <200m)
function toLocalMeters(origin: GeoPoint, point: GeoPoint) {
  const north = (point.lat - origin.lat) * METERS_PER_DEG_LAT
  const east = (point.lng - origin.lng) * metersPerDegLng(origin.lat)
  return { east, north }
}

export function buildTransform(calib: FieldCalibration, fieldW: number, fieldH: number) {
  const b = toLocalMeters(calib.p0, calib.p1) // local (fieldW, 0)
  const c = toLocalMeters(calib.p0, calib.p2) // local (0, fieldH)

  // Matriz M: [x,y] (cancha) -> [east,north] (metros reales)
  // M = [[b.east/fieldW, c.east/fieldH], [b.north/fieldW, c.north/fieldH]]
  const a11 = b.east / fieldW
  const a12 = c.east / fieldH
  const a21 = b.north / fieldW
  const a22 = c.north / fieldH
  const det = a11 * a22 - a12 * a21

  return {
    toPitch(point: GeoPoint): { x: number; y: number } | null {
      if (det === 0) return null
      const { east, north } = toLocalMeters(calib.p0, point)
      const x = (a22 * east - a12 * north) / det
      const y = (-a21 * east + a11 * north) / det
      return {
        x: Math.max(0, Math.min(fieldW, x)),
        y: Math.max(0, Math.min(fieldH, y)),
      }
    },
  }
}

export interface ParsedTrackPoint {
  lat: number
  lng: number
  time?: string
  ele?: number     // elevación en metros
  hr?: number      // pulsaciones bpm
  spo2?: number    // oxígeno en sangre %
  cadence?: number // pasos/min o pedaleos/min
}

// Search by local name (ignores namespace prefix) across all descendants.
// This handles Garmin (gpxtpx:hr), Polar (ns3:hr), generic (hr), etc.
function findByLocalName(el: Element, ...localNames: string[]): string | undefined {
  const lowerNames = localNames.map(n => n.toLowerCase())
  const all = el.getElementsByTagName("*")
  for (let i = 0; i < all.length; i++) {
    const child = all[i]
    const local = (child.localName ?? child.tagName.split(":").pop() ?? "").toLowerCase()
    if (lowerNames.includes(local) && child.textContent?.trim()) {
      return child.textContent.trim()
    }
  }
  return undefined
}

export interface GpxMeta {
  totalDistanceM?: number  // from <totalDistance> in track extensions (Apple Health, etc.)
  totalTimeS?: number      // from <totalTime>
  elevationGainM?: number  // from <cumulativeClimb>
  elevationLossM?: number  // from <cumulativeDecrease>
}

export function parseGpx(text: string): { points: ParsedTrackPoint[]; meta: GpxMeta } {
  const doc = new DOMParser().parseFromString(text, "application/xml")
  const points: ParsedTrackPoint[] = []

  // Extract track-level metadata (Apple Health, Strava, etc.)
  const meta: GpxMeta = {}
  const trkExtEl = doc.getElementsByTagName("trk")[0]?.getElementsByTagName("extensions")[0]
  if (trkExtEl) {
    const totalDist = findByLocalName(trkExtEl, "totaldistance", "distance")
    const totalTime = findByLocalName(trkExtEl, "totaltime", "movingtime")
    const climb = findByLocalName(trkExtEl, "cumulativeclimb", "elevationgain", "totalascent")
    const decrease = findByLocalName(trkExtEl, "cumulativedecrease", "elevationloss", "totaldescent")
    if (totalDist) meta.totalDistanceM = parseFloat(totalDist)
    if (totalTime) meta.totalTimeS = parseFloat(totalTime)
    if (climb) meta.elevationGainM = parseFloat(climb)
    if (decrease) meta.elevationLossM = parseFloat(decrease)
  }

  const trkpts = doc.getElementsByTagName("trkpt")
  for (let i = 0; i < trkpts.length; i++) {
    const el = trkpts[i]
    const lat = parseFloat(el.getAttribute("lat") || "")
    const lng = parseFloat(el.getAttribute("lon") || "")
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue
    const timeEl = el.getElementsByTagName("time")[0]
    const eleEl = el.getElementsByTagName("ele")[0]
    // Search by local name — works with any namespace prefix (Garmin, Polar, generic, etc.)
    const hrRaw = findByLocalName(el, "hr", "heartrate", "heartratebpm")
    const spo2Raw = findByLocalName(el, "spo2", "spo2pct", "oxygensaturation", "spo2")
    const cadRaw = findByLocalName(el, "cad", "cadence", "runningcadence")
    points.push({
      lat,
      lng,
      time: timeEl?.textContent?.trim() || undefined,
      ele: eleEl?.textContent ? parseFloat(eleEl.textContent) : undefined,
      hr: hrRaw ? parseFloat(hrRaw) : undefined,
      spo2: spo2Raw ? parseFloat(spo2Raw) : undefined,
      cadence: cadRaw ? parseFloat(cadRaw) : undefined,
    })
  }
  return { points, meta }
}

export function parseCsv(text: string): ParsedTrackPoint[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return []
  const header = lines[0].toLowerCase().split(",").map(h => h.trim())
  const latIdx = header.findIndex(h => h === "lat" || h === "latitude")
  const lngIdx = header.findIndex(h => h === "lng" || h === "lon" || h === "longitude")
  const timeIdx = header.findIndex(h => h === "time" || h === "timestamp")
  const hrIdx = header.findIndex(h => h === "hr" || h === "heart_rate" || h === "heartrate" || h === "bpm")
  const spo2Idx = header.findIndex(h => h === "spo2" || h === "spo2%" || h === "oxygen")
  if (latIdx === -1 || lngIdx === -1) return []
  const points: ParsedTrackPoint[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = lines[i].split(",")
    const lat = parseFloat(cols[latIdx])
    const lng = parseFloat(cols[lngIdx])
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue
    const hrVal = hrIdx >= 0 ? parseFloat(cols[hrIdx]) : NaN
    const spo2Val = spo2Idx >= 0 ? parseFloat(cols[spo2Idx]) : NaN
    points.push({
      lat,
      lng,
      time: timeIdx >= 0 ? cols[timeIdx]?.trim() : undefined,
      hr: !isNaN(hrVal) ? hrVal : undefined,
      spo2: !isNaN(spo2Val) ? spo2Val : undefined,
    })
  }
  return points
}

export function parseTrackFile(filename: string, text: string): { points: ParsedTrackPoint[]; meta: GpxMeta } {
  if (filename.toLowerCase().endsWith(".gpx")) return parseGpx(text)
  return { points: parseCsv(text), meta: {} }
}

// Extract HR biometrics summary from parsed track points
export interface BiometricSummary {
  avgHr: number
  maxHr: number
  minHr: number
  avgSpo2: number | null
  hasHr: boolean
  hasSpo2: boolean
}

export function extractBiometrics(points: ParsedTrackPoint[]): BiometricSummary {
  const hrPoints = points.filter(p => p.hr && p.hr > 30 && p.hr < 250)
  const spo2Points = points.filter(p => p.spo2 && p.spo2 > 50 && p.spo2 <= 100)
  const hasHr = hrPoints.length > 0
  const hasSpo2 = spo2Points.length > 0
  const avgHr = hasHr ? Math.round(hrPoints.reduce((s, p) => s + p.hr!, 0) / hrPoints.length) : 0
  const maxHr = hasHr ? Math.max(...hrPoints.map(p => p.hr!)) : 0
  const minHr = hasHr ? Math.min(...hrPoints.map(p => p.hr!)) : 0
  const avgSpo2 = hasSpo2 ? Math.round(spo2Points.reduce((s, p) => s + p.spo2!, 0) / spo2Points.length) : null
  return { avgHr, maxHr, minHr, avgSpo2, hasHr, hasSpo2 }
}

// ── Track summary (distance, speed, duration) ──────────────────────────────

export interface TrackSummary {
  points: ParsedTrackPoint[]
  distanceM: number
  durationS: number
  avgSpeedKmh: number
  maxSpeedKmh: number
  elevationGainM?: number
  elevationLossM?: number
  startTime?: Date
  meta: GpxMeta
}

function haversineM(a: ParsedTrackPoint, b: ParsedTrackPoint): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

export function summarizeTrack(points: ParsedTrackPoint[], meta: GpxMeta = {}): TrackSummary {
  let distanceM = 0
  let maxSpeedKmh = 0
  let elevationGainM = 0
  let elevationLossM = 0

  const timestamps = points.map(p => (p.time ? new Date(p.time).getTime() : NaN)).filter(t => !isNaN(t))
  const hasTime = timestamps.length === points.length

  for (let i = 1; i < points.length; i++) {
    const d = haversineM(points[i - 1], points[i])
    distanceM += d
    if (hasTime) {
      const dt = (timestamps[i] - timestamps[i - 1]) / 1000
      if (dt > 0 && dt < 60) {
        const spd = (d / dt) * 3.6
        if (spd > maxSpeedKmh && spd < 50) maxSpeedKmh = spd
      }
    }
    // Elevation gain/loss from per-point ele tags
    const eleA = points[i - 1].ele, eleB = points[i].ele
    if (eleA !== undefined && eleB !== undefined) {
      const diff = eleB - eleA
      if (diff > 0) elevationGainM += diff
      else elevationLossM += Math.abs(diff)
    }
  }

  // Prefer file-provided totals when they exist (Apple Health, Strava export)
  const finalDistanceM = meta.totalDistanceM ?? distanceM
  const finalDurationS = meta.totalTimeS ?? (hasTime ? (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 : 0)
  const finalGain = meta.elevationGainM ?? (elevationGainM > 0 ? elevationGainM : undefined)
  const finalLoss = meta.elevationLossM ?? (elevationLossM > 0 ? elevationLossM : undefined)
  const avgSpeedKmh = finalDurationS > 0 ? (finalDistanceM / finalDurationS) * 3.6 : 0

  return {
    points,
    distanceM: finalDistanceM,
    durationS: finalDurationS,
    avgSpeedKmh,
    maxSpeedKmh,
    elevationGainM: finalGain,
    elevationLossM: finalLoss,
    meta,
    startTime: hasTime ? new Date(timestamps[0]) : undefined,
  }
}
