import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPayment, periodEndFromPlan } from "@/lib/mercadopago"

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

    // MP sends "payment" and "subscription_preapproval" types among others
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const payment = await getPayment(paymentId)

    const [academyId, plan] = (payment.external_reference ?? "").split("::")
    if (!academyId) return NextResponse.json({ ok: true })

    const sb = admin()

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
      // Mark as past_due so the 5-day grace period timer starts
      await sb.from("team_settings").update({
        subscription_status: "past_due",
        updated_at: new Date().toISOString(),
      }).eq("id", academyId)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("MP webhook error:", e)
    // Always return 200 so MP doesn't retry indefinitely
    return NextResponse.json({ ok: true })
  }
}

// MP sends GET to verify the endpoint exists
export async function GET() {
  return NextResponse.json({ ok: true })
}
