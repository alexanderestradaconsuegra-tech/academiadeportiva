import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { pendingSessions, HORIZON_DAYS } from "@/lib/schedules"
import type { TrainingSchedule } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * Rolls each academy's weekly schedule forward, so a coach who set
 * "Sub-12, martes y jueves 18:30" once never creates another session by hand.
 *
 * Daily and idempotent, same as the payments generator: it only creates dates
 * that have neither a session nor a cancellation on record, so running it more
 * often than strictly necessary costs nothing and self-heals a missed day.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const today = new Date().toISOString().split("T")[0]
    const horizonEnd = (() => {
      const d = new Date(today + "T00:00:00Z")
      d.setUTCDate(d.getUTCDate() + HORIZON_DAYS)
      return d.toISOString().split("T")[0]
    })()

    const results = { schedulesChecked: 0, trainingsCreated: 0, failed: 0 }

    const { data: schedules, error: schedulesError } = await admin
      .from("training_schedules")
      .select("*")
      .eq("is_active", true)
    if (schedulesError) {
      console.error("[generate-trainings] schedules:", schedulesError.message)
      return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
    if (!schedules?.length) return NextResponse.json({ ok: true, results })

    for (const row of schedules) {
      results.schedulesChecked++
      try {
        const [{ data: existing }, { data: skips }] = await Promise.all([
          admin.from("trainings").select("date")
            .eq("schedule_id", row.id).gte("date", today).lte("date", horizonEnd),
          admin.from("training_schedule_skips").select("date")
            .eq("schedule_id", row.id).gte("date", today).lte("date", horizonEnd),
        ])

        const planned = pendingSessions(
          row as unknown as TrainingSchedule,
          new Set((existing ?? []).map(t => t.date)),
          new Set((skips ?? []).map(s => s.date)),
          today,
        )
        if (planned.length === 0) continue

        const { error: insertError } = await admin.from("trainings").insert(
          planned.map(p => ({
            academy_id: row.academy_id,
            schedule_id: p.schedule_id,
            title: p.title,
            date: p.date,
            time: p.time,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            category: (p.category ?? null) as any,
            location: p.location ?? "",
            notes: p.notes ?? "",
          }))
        )
        if (insertError) {
          console.error(`[generate-trainings] schedule ${row.id}:`, insertError.message)
          results.failed++
          continue
        }
        results.trainingsCreated += planned.length
      } catch (err) {
        console.error(`[generate-trainings] schedule ${row.id}:`, err)
        results.failed++
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error("[generate-trainings] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
