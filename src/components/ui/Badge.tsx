import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "blue" | "green" | "amber" | "red" | "purple" | "orange" | "pink"
}

const variants = {
  default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  blue: "bg-blue-50 dark:bg-blue-500/10 text-[#0B5CFF]",
  green: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700",
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700",
  red: "bg-red-50 dark:bg-red-500/10 text-red-700",
  purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-700",
  orange: "bg-orange-50 dark:bg-orange-500/10 text-orange-700",
  pink: "bg-pink-50 dark:bg-pink-500/10 text-pink-700",
}

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide", variants[variant], className)}>
      {children}
    </span>
  )
}
