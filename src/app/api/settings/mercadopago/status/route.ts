import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !callerData.user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })
  }

  const { data: profile } = await admin
    .from("profiles").select("academy_id").eq("id", callerData.user.id).single()
  if (!profile?.academy_id) {
    return NextResponse.json({ connected: false })
  }

  const { data: creds } = await admin
    .from("academy_payment_credentials")
    .select("mp_account_email, connected_at")
    .eq("academy_id", profile.academy_id)
    .maybeSingle()

  if (!creds) return NextResponse.json({ connected: false })
  return NextResponse.json({ connected: true, accountEmail: creds.mp_account_email, connectedAt: creds.connected_at })
}
