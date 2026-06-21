"use client"
import { useT } from "@/lib/i18n/useT"
import { misc } from "@/lib/i18n/dictionaries/misc"

export default function Loading() {
  const t = useT(misc)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 dark:border-slate-700 border-t-[#0B5CFF] animate-spin" role="status" aria-label={t("loading")} />
    </div>
  )
}
