import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email"

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

export async function POST(req: NextRequest) {
  try {
    const { email, academy_name } = await req.json()

    if (!email || !academy_name) {
      return NextResponse.json(
        { error: "Email y nombre de academia requeridos" },
        { status: 400, headers: corsHeaders }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Generar código único
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const code = `DEMO-${randomPart}`

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
        { error: `Error al generar código: ${insertError.message}` },
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
            Tu código de demostración para <strong>${academy_name}</strong> está listo. Tienes <strong>14 días gratis</strong> para probar todo lo que Metrikas tiene para ofrecerte.
          </p>

          <div style="background: #05122F; color: #a3e635; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px solid #a3e635;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #a3e635;">TU CÓDIGO DE DEMO</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #a3e635;">${code}</p>
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

    return NextResponse.json({
      ok: true,
      message: "Código enviado a tu email",
      code,
    }, { headers: corsHeaders })
  } catch (err) {
    console.error("Demo request error:", err)
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500, headers: corsHeaders }
    )
  }
}
