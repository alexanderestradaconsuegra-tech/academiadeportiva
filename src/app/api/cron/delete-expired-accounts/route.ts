import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, accountDeletedEmail } from "@/lib/email"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("authorization")
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const results = { deleted: 0, notified: 0, failed: 0 }

    // Get academies with expired trials (no subscription) that are older than 30 days
    const { data: academies } = await admin
      .from("team_settings")
      .select("id, name, trial_expires_at")
      .not("trial_expires_at", "is", null)
      .eq("subscription_status", null)
      .lt("trial_expires_at", thirtyDaysAgo.toISOString())

    if (!academies) return NextResponse.json({ ok: true, results })

    for (const academy of academies) {
      try {
        // Send notification email before deletion
        const { data: profiles } = await admin
          .from("profiles")
          .select("id")
          .eq("academy_id", academy.id)
          .eq("role", "coach")
          .limit(1)

        if (profiles?.length) {
          const { data: user } = await admin.auth.admin.listUsers()
          const coach = user?.users.find(u => u.id === profiles[0].id)
          if (coach?.email) {
            try {
              await sendEmail(
                coach.email,
                "Tu cuenta en Metrikas ha sido eliminada",
                accountDeletedEmail(academy.name)
              )
              results.notified++
            } catch (err) {
              console.error(`Failed to send deletion email for academy ${academy.id}:`, err)
            }
          }
        }

        // Delete all related data (cascade should handle most)
        await admin.from("players").delete().eq("academy_id", academy.id)
        await admin.from("profiles").delete().eq("academy_id", academy.id)
        await admin.from("team_settings").delete().eq("id", academy.id)

        results.deleted++
      } catch (err) {
        console.error(`Failed to delete academy ${academy.id}:`, err)
        results.failed++
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error("Cron error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
