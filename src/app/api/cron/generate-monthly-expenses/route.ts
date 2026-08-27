import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resolveMonthlyChargeDate } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * Clones each academy's recurring expenses (arriendo de cancha, sueldos, etc.)
 * forward into the current month, so a coach who logs "Arriendo cancha —
 * $80.000, recurrente" once doesn't have to re-enter it every month.
 *
 * There's no separate "recurring expense template" table — the most recent
 * is_recurring=true row per (academy_id, category, concept) IS the template.
 * That lets a coach change the amount going forward just by logging a new
 * entry, without a separate edit-the-template flow.
 *
 * Shares resolveMonthlyChargeDate with the payments generator so a fee
 * activated late in the month and a recurring expense logged late in the
 * month land on the same "don't backdate" rule.
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
    const targetDate = resolveMonthlyChargeDate(today)
    const targetPrefix = targetDate.slice(0, 7)
    const results = { academiesChecked: 0, expensesCreated: 0, failed: 0 }

    const { data: academies } = await admin.from("team_settings").select("id")
    if (!academies?.length) return NextResponse.json({ ok: true, results })

    for (const academy of academies) {
      results.academiesChecked++
      try {
        // All recurring expenses ever logged for this academy, most recent first —
        // the newest row per (category, concept) is treated as the template.
        const { data: recurring } = await admin
          .from("expenses")
          .select("category, concept, amount, notes")
          .eq("academy_id", academy.id)
          .eq("is_recurring", true)
          .order("date", { ascending: false })
        if (!recurring?.length) continue

        const templates = new Map<string, { category: string; concept: string; amount: number; notes: string | null }>()
        for (const row of recurring) {
          const key = `${row.category}::${row.concept}`
          if (!templates.has(key)) templates.set(key, row)
        }

        const { data: existing } = await admin
          .from("expenses")
          .select("category, concept")
          .eq("academy_id", academy.id)
          .like("date", `${targetPrefix}%`)
        const existingKeys = new Set((existing ?? []).map(e => `${e.category}::${e.concept}`))

        const missing = Array.from(templates.values()).filter(tpl => !existingKeys.has(`${tpl.category}::${tpl.concept}`))
        if (missing.length === 0) continue

        const now = new Date().toISOString()
        const newExpenses = missing.map(tpl => ({
          academy_id: academy.id,
          category: tpl.category,
          concept: tpl.concept,
          amount: tpl.amount,
          date: targetDate,
          is_recurring: true,
          notes: tpl.notes,
          created_at: now,
        }))

        const { error: insertError } = await admin.from("expenses").insert(newExpenses)
        if (insertError) {
          console.error(`[generate-monthly-expenses] academy ${academy.id}:`, insertError.message)
          results.failed++
          continue
        }
        results.expensesCreated += newExpenses.length
      } catch (err) {
        console.error(`[generate-monthly-expenses] academy ${academy.id}:`, err)
        results.failed++
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error("[generate-monthly-expenses] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
