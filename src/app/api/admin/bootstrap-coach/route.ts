import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const admin = getSupabaseAdmin()
  const { count, error } = await admin.from("profiles").select("*", { count: "exact", head: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ needsSetup: (count ?? 0) === 0 })
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin()
  const { count, error: countError } = await admin.from("profiles").select("*", { count: "exact", head: true })
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "Ya existe una cuenta de entrenador." }, { status: 409 })
  }

  const { email, password, full_name } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    return NextResponse.json({ error: userError?.message ?? "No se pudo crear el usuario." }, { status: 500 })
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id, role: "coach", full_name: full_name || "Entrenador Principal",
  })
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
