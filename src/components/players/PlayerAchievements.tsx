"use client"
import { useMemo } from "react"
import { useApp } from "@/context/AppContext"
import { computeAchievements } from "@/lib/achievements"
import { cn } from "@/lib/utils"

/**
 * Achievements on the player profile: what the player has earned, and the
 * closest ones still to get, with progress. Seen by the coach, the player and
 * the family. Personal only; no comparison with other players.
 */
export default function PlayerAchievements({ playerId }: { playerId: string }) {
  const { attendance, trainings, evaluations, injuries } = useApp()

  const list = useMemo(() => {
    const dateOf = new Map(trainings.map(t => [t.id, t.date]))
    const sessions = attendance
      .filter(a => a.player_id === playerId && dateOf.has(a.training_id))
      .map(a => ({ date: dateOf.get(a.training_id)!, status: a.status }))
    return computeAchievements({
      sessions,
      evaluations: evaluations.filter(e => e.player_id === playerId),
      injuries: injuries.filter(i => i.player_id === playerId),
    }, new Date().toLocaleDateString("en-CA"))
  }, [attendance, trainings, evaluations, injuries, playerId])

  const earned = list.filter(a => a.earned)
  // Next goals: the ones with visible progress first, nearest to done first.
  const next = list
    .filter(a => !a.earned)
    .sort((a, b) => (b.progress ? b.progress.current / b.progress.target : -1) - (a.progress ? a.progress.current / a.progress.target : -1))
    .slice(0, 2)

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Logros</h2>
        <span className="text-xs text-slate-400">{earned.length} de {list.length}</span>
      </div>

      {earned.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {earned.map(a => (
            <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-lime-50 dark:bg-lime-500/10 border border-lime-200 dark:border-lime-500/20">
              <span className="text-2xl leading-none" aria-hidden>{a.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{a.title}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{a.description}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Todavía no hay logros. ¡El primero está cerca!</p>
      )}

      {next.length > 0 && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Próximos</p>
          <ul className="space-y-2">
            {next.map(a => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="text-xl leading-none grayscale opacity-50" aria-hidden>{a.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{a.title}</span>
                    {a.progress && <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{a.progress.current} de {a.progress.target}</span>}
                  </span>
                  {a.progress ? (
                    <span className="block h-1.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <span className={cn("block h-full rounded-full bg-lime-400")} style={{ width: `${Math.min(100, (a.progress.current / a.progress.target) * 100)}%` }} />
                    </span>
                  ) : (
                    <span className="block text-[11px] text-slate-400">{a.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
