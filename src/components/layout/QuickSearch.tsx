"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, UserPlus, CreditCard, CalendarPlus, PenTool, GitCompare, User, CornerDownLeft, type LucideIcon } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useT } from "@/lib/i18n/useT"
import { nav } from "@/lib/i18n/dictionaries/nav"
import { rankItems } from "@/lib/search"
import { cn } from "@/lib/utils"
import { MAIN_NAV, MORE_NAV, SETTINGS_NAV, visibleTo } from "./nav-items"

/** Any button can open the search with `openQuickSearch()`. */
export const OPEN_EVENT = "metrikas:open-search"
export const openQuickSearch = () => window.dispatchEvent(new Event(OPEN_EVENT))

type Group = "actions" | "pages" | "players"
interface Item { id: string; group: Group; label: string; sub?: string; href: string; icon: LucideIcon }

/**
 * Ctrl+K (⌘K on Mac) search: jump to a player, a page or a common action.
 * With the menu trimmed to five entries, this keeps the rest one keystroke away.
 * Searches only what the app has already loaded; no extra queries.
 */
export default function QuickSearch() {
  const { players, currentUser } = useApp()
  const t = useT(nav)
  const router = useRouter()
  const pathname = usePathname()
  const isAssistant = currentUser?.role === "assistant"

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(o => !o) }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(OPEN_EVENT, onOpen) }
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])
  // Reset on close (not on open), so whatever is typed right after Ctrl+K is kept.
  useEffect(() => {
    if (!open) { setQuery(""); setActive(0) }
  }, [open])

  const all = useMemo<Item[]>(() => {
    const actions: (Item & { adminOnly?: boolean })[] = [
      { id: "a-player", group: "actions", label: t("actNewPlayer"), href: "/players/new", icon: UserPlus },
      { id: "a-pay", group: "actions", label: t("actPayment"), href: "/payments", icon: CreditCard, adminOnly: true },
      { id: "a-train", group: "actions", label: t("actTraining"), href: "/calendar", icon: CalendarPlus },
      { id: "a-play", group: "actions", label: t("actPlay"), href: "/tactics", icon: PenTool },
      { id: "a-compare", group: "actions", label: t("actCompare"), href: "/players/compare", icon: GitCompare },
    ]
    const pages = visibleTo([...MAIN_NAV, ...MORE_NAV, SETTINGS_NAV], isAssistant).map<Item>(n => ({
      id: `p-${n.href}`, group: "pages", label: t(n.label), href: n.href, icon: n.icon,
    }))
    const people = players.map<Item>(p => ({
      id: `j-${p.id}`, group: "players", label: p.name, sub: [p.category, p.position].filter(Boolean).join(" · "),
      href: `/players/${p.id}`, icon: User,
    }))
    return [...actions.filter(a => !isAssistant || !a.adminOnly), ...pages, ...people]
  }, [players, isAssistant, t])

  // Empty search: suggest actions and pages. Typing: best matches of each kind.
  const results = useMemo(() => {
    const q = query.trim()
    const of = (g: Group, limit: number) => rankItems(all.filter(i => i.group === g), q, i => `${i.label} ${i.sub ?? ""}`, limit)
    return q
      ? [...of("players", 6), ...of("actions", 4), ...of("pages", 5)]
      : [...of("actions", 5), ...of("pages", 12)]
  }, [all, query])

  useEffect(() => { setActive(0) }, [query])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  function go(item: Item | undefined) {
    if (!item) return
    setOpen(false)
    router.push(item.href)
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]) }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false) }
  }

  if (!open) return null

  const titles: Record<Group, string> = { actions: t("searchActions"), pages: t("searchPages"), players: t("searchPlayers") }

  return (
    <div className="no-print fixed inset-0 z-[90] flex items-start justify-center p-3 pt-[10vh] md:pt-[14vh]" role="dialog" aria-modal="true" aria-label={t("search")}>
      <button aria-label="Cerrar" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-default" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t("searchPlaceholder")}
            role="combobox"
            aria-expanded="true"
            aria-controls="quick-search-list"
            aria-activedescendant={results[active] ? `qs-${results[active].id}` : undefined}
            className="flex-1 h-14 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden md:inline text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <ul id="quick-search-list" ref={listRef} role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-400">{t("searchEmpty")}</li>}
          {results.map((item, i) => {
            const Icon = item.icon
            const newGroup = i === 0 || results[i - 1].group !== item.group
            return (
              <li key={item.id} role="presentation">
                {newGroup && <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titles[item.group]}</p>}
                <button
                  id={`qs-${item.id}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                    i === active ? "bg-lime-50 dark:bg-lime-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    i === active ? "bg-lime-400 text-[#05122F]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-900 dark:text-white truncate">{item.label}</span>
                    {item.sub && <span className="block text-xs text-slate-400 truncate">{item.sub}</span>}
                  </span>
                  {i === active && <CornerDownLeft size={14} className="text-slate-400 shrink-0 hidden md:block" />}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="hidden md:block px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">{t("searchHelp")}</p>
      </div>
    </div>
  )
}
