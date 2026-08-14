import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPaymentWithToken } from "@/lib/mercadopago"

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// MercadoPago notification for a one-off player payment (mensualidad, matrícula, etc.),
// created with the academy's OWN token via createPlayerPaymentPreference. Unlike the
// subscription webhook, this one has to figure out which academy's token to use before
// it can even ask MercadoPago what happened — that's why payment_id/academy_id travel as
// query params on notification_url (MercadoPago echoes them back verbatim), not in the body.
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const paymentRowId = url.searchParams.get("payment_id")
    const academyId = url.searchParams.get("academy_id")
    if (!paymentRowId || !academyId) return NextResponse.json({ ok: true })

    const body = await req.json().catch(() => ({}))
    if (body.type !== "payment" && body.topic !== "payment") return NextResponse.json({ ok: true })
    const mpPaymentId = body.data?.id
    if (!mpPaymentId) return NextResponse.json({ ok: true })

    const sb = admin()

    const { data: creds } = await sb
      .from("academy_payment_credentials").select("mp_access_token").eq("academy_id", academyId).maybeSingle()
    if (!creds?.mp_access_token) return NextResponse.json({ ok: true })

    const mpPayment = await getPaymentWithToken(mpPaymentId, creds.mp_access_token)

    // Only trust it if MercadoPago's own record points back at the exact payment row we expect.
    if (mpPayment.external_reference !== paymentRowId) return NextResponse.json({ ok: true })

    if (mpPayment.status === "approved") {
      await sb.from("payments").update({
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
      }).eq("id", paymentRowId).neq("status", "paid")
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("MP player-payment webhook error:", e)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
