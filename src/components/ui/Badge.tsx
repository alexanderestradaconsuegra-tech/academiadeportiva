import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "blue" | "green" | "amber" | "red" | "purple" | "orange" | "pink"
}

const variants = {
  default: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-[#0B5CFF]",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-700",
  pink: "bg-pink-50 text-pink-700",
}

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide", variants[variant], className)}>
      {children}
    </span>
  )
}
