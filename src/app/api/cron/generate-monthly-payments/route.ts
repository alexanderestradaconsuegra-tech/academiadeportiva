import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resolveMonthlyPaymentDueDate } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * The real fix for "mensualidades should generate automatically on the 1st":
 * the client-side generator in AppContext only ever ran when a coach happened
 * to open /payments, so an academy nobody logged into that day got nothing —
 * silently, with no error anywhere. This runs daily regardless of who is
 * logged in, for every academy with a monthly_fee configured.
 *
 * Daily rather than "only on the 1st" is deliberate: it self-heals if the
 * scheduler missed a day, and it is idempotent (see the per-player existing-
 * payment check below), so running it more often than strictly necessary
 * costs nothing and only helps.
 *
 * Shares resolveMonthlyPaymentDueDate with the client-side generator so both
 * apply the exact same grace-period rule — the whole reason that function
 * exists is to stop a late-configured fee from backdating a debt no one
 * actually missed, and that logic must not drift between the two callers.
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
    const results = { academiesChecked: 0, paymentsCreated: 0, failed: 0 }

    const { data: academies } = await admin
      .from("team_settings")
      .select("id, monthly_fee")
      .not("monthly_fee", "is", null)
      .gt("monthly_fee", 0)

    if (!academies?.length) return NextResponse.json({ ok: true, results })

    for (const academy of academies) {
      results.academiesChecked++
      try {
        const dueDate = resolveMonthlyPaymentDueDate(today)
        const duePrefix = dueDate.slice(0, 7)

        const { data: players } = await admin
          .from("players")
          .select("id")
          .eq("academy_id", academy.id)
        if (!players?.length) continue

        const { data: existing } = await admin
          .from("payments")
          .select("player_id")
          .eq("academy_id", academy.id)
          .eq("concept", "monthly_fee")
          .like("due_date", `${duePrefix}%`)

        const existingPlayerIds = new Set((existing ?? []).map(p => p.player_id))
        const missing = players.filter(p => !existingPlayerIds.has(p.id))
        if (missing.length === 0) continue

        const now = new Date().toISOString()
        const newPayments = missing.map(player => ({
          player_id: player.id,
          academy_id: academy.id,
          concept: "monthly_fee",
          amount: academy.monthly_fee,
          due_date: dueDate,
          paid_date: null,
          status: "pending" as const,
          notes: null,
          created_at: now,
        }))

        const { error: insertError } = await admin.from("payments").insert(newPayments)
        if (insertError) {
          console.error(`[generate-monthly-payments] academy ${academy.id}:`, insertError.message)
          results.failed++
          continue
        }
        results.paymentsCreated += newPayments.length
      } catch (err) {
        console.error(`[generate-monthly-payments] academy ${academy.id}:`, err)
        results.failed++
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error("[generate-monthly-payments] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
