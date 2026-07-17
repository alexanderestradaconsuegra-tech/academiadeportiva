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
    return NextResponse.json({ error: "Solo el entrenador puede editar accesos." }, { status: 403 })
  }

  const { player_id, profile_id, email, password } = await req.json()
  if ((!player_id && !profile_id) || (!email && !password)) {
    return NextResponse.json({ error: "Un jugador o profesor y al menos un cambio (correo o contraseña) son requeridos." }, { status: 400 })
  }

  const targetQuery = profile_id
    ? admin.from("profiles").select("id, academy_id").eq("id", profile_id).single()
    : admin.from("profiles").select("id, academy_id").eq("player_id", player_id).single()
  const { data: targetProfile, error: targetProfileError } = await targetQuery
  if (targetProfileError || !targetProfile) {
    return NextResponse.json({ error: "No se encontró el acceso." }, { status: 404 })
  }
  if (targetProfile.academy_id !== callerProfile.academy_id) {
    return NextResponse.json({ error: "No autorizado para editar este acceso." }, { status: 403 })
  }

  const update: { email?: string; password?: string; email_confirm?: boolean } = {}
  if (email) { update.email = email; update.email_confirm = true }
  if (password) update.password = password

  const { error: updateError } = await admin.auth.admin.updateUserById(targetProfile.id, update)
  if (updateError) {
    console.error("[update-account] updateUserById error:", updateError.message)
    return NextResponse.json({ error: "No se pudo actualizar el acceso." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
