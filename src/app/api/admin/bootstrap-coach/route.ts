import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  return NextResponse.json({ needsSetup: true })
}

// This endpoint is ONLY used for admin tooling, not public registration.
// Self-service registration uses supabase.auth.signUp() on the client + createAcademy() in AppContext.
export async function POST(req: NextRequest) {
  const inviteToken = req.headers.get("x-invite-token")
  const expectedToken = process.env.ADMIN_INVITE_TOKEN
  if (!expectedToken || inviteToken !== expectedToken) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const { email, password, full_name, academy_name, language } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    console.error("[bootstrap-coach] createUser error:", userError?.message)
    return NextResponse.json({ error: "No se pudo crear el usuario." }, { status: 500 })
  }

  const { data: academy, error: academyError } = await admin
    .from("team_settings")
    .insert({ name: academy_name || "Mi Academia", language: language || "es", updated_at: new Date().toISOString() })
    .select()
    .single()
  if (academyError || !academy) {
    await admin.auth.admin.deleteUser(userData.user.id)
    console.error("[bootstrap-coach] createAcademy error:", academyError?.message)
    return NextResponse.json({ error: "No se pudo crear la academia." }, { status: 500 })
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    role: "coach",
    full_name: full_name || "Entrenador Principal",
    academy_id: academy.id,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    console.error("[bootstrap-coach] createProfile error:", profileError.message)
    return NextResponse.json({ error: "No se pudo configurar el perfil." }, { status: 500 })
  }

  // This route builds the academy by hand instead of going through
  // create_academy_with_code, so it has to ask for the starter exercise
  // library itself — otherwise the academy opens with an empty plan.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: seedError } = await (admin as any).rpc("seed_academy_exercises", { p_academy_id: academy.id })
  if (seedError) {
    // The academy is real and usable without it; the coach can add drills
    // by hand. Not worth undoing a successful signup over.
    console.error("[bootstrap-coach] seed exercises error:", seedError.message)
  }

  return NextResponse.json({ success: true })
}
