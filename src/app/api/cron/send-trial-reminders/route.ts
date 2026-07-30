import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, trialReminderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // Verify cron secret
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

    const now = new Date()
    const results = { sent: 0, failed: 0 }

    // Get all academies with active trials
    const { data: academies } = await admin
      .from("team_settings")
      .select("id, name, trial_expires_at")
      .not("trial_expires_at", "is", null)
      .eq("subscription_status", null)

    if (!academies) return NextResponse.json({ ok: true, results })

    for (const academy of academies) {
      const trialEnd = new Date(academy.trial_expires_at)
      const daysUntilEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Send on day 10, 0 (vencimiento), -10
      if (daysUntilEnd === 4 || daysUntilEnd === 0 || daysUntilEnd === -10) {
        try {
          const { data: profiles } = await admin
            .from("profiles")
            .select("id")
            .eq("academy_id", academy.id)
            .eq("role", "coach")
            .limit(1)

          if (!profiles?.length) continue

          const { data: user } = await admin.auth.admin.listUsers()
          const coach = user?.users.find(u => u.id === profiles[0].id)
          if (!coach?.email) continue

          const html = trialReminderEmail(academy.name, daysUntilEnd)
          if (!html) continue

          await sendEmail(
            coach.email,
            daysUntilEnd === 4
              ? "Tu período de prueba vence en 4 días"
              : daysUntilEnd === 0
              ? "Tu período de prueba terminó"
              : "⚠️ Tu cuenta se elimina en 20 días",
            html
          )
          results.sent++
        } catch (err) {
          console.error(`Failed to send email for academy ${academy.id}:`, err)
          results.failed++
        }
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error("Cron error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
