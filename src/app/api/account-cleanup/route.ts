import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, trialReminderEmail, accountDeletedEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const now = new Date()

    // Get all academies with active trials (no subscription)
    const { data: academies, error: fetchError } = await admin
      .from("team_settings")
      .select("id, name, trial_expires_at")
      .not("trial_expires_at", "is", null)
      .eq("subscription_status", null)

    if (fetchError || !academies) {
      return NextResponse.json({ ok: true, results: { remindersSent: 0, accountsDeleted: 0 } })
    }

    let remindersSent = 0
    let accountsDeleted = 0

    for (const academy of academies) {
      const trialEnd = new Date(academy.trial_expires_at)
      const daysUntilEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // SEND REMINDERS on day 4, 0, -10
      if (daysUntilEnd === 4 || daysUntilEnd === 0 || daysUntilEnd === -10) {
        try {
          const { data: profiles } = await admin
            .from("profiles")
            .select("id")
            .eq("academy_id", academy.id)
            .eq("role", "coach")
            .limit(1)

          if (profiles?.length) {
            const { data: authUsers } = await admin.auth.admin.listUsers()
            const coach = authUsers?.users.find(u => u.id === profiles[0].id)

            if (coach?.email) {
              const html = trialReminderEmail(academy.name, daysUntilEnd)
              if (html) {
                await sendEmail(
                  coach.email,
                  daysUntilEnd === 4
                    ? "Tu período de prueba vence en 4 días"
                    : daysUntilEnd === 0
                    ? "Tu período de prueba terminó"
                    : "⚠️ Tu cuenta se elimina en 20 días",
                  html
                )
                remindersSent++
              }
            }
          }
        } catch (err) {
          console.error(`Cleanup: reminder error for ${academy.id}`, err)
        }
      }

      // DELETE ACCOUNTS older than 30 days
      if (daysUntilEnd < -30) {
        try {
          // Notify before deletion
          const { data: profiles } = await admin
            .from("profiles")
            .select("id")
            .eq("academy_id", academy.id)
            .eq("role", "coach")
            .limit(1)

          if (profiles?.length) {
            const { data: authUsers } = await admin.auth.admin.listUsers()
            const coach = authUsers?.users.find(u => u.id === profiles[0].id)
            if (coach?.email) {
              try {
                await sendEmail(
                  coach.email,
                  "Tu cuenta en Metrikas ha sido eliminada",
                  accountDeletedEmail(academy.name)
                )
              } catch (err) {
                console.error(`Cleanup: deletion email error for ${academy.id}`, err)
              }
            }
          }

          // Delete all related data
          await admin.from("players").delete().eq("academy_id", academy.id)
          await admin.from("profiles").delete().eq("academy_id", academy.id)
          await admin.from("team_settings").delete().eq("id", academy.id)

          accountsDeleted++
        } catch (err) {
          console.error(`Cleanup: delete error for ${academy.id}`, err)
        }
      }
    }

    return NextResponse.json({ ok: true, results: { remindersSent, accountsDeleted } })
  } catch (err) {
    console.error("Account cleanup error:", err)
    return NextResponse.json({ ok: true, results: { remindersSent: 0, accountsDeleted: 0 } })
  }
}
