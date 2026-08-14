"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Plus, X, Trash2, Check, CreditCard, AlertTriangle, Clock, ChevronRight, Search, Bell, RefreshCw, Settings2, Upload, FileCheck, XCircle } from "lucide-react"
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
  overdue:     { label: "statusOverdue",    color: "text-red-600",    bg: "bg-red-50 dark:bg-red-500/10",    border: "border-red-200 dark:border-red-500/20" },
  pending:     { label: "statusPending",    color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
  en_revision: { label: "statusEnRevision", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/20" },
  paid:        { label: "statusPaid",       color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
} as const

const EMPTY_FORM = { player_id: "", concept: "monthly_fee" as Concept, amount: "", due_date: "", paid_date: "", notes: "" }

export default function PaymentsPage() {
  const {
    players, payments, addPayment, updatePayment, deletePayment, teamSettings, updateTeamSettings,
    autoGenerateMonthlyPayments, currentUser, submitPaymentReceipt, approvePaymentReceipt, rejectPaymentReceipt,
    getReceiptSignedUrl,
  } = useApp()
  const t = useT(paymentsDict)
  const searchParams = useSearchParams()
  const isCoach = currentUser?.role === "coach"
  const isPlayer = currentUser?.role === "player"
  const ownPlayerId = currentUser?.player_id ?? null

  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "pending" | "paid">("all")
  const [playerFilter, setPlayerFilter] = useState(searchParams.get("player") ?? "all")
  const [conceptFilter, setConceptFilter] = useState<"all" | Concept>("all")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, due_date: new Date().toISOString().split("T")[0] })
  const [generating, setGenerating] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notifyResult, setNotifyResult] = useState<string | null>(null)
  const [showFeeSettings, setShowFeeSettings] = useState(false)
  const [feeInput, setFeeInput] = useState("")
  const autoGenDone = useRef(false)

  // Receipt upload modal (manual cash/transfer payments)
  const [receiptTarget, setReceiptTarget] = useState<Payment | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptNote, setReceiptNote] = useState("")
  const [receiptSaving, setReceiptSaving] = useState(false)
  const [receiptError, setReceiptError] = useState("")

  // Receipt review (coach approving/rejecting)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewUrls, setReviewUrls] = useState<Record<string, string>>({})
  const [rejectDrafts, setRejectDrafts] = useState<Record<string, string>>({})

  // Player/apoderado self-serve payment
  const [mpConnected, setMpConnected] = useState<boolean | null>(null)
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState("")

  useEffect(() => {
    if (!isPlayer) return
    (async () => {
      const { data: sessionData } = await (await import("@/lib/supabase")).supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/settings/mercadopago/status", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setMpConnected(!!data.connected)
    })()
  }, [isPlayer])

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const currentMonthStart = today.slice(0, 7) + "-01"
  const dayOfMonth = parseInt(today.slice(8, 10), 10)
  const isFirst5Days = dayOfMonth <= 5

  // Auto-generate monthly payments once on load (coach only)
  useEffect(() => {
    if (!isCoach || autoGenDone.current) return
    if (!teamSettings?.monthly_fee) return
    autoGenDone.current = true
    autoGenerateMonthlyPayments()
  }, [isCoach, teamSettings?.monthly_fee, autoGenerateMonthlyPayments])

  const enriched = useMemo(() => payments.map(p => ({
    ...p,
    effectiveStatus: effectivePaymentStatus(p, today),
    player: players.find(pl => pl.id === p.player_id),
  })), [payments, players, today])

  const stats = useMemo(() => {
    const overdue = enriched.filter(p => p.effectiveStatus === "overdue")
    // "Pendiente" is the total not-yet-collected: it includes overdue payments too
    // (an overdue payment is still pending, just late) — "Vencido" is the subset alert.
    const unpaid = enriched.filter(p => p.effectiveStatus !== "paid")
    const collectedThisMonth = enriched.filter(p => p.status === "paid" && p.paid_date && p.paid_date >= currentMonthStart)
    return {
      overdueCount: new Set(overdue.map(p => p.player_id)).size,
      overdueAmount: overdue.reduce((s, p) => s + p.amount, 0),
      pendingCount: new Set(unpaid.map(p => p.player_id)).size,
      pendingAmount: unpaid.reduce((s, p) => s + p.amount, 0),
      collectedAmount: collectedThisMonth.reduce((s, p) => s + p.amount, 0),
    }
  }, [enriched, currentMonthStart])

  // Players missing monthly fee payment this month
  const missingMonthlyFee = useMemo(() => {
    if (!teamSettings?.monthly_fee) return []
    const monthPrefix = today.slice(0, 7)
    const paidThisMonth = new Set(
      payments.filter(p => p.concept === "monthly_fee" && p.due_date.startsWith(monthPrefix)).map(p => p.player_id)
    )
    return players.filter(p => !paidThisMonth.has(p.id))
  }, [players, payments, teamSettings?.monthly_fee, today])

  // Players with pending/overdue monthly fee this month
  const unpaidMonthlyFee = useMemo(() => {
    const monthPrefix = today.slice(0, 7)
    return enriched.filter(p =>
      p.concept === "monthly_fee" &&
      p.due_date.startsWith(monthPrefix) &&
      p.effectiveStatus !== "paid"
    )
  }, [enriched, today])

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
        const order = { overdue: 0, en_revision: 1, pending: 2, paid: 3 }
        const diff = order[a.effectiveStatus] - order[b.effectiveStatus]
        if (diff !== 0) return diff
        return a.due_date.localeCompare(b.due_date)
      })
  }, [enriched, statusFilter, playerFilter, conceptFilter, search])

  // Receipts awaiting coach approval
  const pendingReview = useMemo(() => enriched.filter(p => p.effectiveStatus === "en_revision"), [enriched])

  useEffect(() => {
    if (!isCoach || pendingReview.length === 0) return
    let cancelled = false
    Promise.all(pendingReview.map(async p => {
      if (!p.receipt_path || reviewUrls[p.id]) return null
      const url = await getReceiptSignedUrl(p.receipt_path)
      return url ? { id: p.id, url } : null
    })).then(results => {
      if (cancelled) return
      const next: Record<string, string> = {}
      results.forEach(r => { if (r) next[r.id] = r.url })
      if (Object.keys(next).length > 0) setReviewUrls(u => ({ ...u, ...next }))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoach, pendingReview])

  function openReceiptModal(p: Payment) {
    setReceiptTarget(p)
    setReceiptFile(null)
    setReceiptNote("")
    setReceiptError("")
  }

  async function handleUploadReceipt() {
    if (!receiptTarget || !receiptFile) return
    setReceiptSaving(true)
    setReceiptError("")
    const { error } = await submitPaymentReceipt(receiptTarget.id, receiptFile, receiptNote)
    setReceiptSaving(false)
    if (error) { setReceiptError(error); return }
    setReceiptTarget(null)
  }

  function handleApprove(id: string) {
    approvePaymentReceipt(id)
    setReviewUrls(u => { const n = { ...u }; delete n[id]; return n })
  }

  function handleReject(id: string) {
    rejectPaymentReceipt(id, rejectDrafts[id] ?? "")
    setReviewUrls(u => { const n = { ...u }; delete n[id]; return n })
    setRejectDrafts(d => { const n = { ...d }; delete n[id]; return n })
  }

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

  async function handleGenerate() {
    setGenerating(true)
    await autoGenerateMonthlyPayments()
    setGenerating(false)
  }

  async function handleNotifyPending() {
    setNotifying(true)
    setNotifyResult(null)
    try {
      const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: "Pago pendiente",
          body: `Tienes un pago de mensualidad pendiente. Por favor regulariza tu situación.`,
          url: "/",
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setNotifyResult(`Error: ${json.error ?? res.statusText}`)
      } else {
        setNotifyResult(`Notificaciones enviadas: ${json.sent} · Fallaron: ${json.failed}`)
      }
    } catch (e) {
      setNotifyResult(`Error al enviar: ${String(e)}`)
    }
    setNotifying(false)
  }

  function saveFeeSettings() {
    const fee = parseFloat(feeInput)
    if (!isNaN(fee) && fee >= 0) {
      updateTeamSettings({ monthly_fee: fee > 0 ? fee : null })
    }
    setShowFeeSettings(false)
  }

  const selectCls = "h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer"

  const ownPayments = useMemo(() => {
    if (!ownPlayerId) return []
    return enriched
      .filter(p => p.player_id === ownPlayerId)
      .sort((a, b) => {
        const order = { overdue: 0, en_revision: 1, pending: 2, paid: 3 }
        const diff = order[a.effectiveStatus] - order[b.effectiveStatus]
        if (diff !== 0) return diff
        return a.due_date.localeCompare(b.due_date)
      })
  }, [enriched, ownPlayerId])

  async function handlePayWithMercadoPago(paymentId: string) {
    setCheckoutError("")
    setCheckoutLoadingId(paymentId)
    const { data: sessionData } = await (await import("@/lib/supabase")).supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payment_id: paymentId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCheckoutLoadingId(null)
      setCheckoutError(data.error || "No se pudo iniciar el pago.")
      return
    }
    window.location.href = data.checkout_url
  }

  const receiptModal = receiptTarget && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Subir comprobante de pago</h2>
          <button onClick={() => setReceiptTarget(null)} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {players.find(pl => pl.id === receiptTarget.player_id)?.name} · ${receiptTarget.amount.toLocaleString()} · {t(CONCEPT_KEYS[receiptTarget.concept as Concept] ?? "otherConcept")}
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Foto o PDF del comprobante</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300"
            />
          </div>
          <Input
            label="Nota (opcional)"
            placeholder="Ej: transferencia del 5 de agosto"
            value={receiptNote}
            onChange={e => setReceiptNote(e.target.value)}
          />
          {receiptError && <p className="text-xs text-red-600">{receiptError}</p>}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            El pago quedará "En revisión" hasta que se confirme que el dinero llegó.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setReceiptTarget(null)}>Cancelar</Button>
            <Button type="button" loading={receiptSaving} disabled={!receiptFile} onClick={handleUploadReceipt}>Subir</Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isPlayer) {
    return (
      <AppShell>
        <div className="p-4 md:p-6 xl:p-8 animate-fade-in max-w-2xl">
          <PageHeader title="Mis pagos" subtitle={`${ownPayments.length} registrados`} />

          {checkoutError && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 mb-5">
              <p className="text-xs text-red-600">{checkoutError}</p>
            </div>
          )}

          {ownPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <CreditCard size={40} className="mb-3 opacity-30" />
              <p className="font-semibold">Todavía no tienes pagos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownPayments.map(p => {
                const cfg = STATUS_CFG[p.effectiveStatus]
                const conceptKey = CONCEPT_KEYS[p.concept as Concept] ?? "otherConcept"
                const canPay = p.effectiveStatus === "pending" || p.effectiveStatus === "overdue"
                return (
                  <div key={p.id} className={cn("bg-white dark:bg-slate-900 rounded-2xl p-4 border", cfg.border)}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(conceptKey)}</p>
                      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg shrink-0", cfg.color, cfg.bg)}>
                        {t(cfg.label as keyof typeof paymentsDict)}
                      </span>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white mb-1">${p.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Vence {formatDate(p.due_date)}</p>
                    {p.paid_date && <p className="text-xs text-emerald-600 mb-1">✓ Pagado el {formatDate(p.paid_date)}</p>}
                    {p.effectiveStatus === "en_revision" && (
                      <p className="text-xs text-violet-600 mb-1">Tu comprobante está en revisión — te avisaremos cuando se confirme.</p>
                    )}
                    {p.rejection_note && p.effectiveStatus !== "paid" && (
                      <p className="text-xs text-red-500 mb-1">Comprobante rechazado: {p.rejection_note}</p>
                    )}
                    {canPay && (
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        {mpConnected && (
                          <Button size="sm" type="button" loading={checkoutLoadingId === p.id} onClick={() => handlePayWithMercadoPago(p.id)}>
                            <CreditCard size={13} /> Pagar con MercadoPago
                          </Button>
                        )}
                        <Button size="sm" variant="outline" type="button" onClick={() => openReceiptModal(p)}>
                          <Upload size={13} /> Ya pagué (subir comprobante)
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {receiptModal}
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("pageTitle")} subtitle={`${payments.length} ${t("paymentsRegistered")}`}>
          {isCoach && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setFeeInput(String(teamSettings?.monthly_fee ?? "")); setShowFeeSettings(true) }}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Settings2 size={14} /> Mensualidad
              </button>
              <Button size="md" onClick={() => setShowForm(true)}>
                <Plus size={16} /> {t("newPayment")}
              </Button>
            </div>
          )}
        </PageHeader>

        {/* Monthly fee banner */}
        {isCoach && teamSettings?.monthly_fee && missingMonthlyFee.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B5CFF] flex items-center justify-center shrink-0">
              <RefreshCw size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {missingMonthlyFee.length} alumnos sin cuota este mes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mensualidad: ${teamSettings.monthly_fee.toLocaleString()} · Se generarán como pendientes
              </p>
            </div>
            <Button size="sm" loading={generating} onClick={handleGenerate}>
              Generar pagos
            </Button>
          </div>
        )}

        {/* Notify pending banner (first 5 days of month) */}
        {isCoach && unpaidMonthlyFee.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {unpaidMonthlyFee.length} cuotas pendientes este mes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFirst5Days ? "Primeros días del mes — avisa a los alumnos" : "Notifica a alumnos con pagos pendientes"}
              </p>
              {notifyResult && <p className="text-xs mt-1 font-medium text-amber-700 dark:text-amber-400">{notifyResult}</p>}
            </div>
            <Button size="sm" variant="secondary" loading={notifying} onClick={handleNotifyPending}>
              <Bell size={14} /> Notificar
            </Button>
          </div>
        )}

        {/* Receipts awaiting review */}
        {isCoach && pendingReview.length > 0 && (
          <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck size={16} className="text-violet-600 shrink-0" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {pendingReview.length} comprobante{pendingReview.length === 1 ? "" : "s"} por revisar
              </p>
            </div>
            <div className="space-y-3">
              {pendingReview.map(p => (
                <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col sm:flex-row gap-3 border border-violet-100 dark:border-violet-500/10">
                  {reviewUrls[p.id] && (
                    <a href={reviewUrls[p.id]} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img src={reviewUrls[p.id]} alt="Comprobante" className="w-full sm:w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.player?.name ?? "—"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">${p.amount.toLocaleString()} · {formatDate(p.due_date)}</p>
                    {p.receipt_note && <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">"{p.receipt_note}"</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Check size={12} /> Aprobar
                      </button>
                      {reviewingId === p.id ? (
                        <>
                          <input
                            type="text"
                            placeholder="Motivo del rechazo (opcional)"
                            aria-label="Motivo del rechazo"
                            value={rejectDrafts[p.id] ?? ""}
                            onChange={e => setRejectDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 outline-none focus:border-[#0B5CFF] flex-1 min-w-32"
                          />
                          <button
                            onClick={() => handleReject(p.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <XCircle size={12} /> Confirmar rechazo
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setReviewingId(p.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle size={12} /> Rechazar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              type="text" placeholder="Buscar alumno..." aria-label="Buscar alumno" value={search}
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
                <div key={p.id} className={cn("bg-white dark:bg-slate-900 rounded-2xl p-4 border flex flex-wrap items-center gap-3 group", cfg.border)}>
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
                        {p.rejection_note && p.effectiveStatus !== "paid" && (
                          <span className="text-[10px] text-red-500 italic truncate max-w-40" title={p.rejection_note}>
                            Comprobante rechazado: {p.rejection_note}
                          </span>
                        )}
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
                  {isCoach && (
                    <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {(p.effectiveStatus === "pending" || p.effectiveStatus === "overdue") && (
                        <button
                          onClick={() => openReceiptModal(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Upload size={12} /> <span className="hidden sm:inline">Comprobante</span>
                        </button>
                      )}
                      {p.effectiveStatus !== "paid" && (
                        <button
                          onClick={() => markPaid(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Check size={12} /> <span className="hidden sm:inline">{t("markPaid")}</span>
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm(t("confirmDelete"))) deletePayment(p.id) }}
                        aria-label={t("confirmDelete")}
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                      <Link href={`/players/${p.player_id}`} aria-label="Ver jugador" className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B5CFF] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly fee settings modal */}
      {showFeeSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Configurar mensualidad</h2>
              <button onClick={() => setShowFeeSettings(false)} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define el monto de la mensualidad. Al inicio de cada mes se generarán pagos pendientes automáticamente para todos los alumnos.
              </p>
              <Input
                label="Monto mensual ($)"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 50000"
                value={feeInput}
                onChange={e => setFeeInput(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" type="button" onClick={() => setShowFeeSettings(false)}>Cancelar</Button>
                <Button type="button" onClick={saveFeeSettings}>Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt upload modal */}
      {receiptModal}

      {/* New payment modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("newPaymentTitle")}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
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
