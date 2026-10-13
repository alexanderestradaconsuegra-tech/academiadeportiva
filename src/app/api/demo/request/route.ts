import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, escapeHtml } from "@/lib/email"
import { generateActivationCode, normalizeEmail, isValidEmail, cleanAcademyName } from "@/lib/signup-guards"

export const dynamic = "force-dynamic"

// The marketing landing lives on its own domain (metrikas.pro) separate from
// this app (app.metrikas.pro), so its "Solicitar Demo" form calls this route
// cross-origin — it needs its own explicit CORS allowance, scoped to just the
// landing's origin, not a wildcard.
const ALLOWED_ORIGIN = "https://metrikas.pro"
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// CORS only constrains browsers, so it is no defence against a script hitting
// this endpoint in a loop. Three layers, because each has a hole on its own:
//  - per IP, in memory: a speed bump that resets on deploy, and the IP comes
//    from a header the caller can influence, so it must never be the only gate;
//  - per email, against the table: survives restarts, but a script just varies
//    the email;
//  - a global ceiling per hour, against the table: whatever the caller varies,
//    the total number of demo emails this endpoint can send is bounded.
const RATE_PER_IP = 3
const RATE_WINDOW_MS = 60 * 60 * 1000
const GLOBAL_DEMOS_PER_HOUR = 40
const ipHits = new Map<string, number[]>()

function ipRateLimited(ip: string, now: number): boolean {
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_PER_IP) {
    ipHits.set(ip, hits)
    return true
  }
  hits.push(now)
  ipHits.set(ip, hits)
  // Keep the map from growing without bound on a long-lived process
  if (ipHits.size > 5000) {
    ipHits.forEach((times, key) => {
      if (times.every((t: number) => now - t >= RATE_WINDOW_MS)) ipHits.delete(key)
    })
  }
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = normalizeEmail(body?.email)
    const academy_name = cleanAcademyName(body?.academy_name)

    if (!email || !academy_name) {
      return NextResponse.json(
        { error: "Email y nombre de academia requeridos" },
        { status: 400, headers: corsHeaders }
      )
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ese correo no parece válido." },
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

    const hourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count: lastHour, error: lastHourError } = await admin
      .from("activation_codes")
      .select("id", { count: "exact", head: true })
      .eq("code_type", "demo")
      .gte("requested_at", hourAgo)
    // A failed count must not read as "nobody asked": that would switch the
    // ceiling off exactly when something is wrong.
    if (lastHourError || (lastHour ?? 0) >= GLOBAL_DEMOS_PER_HOUR) {
      return NextResponse.json(
        { error: "Estamos recibiendo muchas solicitudes. Intenta de nuevo en un rato o escríbenos por WhatsApp." },
        { status: 429, headers: corsHeaders }
      )
    }

    // One demo per email per day, checked against what is already stored
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentForEmail, error: recentError } = await admin
      .from("activation_codes")
      .select("id", { count: "exact", head: true })
      .eq("code_type", "demo")
      .eq("email", email)
      .gte("requested_at", since)

    if (recentError || (recentForEmail ?? 0) > 0) {
      return NextResponse.json(
        { error: "Ya enviamos un código a este correo. Revisa tu bandeja o escríbenos por WhatsApp." },
        { status: 429, headers: corsHeaders }
      )
    }

    const code = generateActivationCode("DEMO")

    // Calcular fecha de vencimiento (14 días)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    // Guardar en BD
    const { error: insertError } = await admin
      .from("activation_codes")
      .insert({
        code,
        code_type: "demo",
        email,
        academy_name,
        requested_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        used: false,
      })

    if (insertError) {
      console.error("Error inserting code:", insertError)
      return NextResponse.json(
        { error: "No pudimos generar tu código. Intenta de nuevo en un momento." },
        { status: 500, headers: corsHeaders }
      )
    }

    // Enviar email
    const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://app.metrikas.pro").replace(/\/$/, "")
    const demoEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%); padding: 2px; border-radius: 12px;">
        <div style="background: white; padding: 40px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #05122F; margin: 0; font-size: 28px;">🎁 ¡Acceso Demo Listo!</h1>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hola,<br><br>
            Tu código de demostración para <strong>${escapeHtml(academy_name)}</strong> está listo. Tienes <strong>14 días gratis</strong> para probar todo lo que Metrikas tiene para ofrecerte.
          </p>

          <div style="background: #05122F; color: #a3e635; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px solid #a3e635;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #a3e635;">TU CÓDIGO DE DEMO</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #a3e635;">${escapeHtml(code)}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #a3e635;">Válido hasta: ${expiresAt.toLocaleDateString("es-CL")}</p>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #a3e635; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
              <strong>⏱️ Importante:</strong> Después de 14 días necesitarás una suscripción para continuar usando Metrikas.
            </p>
          </div>

          <h3 style="color: #05122F; margin-top: 30px;">Tu demo incluye:</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            <li>✅ Jugadores y categorías ilimitadas</li>
            <li>✅ Evaluaciones con gráficas de progreso</li>
            <li>✅ Convocatorias y confirmaciones</li>
            <li>✅ Análisis táctico</li>
            <li>✅ Pagos automáticos</li>
            <li>✅ Comunicación con jugadores</li>
            <li>✅ TODO INCLUIDO — sin restricciones</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="display: inline-block; background: #a3e635; color: #05122F; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              👉 Ingresar a Metrikas
            </a>
          </p>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Pegunta: ¿Necesitas ayuda? Escríbenos por WhatsApp: <a href="https://wa.me/56992103974" style="color: #a3e635; text-decoration: none;">+56 9 9210 3974</a>
          </p>
        </div>
      </div>
    `

    await sendEmail(
      email,
      "🎁 Tu código de demo está listo — 14 días gratis en Metrikas",
      demoEmailHtml
    )

    // The code is deliberately NOT in the response. It used to be, which made
    // the email pointless as proof of ownership: anyone could request a demo
    // for somebody else's address, read the code from the reply, and create
    // an account under that address without ever seeing the mailbox. Now the
    // only place the code exists is the inbox it was sent to.
    return NextResponse.json({
      ok: true,
      message: "Código enviado a tu email",
    }, { headers: corsHeaders })
  } catch (err) {
    console.error("Demo request error:", err)
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500, headers: corsHeaders }
    )
  }
}
