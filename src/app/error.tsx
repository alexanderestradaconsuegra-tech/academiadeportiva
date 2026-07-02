"use client"
import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { useT } from "@/lib/i18n/useT"
import { misc } from "@/lib/i18n/dictionaries/misc"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT(misc)

  useEffect(() => {
    // Only expose full error details in development; in production use a server-side tracker
    if (process.env.NODE_ENV === "development") console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{t("somethingWentWrong")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {t("unexpectedErrorMessage")}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5CFF] text-white text-sm font-semibold hover:bg-[#0a4fe0] transition-colors"
            >
              <RotateCcw size={15} /> {t("tryAgain")}
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
