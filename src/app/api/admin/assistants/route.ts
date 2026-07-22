import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
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
  if (callerProfileError || callerProfile?.role !== "coach" || !callerProfile.academy_id) {
    return NextResponse.json({ error: "Solo el entrenador principal puede ver los profesores." }, { status: 403 })
  }

  const { data: assistants, error } = await admin
    .from("profiles")
    .select("id, full_name, category, created_at")
    .eq("academy_id", callerProfile.academy_id)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ assistants: assistants ?? [] })
}
