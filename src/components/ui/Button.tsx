import { cn } from "@/lib/utils"
import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variants = {
  primary: "bg-[#0B5CFF] text-white hover:bg-blue-700 shadow-sm shadow-blue-200 active:bg-blue-800",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white",
}

const sizes = {
  sm: "h-8 px-3 text-xs font-semibold",
  md: "h-9 px-4 text-sm font-semibold",
  lg: "h-11 px-6 text-sm font-semibold",
}

export default function Button({
  variant = "primary", size = "md", loading, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
