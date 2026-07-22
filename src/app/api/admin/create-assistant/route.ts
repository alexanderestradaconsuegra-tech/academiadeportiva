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
    return NextResponse.json({ error: "Solo el entrenador principal puede crear profesores." }, { status: 403 })
  }

  const { email, password, full_name, category } = await req.json()
  if (!email || !password || !category) {
    return NextResponse.json({ error: "Correo, contraseña y categoría son requeridos." }, { status: 400 })
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    console.error("[create-assistant] createUser error:", userError?.message)
    return NextResponse.json({ error: "No se pudo crear el acceso." }, { status: 500 })
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    role: "assistant",
    category,
    full_name: full_name || null,
    academy_id: callerProfile.academy_id,
  })
  if (profileError) {
    console.error("[create-assistant] createProfile error:", profileError.message)
    await admin.auth.admin.deleteUser(userData.user.id)
    return NextResponse.json({ error: "No se pudo configurar el perfil." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
