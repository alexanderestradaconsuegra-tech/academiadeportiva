"use client"
import { useMemo, useState } from "react"
import { useApp } from "@/context/AppContext"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/useT"
import { payments as paymentsDict } from "@/lib/i18n/dictionaries/payments"
import { CONCEPTS, CONCEPT_KEYS, type Concept } from "@/lib/paymentConcepts"
import { planBulkCharges, bulkTotal, type BulkTarget } from "@/lib/bulkCharges"
import type { Category } from "@/lib/types"
import { X, Users, User, Layers, ListChecks, AlertTriangle, Search } from "lucide-react"

type Mode = "one" | "all" | "category" | "pick"

const MODES: { id: Mode; label: string; icon: typeof User }[] = [
  { id: "one", label: "Un alumno", icon: User },
  { id: "all", label: "Toda la academia", icon: Users },
  { id: "category", label: "Una categoría", icon: Layers },
  { id: "pick", label: "Elegir varios", icon: ListChecks },
]

const money = (n: number) => `$${n.toLocaleString("es-CL")}`

/**
 * Registers a charge for one student — or for a hundred.
 *
 * It used to offer only a single-student dropdown, which stops being usable
 * the moment an academy has more than a handful of players: charging the
 * annual enrollment meant repeating the form once per child. Everything now
 * goes through the same awaited path, so a failure is reported instead of
 * leaving charges on screen that were never saved.
 */
export default function NewChargeModal({ onClose, onDone }: { onClose: () => void; onDone: (message: string) => void }) {
  const { players, payments, addPaymentsBulk } = useApp()
  const t = useT(paymentsDict)

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const [mode, setMode] = useState<Mode>("one")
  const [playerId, setPlayerId] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [concept, setConcept] = useState<Concept>("monthly_fee")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState(today)
  const [paidDate, setPaidDate] = useState("")
  const [notes, setNotes] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const sorted = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])

  const categories = useMemo(() => {
    const counts = new Map<Category, number>()
    players.forEach(p => counts.set(p.category, (counts.get(p.category) ?? 0) + 1))
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [players])

  const target: BulkTarget | null =
    mode === "all" ? { kind: "all" }
    : mode === "category" ? (category ? { kind: "category", category } : null)
    : mode === "pick" ? { kind: "players", ids: Array.from(picked) }
    : playerId ? { kind: "players", ids: [playerId] }
    : null

  const numericAmount = Number(amount)
  const amountOk = amount !== "" && Number.isFinite(numericAmount) && numericAmount > 0

  const plan = useMemo(
    () => target ? planBulkCharges({ players, payments, concept, dueDate, target }) : null,
    // target is rebuilt each render; its inputs are what matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [players, payments, concept, dueDate, mode, playerId, category, picked]
  )

  const count = plan?.toCreate.length ?? 0
  const isBulk = mode !== "one"
  const canSubmit = !!plan && count > 0 && amountOk && !!dueDate && !saving

  const visiblePlayers = sorted.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()))

  function togglePick(id: string) {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function changeMode(next: Mode) {
    setMode(next)
    setConfirming(false)
    setError("")
  }

  async function submit() {
    if (!plan || !canSubmit) return
    setSaving(true)
    setError("")
    const { created, error: err } = await addPaymentsBulk(
      plan.toCreate.map(p => ({
        player_id: p.id,
        concept,
        amount: numericAmount,
        due_date: dueDate,
        // A paid date only makes sense when registering one payment that has
        // already happened; a hundred charges are all still owed.
        paid_date: mode === "one" && paidDate ? paidDate : null,
        status: mode === "one" && paidDate ? "paid" : "pending",
        notes: notes.trim() || null,
      }))
    )
    setSaving(false)
    if (err) { setError(err); setConfirming(false); return }

    const skipped = plan.alreadyHave.length
    onDone(
      created === 1
        ? "Cobro registrado."
        : `Se crearon ${created} cobros por ${money(bulkTotal(created, numericAmount))}` +
          (skipped > 0 ? ` · ${skipped} omitidos porque ya lo tenían` : "") + "."
    )
    onClose()
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    // Money for many families: a deliberate second tap, showing the total.
    if (isBulk && count > 1 && !confirming) { setConfirming(true); return }
    void submit()
  }

  const selectCls = "w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-lime-600 dark:focus:border-lime-400 outline-none"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-md animate-scale-in max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registrar cobro</h2>
          <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">¿A quién le cobras?</label>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id} type="button" onClick={() => changeMode(id)}
                  className={cn(
                    "h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors",
                    mode === id
                      ? "bg-lime-400 border-lime-400 text-[#05122F]"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
                  )}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "one" && (
            <select value={playerId} onChange={e => setPlayerId(e.target.value)} className={selectCls} required aria-label={t("playerLabel")}>
              <option value="">Elegir alumno…</option>
              {sorted.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

          {mode === "all" && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se le cobra a los <strong className="text-slate-800 dark:text-slate-200">{players.length} alumnos</strong> de la academia.
            </p>
          )}

          {mode === "category" && (
            <select value={category} onChange={e => setCategory(e.target.value as Category | "")} className={selectCls} aria-label="Categoría">
              <option value="">Elegir categoría…</option>
              {categories.map(([c, n]) => <option key={c} value={c}>{c} ({n} alumnos)</option>)}
            </select>
          )}

          {mode === "pick" && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="relative border-b border-slate-100 dark:border-slate-800">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alumno…" aria-label="Buscar alumno"
                  className="w-full h-11 pl-9 pr-3 text-sm bg-white dark:bg-slate-900 outline-none"
                />
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 text-[11px]">
                <span className="font-semibold text-slate-500 dark:text-slate-400">{picked.size} elegidos</span>
                <span className="flex gap-3">
                  <button type="button" className="font-bold text-lime-700 dark:text-lime-400"
                    onClick={() => setPicked(prev => { const n = new Set(prev); visiblePlayers.forEach(p => n.add(p.id)); return n })}>
                    Marcar visibles
                  </button>
                  <button type="button" className="font-bold text-slate-500" onClick={() => setPicked(new Set())}>Limpiar</button>
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                {visiblePlayers.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-slate-400 text-center">Sin resultados</p>
                ) : visiblePlayers.map(p => (
                  <label key={p.id} className="flex items-center gap-3 px-3 min-h-11 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <input type="checkbox" checked={picked.has(p.id)} onChange={() => togglePick(p.id)} className="w-4 h-4 rounded border-slate-300 text-lime-600" />
                    <span className="flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{p.category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t("conceptLabel")}</label>
            <select value={concept} onChange={e => setConcept(e.target.value as Concept)} className={selectCls}>
              {CONCEPTS.map(c => <option key={c} value={c}>{t(CONCEPT_KEYS[c])}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label={isBulk ? "Monto por alumno ($)" : t("amountLabel")} type="number" inputMode="decimal" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
            <Input label={t("dueDateLabel")} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>

          {mode === "one" && (
            <Input label={t("paidDateLabel")} type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} />
          )}
          <Input label={t("notesLabel")} placeholder={t("notesPlaceholder")} value={notes} onChange={e => setNotes(e.target.value)} />

          {plan && plan.alreadyHave.length > 0 && (
            <div className="flex gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {plan.alreadyHave.length === 1
                  ? `${plan.alreadyHave[0].name} ya tiene este cobro para esa fecha`
                  : `${plan.alreadyHave.length} alumnos ya tienen este cobro para esa fecha`}
                {count > 0 ? " y se omiten para no cobrarles dos veces." : ". No hay nada nuevo que crear."}
              </p>
            </div>
          )}

          {isBulk && plan && count > 0 && amountOk && (
            <div className={cn("rounded-xl p-3 border", confirming ? "bg-lime-50 dark:bg-lime-500/10 border-lime-300 dark:border-lime-500/30" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700")}>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {count} cobros de {money(numericAmount)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total: <strong>{money(bulkTotal(count, numericAmount))}</strong>
                {confirming && " · ¿Confirmás crearlos?"}
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" type="button" onClick={confirming ? () => setConfirming(false) : onClose}>
              {confirming ? "Volver" : t("cancel")}
            </Button>
            <Button type="submit" loading={saving} disabled={!canSubmit}>
              {confirming ? `Sí, crear ${count} cobros` : isBulk && count > 1 ? `Crear ${count} cobros` : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
