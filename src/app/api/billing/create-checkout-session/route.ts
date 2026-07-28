import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getStripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const priceId = process.env.STRIPE_PRICE_ID
  if (!stripe || !priceId) {
    return NextResponse.json({ error: "La facturación con tarjeta aún no está configurada. Contacta al soporte." }, { status: 501 })
  }

  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })

  const { data: profile } = await admin.from("profiles").select("role, academy_id").eq("id", userData.user.id).single()
  if (!profile || profile.role !== "coach" || !profile.academy_id) {
    return NextResponse.json({ error: "Solo el entrenador puede gestionar la suscripción." }, { status: 403 })
  }

  const { data: academy } = await admin
    .from("team_settings")
    .select("id, name, stripe_customer_id")
    .eq("id", profile.academy_id)
    .single()
  if (!academy) return NextResponse.json({ error: "Academia no encontrada." }, { status: 404 })

  let customerId = academy.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.user.email ?? undefined,
      name: academy.name,
      metadata: { academy_id: academy.id },
    })
    customerId = customer.id
    await admin.from("team_settings").update({ stripe_customer_id: customerId }).eq("id", academy.id)
  }

  const origin = req.nextUrl.origin
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?billing=success`,
    cancel_url: `${origin}/settings?billing=canceled`,
    metadata: { academy_id: academy.id },
    subscription_data: { metadata: { academy_id: academy.id } },
  })

  return NextResponse.json({ url: session.url })
}
