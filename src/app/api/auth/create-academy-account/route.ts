import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email, password, academyName, coachName, language, activationCode } = await req.json()

    if (!email || !password || !activationCode) {
      return NextResponse.json(
        { error: "Email, password, y código requeridos" },
        { status: 400 }
      )
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

    // Check if code is already used
    if (codeData.used) {
      return NextResponse.json(
        { error: "Este código ya fue utilizado" },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (new Date(codeData.expires_at) < new Date()) {
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

    if (authError) {
      // If user already exists, continue anyway (they might be trying to add an academy to existing account)
      if (!authError.message?.includes("already exists")) {
        console.error("Auth creation error:", authError)
        return NextResponse.json(
          { error: authError?.message || "Error al crear usuario" },
          { status: 500 }
        )
      }
    }

    if (!authData?.user && !authError?.message?.includes("already exists")) {
      return NextResponse.json(
        { error: "Error al crear usuario" },
        { status: 500 }
      )
    }

    // Mark code as used
    await admin
      .from("activation_codes")
      .update({ used: true })
      .eq("code", activationCode.trim())

    // Create academy using RPC
    const { data: academyId, error: rpcErr } = await admin.rpc("crear_academia_con_código", {
      p_name: academyName || "Mi Academia",
      p_coach_name: coachName || "Entrenador",
      p_language: language || "es",
      p_code: activationCode.trim(),
    })

    if (rpcErr || !academyId) {
      console.error("RPC error:", rpcErr)
      return NextResponse.json(
        { error: rpcErr?.message || "Error al crear academia" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Academia creada exitosamente",
      userId: authData.user.id,
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
