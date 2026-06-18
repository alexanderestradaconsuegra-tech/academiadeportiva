import { NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
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

  const { data: callerProfile, error: callerProfileError } = await admin
    .from("profiles").select("role").eq("id", callerData.user.id).single()
  if (callerProfileError || callerProfile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el entrenador puede enviar notificaciones." }, { status: 403 })
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json({ error: "Notificaciones push no configuradas en el servidor." }, { status: 500 })
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const { title, body, url, category } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: "Título y mensaje son requeridos." }, { status: 400 })
  }

  let profileIds: string[]
  if (category && category !== "all") {
    const { data: playersInCategory } = await admin.from("players").select("id").eq("category", category)
    const playerIds = (playersInCategory ?? []).map(p => p.id)
    if (playerIds.length === 0) return NextResponse.json({ sent: 0, failed: 0 })
    const { data: profiles } = await admin.from("profiles").select("id").in("player_id", playerIds)
    profileIds = (profiles ?? []).map(p => p.id)
  } else {
    const { data: profiles } = await admin.from("profiles").select("id").eq("role", "player")
    profileIds = (profiles ?? []).map(p => p.id)
  }

  if (profileIds.length === 0) return NextResponse.json({ sent: 0, failed: 0 })

  const { data: subscriptions } = await admin.from("push_subscriptions").select("*").in("profile_id", profileIds)
  if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ sent: 0, failed: 0 })

  const payload = JSON.stringify({ title, body, url: url || "/" })
  let sent = 0
  let failed = 0

  await Promise.all(subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      sent++
    } catch (err) {
      failed++
      const statusCode = (err as { statusCode?: number }).statusCode
      if (statusCode === 404 || statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id)
      }
    }
  }))

  return NextResponse.json({ sent, failed })
}
