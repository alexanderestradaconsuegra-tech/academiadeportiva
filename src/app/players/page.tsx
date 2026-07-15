"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PlayerCard from "@/components/PlayerCard"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { Plus, Search, SlidersHorizontal, Users, ArrowLeftRight } from "lucide-react"
import type { Category, Position } from "@/lib/types"
import { useT } from "@/lib/i18n/useT"
import { players as playersDict } from "@/lib/i18n/dictionaries/players"
import { useEnumT } from "@/lib/i18n/enums"

const CATEGORIES: Category[] = ["Sub-10","Sub-12","Sub-14","Sub-16","Sub-18","Juvenil","Senior"]
const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]

export default function PlayersPage() {
  const { players, injuries, payments, getLatestEvaluation } = useApp()
  const injuredIds = new Set(injuries.filter(i => !i.is_recovered).map(i => i.player_id))
  const today = new Date().toISOString().split("T")[0]
  const overduePaymentIds = new Set(payments.filter(p => p.status === "pending" && p.due_date < today).map(p => p.player_id))
  const t = useT(playersDict)
  const e = useEnumT()
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [posFilter, setPosFilter] = useState<string>("all")

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === "all" || p.category === catFilter
    const matchPos = posFilter === "all" || p.position === posFilter
    return matchSearch && matchCat && matchPos
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 xl:p-8 animate-fade-in">
        <PageHeader title={t("playersTitle")} subtitle={`${players.length} ${t("playersSubtitle")}`}>
          <Link href="/players/compare">
            <Button size="md" variant="outline">
              <ArrowLeftRight size={16} /> {t("comparePlayers")}
            </Button>
          </Link>
          <Link href="/players/new">
            <Button size="md">
              <Plus size={16} /> {t("newPlayer")}
            </Button>
          </Link>
        </PageHeader>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-slate-800 mb-5 flex flex-wrap gap-2 md:gap-3 items-center">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text" placeholder={t("searchPlaceholder")} value={search}
              onChange={ev => setSearch(ev.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400 dark:text-slate-500" />
            <select value={catFilter} onChange={ev => setCatFilter(ev.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer">
              <option value="all">{t("allCategories")}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{e.category(c)}</option>)}
            </select>
            <select value={posFilter} onChange={ev => setPosFilter(ev.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:border-[#0B5CFF] outline-none cursor-pointer">
              <option value="all">{t("allPositions")}</option>
              {POSITIONS.map(p => <option key={p} value={p}>{e.position(p)}</option>)}
            </select>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-auto">
            {filtered.length} {filtered.length !== 1 ? t("results") : t("result")}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">{t("noPlayersFound")}</p>
            <p className="text-sm mt-1">{t("adjustFiltersOrAdd")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {filtered.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                evaluation={getLatestEvaluation(player.id)}
                isInjured={injuredIds.has(player.id)}
                hasOverduePayment={overduePaymentIds.has(player.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
