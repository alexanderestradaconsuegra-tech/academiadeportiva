import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: "blue" | "green" | "amber" | "red" | "purple"
  className?: string
}

const colorMap = {
  blue: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-[#0B5CFF]", icon: "bg-blue-100 dark:bg-blue-500/15 text-[#0B5CFF]", trend: "text-[#0B5CFF]" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600", icon: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600", trend: "text-emerald-600" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600", icon: "bg-amber-100 dark:bg-amber-500/15 text-amber-600", trend: "text-amber-600" },
  red: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600", icon: "bg-red-100 dark:bg-red-500/15 text-red-600", trend: "text-red-600" },
  purple: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600", icon: "bg-purple-100 dark:bg-purple-500/15 text-purple-600", trend: "text-purple-600" },
}

export default function StatCard({ title, value, subtitle, icon, trend, color = "blue", className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 card-hover", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
          <p className={cn("text-3xl font-bold mt-1 tracking-tight", c.text)}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.icon)}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-xs font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>
          <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
