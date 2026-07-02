import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  // In multi-academy SaaS, any user can register — always allow
  return NextResponse.json({ needsSetup: true })
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin()
  const { email, password, full_name, academy_name, language } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }

  // Create auth user
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    return NextResponse.json({ error: userError?.message ?? "No se pudo crear el usuario." }, { status: 500 })
  }

  // Create academy (team_settings)
  const { data: academy, error: academyError } = await admin
    .from("team_settings")
    .insert({
      name: academy_name || "Mi Academia",
      language: language || "es",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (academyError || !academy) {
    // Clean up orphan auth user
    await admin.auth.admin.deleteUser(userData.user.id)
    return NextResponse.json({ error: academyError?.message ?? "No se pudo crear la academia." }, { status: 500 })
  }

  // Create profile linked to academy
  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    role: "coach",
    full_name: full_name || "Entrenador Principal",
    academy_id: academy.id,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
