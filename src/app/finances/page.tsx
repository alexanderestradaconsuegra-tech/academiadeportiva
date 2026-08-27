"use client"
import { useState, useMemo } from "react"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Plus, X, Trash2, Pencil, TrendingUp, TrendingDown, Scale, Wallet, RefreshCw } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { Expense, ExpenseCategory } from "@/lib/types"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/types"

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  arriendo: "bg-blue-500",
  sueldos: "bg-violet-500",
  implementos: "bg-amber-500",
  servicios: "bg-cyan-500",
  otro: "bg-slate-400",
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
}

const EMPTY_FORM = { category: "arriendo" as ExpenseCategory, concept: "", amount: "", date: "", is_recurring: false, notes: "" }

export default function FinancesPage() {
  const { payments, expenses, addExpense, updateExpense, deleteExpense, currentUser } = useApp()
  const isCoach = currentUser?.role === "coach"

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const [month, setMonth] = useState(today.slice(0, 7))
  const [categoryFilter, setCategoryFilter] = useState<"all" | ExpenseCategory>("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, date: today })

  const monthExpenses = useMemo(
    () => expenses.filter(e => e.date.startsWith(month)),
    [expenses, month]
  )

  const monthIncome = useMemo(
    () => payments.filter(p => p.status === "paid" && p.paid_date && p.paid_date.startsWith(month)),
    [payments, month]
  )

  const stats = useMemo(() => {
    const income = monthIncome.reduce((s, p) => s + p.amount, 0)
    const expense = monthExpenses.reduce((s, e) => s + e.amount, 0)
    return { income, expense, net: income - expense }
  }, [monthIncome, monthExpenses])

  const byCategory = useMemo(() => {
    const totals = new Map<ExpenseCategory, number>()
    monthExpenses.forEach(e => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount))
    return CATEGORIES
      .map(c => ({ category: c, total: totals.get(c) ?? 0 }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [monthExpenses])

  const filtered = useMemo(() => {
    return monthExpenses
      .filter(e => categoryFilter === "all" || e.category === categoryFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [monthExpenses, categoryFilter])

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, date: today })
    setShowForm(true)
  }

  function openEdit(e: Expense) {
    setEditing(e)
    setForm({ category: e.category, concept: e.concept, amount: String(e.amount), date: e.date, is_recurring: e.is_recurring, notes: e.notes ?? "" })
    setShowForm(true)
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const data = {
      category: form.category,
      concept: form.concept,
      amount: Number(form.amount),
      date: form.date,
      is_recurring: form.is_recurring,
      notes: form.notes || null,
    }
    if (editing) {
      updateExpense(editing.id, data)
    } else {
      addExpense(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  if (!isCoach) {
    return (
      <AppShell>
        <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
          <PageHeader title="Finanzas" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No tienes acceso a esta sección.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title="Finanzas" subtitle="Cuánto cobraste, cuánto gastaste y cuánto te queda">
          <div className="flex items-center gap-2">
            <input
              type="month"
              aria-label="Mes"
              value={month}
              onChange={ev => setMonth(ev.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-lime-600 dark:focus:border-lime-400 outline-none"
            />
            <Button size="md" onClick={openNew}>
              <Plus size={16} /> Nuevo gasto
            </Button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-emerald-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ingresos</span>
            </div>
            <p className="text-xl font-black text-emerald-600">${stats.income.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{monthLabel(month)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-red-100 dark:border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={15} className="text-red-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gastos</span>
            </div>
            <p className="text-xl font-black text-red-600">${stats.expense.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{monthExpenses.length} registros</p>
          </div>
          <div className={cn("rounded-2xl p-4 border", stats.net >= 0 ? "bg-white dark:bg-slate-900 border-lime-100 dark:border-lime-500/20" : "bg-white dark:bg-slate-900 border-red-100 dark:border-red-500/20")}>
            <div className="flex items-center gap-2 mb-1">
              <Scale size={15} className={stats.net >= 0 ? "text-lime-600" : "text-red-500"} />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Balance</span>
            </div>
            <p className={cn("text-xl font-black", stats.net >= 0 ? "text-slate-900 dark:text-white" : "text-red-600")}>
              ${stats.net.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Gastos por categoría</p>
            <div className="space-y-2.5">
              {byCategory.map(({ category, total }) => {
                const pct = stats.expense > 0 ? Math.round((total / stats.expense) * 100) : 0
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{EXPENSE_CATEGORY_LABELS[category]}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">${total.toLocaleString()} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={cn("h-full rounded-full", CATEGORY_COLORS[category])} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn("h-9 px-3 rounded-xl text-xs font-semibold border transition-all",
              categoryFilter === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
            )}
          >
            Todas
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn("h-9 px-3 rounded-xl text-xs font-semibold border transition-all",
                categoryFilter === c ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
              )}
            >
              {EXPENSE_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Wallet size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">Sin gastos registrados este mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 group">
                <div className={cn("w-2 h-10 rounded-full shrink-0", CATEGORY_COLORS[e.category])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{e.concept}</p>
                    {e.is_recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                        <RefreshCw size={9} /> Recurrente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{EXPENSE_CATEGORY_LABELS[e.category]} · {formatDate(e.date)}</p>
                  {e.notes && <p className="text-[10px] text-slate-300 dark:text-slate-600 italic truncate mt-0.5">{e.notes}</p>}
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white shrink-0">${e.amount.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(e)}
                    aria-label="Editar"
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-lime-700 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-500/10 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => { if (confirm("¿Eliminar este gasto?")) deleteExpense(e.id) }}
                    aria-label="Eliminar"
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/edit expense modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editing ? "Editar gasto" : "Nuevo gasto"}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Cerrar" className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Categoría</label>
                <select
                  value={form.category}
                  onChange={ev => setForm(f => ({ ...f, category: ev.target.value as ExpenseCategory }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-lime-600 dark:focus:border-lime-400 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <Input label="Concepto" placeholder="Ej: Arriendo cancha municipal" value={form.concept} onChange={ev => setForm(f => ({ ...f, concept: ev.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Monto ($)" type="number" min={0} step="0.01" value={form.amount} onChange={ev => setForm(f => ({ ...f, amount: ev.target.value }))} required />
                <Input label="Fecha" type="date" value={form.date} onChange={ev => setForm(f => ({ ...f, date: ev.target.value }))} required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={ev => setForm(f => ({ ...f, is_recurring: ev.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Es un gasto recurrente (se repite cada mes)</span>
              </label>
              <Input label="Notas (opcional)" placeholder="Detalles adicionales" value={form.notes} onChange={ev => setForm(f => ({ ...f, notes: ev.target.value }))} />
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
