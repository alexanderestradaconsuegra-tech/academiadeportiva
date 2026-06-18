"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import { Trophy, Check } from "lucide-react"

export default function SettingsPage() {
  const { teamSettings, updateTeamSettings } = useApp()
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
      </div>
    </AppShell>
  )
}
