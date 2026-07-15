"use client"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Plus, X, Trash2, Check, CreditCard, AlertTriangle, Clock, ChevronRight, Search } from "lucide-react"
import { cn, formatDate, avatarUrl } from "@/lib/utils"
import type { Payment } from "@/lib/types"
import { effectivePaymentStatus } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { payments as paymentsDict } from "@/lib/i18n/dictionaries/payments"

const CONCEPTS = ["monthly_fee", "enrollment", "uniform", "tournament", "other"] as const
type Concept = typeof CONCEPTS[number]

const CONCEPT_KEYS: Record<Concept, keyof typeof paymentsDict> = {
  monthly_fee: "monthlyFee",
  enrollment: "enrollment",
  uniform: "uniform",
  tournament: "tournament",
  other: "otherConcept",
}

const STATUS_CFG = {
  overdue: { label: "statusOverdue", color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20" },
  pending: { label: "statusPending", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
  paid:    { label: "statusPaid",    color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
} as const

const EMPTY_FORM = { player_id: "", concept: "monthly_fee" as Concept, amount: "", due_date: "", paid_date: "", notes: "" }

export default function PaymentsPage() {
  const { players, payments, addPayment, updatePayment, deletePayment } = useApp()
  const t = useT(paymentsDict)
  const searchParams = useSearchParams()

  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "pending" | "paid">("all")
  const [playerFilter, setPlayerFilter] = useState(searchParams.get("player") ?? "all")
  const [conceptFilter, setConceptFilter] = useState<"all" | Concept>("all")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, due_date: new Date().toISOString().split("T")[0] })

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const currentMonthStart = today.slice(0, 7) + "-01"

  const enriched = useMemo(() => payments.map(p => ({
    ...p,
    effectiveStatus: effectivePaymentStatus(p, today),
    player: players.find(pl => pl.id === p.player_id),
  })), [payments, players, today])

  const stats = useMemo(() => {
    const overdue = enriched.filter(p => p.effectiveStatus === "overdue")
    const pending = enriched.filter(p => p.effectiveStatus === "pending")
    const collectedThisMonth = enriched.filter(p => p.status === "paid" && p.paid_date && p.paid_date >= currentMonthStart)
    return {
      overdueCount: new Set(overdue.map(p => p.player_id)).size,
      overdueAmount: overdue.reduce((s, p) => s + p.amount, 0),
      pendingCount: new Set(pending.map(p => p.player_id)).size,
      pendingAmount: pending.reduce((s, p) => s + p.amount, 0),
      collectedAmount: collectedThisMonth.reduce((s, p) => s + p.amount, 0),
    }
  }, [enriched, currentMonthStart])

  const filtered = useMemo(() => {
    return enriched
      .filter(p => {
        if (statusFilter !== "all" && p.effectiveStatus !== statusFilter) return false
        if (playerFilter !== "all" && p.player_id !== playerFilter) return false
        if (conceptFilter !== "all" && p.concept !== conceptFilter) return false
        if (search) {
          const name = p.player?.name.toLowerCase() ?? ""
          if (!name.includes(search.toLowerCase())) return false
        }
        return true
      })
      .sort((a, b) => {
        const order = { overdue: 0, pending: 1, paid: 2 }
        const diff = order[a.effectiveStatus] - order[b.effectiveStatus]
        if (diff !== 0) return diff
        return a.due_date.localeCompare(b.due_date)
      })
  }, [enriched, statusFilter, playerFilter, conceptFilter, search])

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    addPayment({
      player_id: form.player_id,
      concept: form.concept,
      amount: Number(form.amount),
      due_date: form.due_date,
      paid_date: form.paid_date || null,
      status: form.paid_date ? "paid" : "pending",
      notes: form.notes || null,
    })
    setShowForm(false)
    setForm({ ...EMPTY_FORM, due_date: new Date().toISOString().split("T")[0] })
  }

  function markPaid(p: Payment) {
    updatePayment(p.id, { status: "paid", paid_date: today })
  }

  const selectCls = "h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer"

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={`${payments.length} ${t("paymentsRegistered")}`}>
          <Button size="md" onClick={() => setShowForm(true)}>
            <Plus size={16} /> {t("newPayment")}
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-red-100 dark:border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={15} className="text-red-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("overduePayments")}</span>
            </div>
            <p className="text-xl font-black text-red-600">${stats.overdueAmount.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{stats.overdueCount} {t("players")}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-100 dark:border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} className="text-amber-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("pendingPayments")}</span>
            </div>
            <p className="text-xl font-black text-amber-600">${stats.pendingAmount.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{stats.pendingCount} {t("players")}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={15} className="text-emerald-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("collectedThisMonth")}</span>
            </div>
            <p className="text-xl font-black text-emerald-600">${stats.collectedAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-slate-800 mb-5 flex flex-wrap gap-2 md:gap-3 items-center">
          <div className="relative flex-1 min-w-36">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text" placeholder="Buscar alumno..." value={search}
              onChange={ev => setSearch(ev.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "overdue", "pending", "paid"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn("h-9 px-3 rounded-xl text-xs font-semibold border transition-all", statusFilter === s
                  ? s === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                    : s === "overdue" ? "bg-red-500 text-white border-transparent"
                    : s === "pending" ? "bg-amber-500 text-white border-transparent"
                    : "bg-emerald-500 text-white border-transparent"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
                )}
              >
                {s === "all" ? t("allStatus") : t(STATUS_CFG[s].label as keyof typeof paymentsDict)}
              </button>
            ))}
          </div>
          <select value={playerFilter} onChange={ev => setPlayerFilter(ev.target.value)} className={selectCls}>
            <option value="all">{t("allPlayers")}</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={conceptFilter} onChange={ev => setConceptFilter(ev.target.value as "all" | Concept)} className={selectCls}>
            <option value="all">{t("allConcepts")}</option>
            {CONCEPTS.map(c => <option key={c} value={c}>{t(CONCEPT_KEYS[c])}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <CreditCard size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">{payments.length === 0 ? t("noPayments") : t("noPaymentsMatch")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => {
              const cfg = STATUS_CFG[p.effectiveStatus]
              const conceptKey = CONCEPT_KEYS[p.concept as Concept] ?? "otherConcept"
              return (
                <div key={p.id} className={cn("bg-white dark:bg-slate-900 rounded-2xl p-4 border flex items-center gap-4 group", cfg.border)}>
                  {/* Player */}
                  <Link href={`/players/${p.player_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={p.player?.photo_url || avatarUrl(p.player?.name ?? "", p.player_id)}
                      alt={p.player?.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.player?.name ?? "—"}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-slate-500">{t(conceptKey)}</span>
                        {p.notes && <span className="text-[10px] text-slate-300 dark:text-slate-600 italic truncate max-w-32">{p.notes}</span>}
                      </div>
                    </div>
                  </Link>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-slate-900 dark:text-white">${p.amount.toLocaleString()}</p>
                  </div>

                  {/* Dates */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(p.due_date)}</p>
                    {p.paid_date && <p className="text-[10px] text-emerald-600">✓ {formatDate(p.paid_date)}</p>}
                  </div>

                  {/* Status */}
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg shrink-0", cfg.color, cfg.bg)}>
                    {t(cfg.label as keyof typeof paymentsDict)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.effectiveStatus !== "paid" && (
                      <button
                        onClick={() => markPaid(p)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Check size={12} /> {t("markPaid")}
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm(t("confirmDelete"))) deletePayment(p.id) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                    <Link href={`/players/${p.player_id}`} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B5CFF] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New payment modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("newPaymentTitle")}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t("playerLabel")}</label>
                <select
                  value={form.player_id}
                  onChange={ev => setForm(f => ({ ...f, player_id: ev.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#0B5CFF] outline-none"
                  required
                >
                  <option value="">—</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t("conceptLabel")}</label>
                <select
                  value={form.concept}
                  onChange={ev => setForm(f => ({ ...f, concept: ev.target.value as Concept }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#0B5CFF] outline-none"
                >
                  {CONCEPTS.map(c => <option key={c} value={c}>{t(CONCEPT_KEYS[c])}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t("amountLabel")} type="number" min={0} step="0.01" value={form.amount} onChange={ev => setForm(f => ({ ...f, amount: ev.target.value }))} required />
                <Input label={t("dueDateLabel")} type="date" value={form.due_date} onChange={ev => setForm(f => ({ ...f, due_date: ev.target.value }))} required />
              </div>
              <Input label={t("paidDateLabel")} type="date" value={form.paid_date} onChange={ev => setForm(f => ({ ...f, paid_date: ev.target.value }))} />
              <Input label={t("notesLabel")} placeholder={t("notesPlaceholder")} value={form.notes} onChange={ev => setForm(f => ({ ...f, notes: ev.target.value }))} />
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
                <Button type="submit">{t("save")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
