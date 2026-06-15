"use client"
import { cn, getScoreColor } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export default function ScoreRing({ score, size = 80, strokeWidth = 7, className, showLabel = true }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 85 ? "#10B981" :
    score >= 70 ? "#0B5CFF" :
    score >= 55 ? "#F59E0B" :
    "#EF4444"

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold leading-none", getScoreColor(score), size >= 70 ? "text-xl" : "text-base")}>
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Score</span>
        </div>
      )}
    </div>
  )
}
