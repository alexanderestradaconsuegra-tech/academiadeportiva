"use client"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Shield, RefreshCw, LogOut } from "lucide-react"

interface Academy {
  id: string
  name: string
  city: string | null
  subscription_status: string
  subscription_current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  updated_at: string
  coach_name: string | null
}

const STATUSES = ["trialing", "active", "past_due", "suspended", "canceled"] as const

const STATUS_STYLE: Record<string, string> = {
  trialing: "bg-blue-50 text-blue-600",
  active: "bg-emerald-50 text-emerald-600",
  past_due: "bg-amber-50 text-amber-600",
  suspended: "bg-red-50 text-red-600",
  canceled: "bg-slate-100 text-slate-500",
}

export default function AdminPage() {
  const [academies, setAcademies] = useState<Academy[] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setError("Inicia sesión primero con tu cuenta en la app y vuelve a esta página.")
      setLoading(false)
      return
    }
    const res = await fetch("/api/admin/academies", { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "No autorizado.")
      setLoading(false)
      return
    }
    setAcademies(data.academies)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(academyId: string, status: string, periodEnd: string | null) {
    setSavingId(academyId)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch("/api/admin/academies/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ academy_id: academyId, subscription_status: status, subscription_current_period_end: periodEnd }),
    })
    setSavingId(null)
    if (res.ok) await load()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0B5CFF]" />
            <h1 className="text-lg font-bold text-slate-900">Panel de administración — Academias</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => supabase.auth.signOut().then(() => location.reload())} className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400">Cargando…</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        {academies && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
                    <th className="px-4 py-3">Academia</th>
                    <th className="px-4 py-3">Coach</th>
                    <th className="px-4 py-3">Ciudad</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Vence</th>
                    <th className="px-4 py-3">Stripe</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {academies.map(a => (
                    <AcademyRow key={a.id} academy={a} saving={savingId === a.id} onUpdate={updateStatus} />
                  ))}
                </tbody>
              </table>
            </div>
            {academies.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No hay academias todavía.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function AcademyRow({ academy, saving, onUpdate }: {
  academy: Academy
  saving: boolean
  onUpdate: (id: string, status: string, periodEnd: string | null) => void
}) {
  const [status, setStatus] = useState(academy.subscription_status)
  const [periodEnd, setPeriodEnd] = useState(academy.subscription_current_period_end?.split("T")[0] ?? "")

  return (
    <tr>
      <td className="px-4 py-3 font-semibold text-slate-900">{academy.name}</td>
      <td className="px-4 py-3 text-slate-500">{academy.coach_name ?? "—"}</td>
      <td className="px-4 py-3 text-slate-500">{academy.city ?? "—"}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUS_STYLE[academy.subscription_status] ?? ""}`}>
          {academy.subscription_status}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500">
        {academy.subscription_current_period_end ? new Date(academy.subscription_current_period_end).toLocaleDateString("es-CO") : "—"}
      </td>
      <td className="px-4 py-3 text-slate-400 text-xs">{academy.stripe_customer_id ? "Conectado" : "Manual"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-8 px-2 rounded-lg border border-slate-200 text-xs">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="h-8 px-2 rounded-lg border border-slate-200 text-xs" />
          <button
            onClick={() => onUpdate(academy.id, status, periodEnd || null)}
            disabled={saving}
            className="h-8 px-3 rounded-lg bg-[#0B5CFF] text-white text-xs font-semibold disabled:opacity-50"
          >
            {saving ? "…" : "Guardar"}
          </button>
        </div>
      </td>
    </tr>
  )
}
