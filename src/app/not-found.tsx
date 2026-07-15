"use client"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { misc } from "@/lib/i18n/dictionaries/misc"

export default function NotFound() {
  const t = useT(misc)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
          <Trophy size={28} className="text-[#0B5CFF]" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{t("pageNotFound")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("pageNotFoundMessage")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5CFF] text-white text-sm font-semibold hover:bg-[#0a4fe0] transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  )
}
