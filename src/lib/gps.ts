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
}

export function parseGpx(text: string): ParsedTrackPoint[] {
  const doc = new DOMParser().parseFromString(text, "application/xml")
  const points: ParsedTrackPoint[] = []
  const trkpts = doc.getElementsByTagName("trkpt")
  for (let i = 0; i < trkpts.length; i++) {
    const el = trkpts[i]
    const lat = parseFloat(el.getAttribute("lat") || "")
    const lng = parseFloat(el.getAttribute("lon") || "")
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue
    const timeEl = el.getElementsByTagName("time")[0]
    points.push({ lat, lng, time: timeEl?.textContent || undefined })
  }
  return points
}

export function parseCsv(text: string): ParsedTrackPoint[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return []
  const header = lines[0].toLowerCase().split(",").map(h => h.trim())
  const latIdx = header.findIndex(h => h === "lat" || h === "latitude")
  const lngIdx = header.findIndex(h => h === "lng" || h === "lon" || h === "longitude")
  const timeIdx = header.findIndex(h => h === "time" || h === "timestamp")
  if (latIdx === -1 || lngIdx === -1) return []
  const points: ParsedTrackPoint[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = lines[i].split(",")
    const lat = parseFloat(cols[latIdx])
    const lng = parseFloat(cols[lngIdx])
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue
    points.push({ lat, lng, time: timeIdx >= 0 ? cols[timeIdx]?.trim() : undefined })
  }
  return points
}

export function parseTrackFile(filename: string, text: string): ParsedTrackPoint[] {
  if (filename.toLowerCase().endsWith(".gpx")) return parseGpx(text)
  return parseCsv(text)
}
