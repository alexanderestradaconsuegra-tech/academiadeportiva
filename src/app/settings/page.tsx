"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import PhotoUpload from "@/components/ui/PhotoUpload"
import { Trophy, Check, KeyRound, UserCheck, Sun, Moon, Send, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category, Language } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { settings } from "@/lib/i18n/dictionaries/settings"

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
]

const CATEGORIES: Category[] = ["Sub-10", "Sub-12", "Sub-14", "Sub-16", "Sub-18", "Juvenil", "Senior"]

function NotificationBroadcast() {
  const t = useT(settings)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState("")

  async function handleSend() {
    setError("")
    setResult(null)
    setSending(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, body, category }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) {
      setError(data.error || t("notificationSendError"))
      return
    }
    setResult(data)
    setTitle("")
    setBody("")
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("sendPushNotificationTitle")}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t("sendPushNotificationSubtitle")}</p>
      <div className="space-y-3">
        <Input label={t("notificationTitleLabel")} placeholder={t("notificationTitlePlaceholder")} value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea label={t("notificationMessageLabel")} placeholder={t("notificationMessagePlaceholder")} value={body} onChange={e => setBody(e.target.value)} rows={3} />
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">{t("sendToLabel")}</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 outline-none focus:border-[#0B5CFF] w-full sm:w-auto"
          >
            <option value="all">{t("allPlayersOption")}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {result && (
          <p className="text-xs text-emerald-600">
            {t("notificationSentSingular")} {result.sent} {result.sent === 1 ? t("notificationDevice") : t("notificationDevicePlural")}{result.failed > 0 ? ` · ${result.failed} ${t("notificationFailedSuffix")}` : ""}.
          </p>
        )}
        <div className="flex justify-end">
          <Button size="sm" type="button" loading={sending} disabled={!title.trim() || !body.trim()} onClick={handleSend}>
            <Send size={13} /> {t("send")}
          </Button>
        </div>
      </div>
    </div>
  )
}

function AccessManager() {
  const t = useT(settings)
  const { players } = useApp()
  const [withAccess, setWithAccess] = useState<Set<string>>(new Set())
  const [loadingList, setLoadingList] = useState(true)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  useEffect(() => {
    supabase.from("profiles").select("player_id").not("player_id", "is", null)
      .then(({ data }) => {
        setWithAccess(new Set((data ?? []).map(r => r.player_id as string)))
        setLoadingList(false)
      })
  }, [])

  async function handleCreate(playerId: string) {
    setError("")
    setCreating(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const player = players.find(p => p.id === playerId)
    const res = await fetch("/api/admin/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: form.email, password: form.password, player_id: playerId, full_name: player?.name }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      setError(data.error || t("accessCreateError"))
      return
    }
    setWithAccess(s => new Set(s).add(playerId))
    setOpenFor(null)
    setForm({ email: "", password: "" })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("accessManagerTitle")}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t("accessManagerSubtitle")}</p>

      {loadingList ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">{t("loading")}</p>
      ) : players.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">{t("noPlayersYet")}</p>
      ) : (
        <div className="space-y-2">
          {players.map(p => {
            const has = withAccess.has(p.id)
            return (
              <div key={p.id} className="rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{p.position}</p>
                  </div>
                  {has ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      <UserCheck size={12} /> {t("withAccess")}
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" type="button" onClick={() => { setOpenFor(openFor === p.id ? null : p.id); setError(""); setForm({ email: "", password: "" }) }}>
                      <KeyRound size={13} /> {t("createAccess")}
                    </Button>
                  )}
                </div>
                {openFor === p.id && !has && (
                  <div className="p-3 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <Input label={t("emailLabel")} type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      <Input label={t("passwordLabel")} type="text" placeholder={t("passwordPlaceholder")} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex justify-end">
                      <Button size="sm" type="button" loading={creating} disabled={!form.email || form.password.length < 6} onClick={() => handleCreate(p.id)}>
                        {t("createAccess")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { teamSettings, updateTeamSettings, currentUser, darkMode, toggleDarkMode, language } = useApp()
  const isCoach = currentUser?.role === "coach"
  const [saved, setSaved] = useState(false)
  const t = useT(settings)
  const [form, setForm] = useState({
    name: "", logo_url: "", city: "", founded_year: "", description: "",
  })

  useEffect(() => {
    if (teamSettings) {
      setForm({
        name: teamSettings.name,
        logo_url: teamSettings.logo_url,
        city: teamSettings.city,
        founded_year: teamSettings.founded_year ? String(teamSettings.founded_year) : "",
        description: teamSettings.description,
      })
    }
  }, [teamSettings])

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateTeamSettings({
      name: form.name,
      logo_url: form.logo_url,
      city: form.city,
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      description: form.description,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-3xl">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("appearanceTitle")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("appearanceSubtitle")}</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => darkMode && toggleDarkMode()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                !darkMode ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <Sun size={14} /> {t("light")}
            </button>
            <button
              type="button"
              onClick={() => !darkMode && toggleDarkMode()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                darkMode ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <Moon size={14} /> {t("dark")}
            </button>
          </div>
        </div>

        {isCoach && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Languages size={14} className="text-[#0B5CFF]" /> {t("languageTitle")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("languageSubtitle")}</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => updateTeamSettings({ language: l.code })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    language === l.code ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Logo preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 h-fit">
              <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                {t("logoHint")}
              </p>
              <PhotoUpload folder="team" onUploaded={url => set("logo_url", url)} />
              <Input
                label={t("logoUrlLabel")}
                placeholder="https://..."
                value={form.logo_url}
                onChange={e => set("logo_url", e.target.value)}
                className="w-full text-xs"
              />
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("teamInfoTitle")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label={t("teamNameLabel")} placeholder="FutbolMetrics" value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <Input label={t("cityLabel")} placeholder="Bogotá" value={form.city} onChange={e => set("city", e.target.value)} />
                  <Input label={t("foundedYearLabel")} type="number" placeholder="2018" min={1900} max={2100} value={form.founded_year} onChange={e => set("founded_year", e.target.value)} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t("descriptionTitle")}</h3>
                <Textarea label={t("descriptionLabel")} placeholder="Academia Deportiva..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
              </div>

              <div className="flex items-center gap-3 justify-end">
                {saved && (
                  <span className="text-emerald-600 text-sm font-medium flex items-center gap-1.5">
                    <Check size={16} /> {t("saved")}
                  </span>
                )}
                <Button type="submit">{t("saveChanges")}</Button>
              </div>
            </div>
          </div>
        </form>

        {isCoach && (
          <div className="mt-6 space-y-6">
            <NotificationBroadcast />
            <AccessManager />
          </div>
        )}
      </div>
    </AppShell>
  )
}
