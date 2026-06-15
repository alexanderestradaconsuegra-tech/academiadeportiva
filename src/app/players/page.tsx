"use client"
import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/context/AppContext"
import AppShell from "@/components/layout/AppShell"
import PlayerCard from "@/components/PlayerCard"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { Plus, Search, SlidersHorizontal, Users } from "lucide-react"
import type { Category, Position } from "@/lib/types"

const CATEGORIES: Category[] = ["Sub-10","Sub-12","Sub-14","Sub-16","Sub-18","Juvenil","Senior"]
const POSITIONS: Position[] = ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"]

export default function PlayersPage() {
  const { players, getLatestEvaluation } = useApp()
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
        <PageHeader title="Jugadores" subtitle={`${players.length} jugadores registrados en el sistema`}>
          <Link href="/players/new">
            <Button size="md">
              <Plus size={16} /> Nuevo Jugador
            </Button>
          </Link>
        </PageHeader>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-5 flex flex-wrap gap-2 md:gap-3 items-center">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Buscar jugador o posición..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#0B5CFF] outline-none cursor-pointer">
              <option value="all">Todas las posiciones</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium ml-auto">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">No se encontraron jugadores</p>
            <p className="text-sm mt-1">Ajusta los filtros o agrega un nuevo jugador</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {filtered.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                evaluation={getLatestEvaluation(player.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
