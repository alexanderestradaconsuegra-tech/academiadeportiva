import type { Player, Evaluation, Activity, MatchPlayerStat, Match, Attendance, Training } from "@/lib/types"

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
