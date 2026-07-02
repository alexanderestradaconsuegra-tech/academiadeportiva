"use client"
import Link from "next/link"
import Image from "next/image"
import type { Player, Evaluation, DominantFoot } from "@/lib/types"
import { cn, getScoreColor, getPositionShort, avatarUrl } from "@/lib/utils"
import Badge from "./ui/Badge"
import ScoreRing from "./ui/ScoreRing"
import { ChevronRight, AlertCircle } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"

const positionColorMap: Record<string, string> = {
  "Portero": "blue",
  "Delantero Centro": "red",
  "Segundo Delantero": "red",
  "Extremo Derecho": "orange",
  "Extremo Izquierdo": "orange",
  "Mediocampista Central": "green",
  "Mediocampista Ofensivo": "green",
  "Mediocampista Defensivo": "amber",
  "Defensa Central": "purple",
  "Lateral Derecho": "purple",
  "Lateral Izquierdo": "purple",
}

interface PlayerCardProps {
  player: Player
  evaluation?: Evaluation
  isInjured?: boolean
}

export default function PlayerCard({ player, evaluation, isInjured }: PlayerCardProps) {
  const t = useT(playersDict)
  const e = useEnumT()
  const score = evaluation?.general_score ?? 0
  const posColor = (positionColorMap[player.position] ?? "default") as "blue" | "red" | "orange" | "green" | "amber" | "purple" | "default"

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden card-hover animate-fade-in">
      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-br from-[#071B4D] to-[#0B5CFF] relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isInjured && (
            <span className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              <AlertCircle size={9} /> {t("injured")}
            </span>
          )}
          <span className="bg-white/20 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">{player.category}</span>
        </div>
      </div>

      <div className="px-3 md:px-5 pb-4 md:pb-5">
        {/* Avatar */}
        <div className="-mt-4 mb-3 flex items-end justify-between relative z-10">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-slate-100">
            <img
              src={player.photo_url || avatarUrl(player.name, player.id)}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
          {evaluation && <ScoreRing score={score} size={52} strokeWidth={5} />}
        </div>

        {/* Info */}
        <div className="mb-2">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">{player.name}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={posColor}>{getPositionShort(player.position)}</Badge>
            <span className="text-xs text-slate-400 dark:text-slate-500">{player.age} {t("yearsOld")}</span>
            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{e.dominantFoot(player.dominant_foot as DominantFoot)}</span>
          </div>
        </div>

        {/* Stats row */}
        {evaluation && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            {[
              { label: t("velLabel"), value: evaluation.speed_score },
              { label: t("tecLabel"), value: evaluation.technique_score },
              { label: t("resLabel"), value: evaluation.resistance_score },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={cn("text-sm font-bold", getScoreColor(s.value))}>{s.value}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <Link
          href={`/players/${player.id}`}
          className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#0B5CFF] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Ver perfil <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
