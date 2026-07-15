"use client"
import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { subscribeToPush, unsubscribeFromPush, getPushSubscriptionStatus } from "@/lib/push"

export default function PushToggle() {
  const [status, setStatus] = useState<"subscribed" | "unsubscribed" | "unsupported" | "loading">("loading")
  const [working, setWorking] = useState(false)

  useEffect(() => {
    getPushSubscriptionStatus().then(setStatus)
  }, [])

  if (status === "unsupported" || status === "loading") return null

  async function toggle() {
    setWorking(true)
    if (status === "subscribed") {
      await unsubscribeFromPush()
      setStatus("unsubscribed")
    } else {
      const err = await subscribeToPush()
      if (!err) setStatus("subscribed")
      else alert(err)
    }
    setWorking(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={working}
      title={status === "subscribed" ? "Desactivar notificaciones" : "Activar notificaciones"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        status === "subscribed"
          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
      } disabled:opacity-50`}
    >
      {status === "subscribed" ? <Bell size={14} /> : <BellOff size={14} />}
      {status === "subscribed" ? "Notificaciones on" : "Notificaciones off"}
    </button>
  )
}
