import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getStripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "La facturación con tarjeta aún no está configurada." }, { status: 501 })
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

  const { data: academy } = await admin.from("team_settings").select("stripe_customer_id").eq("id", profile.academy_id).single()
  if (!academy?.stripe_customer_id) {
    return NextResponse.json({ error: "Esta academia aún no tiene una suscripción con Stripe." }, { status: 404 })
  }

  const origin = req.nextUrl.origin
  const session = await stripe.billingPortal.sessions.create({
    customer: academy.stripe_customer_id,
    return_url: `${origin}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
