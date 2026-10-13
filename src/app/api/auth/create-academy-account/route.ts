import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { normalizeEmail, isValidEmail, cleanAcademyName } from "@/lib/signup-guards"

export const dynamic = "force-dynamic"

// Redeeming a code is an unauthenticated call that accepts guesses. Codes are
// now long and random, but there was no limit at all on how fast someone could
// try them. In memory, per IP: a speed bump, not the only defence.
const ATTEMPTS_PER_IP = 12
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000
const attempts = new Map<string, number[]>()

function tooManyAttempts(ip: string, now: number): boolean {
  const recent = (attempts.get(ip) ?? []).filter(t => now - t < ATTEMPT_WINDOW_MS)
  if (recent.length >= ATTEMPTS_PER_IP) { attempts.set(ip, recent); return true }
  recent.push(now)
  attempts.set(ip, recent)
  if (attempts.size > 5000) {
    attempts.forEach((times, key) => { if (times.every(t => now - t >= ATTEMPT_WINDOW_MS)) attempts.delete(key) })
  }
  return false
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}))
    const { password, language, activationCode } = raw
    const email = normalizeEmail(raw.email)
    const academyName = cleanAcademyName(raw.academyName)
    const coachName = cleanAcademyName(raw.coachName)

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida"
    if (tooManyAttempts(ip, Date.now())) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta de nuevo en una hora." },
        { status: 429 }
      )
    }

    if (!email || !password || !activationCode || typeof activationCode !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email, password, y código requeridos" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Ese correo no parece válido." }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verify activation code exists and is valid
    const { data: codeData, error: codeError } = await admin
      .from("activation_codes")
      .select("*")
      .eq("code", activationCode.trim())
      .single()

    if (codeError || !codeData) {
      return NextResponse.json(
        { error: "Código de activación inválido o expirado" },
        { status: 400 }
      )
    }

    // Payment codes stand in for an academy that has not been created yet and
    // are redeemed only by the payment webhook, using the service role. A
    // person is never meant to type one — accepting it here would let anyone
    // who guessed a pending checkout's code get an academy without paying.
    if (codeData.code_type === "payment") {
      return NextResponse.json(
        { error: "Código de activación inválido o expirado" },
        { status: 400 }
      )
    }

    // Check if code is already used
    if (codeData.used_at) {
      return NextResponse.json(
        { error: "Este código ya fue utilizado" },
        { status: 400 }
      )
    }

    // Check if code has expired (codes generated from the admin panel have no expiry)
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Código de activación expirado" },
        { status: 400 }
      )
    }

    // Create user in Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData?.user) {
      console.error("Auth creation error:", authError)
      return NextResponse.json(
        { error: authError?.message || "Error al crear usuario" },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // Create academy using RPC, passing the new user's id explicitly since this
    // runs with the service role and has no auth.uid() session context.
    // The RPC itself marks the code as used.
    const { data: academyId, error: rpcErr } = await admin.rpc("create_academy_with_code", {
      p_name: academyName || "Mi Academia",
      p_coach_name: coachName || "Entrenador",
      p_language: language || "es",
      p_code: activationCode.trim(),
      p_user_id: userId,
    })

    if (rpcErr || !academyId) {
      console.error("RPC error:", rpcErr)
      // Roll back the created user so the email can be retried cleanly
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: rpcErr?.message || "Error al crear academia" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Academia creada exitosamente",
      userId,
      academyId,
    })
  } catch (err) {
    console.error("Academy creation error:", err)
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500 }
    )
  }
}
