import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Full-data JSON snapshot, for taking a backup off a Supabase plan that has
 * no automatic ones.
 *
 * This is a stopgap, not a real backup. It captures row data only — no schema,
 * no RLS policies, no functions, no auth users, no storage objects. Restoring
 * from it means recreating the schema first and re-inviting users. The actual
 * fix is a plan with point-in-time backups; this exists so there is *something*
 * recoverable in the meantime.
 *
 * Auth: CRON_SECRET, same as the scheduled jobs — this returns every academy's
 * data, so it is operator-only and must never be reachable by a customer.
 *
 * Usage:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     https://app.metrikas.pro/api/admin/export -o metrikas-backup.json
 */
const TABLES = [
  "team_settings",
  "profiles",
  "players",
  "evaluations",
  "activities",
  "exercises",
  "trainings",
  "attendance",
  "matches",
  "match_player_stats",
  "convocatorias",
  "convocatoria_players",
  "payments",
  "expenses",
  "physical_tests",
  "injuries",
  "health_profiles",
  "live_sessions",
  "position_samples",
  "activation_codes",
  "training_schedules",
  "tactic_plays",
  "tactics_plays",
  "custom_exercises",
] as const

export async function GET(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "")
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const data: Record<string, unknown[]> = {}
  const failed: string[] = []

  for (const table of TABLES) {
    const { data: rows, error } = await sb.from(table).select("*")
    if (error) {
      // Keep going — a partial snapshot beats none, but say which tables are
      // missing so nobody mistakes it for complete.
      failed.push(table)
      continue
    }
    data[table] = rows ?? []
  }

  const body = {
    exported_at: new Date().toISOString(),
    note: "Row data only. No schema, auth users, or storage objects. Not a substitute for database backups.",
    failed_tables: failed,
    row_counts: Object.fromEntries(Object.entries(data).map(([t, rows]) => [t, rows.length])),
    data,
  }

  const stamp = new Date().toISOString().split("T")[0]
  return new NextResponse(JSON.stringify(body, null, 2), {
    status: failed.length ? 207 : 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="metrikas-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  })
}
