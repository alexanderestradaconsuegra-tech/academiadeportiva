import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getStripe } from "@/lib/stripe"
import type { SubscriptionStatus } from "@/lib/types"

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing": return "trialing"
    case "active": return "active"
    case "past_due":
    case "incomplete": return "past_due"
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
    case "paused":
    default: return "suspended"
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const academyId = sub.metadata?.academy_id
  if (!academyId) return
  const periodEnd = sub.items.data[0]?.current_period_end
  const admin = getSupabaseAdmin()
  await admin.from("team_settings").update({
    subscription_status: mapStripeStatus(sub.status),
    subscription_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  }).eq("id", academyId)
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 501 })
  }

  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "Falta firma." }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err)
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(sub)
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err)
    return NextResponse.json({ error: "Error procesando el evento." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
