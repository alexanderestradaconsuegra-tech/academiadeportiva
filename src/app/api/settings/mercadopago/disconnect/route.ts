import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !callerData.user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })
  }

  const { data: profile } = await admin
    .from("profiles").select("role, academy_id").eq("id", callerData.user.id).single()
  if (!profile || profile.role !== "coach" || !profile.academy_id) {
    return NextResponse.json({ error: "Solo el entrenador puede desconectar MercadoPago." }, { status: 403 })
  }

  await admin.from("academy_payment_credentials").delete().eq("academy_id", profile.academy_id)
  return NextResponse.json({ ok: true })
}
