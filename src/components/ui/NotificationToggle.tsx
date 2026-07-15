"use client"
import { useEffect, useState } from "react"
import { BellOff, BellRing } from "lucide-react"
import Button from "./Button"
import { cn } from "@/lib/utils"
import { getPushSubscriptionStatus, subscribeToPush, unsubscribeFromPush } from "@/lib/push"
import { useT } from "@/lib/i18n/useT"
import { misc as miscDict } from "@/lib/i18n/dictionaries/misc"

type Status = "loading" | "subscribed" | "unsubscribed" | "unsupported"

export default function NotificationToggle() {
  const t = useT(miscDict)
  const [status, setStatus] = useState<Status>("loading")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getPushSubscriptionStatus().then(setStatus)
  }, [])

  async function handleToggle() {
    setError("")
    setBusy(true)
    if (status === "subscribed") {
      const err = await unsubscribeFromPush()
      if (err) setError(err)
      else setStatus("unsubscribed")
    } else {
      const err = await subscribeToPush()
      if (err) setError(err)
      else setStatus("subscribed")
    }
    setBusy(false)
  }

  if (status === "unsupported") return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          status === "subscribed" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-slate-100 dark:bg-slate-800"
        )}>
          {status === "subscribed" ? <BellRing size={16} className="text-emerald-600" /> : <BellOff size={16} className="text-slate-400" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("notifications")}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {status === "subscribed" ? t("notificationsActive") : t("notificationsInactive")}
          </p>
        </div>
        <Button size="sm" variant={status === "subscribed" ? "outline" : "primary"} loading={status === "loading" || busy} onClick={handleToggle}>
          {status === "subscribed" ? t("disable") : t("enable")}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
