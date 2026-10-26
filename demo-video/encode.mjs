// Turns work/<id>/frames into the deliverables in out/<id>/:
// a 30 fps master with a soft cross-fade back to the first frame (so the clip
// loops cleanly), then MP4 (H.264) + WebM (VP9) + JPG poster for every width.
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const WORK = path.join(ROOT, "work")
const OUT = path.join(ROOT, "out")
const LIMIT_1280 = 1.2 * 1024 * 1024
const FADE = 0.6

const run = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] })
export const probeSeconds = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim())
const even = (n) => Math.round(n / 2) * 2

export function widthsFor(clip) {
  return clip.device.isMobile ? [560, 828] : [840, 1280, 1680]
}

function buildMaster(clip) {
  const dir = path.join(WORK, clip.id)
  const { width, height } = clip.device.viewport
  const W = even(width * clip.device.deviceScaleFactor), H = even(height * clip.device.deviceScaleFactor)
  const raw = path.join(dir, "raw.mp4")
  run(["-f", "concat", "-safe", "0", "-i", path.join(dir, "frames.ffconcat"),
    "-vf", `scale=${W}:${H}:flags=lanczos,fps=30,format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "10", raw])
  const D = probeSeconds(raw)
  const master = path.join(dir, "master.mp4")
  // The last FADE seconds dissolve into the first frame: the end matches the start.
  run(["-i", raw, "-i", raw, "-filter_complex",
    `[1:v]trim=end_frame=1,loop=loop=${Math.ceil(FADE * 30) + 2}:size=1:start=0,setpts=N/30/TB,fps=30[s];` +
    `[0:v]settb=AVTB[a];[s]settb=AVTB[b];[a][b]xfade=transition=fade:duration=${FADE}:offset=${(D - FADE).toFixed(3)},format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "10", "-t", D.toFixed(3), master])
  return { master, seconds: probeSeconds(master) }
}

function encodeWidth(clip, master, seconds, w) {
  const dir = path.join(OUT, clip.id)
  fs.mkdirSync(dir, { recursive: true })
  const base = path.join(dir, `${clip.id}-${w}`)
  const scale = `scale=${w}:-2:flags=lanczos`
  const capped = w === 1280
  // Start from a quality setting and back off only if the 1280 cap is exceeded.
  let crf = 19
  for (;;) {
    run(["-i", master, "-vf", scale, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-tune", "animation",
      "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", base + ".mp4"])
    if (!capped || fs.statSync(base + ".mp4").size <= LIMIT_1280 || crf >= 34) break
    crf += 1
  }
  let vcrf = 31
  for (;;) {
    run(["-i", master, "-vf", scale, "-c:v", "libvpx-vp9", "-crf", String(vcrf), "-b:v", "0", "-row-mt", "1",
      "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", base + ".webm"])
    if (!capped || fs.statSync(base + ".webm").size <= LIMIT_1280 || vcrf >= 50) break
    vcrf += 2
  }
  run(["-ss", (seconds * clip.poster).toFixed(2), "-i", master, "-frames:v", "1", "-vf", scale, "-q:v", "2", base + ".jpg"])
  return { mp4: base + ".mp4", webm: base + ".webm", jpg: base + ".jpg", crf, vcrf }
}

export function encodeClip(clip) {
  const { master, seconds } = buildMaster(clip)
  const files = widthsFor(clip).map((w) => ({ width: w, ...encodeWidth(clip, master, seconds, w) }))
  return { clip, master, seconds, files }
}

/** One row per clip, a frame every 2 seconds, labelled. */
export function contactSheet(clips) {
  const rows = []
  const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
  const TH = 180
  const thumbs = (clip) => Math.ceil(probeSeconds(path.join(WORK, clip.id, "master.mp4")) / 2)
  const thumbW = (clip) => 2 * Math.round((TH * clip.device.viewport.width) / clip.device.viewport.height / 2)
  const ROW_W = Math.max(...clips.map((c) => thumbs(c) * (thumbW(c) + 12)))
  for (const clip of clips) {
    const master = path.join(WORK, clip.id, "master.mp4")
    const n = thumbs(clip)
    const row = path.join(WORK, clip.id, "sheet-row.png")
    const label = `${clip.id}  ·  ${clip.title}`.replace(/:/g, "\\:")
    run(["-i", master, "-vf",
      `fps=1/2,scale=-2:${TH}:flags=lanczos,pad=iw+12:ih+12:6:6:white,tile=${n}x1:color=white,` +
      `pad=${ROW_W}:ih+44:0:44:white,drawtext=fontfile=${font}:text='${label}':x=10:y=12:fontsize=22:fontcolor=0x0f172a`,
      "-frames:v", "1", row])
    rows.push(row)
  }
  const out = path.join(OUT, "contact-sheet.jpg")
  run([...rows.flatMap((r) => ["-i", r]), "-filter_complex", `${rows.map((_, i) => `[${i}:v]`).join("")}${rows.length > 1 ? `vstack=inputs=${rows.length},` : ""}pad=iw+40:ih+40:20:20:white`, "-q:v", "3", out])
  return out
}
