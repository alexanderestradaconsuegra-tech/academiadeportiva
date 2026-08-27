import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Liveness + dependency check for uptime monitoring.
 *
 * Deliberately unauthenticated and deliberately thin: it reports whether the
 * app can still reach its database, and nothing else. No counts, no table
 * names, no versions — a health endpoint that leaks shape is a recon endpoint.
 *
 * 200 = healthy, 503 = degraded, so a monitor can alert on the status code
 * without parsing the body.
 */
export async function GET() {
  const startedAt = Date.now()

  let dbOk = false
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    // head+count touches the connection without pulling rows back
    const { error } = await sb.from("team_settings").select("id", { count: "exact", head: true })
    dbOk = !error
  } catch {
    dbOk = false
  }

  const healthy = dbOk
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      db: dbOk ? "ok" : "down",
      ms: Date.now() - startedAt,
      at: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  )
}
