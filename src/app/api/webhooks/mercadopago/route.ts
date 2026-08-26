import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { getPayment, getPreapproval, periodEndFromPlan } from "@/lib/mercadopago"
import { sendEmail, newAcademyCredentialsEmail } from "@/lib/email"

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function generatePassword(): string {
  // 12 chars from an unambiguous alphabet (no 0/O/1/l/I) — this gets emailed
  // and typed once, so it needs to read cleanly, not just be entropic.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from(crypto.randomBytes(12))
    .map(b => alphabet[b % alphabet.length])
    .join("")
}

/**
 * `reference` is the part of external_reference before "::plan". It's either
 * a real academy_id (the signed-in checkout flow) or an activation code (the
 * public, no-account-yet checkout flow) — see public-checkout/route.ts.
 *
 * Returns the academy_id to apply the subscription update to, creating the
 * account first if this is the first payment on a code. Returns null only
 * when the reference cannot be resolved at all, which the caller treats as
 * "ignore this event".
 */
async function resolveOrCreateAcademy(sb: SupabaseClient, reference: string, payerEmail: string | undefined): Promise<string | null> {
  if (UUID_RE.test(reference)) {
    const { data: existing } = await sb.from("team_settings").select("id").eq("id", reference).maybeSingle()
    if (existing) return existing.id
  }

  const { data: codeRow } = await sb
    .from("activation_codes")
    .select("*")
    .eq("code", reference)
    .eq("code_type", "payment")
    .maybeSingle()
  if (!codeRow) return null

  // Webhook redelivery after the account was already created — same academy,
  // not an error.
  if (codeRow.used_at) return codeRow.used_by_academy_id ?? null

  const email = codeRow.email ?? payerEmail
  if (!email) {
    console.error(`[MP webhook] payment code ${reference} has no email on file`)
    return null
  }

  const password = generatePassword()
  const { data: userData, error: userError } = await sb.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    console.error(`[MP webhook] createUser failed for ${reference}:`, userError?.message)
    return null
  }

  const { data: academyId, error: rpcErr } = await sb.rpc("create_academy_with_code", {
    p_name: codeRow.academy_name || "Mi Academia",
    p_coach_name: "Entrenador Principal",
    p_language: "es",
    p_code: reference,
    p_user_id: userData.user.id,
  })
  if (rpcErr || !academyId) {
    console.error(`[MP webhook] create_academy_with_code failed for ${reference}:`, rpcErr?.message)
    await sb.auth.admin.deleteUser(userData.user.id)
    return null
  }

  try {
    await sendEmail(
      email,
      "🎉 ¡Tu academia ya está lista! — Metrikas",
      newAcademyCredentialsEmail(codeRow.academy_name || "tu academia", email, password)
    )
  } catch (err) {
    // The account is real and paid for even if the email failed to send —
    // do not roll anything back. Logged loudly since this is the one case
    // where a paying customer could be stuck with no way in.
    console.error(`[MP webhook] credentials email failed for ${email} (academy ${academyId}):`, err)
  }

  return academyId
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
      const [reference, plan] = (preapproval.external_reference ?? "").split("::")
      if (!reference) return NextResponse.json({ ok: true })

      const mpStatus: string = preapproval.status // "authorized" | "paused" | "cancelled" | "pending"

      if (mpStatus === "authorized") {
        const academyId = await resolveOrCreateAcademy(sb, reference, preapproval.payer_email)
        if (!academyId) {
          // Do NOT swallow this one as ok:true — a real charge just went
          // through with nothing to attach it to. Let MercadoPago retry.
          return NextResponse.json({ error: "No se pudo resolver o crear la academia." }, { status: 500 })
        }
        const periodEnd = periodEndFromPlan(plan ?? "monthly")
        await sb.from("team_settings").update({
          subscription_status: "active",
          subscription_current_period_end: periodEnd.toISOString(),
          mp_plan: plan ?? "monthly",
          mp_preapproval_id: String(preapprovalId),
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      } else if (mpStatus === "paused" && UUID_RE.test(reference)) {
        await sb.from("team_settings").update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("id", reference)
      } else if (mpStatus === "cancelled" && UUID_RE.test(reference)) {
        await sb.from("team_settings").update({
          subscription_status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("id", reference)
      }

      return NextResponse.json({ ok: true })
    }

    // Each individual recurring payment charge
    if (body.type === "payment") {
      const paymentId = body.data?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const payment = await getPayment(paymentId)
      const [reference, plan] = (payment.external_reference ?? "").split("::")
      if (!reference) return NextResponse.json({ ok: true })

      if (payment.status === "approved") {
        const academyId = await resolveOrCreateAcademy(sb, reference, payment.payer?.email)
        if (!academyId) {
          return NextResponse.json({ error: "No se pudo resolver o crear la academia." }, { status: 500 })
        }
        const periodEnd = periodEndFromPlan(plan ?? "monthly")
        await sb.from("team_settings").update({
          subscription_status: "active",
          subscription_current_period_end: periodEnd.toISOString(),
          mp_payment_id: String(paymentId),
          mp_plan: plan ?? "monthly",
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        }).eq("id", academyId)
      } else if ((payment.status === "rejected" || payment.status === "cancelled") && UUID_RE.test(reference)) {
        // A rejected/cancelled first attempt on a brand-new signup has no
        // academy yet — nothing to mark past_due, and definitely not a
        // reason to create an account, so this only applies to a renewal on
        // an existing academy.
        await sb.from("team_settings").update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("id", reference)
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
