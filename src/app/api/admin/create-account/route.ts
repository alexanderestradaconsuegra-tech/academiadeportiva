import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !callerData.user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 })
  }

  const { data: callerProfile, error: callerProfileError } = await admin
    .from("profiles").select("role, academy_id").eq("id", callerData.user.id).single()
  if (callerProfileError || callerProfile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el entrenador puede crear accesos." }, { status: 403 })
  }

  const { email, password, player_id, full_name, role, category } = await req.json()
  const targetRole = role === "assistant" ? "assistant" : "player"

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }
  if (targetRole === "player" && !player_id) {
    return NextResponse.json({ error: "El jugador es requerido." }, { status: 400 })
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    console.error("[create-account] createUser error:", userError?.message)
    return NextResponse.json({ error: "No se pudo crear el acceso." }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileInsert: any = {
    id: userData.user.id,
    role: targetRole,
    player_id: targetRole === "player" ? player_id : null,
    full_name: full_name || null,
    academy_id: callerProfile.academy_id,
  }
  if (targetRole === "assistant" && category) {
    profileInsert.category = category
  }

  const { error: profileError } = await admin.from("profiles").insert(profileInsert)
  if (profileError) {
    console.error("[create-account] createProfile error:", profileError.message)
    return NextResponse.json({ error: "No se pudo configurar el perfil." }, { status: 500 })
  }

  return NextResponse.json({ success: true, user: { id: userData.user.id } })
}
