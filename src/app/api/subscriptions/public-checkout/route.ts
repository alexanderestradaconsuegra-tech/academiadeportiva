import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createPreapproval } from "@/lib/mercadopago"

export const dynamic = "force-dynamic"

// The marketing landing lives on its own domain (metrikas.pro), so its "pay
// now" button calls this route cross-origin — same pattern as /api/demo/request.
const ALLOWED_ORIGIN = "https://metrikas.pro"
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// This is a public, unauthenticated endpoint by design — there is no account
// yet, that's the whole point. It only ever creates a MercadoPago checkout
// link plus an unused activation code; the account itself is created by the
// webhook once MercadoPago confirms the payment actually went through, never
// here. In memory only (resets on deploy), just a speed bump against a script
// hammering this route — the real gate is that nothing happens without money
// actually moving.
const RATE_PER_IP = 5
const RATE_WINDOW_MS = 60 * 60 * 1000
const ipHits = new Map<string, number[]>()

function ipRateLimited(ip: string, now: number): boolean {
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_PER_IP) {
    ipHits.set(ip, hits)
    return true
  }
  hits.push(now)
  ipHits.set(ip, hits)
  if (ipHits.size > 5000) {
    ipHits.forEach((times, key) => {
      if (times.every((t: number) => now - t >= RATE_WINDOW_MS)) ipHits.delete(key)
    })
  }
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { email, academyName, plan } = await req.json()

    if (!email || !academyName || !["monthly", "annual"].includes(plan)) {
      return NextResponse.json(
        { error: "Correo, nombre de academia y plan son requeridos" },
        { status: 400, headers: corsHeaders }
      )
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida"
    if (ipRateLimited(ip, Date.now())) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en una hora." },
        { status: 429, headers: corsHeaders }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // A fresh, unused "payment" code stands in for the not-yet-created
    // academy. The webhook looks it up by this same code once MercadoPago
    // confirms the charge, and that's the only place an account gets made.
    const code = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { error: insertError } = await admin.from("activation_codes").insert({
      code,
      code_type: "payment",
      email,
      academy_name: academyName,
      requested_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    if (insertError) {
      console.error("[public-checkout] insert activation_code error:", insertError.message)
      return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500, headers: corsHeaders })
    }

    const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://app.metrikas.pro").replace(/\/$/, "")
    const preapproval = await createPreapproval(
      plan,
      code,
      email,
      `${appUrl}/signup/success?plan=${plan}`
    )

    return NextResponse.json({ checkout_url: preapproval.init_point }, { headers: corsHeaders })
  } catch (e: any) {
    console.error("[public-checkout] error:", e)
    return NextResponse.json({ error: e.message ?? "Error al iniciar el pago" }, { status: 500, headers: corsHeaders })
  }
}
