/**
 * Rules for what the photo proxy is willing to serve. Kept pure so the part
 * that stops an uploaded file from running as the app can be tested.
 */

/** Plain raster formats browsers display inline. SVG is deliberately absent: it can carry script. */
const SAFE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

/** The only top-level folders the app writes photos into. */
const SERVABLE_FOLDERS = new Set(["players", "team"])

/**
 * Returns the content type to serve, or null if the file must not be served.
 * Parameters ("image/png; charset=...") are stripped and case is ignored.
 */
export function safeImageType(declared: string | null | undefined): string | null {
  const base = (declared ?? "").split(";")[0].trim().toLowerCase()
  return SAFE_IMAGE_TYPES.has(base) ? base : null
}

/**
 * A servable path is exactly `<players|team>/<file>`: two segments, no
 * traversal, no empty or hidden pieces.
 */
export function isServablePhotoPath(segments: string[] | undefined): boolean {
  if (!segments || segments.length !== 2) return false
  const [folder, file] = segments
  if (!SERVABLE_FOLDERS.has(folder)) return false
  if (!file || file === "." || file === ".." || file.startsWith(".")) return false
  return !segments.some(s => s.includes("..") || s.includes("\\") || s.includes("\0"))
}
