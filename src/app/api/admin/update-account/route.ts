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
    .from("profiles").select("role").eq("id", callerData.user.id).single()
  if (callerProfileError || callerProfile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el entrenador puede editar accesos." }, { status: 403 })
  }

  const { user_id, email, password } = await req.json()
  if (!user_id || (!email && !password)) {
    return NextResponse.json({ error: "user_id y al menos email o contraseña son requeridos." }, { status: 400 })
  }

  const updates: { email?: string; password?: string } = {}
  if (email) updates.email = email
  if (password) updates.password = password

  const { error: updateError } = await admin.auth.admin.updateUserById(user_id, updates)
  if (updateError) {
    console.error("[update-account] error:", updateError.message)
    return NextResponse.json({ error: "No se pudo actualizar el acceso." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
