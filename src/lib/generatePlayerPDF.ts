import type { Player, Evaluation, Activity, MatchPlayerStat, Match, Attendance, Training } from "@/lib/types"

// ─── Helper: rounded rect path ───────────────────────────────────────────────
function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Helper: load image (CORS-safe) ─────────────────────────────────────────
async function loadImg(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ─── Player card (canvas → PDF) ──────────────────────────────────────────────
export async function generatePlayerCard(data: {
  player: Player
  academyName: string
  evaluation?: Evaluation
}) {
  const { player, academyName, evaluation } = data

  const stats = evaluation ? [
    { key: "VEL", value: Math.round(evaluation.speed_score * 10) },
    { key: "FUE", value: Math.round(evaluation.strength_score * 10) },
    { key: "TEC", value: Math.round(evaluation.technique_score * 10) },
    { key: "RES", value: Math.round(evaluation.resistance_score * 10) },
    { key: "POT", value: Math.round(evaluation.power_score * 10) },
    { key: "AGI", value: Math.round(evaluation.agility_score * 10) },
  ] : []

  const ovr = stats.length > 0
    ? Math.round(stats.reduce((s, x) => s + x.value, 0) / stats.length)
    : 0

  const badge = ovr >= 88 ? "ELITE" : ovr >= 75 ? "TOP" : "PRO"

  // Load photo before drawing
  const photoImg = player.photo_url ? await loadImg(player.photo_url) : null

  // ── Canvas ────────────────────────────────────────────────────────────────
  const CW = 520
  const CH = 760
  const CORNER = 34

  const canvas = document.createElement("canvas")
  canvas.width = CW
  canvas.height = CH
  const ctx = canvas.getContext("2d")!

  // Background gradient
  const bg = ctx.createLinearGradient(CW * 0.2, 0, 0, CH)
  bg.addColorStop(0, "#0f1f60")
  bg.addColorStop(0.4, "#080d2e")
  bg.addColorStop(1, "#030812")
  rrPath(ctx, 0, 0, CW, CH, CORNER)
  ctx.fillStyle = bg
  ctx.fill()

  // Shimmer overlay
  ctx.save()
  rrPath(ctx, 0, 0, CW, CH, CORNER)
  ctx.clip()
  const shim = ctx.createLinearGradient(0, CH * 0.3, CW, CH * 0.7)
  shim.addColorStop(0, "transparent")
  shim.addColorStop(0.42, "rgba(255,200,60,0.07)")
  shim.addColorStop(0.52, "rgba(255,80,200,0.05)")
  shim.addColorStop(0.62, "rgba(60,200,255,0.07)")
  shim.addColorStop(1, "transparent")
  ctx.fillStyle = shim
  ctx.fillRect(0, 0, CW, CH)
  ctx.restore()

  // Gold outer border
  rrPath(ctx, 1.5, 1.5, CW - 3, CH - 3, CORNER - 1)
  ctx.strokeStyle = "rgba(251,191,36,0.35)"
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Subtle inner border
  rrPath(ctx, 5, 5, CW - 10, CH - 10, CORNER - 3)
  ctx.strokeStyle = "rgba(255,255,255,0.05)"
  ctx.lineWidth = 1
  ctx.stroke()

  // ── HEADER ────────────────────────────────────────────────────────────────
  // OVR
  ctx.font = "900 100px Arial, sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "left"
  ctx.shadowColor = "rgba(11,92,255,0.9)"
  ctx.shadowBlur = 24
  ctx.fillText(`${ovr}`, 40, 118)
  ctx.shadowBlur = 0

  // Position
  ctx.font = "700 26px Arial, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.85)"
  ctx.fillText(player.position || "—", 44, 152)

  // Gold separator line
  ctx.beginPath()
  ctx.moveTo(44, 163)
  ctx.lineTo(114, 163)
  ctx.strokeStyle = "rgba(251,191,36,0.4)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Category
  ctx.font = "600 18px Arial, sans-serif"
  ctx.fillStyle = "rgba(251,191,36,0.65)"
  ctx.fillText(player.category || "—", 44, 182)

  // ELITE badge (top-right)
  const bW = 116; const bH = 38; const bX = CW - bW - 32; const bY = 30
  rrPath(ctx, bX, bY, bW, bH, 10)
  ctx.fillStyle = "rgba(251,191,36,0.15)"
  ctx.fill()
  rrPath(ctx, bX, bY, bW, bH, 10)
  ctx.strokeStyle = "rgba(251,191,36,0.35)"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.font = "900 18px Arial, sans-serif"
  ctx.fillStyle = "#fbbf24"
  ctx.textAlign = "center"
  ctx.fillText(badge, bX + bW / 2, bY + 25)

  // ── PHOTO ─────────────────────────────────────────────────────────────────
  const pCX = CW / 2
  const pCY = 316
  const pR = 112

  // Glow
  const glow = ctx.createRadialGradient(pCX, pCY, 0, pCX, pCY, pR + 40)
  glow.addColorStop(0, "rgba(11,92,255,0.45)")
  glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(pCX, pCY, pR + 40, 0, Math.PI * 2)
  ctx.fill()

  // Photo or initials (clipped to circle)
  ctx.save()
  ctx.beginPath()
  ctx.arc(pCX, pCY, pR, 0, Math.PI * 2)
  ctx.clip()
  if (photoImg) {
    const dim = Math.min(photoImg.width, photoImg.height)
    const sx = (photoImg.width - dim) / 2
    const sy = (photoImg.height - dim) / 2
    ctx.drawImage(photoImg, sx, sy, dim, dim, pCX - pR, pCY - pR, pR * 2, pR * 2)
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.07)"
    ctx.fillRect(pCX - pR, pCY - pR, pR * 2, pR * 2)
    ctx.font = "700 88px Arial, sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const initials = player.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")
    ctx.fillText(initials, pCX, pCY)
    ctx.textBaseline = "alphabetic"
  }
  ctx.restore()

  // White ring
  ctx.beginPath()
  ctx.arc(pCX, pCY, pR, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(255,255,255,0.25)"
  ctx.lineWidth = 3
  ctx.stroke()
  // Gold ring
  ctx.beginPath()
  ctx.arc(pCX, pCY, pR + 4, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(251,191,36,0.25)"
  ctx.lineWidth = 2
  ctx.stroke()

  // ── PLAYER NAME ───────────────────────────────────────────────────────────
  ctx.textAlign = "center"
  ctx.font = "900 36px Arial, sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0,0,0,0.7)"
  ctx.shadowBlur = 10
  ctx.fillText(player.name.toUpperCase(), CW / 2, 468)
  ctx.shadowBlur = 0

  // ── GOLD DIVIDER ──────────────────────────────────────────────────────────
  const divY = 486
  const divGrad = ctx.createLinearGradient(60, 0, CW - 60, 0)
  divGrad.addColorStop(0, "transparent")
  divGrad.addColorStop(0.3, "rgba(251,191,36,0.4)")
  divGrad.addColorStop(0.7, "rgba(251,191,36,0.4)")
  divGrad.addColorStop(1, "transparent")
  ctx.beginPath()
  ctx.moveTo(60, divY)
  ctx.lineTo(CW - 60, divY)
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(CW / 2, divY, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(251,191,36,0.55)"
  ctx.fill()

  // ── STATS ─────────────────────────────────────────────────────────────────
  if (stats.length > 0) {
    const sStartY = 514
    const colW = (CW - 80) / 2
    const barMaxW = colW - 86

    stats.forEach((s, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const sx = 40 + col * (colW + 0)
      const sy = sStartY + row * 52

      const color = s.value >= 90 ? "#facc15" : s.value >= 80 ? "#34d399" : "#38bdf8"

      // Value
      ctx.textAlign = "right"
      ctx.font = "900 28px Arial, sans-serif"
      ctx.fillStyle = color
      ctx.shadowColor = color + "90"
      ctx.shadowBlur = 8
      ctx.fillText(`${s.value}`, sx + 44, sy + 22)
      ctx.shadowBlur = 0

      // Key
      ctx.textAlign = "left"
      ctx.font = "600 15px Arial, sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.45)"
      ctx.fillText(s.key, sx + 50, sy + 22)

      // Bar track
      const barX = sx + 86; const barY = sy + 10; const barH = 8
      rrPath(ctx, barX, barY, barMaxW, barH, 4)
      ctx.fillStyle = "rgba(255,255,255,0.1)"
      ctx.fill()

      // Bar fill
      const fillW = Math.max(0, (s.value / 100) * barMaxW)
      if (fillW > 0) {
        rrPath(ctx, barX, barY, fillW, barH, 4)
        ctx.fillStyle = color
        ctx.shadowColor = color + "80"
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerY = CH - 36
  ctx.beginPath()
  ctx.moveTo(60, footerY - 10)
  ctx.lineTo(CW - 60, footerY - 10)
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.textAlign = "center"
  ctx.font = "600 17px Arial, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.22)"
  ctx.fillText(`METRIKAS · ${academyName.toUpperCase()}`, CW / 2, footerY + 12)

  // ── Embed in A4 PDF ────────────────────────────────────────────────────────
  const cardDataUrl = canvas.toDataURL("image/png")
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const W = 210; const H = 297

  doc.setFillColor(5, 18, 47)
  doc.rect(0, 0, W, H, "F")

  const cardPdfW = 130
  const cardPdfH = cardPdfW * (CH / CW)
  const cardPdfX = (W - cardPdfW) / 2
  const cardPdfY = (H - cardPdfH) / 2

  doc.addImage(cardDataUrl, "PNG", cardPdfX, cardPdfY, cardPdfW, cardPdfH)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(180, 190, 210)
  doc.text("metrikas.pro", W / 2, H - 8, { align: "center" })

  doc.save(`carta-${player.name.replace(/\s+/g, "-").toLowerCase()}.pdf`)
}

interface ReportData {
  player: Player
  academyName: string
  evaluation?: Evaluation
  activities: Activity[]
  matchStats: MatchPlayerStat[]
  matches: Match[]
  attendances: Attendance[]
  trainings: Training[]
}

function drawBar(doc: InstanceType<typeof import("jspdf").jsPDF>, x: number, y: number, value: number, max = 10, width = 60, height = 6) {
  doc.setFillColor(230, 236, 245)
  doc.roundedRect(x, y, width, height, 2, 2, "F")
  const filled = (value / max) * width
  if (filled > 0) {
    doc.setFillColor(11, 92, 255)
    doc.roundedRect(x, y, filled, height, 2, 2, "F")
  }
}

export async function generatePlayerPDF(data: ReportData) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const W = 210
  const margin = 16
  let y = 0

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(7, 27, 77)
  doc.rect(0, 0, W, 36, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Reporte de Rendimiento", margin, 15)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(data.academyName, margin, 22)
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`, margin, 28)

  // ── Player info ───────────────────────────────────────────────────────────
  y = 46
  doc.setTextColor(30, 30, 40)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(data.player.name, margin, y)

  y += 7
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 110, 130)
  doc.text(`${data.player.position}  ·  ${data.player.category}  ·  ${data.player.age} años`, margin, y)

  y += 6
  const infoItems = [
    ["Altura", `${data.player.height} cm`],
    ["Peso", `${data.player.weight} kg`],
    ["Pie dominante", data.player.dominant_foot],
    ["Club", data.player.club || "—"],
  ]
  infoItems.forEach(([label, val], i) => {
    const col = margin + (i % 2) * 85
    const row = y + Math.floor(i / 2) * 8
    doc.setFont("helvetica", "bold")
    doc.setTextColor(60, 70, 90)
    doc.text(`${label}:`, col, row)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 30, 40)
    doc.text(val, col + 28, row)
  })

  y += 20

  // Divider
  doc.setDrawColor(220, 225, 235)
  doc.setLineWidth(0.4)
  doc.line(margin, y, W - margin, y)
  y += 8

  // ── Evaluation scores ─────────────────────────────────────────────────────
  if (data.evaluation) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(7, 27, 77)
    doc.text("Evaluación de Habilidades", margin, y)
    y += 7

    const scores: [string, number][] = [
      ["Velocidad", data.evaluation.speed_score],
      ["Fuerza", data.evaluation.strength_score],
      ["Técnica", data.evaluation.technique_score],
      ["Resistencia", data.evaluation.resistance_score],
      ["Potencia", data.evaluation.power_score],
      ["Agilidad", data.evaluation.agility_score],
    ]

    scores.forEach(([label, val]) => {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(60, 70, 90)
      doc.text(label, margin, y + 4.5)
      drawBar(doc, margin + 28, y, val)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(11, 92, 255)
      doc.text(`${val}/10`, margin + 93, y + 4.5)
      y += 10
    })

    // General score
    doc.setFillColor(11, 92, 255)
    doc.roundedRect(margin, y, 80, 12, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(`Puntuación general: ${data.evaluation.general_score}/10`, margin + 5, y + 8)
    y += 20
  }

  // ── Match stats ───────────────────────────────────────────────────────────
  if (data.matchStats.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(7, 27, 77)
    doc.text("Estadísticas en Partidos", margin, y)
    y += 7

    const totalGoals = data.matchStats.reduce((s, m) => s + (m.goals ?? 0), 0)
    const totalAssists = data.matchStats.reduce((s, m) => s + (m.assists ?? 0), 0)
    const totalMinutes = data.matchStats.reduce((s, m) => s + (m.minutes_played ?? 0), 0)
    const totalYellow = data.matchStats.reduce((s, m) => s + (m.yellow_cards ?? 0), 0)
    const totalRed = data.matchStats.reduce((s, m) => s + (m.red_cards ?? 0), 0)
    const avgRating = data.matchStats.filter(m => m.rating).reduce((s, m, _, a) => s + (m.rating ?? 0) / a.length, 0)

    const statBoxes = [
      ["Partidos", `${data.matchStats.length}`],
      ["Goles", `${totalGoals}`],
      ["Asistencias", `${totalAssists}`],
      ["Minutos", `${totalMinutes}`],
      ["Amarillas", `${totalYellow}`],
      ["Rojas", `${totalRed}`],
      ...(avgRating > 0 ? [["Rating prom.", avgRating.toFixed(1)]] : []),
    ]

    const boxW = (W - margin * 2) / 4
    statBoxes.forEach(([label, val], i) => {
      const col = margin + (i % 4) * boxW
      const row = y + Math.floor(i / 4) * 18
      doc.setFillColor(245, 247, 252)
      doc.roundedRect(col, row, boxW - 2, 14, 2, 2, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(11, 92, 255)
      doc.text(val, col + (boxW - 2) / 2, row + 8, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(120, 130, 150)
      doc.text(label, col + (boxW - 2) / 2, row + 13, { align: "center" })
    })
    y += Math.ceil(statBoxes.length / 4) * 18 + 6
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  if (data.attendances.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(7, 27, 77)
    doc.text("Asistencia a Entrenamientos", margin, y)
    y += 7

    const present = data.attendances.filter(a => a.status === "present").length
    const absent = data.attendances.filter(a => a.status === "absent").length
    const late = data.attendances.filter(a => a.status === "late").length
    const total = data.attendances.length
    const pct = total > 0 ? Math.round((present / total) * 100) : 0

    const attData: [string, string, [number, number, number], [number, number, number]][] = [
      ["Total entrenam.", `${total}`, [245, 247, 252], [60, 70, 90]],
      ["Presentes", `${present}`, [236, 253, 245], [22, 163, 74]],
      ["Ausentes", `${absent}`, [254, 242, 242], [220, 38, 38]],
      ["Tarde", `${late}`, [255, 251, 235], [202, 138, 4]],
      ["% Asistencia", `${pct}%`, [239, 246, 255], [11, 92, 255]],
    ]

    const attBoxW = (W - margin * 2) / 5
    attData.forEach(([label, val, bg, fg], i) => {
      const col = margin + i * attBoxW
      doc.setFillColor(bg[0], bg[1], bg[2])
      doc.roundedRect(col, y, attBoxW - 2, 14, 2, 2, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(fg[0], fg[1], fg[2])
      doc.text(val, col + (attBoxW - 2) / 2, y + 8, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(120, 130, 150)
      doc.text(label, col + (attBoxW - 2) / 2, y + 13, { align: "center" })
    })
    y += 20
  }

  // ── Activities summary ────────────────────────────────────────────────────
  if (data.activities.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(7, 27, 77)
    doc.text(`Actividades (${data.activities.length} registros)`, margin, y)
    y += 7

    const byCategory: Record<string, number> = {}
    data.activities.forEach(a => { byCategory[a.category] = (byCategory[a.category] ?? 0) + 1 })
    Object.entries(byCategory).forEach(([cat, count]) => {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(60, 70, 90)
      doc.text(`${cat}:`, margin + 2, y)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 30, 40)
      doc.text(`${count} sesiones`, margin + 35, y)
      y += 6
    })
    y += 4
  }

  // ── Objective / Notes ─────────────────────────────────────────────────────
  if (data.player.objective) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(7, 27, 77)
    doc.text("Objetivo:", margin, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(60, 70, 90)
    const lines = doc.splitTextToSize(data.player.objective, W - margin * 2 - 24) as string[]
    doc.text(lines, margin + 24, y)
    y += lines.length * 5 + 4
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(240, 243, 250)
  doc.rect(0, 287, W, 10, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(150, 160, 180)
  doc.text(`Metrikas · ${data.academyName} · ${new Date().getFullYear()}`, W / 2, 293, { align: "center" })

  doc.save(`reporte-${data.player.name.replace(/\s+/g, "-").toLowerCase()}.pdf`)
}
