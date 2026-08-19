import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, demoReminderEmail } from "@/lib/email"

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

    // Demo codes still unused
    const { data: codes } = await admin
      .from("activation_codes")
      .select("code, email, academy_name, expires_at")
      .eq("code_type", "demo")
      .eq("used", false)

    if (!codes) return NextResponse.json({ ok: true, results })

    for (const c of codes) {
      if (!c.expires_at || !c.email) continue
      const expiresAt = new Date(c.expires_at)
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Nudge with 10 days left (4 days after requesting), then again with 1 day left
      if (daysLeft === 10 || daysLeft === 1) {
        try {
          const html = demoReminderEmail(c.academy_name ?? "tu academia", c.code, daysLeft)
          await sendEmail(
            c.email,
            daysLeft === 1 ? "⏱️ Tu demo de Metrikas vence mañana" : "👋 ¿Ya probaste Metrikas?",
            html
          )
          results.sent++
        } catch (err) {
          console.error(`Failed to send demo reminder for ${c.code}:`, err)
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
