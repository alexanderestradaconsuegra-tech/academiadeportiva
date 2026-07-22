import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/require-super-admin"

const VALID_STATUSES = new Set(["trialing", "active", "past_due", "suspended", "canceled"])

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth.error) return auth.error
  const { admin } = auth

  const { academy_id, subscription_status, subscription_current_period_end } = await req.json()
  if (!academy_id || !VALID_STATUSES.has(subscription_status)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 })
  }

  const { error } = await admin
    .from("team_settings")
    .update({
      subscription_status,
      subscription_current_period_end: subscription_current_period_end || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", academy_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
