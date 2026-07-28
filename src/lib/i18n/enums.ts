import { useApp } from "@/context/AppContext"
import type { Language, Position, DominantFoot, Category, ActivityCategory, ActivityUnit, Intensity } from "@/lib/types"

type EnumDict = Record<string, Record<Language, string>>

const position: EnumDict = {
  "Portero": { es: "Portero", en: "Goalkeeper", pt: "Goleiro" },
  "Defensa Central": { es: "Defensa Central", en: "Center Back", pt: "Zagueiro" },
  "Lateral Derecho": { es: "Lateral Derecho", en: "Right Back", pt: "Lateral Direito" },
  "Lateral Izquierdo": { es: "Lateral Izquierdo", en: "Left Back", pt: "Lateral Esquerdo" },
  "Mediocampista Defensivo": { es: "Mediocampista Defensivo", en: "Defensive Midfielder", pt: "Volante" },
  "Mediocampista Central": { es: "Mediocampista Central", en: "Central Midfielder", pt: "Meio-campista Central" },
  "Mediocampista Ofensivo": { es: "Mediocampista Ofensivo", en: "Attacking Midfielder", pt: "Meia Ofensivo" },
  "Extremo Derecho": { es: "Extremo Derecho", en: "Right Winger", pt: "Ponta Direita" },
  "Extremo Izquierdo": { es: "Extremo Izquierdo", en: "Left Winger", pt: "Ponta Esquerda" },
  "Delantero Centro": { es: "Delantero Centro", en: "Center Forward", pt: "Centroavante" },
  "Segundo Delantero": { es: "Segundo Delantero", en: "Second Striker", pt: "Segundo Atacante" },
}

const dominantFoot: EnumDict = {
  "Derecha": { es: "Derecha", en: "Right", pt: "Direita" },
  "Izquierda": { es: "Izquierda", en: "Left", pt: "Esquerda" },
  "Ambidiestro": { es: "Ambidiestro", en: "Both", pt: "Ambidestro" },
}

const category: EnumDict = {
  "Sub-5": { es: "Sub-5", en: "U5", pt: "Sub-5" },
  "Sub-6": { es: "Sub-6", en: "U6", pt: "Sub-6" },
  "Sub-7": { es: "Sub-7", en: "U7", pt: "Sub-7" },
  "Sub-8": { es: "Sub-8", en: "U8", pt: "Sub-8" },
  "Sub-9": { es: "Sub-9", en: "U9", pt: "Sub-9" },
  "Sub-10": { es: "Sub-10", en: "U10", pt: "Sub-10" },
  "Sub-11": { es: "Sub-11", en: "U11", pt: "Sub-11" },
  "Sub-12": { es: "Sub-12", en: "U12", pt: "Sub-12" },
  "Sub-13": { es: "Sub-13", en: "U13", pt: "Sub-13" },
  "Sub-14": { es: "Sub-14", en: "U14", pt: "Sub-14" },
  "Sub-15": { es: "Sub-15", en: "U15", pt: "Sub-15" },
  "Otra": { es: "Otra", en: "Other", pt: "Outra" },
}

const activityCategory: EnumDict = {
  "Velocidad": { es: "Velocidad", en: "Speed", pt: "Velocidade" },
  "Fuerza": { es: "Fuerza", en: "Strength", pt: "Força" },
  "Técnica": { es: "Técnica", en: "Technique", pt: "Técnica" },
  "Resistencia": { es: "Resistencia", en: "Endurance", pt: "Resistência" },
  "Potencia": { es: "Potencia", en: "Power", pt: "Potência" },
  "Pliometría": { es: "Pliometría", en: "Plyometrics", pt: "Pliometria" },
  "Agilidad": { es: "Agilidad", en: "Agility", pt: "Agilidade" },
}

const activityUnit: EnumDict = {
  "segundos": { es: "segundos", en: "seconds", pt: "segundos" },
  "kg": { es: "kg", en: "kg", pt: "kg" },
  "repeticiones": { es: "repeticiones", en: "reps", pt: "repetições" },
  "metros": { es: "metros", en: "meters", pt: "metros" },
  "puntos": { es: "puntos", en: "points", pt: "pontos" },
}

const intensity: EnumDict = {
  "Baja": { es: "Baja", en: "Low", pt: "Baixa" },
  "Media": { es: "Media", en: "Medium", pt: "Média" },
  "Alta": { es: "Alta", en: "High", pt: "Alta" },
}

function translate(dict: EnumDict, value: string, language: Language): string {
  return dict[value]?.[language] ?? value
}

export function useEnumT() {
  const { language } = useApp()
  return {
    position: (v: Position) => translate(position, v, language),
    dominantFoot: (v: DominantFoot) => translate(dominantFoot, v, language),
    category: (v: Category) => translate(category, v, language),
    activityCategory: (v: ActivityCategory) => translate(activityCategory, v, language),
    activityUnit: (v: ActivityUnit) => translate(activityUnit, v, language),
    intensity: (v: Intensity) => translate(intensity, v, language),
  }
}
