import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPayment, getPreapproval, periodEndFromPlan } from "@/lib/mercadopago"

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sb = admin()

    // Subscription status changes (authorized, paused, cancelled)
    if (body.type === "subscription_preapproval" || body.topic === "preapproval") {
      const preapprovalId = body.data?.id
      if (!preapprovalId) return NextResponse.json({ ok: true })

      const preapproval = await getPreapproval(String(preapprovalId))
      const [academyId, plan] = (preapproval.external_reference ?? "").split("::")
      if (!academyId) return NextResponse.json({ ok: true })

      const mpStatus: string = preapproval.status // "authorized" | "paused" | "cancelled" | "pending"

      if (mpStatus === "authorized") {
        const periodEnd = periodEndFromPlan(plan ?? "monthly")
        await sb.from("team_settings").update({
          subscription_status: "active",
          subscription_current_period_end: periodEnd.toISOString(),
          mp_plan: plan ?? "monthly",
          mp_preapproval_id: String(preapprovalId),
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      } else if (mpStatus === "paused") {
        await sb.from("team_settings").update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      } else if (mpStatus === "cancelled") {
        await sb.from("team_settings").update({
          subscription_status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      }

      return NextResponse.json({ ok: true })
    }

    // Each individual recurring payment charge
    if (body.type === "payment") {
      const paymentId = body.data?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const payment = await getPayment(paymentId)
      const [academyId, plan] = (payment.external_reference ?? "").split("::")
      if (!academyId) return NextResponse.json({ ok: true })

      if (payment.status === "approved") {
        const periodEnd = periodEndFromPlan(plan ?? "monthly")
        await sb.from("team_settings").update({
          subscription_status: "active",
          subscription_current_period_end: periodEnd.toISOString(),
          mp_payment_id: String(paymentId),
          mp_plan: plan ?? "monthly",
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        await sb.from("team_settings").update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("MP webhook error:", e)
    // Always 200 so MP doesn't retry indefinitely
    return NextResponse.json({ ok: true })
  }
}

// MP sends GET to verify the endpoint exists
export async function GET() {
  return NextResponse.json({ ok: true })
}
