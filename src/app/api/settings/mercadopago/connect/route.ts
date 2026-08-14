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
    return NextResponse.json({ error: "Solo el entrenador puede conectar MercadoPago." }, { status: 403 })
  }

  const { access_token } = await req.json()
  if (!access_token || typeof access_token !== "string") {
    return NextResponse.json({ error: "Token requerido." }, { status: 400 })
  }

  const mpRes = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!mpRes.ok) {
    return NextResponse.json(
      { error: "Ese token no es válido. Verifica que lo copiaste completo desde MercadoPago." },
      { status: 400 }
    )
  }
  const mpUser = await mpRes.json()

  const { error: upsertError } = await admin.from("academy_payment_credentials").upsert({
    academy_id: profile.academy_id,
    mp_access_token: access_token,
    mp_account_email: mpUser.email ?? null,
    mp_account_id: mpUser.id ? String(mpUser.id) : null,
    updated_at: new Date().toISOString(),
  })
  if (upsertError) {
    return NextResponse.json({ error: "No se pudo guardar la conexión." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, accountEmail: mpUser.email ?? null })
}
