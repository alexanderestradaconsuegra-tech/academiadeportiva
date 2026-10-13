import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { isAllowedPushEndpoint } from "@/lib/push-endpoint"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })
  }

  const { endpoint, p256dh, auth } = await req.json()
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Datos de suscripción incompletos." }, { status: 400 })
  }
  // The server later POSTs to this URL. Only a browser vendor's push service is
  // a legitimate destination — see lib/push-endpoint.
  if (!isAllowedPushEndpoint(endpoint)) {
    return NextResponse.json({ error: "Endpoint de notificaciones no válido." }, { status: 400 })
  }

  const { error } = await admin.from("push_subscriptions").upsert({
    profile_id: userData.user.id,
    endpoint,
    p256dh,
    auth,
  }, { onConflict: "endpoint" })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
