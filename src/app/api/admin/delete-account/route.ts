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
    return NextResponse.json({ error: "Solo el entrenador puede eliminar accesos." }, { status: 403 })
  }

  const { user_id } = await req.json()
  if (!user_id) {
    return NextResponse.json({ error: "user_id es requerido." }, { status: 400 })
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user_id)
  if (deleteError) {
    console.error("[delete-account] error:", deleteError.message)
    return NextResponse.json({ error: "No se pudo eliminar el acceso." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
