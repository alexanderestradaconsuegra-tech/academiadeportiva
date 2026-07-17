import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/require-super-admin"

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth.error) return auth.error
  const { admin } = auth

  const { data: academies, error } = await admin
    .from("team_settings")
    .select("id, name, city, subscription_status, subscription_current_period_end, stripe_customer_id, stripe_subscription_id, updated_at")
    .order("updated_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: coaches } = await admin
    .from("profiles")
    .select("academy_id, full_name")
    .eq("role", "coach")

  const coachByAcademy = new Map((coaches ?? []).map(c => [c.academy_id, c.full_name]))

  const result = (academies ?? []).map(a => ({
    ...a,
    coach_name: coachByAcademy.get(a.id) ?? null,
  }))

  return NextResponse.json({ academies: result })
}
