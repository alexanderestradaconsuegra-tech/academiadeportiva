"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import { supabase } from "@/lib/supabase"
import { Plus, Copy, Check, Trash2, KeyRound, RefreshCw, Building2 } from "lucide-react"

interface ActivationCode {
  id: string
  code: string
  label: string | null
  created_at: string
  used_at: string | null
  used_by_academy_id: string | null
  academy_name?: string | null
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "alexanderestradaconsuegra@gmail.com"

export default function CodesAdminPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState("")
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? ""
      setIsSuperAdmin(email === SUPER_ADMIN_EMAIL)
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    if (authChecked && !isSuperAdmin) router.replace("/dashboard")
  }, [authChecked, isSuperAdmin, router])

  const load = useCallback(async () => {
    setLoading(true)
    const sb = supabase as any
    const { data } = await sb
      .from("activation_codes")
      .select("*, team_settings(name)")
      .order("created_at", { ascending: false })
    if (data) {
      setCodes(data.map((r: any) => ({
        ...r,
        academy_name: r.team_settings?.name ?? null,
        team_settings: undefined,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (isSuperAdmin) load() }, [isSuperAdmin, load])

  async function createCode() {
    setCreating(true)
    setError("")
    const code = generateCode()
    const sb = supabase as any
    const { error: err } = await sb
      .from("activation_codes")
      .insert({ code, label: newLabel.trim() || null })
    if (err) {
      setError("Error al crear código. Intenta de nuevo.")
    } else {
      setNewLabel("")
      await load()
    }
    setCreating(false)
  }

  async function deleteCode(id: string) {
    if (!confirm("¿Eliminar este código?")) return
    const sb = supabase as any
    await sb.from("activation_codes").delete().eq("id", id)
    setCodes(c => c.filter(x => x.id !== id))
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!authChecked || !isSuperAdmin) return null

  const unused = codes.filter(c => !c.used_at)
  const used = codes.filter(c => c.used_at)

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader
          title="Códigos de Activación"
          subtitle="Genera un código único por academia antes de vender"
        />

        {/* Create new code */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#0B5CFF]" /> Generar nuevo código
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Nombre academia / cliente (opcional)"
              className="h-10 flex-1 min-w-[200px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none"
              onKeyDown={e => e.key === "Enter" && !creating && createCode()}
            />
            <button
              onClick={createCode}
              disabled={creating}
              className="h-10 px-5 bg-[#0B5CFF] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {creating ? <RefreshCw size={14} className="animate-spin" /> : <KeyRound size={14} />}
              Crear código
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {/* Available codes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound size={16} className="text-emerald-500" />
              Disponibles <span className="text-emerald-500">({unused.length})</span>
            </h3>
            <button onClick={load} className="text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-4 text-center">Cargando…</p>
          ) : unused.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No hay códigos disponibles. Crea uno arriba.</p>
          ) : (
            <div className="space-y-2">
              {unused.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{c.code}</code>
                      {c.label && <span className="text-xs text-slate-500 dark:text-slate-400">{c.label}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Creado {new Date(c.created_at).toLocaleDateString("es-CL")}</p>
                  </div>
                  <button
                    onClick={() => copyCode(c.code)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#0B5CFF] hover:border-[#0B5CFF] transition-colors"
                    title="Copiar código"
                  >
                    {copied === c.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => deleteCode(c.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used codes */}
        {used.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              Usados — academias registradas <span className="text-slate-400">({used.length})</span>
            </h3>
            <div className="space-y-2">
              {used.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-slate-400 line-through">{c.code}</code>
                      {c.label && <span className="text-xs text-slate-500">{c.label}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Usado el {new Date(c.used_at!).toLocaleDateString("es-CL")}
                      {c.academy_name && <> · <span className="font-semibold text-slate-600 dark:text-slate-300">{c.academy_name}</span></>}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">Activo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
