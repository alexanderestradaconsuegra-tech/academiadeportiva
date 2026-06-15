import { cn } from "@/lib/utils"
import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          "h-10 rounded-xl border px-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all duration-150",
          error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100",
          "outline-none",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
