import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { createPlayerPaymentPreference } from "@/lib/mercadopago"

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
    .from("profiles").select("player_id, academy_id").eq("id", callerData.user.id).single()
  if (!profile?.player_id || !profile.academy_id) {
    return NextResponse.json({ error: "Solo un jugador puede pagar su propia mensualidad." }, { status: 403 })
  }
  const academyId = profile.academy_id

  const { payment_id } = await req.json()
  if (!payment_id) return NextResponse.json({ error: "payment_id requerido." }, { status: 400 })

  const { data: payment } = await admin
    .from("payments").select("id, player_id, concept, amount, status").eq("id", payment_id).single()
  if (!payment || payment.player_id !== profile.player_id) {
    return NextResponse.json({ error: "Pago no encontrado." }, { status: 404 })
  }
  if (payment.status === "paid") {
    return NextResponse.json({ error: "Este pago ya fue confirmado." }, { status: 400 })
  }

  const { data: creds } = await admin
    .from("academy_payment_credentials").select("mp_access_token").eq("academy_id", academyId).maybeSingle()
  if (!creds?.mp_access_token) {
    return NextResponse.json({ error: "Tu academia todavía no conectó MercadoPago." }, { status: 400 })
  }

  try {
    const preference = await createPlayerPaymentPreference(
      creds.mp_access_token,
      { id: payment.id, concept: payment.concept, amount: payment.amount },
      academyId,
    )
    return NextResponse.json({ checkout_url: preference.init_point })
  } catch (e: any) {
    console.error("payments/checkout error:", e)
    return NextResponse.json({ error: "No se pudo iniciar el pago. Verifica la conexión de MercadoPago de tu academia." }, { status: 500 })
  }
}
