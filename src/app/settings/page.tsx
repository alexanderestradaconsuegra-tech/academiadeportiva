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
import { Trophy, Check, KeyRound, UserCheck, Sun, Moon, Send, Languages, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category, Language } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { settings } from "@/lib/i18n/dictionaries/settings"

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
]

const CATEGORIES: Category[] = ["Sub-5", "Sub-6", "Sub-7", "Sub-8", "Sub-9", "Sub-10", "Sub-11", "Sub-12", "Sub-13", "Sub-14", "Sub-15", "Otra"]

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

function MyAccount() {
  const t = useT(settings)
  const [currentEmail, setCurrentEmail] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? ""))
  }, [])

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setSavingEmail(false)
    if (error) {
      setEmailMsg({ type: "error", text: error.message })
      return
    }
    setEmailMsg({ type: "success", text: t("emailUpdateConfirmSent") })
    setNewEmail("")
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: t("passwordTooShort") })
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordMsg({ type: "error", text: error.message })
      return
    }
    setPasswordMsg({ type: "success", text: t("passwordUpdated") })
    setNewPassword("")
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
        <Mail size={14} className="text-[#0B5CFF]" /> {t("myAccountTitle")}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t("myAccountSubtitle")}</p>

      {currentEmail && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          {t("currentEmailLabel")}: <span className="font-semibold text-slate-600 dark:text-slate-300">{currentEmail}</span>
        </p>
      )}

      <form onSubmit={handleEmailUpdate} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mb-1">
        <div className="flex-1 w-full">
          <Input label={t("newEmailLabel")} type="email" placeholder={t("emailPlaceholder")} value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        </div>
        <Button size="sm" type="submit" loading={savingEmail} disabled={!newEmail}>{t("updateEmail")}</Button>
      </form>
      {emailMsg && <p className={cn("text-xs mt-2 mb-3", emailMsg.type === "success" ? "text-emerald-600" : "text-red-600")}>{emailMsg.text}</p>}

      <form onSubmit={handlePasswordUpdate} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mt-4">
        <div className="flex-1 w-full">
          <Input label={t("newPasswordLabel")} type="password" placeholder={t("passwordPlaceholder")} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <Button size="sm" type="submit" loading={savingPassword} disabled={newPassword.length < 6}>{t("updatePassword")}</Button>
      </form>
      {passwordMsg && <p className={cn("text-xs mt-2", passwordMsg.type === "success" ? "text-emerald-600" : "text-red-600")}>{passwordMsg.text}</p>}
    </div>
  )
}

const BILLING_STATUS_LABEL: Record<string, { label: string; bg: string }> = {
  trialing: { label: "En prueba", bg: "bg-blue-50 text-blue-600" },
  active: { label: "Activa", bg: "bg-emerald-50 text-emerald-600" },
  past_due: { label: "Pago pendiente", bg: "bg-amber-50 text-amber-600" },
  suspended: { label: "Suspendida", bg: "bg-red-50 text-red-600" },
  canceled: { label: "Cancelada", bg: "bg-slate-100 text-slate-500" },
}

function BillingCard() {
  const { teamSettings } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const status = teamSettings?.subscription_status ?? "active"
  const cfg = BILLING_STATUS_LABEL[status] ?? BILLING_STATUS_LABEL.active
  const hasStripe = !!teamSettings?.stripe_customer_id

  async function handleClick() {
    setError("")
    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const endpoint = hasStripe ? "/api/billing/portal" : "/api/billing/create-checkout-session"
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok || !data.url) {
      setError(data.error || "No se pudo continuar.")
      return
    }
    window.location.href = data.url
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Facturación</h3>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", cfg.bg)}>{cfg.label}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        {teamSettings?.subscription_current_period_end
          ? `Vence el ${new Date(teamSettings.subscription_current_period_end).toLocaleDateString("es-CO")}`
          : "Tu suscripción es gestionada manualmente por el equipo de soporte."}
      </p>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <Button size="sm" type="button" loading={loading} onClick={handleClick}>
        {hasStripe ? "Gestionar suscripción" : "Suscribirse con tarjeta"}
      </Button>
    </div>
  )
}

function AccessManager() {
  const t = useT(settings)
  const { players } = useApp()
  const [withAccess, setWithAccess] = useState<Set<string>>(new Set())
  const [loadingList, setLoadingList] = useState(true)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const [editingFor, setEditingFor] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })
  const [editForm, setEditForm] = useState({ email: "", password: "" })

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

  async function handleUpdate(playerId: string) {
    setError("")
    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch("/api/admin/update-account", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ player_id: playerId, email: editForm.email || undefined, password: editForm.password || undefined }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || t("accessUpdateError"))
      return
    }
    setEditingFor(null)
    setEditForm({ email: "", password: "" })
    setSaved(playerId)
    setTimeout(() => setSaved(null), 2500)
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
                    <>
                      {saved === p.id && (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <Check size={12} /> {t("saved")}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        <UserCheck size={12} /> {t("withAccess")}
                      </span>
                      <Button variant="outline" size="sm" type="button" onClick={() => { setEditingFor(editingFor === p.id ? null : p.id); setError(""); setEditForm({ email: "", password: "" }) }}>
                        {t("editAccess")}
                      </Button>
                    </>
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
                {editingFor === p.id && has && (
                  <div className="p-3 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <p className="text-xs text-slate-400 dark:text-slate-500 pt-3">{t("editAccessHint")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input label={t("newEmailLabel")} type="email" placeholder={t("emailPlaceholder")} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                      <Input label={t("newPasswordLabel")} type="text" placeholder={t("passwordPlaceholder")} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" type="button" onClick={() => setEditingFor(null)}>{t("cancel")}</Button>
                      <Button
                        size="sm" type="button" loading={saving}
                        disabled={!editForm.email && editForm.password.length < 6}
                        onClick={() => handleUpdate(p.id)}
                      >
                        {t("saveChanges")}
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

        <MyAccount />

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
            <BillingCard />
            <NotificationBroadcast />
            <AccessManager />
          </div>
        )}
      </div>
    </AppShell>
  )
}
