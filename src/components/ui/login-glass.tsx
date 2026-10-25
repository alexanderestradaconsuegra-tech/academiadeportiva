"use client"
import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Glass login building blocks: a full-bleed photo behind a dark frosted card,
 * inputs with a leading icon, and a glowing primary button.
 *
 * Visual style adapted from the "gaming login" pattern (21st.dev). Its demo-only
 * parts are intentionally left out: fake social buttons, a "remember me" switch
 * that did nothing, an artificial submit delay, and logging the credentials.
 */

/** Photo filling the screen, darkened so the card and text stay readable. */
export function LoginBackground({ src }: { src: string }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05122F]/70 via-[#05122F]/45 to-[#05122F]/85" />
    </div>
  )
}

/** Frosted dark card that holds the form. */
export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-black/45 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-md", className)}>
      {children}
    </div>
  )
}

/** Title with a soft lime glow behind it. */
export function GlowTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="group relative inline-block text-2xl sm:text-3xl font-bold text-white">
        <span aria-hidden="true" className="absolute -inset-2 rounded-xl bg-gradient-to-r from-lime-400/25 via-emerald-400/20 to-sky-400/20 blur-xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative">{children}</span>
      </h1>
      {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
    </div>
  )
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: React.ReactNode
}

/** Labelled input with a leading icon, styled for the dark glass card. */
export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(function GlassInput(
  { label, icon, className, id, ...props },
  ref,
) {
  const inputId = id ?? `glass-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/70">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55">{icon}</span>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            "h-12 w-full rounded-xl border border-white/15 bg-white/[0.07] pl-10 pr-3 text-[15px] text-white placeholder-white/45 outline-none transition-colors",
            "focus:border-lime-400/70 focus:bg-white/10 focus:ring-2 focus:ring-lime-400/25",
            className,
          )}
        />
      </div>
    </div>
  )
})

/** Password input with a show / hide button. */
export function GlassPasswordInput({ label, icon, ...props }: Omit<GlassInputProps, "type">) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <GlassInput label={label} icon={icon} type={visible ? "text" : "password"} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute bottom-0 right-0 flex h-12 w-11 items-center justify-center text-white/55 transition-colors hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

/** Primary action: lime button with a glow that lifts on hover. */
export function GlassButton({ loading, loadingText, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingText?: string }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-[15px] font-semibold text-[#05122F]",
        "shadow-lg shadow-lime-400/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-lime-400/45",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        className,
      )}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {loadingText}
        </>
      ) : children}
    </button>
  )
}
