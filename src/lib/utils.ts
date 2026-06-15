import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400"
  if (score >= 70) return "text-blue-400"
  if (score >= 55) return "text-amber-400"
  return "text-red-400"
}

export function getScoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-400/10 border-emerald-400/30"
  if (score >= 70) return "bg-blue-400/10 border-blue-400/30"
  if (score >= 55) return "bg-amber-400/10 border-amber-400/30"
  return "bg-red-400/10 border-red-400/30"
}

export function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case "Alta": return "text-red-400 bg-red-400/10"
    case "Media": return "text-amber-400 bg-amber-400/10"
    case "Baja": return "text-emerald-400 bg-emerald-400/10"
    default: return "text-slate-400 bg-slate-400/10"
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Velocidad: "text-yellow-400 bg-yellow-400/10",
    Fuerza: "text-red-400 bg-red-400/10",
    Técnica: "text-blue-400 bg-blue-400/10",
    Resistencia: "text-emerald-400 bg-emerald-400/10",
    Potencia: "text-orange-400 bg-orange-400/10",
    Agilidad: "text-purple-400 bg-purple-400/10",
  }
  return colors[category] || "text-slate-400 bg-slate-400/10"
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

export function getPositionShort(position: string): string {
  const map: Record<string, string> = {
    "Portero": "POR",
    "Defensa Central": "DFC",
    "Lateral Derecho": "LD",
    "Lateral Izquierdo": "LI",
    "Mediocampista Defensivo": "MCD",
    "Mediocampista Central": "MC",
    "Mediocampista Ofensivo": "MCO",
    "Extremo Derecho": "ED",
    "Extremo Izquierdo": "EI",
    "Delantero Centro": "DC",
    "Segundo Delantero": "SD",
  }
  return map[position] || position.substring(0, 3).toUpperCase()
}

export function avatarUrl(name: string, id: string): string {
  const seed = encodeURIComponent(name + id)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=0B5CFF`
}
