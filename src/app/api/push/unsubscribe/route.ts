import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })
  }

  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: "Falta el endpoint." }, { status: 400 })

  const { error } = await admin.from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("profile_id", userData.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
