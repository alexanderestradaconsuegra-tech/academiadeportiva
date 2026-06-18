"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import { Trophy, Check, KeyRound, UserCheck } from "lucide-react"

function AccessManager() {
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
      setError(data.error || "No se pudo crear el acceso.")
      return
    }
    setWithAccess(s => new Set(s).add(playerId))
    setOpenFor(null)
    setForm({ email: "", password: "" })
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Accesos de jugadores / padres</h3>
      <p className="text-xs text-slate-500 mb-4">Crea un correo y contraseña para que un jugador o su acudiente vea su propio perfil.</p>

      {loadingList ? (
        <p className="text-xs text-slate-400">Cargando...</p>
      ) : players.length === 0 ? (
        <p className="text-xs text-slate-400">No hay jugadores registrados todavía.</p>
      ) : (
        <div className="space-y-2">
          {players.map(p => {
            const has = withAccess.has(p.id)
            return (
              <div key={p.id} className="rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.position}</p>
                  </div>
                  {has ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <UserCheck size={12} /> Con acceso
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" type="button" onClick={() => { setOpenFor(openFor === p.id ? null : p.id); setError(""); setForm({ email: "", password: "" }) }}>
                      <KeyRound size={13} /> Crear acceso
                    </Button>
                  )}
                </div>
                {openFor === p.id && !has && (
                  <div className="p-3 pt-0 space-y-3 border-t border-slate-100 mt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <Input label="Correo" type="email" placeholder="jugador@correo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      <Input label="Contraseña" type="text" placeholder="mínimo 6 caracteres" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex justify-end">
                      <Button size="sm" type="button" loading={creating} disabled={!form.email || form.password.length < 6} onClick={() => handleCreate(p.id)}>
                        Crear acceso
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
  const { teamSettings, updateTeamSettings, currentUser } = useApp()
  const isCoach = currentUser?.role === "coach"
  const [saved, setSaved] = useState(false)
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
        <PageHeader title="Configuración" subtitle="Datos del equipo / academia que se muestran en toda la app" />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Logo preview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-4 h-fit">
              <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Pega la URL de una imagen para usarla como logo del equipo.
              </p>
              <Input
                label="URL del logo"
                placeholder="https://..."
                value={form.logo_url}
                onChange={e => set("logo_url", e.target.value)}
                className="w-full text-xs"
              />
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Información del Equipo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Nombre del equipo *" placeholder="FutbolMetrics" value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <Input label="Ciudad" placeholder="Bogotá" value={form.city} onChange={e => set("city", e.target.value)} />
                  <Input label="Año de fundación" type="number" placeholder="2018" min={1900} max={2100} value={form.founded_year} onChange={e => set("founded_year", e.target.value)} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Descripción</h3>
                <Textarea label="Descripción / lema" placeholder="Academia Deportiva..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
              </div>

              <div className="flex items-center gap-3 justify-end">
                {saved && (
                  <span className="text-emerald-600 text-sm font-medium flex items-center gap-1.5">
                    <Check size={16} /> Guardado
                  </span>
                )}
                <Button type="submit">Guardar cambios</Button>
              </div>
            </div>
          </div>
        </form>

        {isCoach && (
          <div className="mt-6">
            <AccessManager />
          </div>
        )}
      </div>
    </AppShell>
  )
}
