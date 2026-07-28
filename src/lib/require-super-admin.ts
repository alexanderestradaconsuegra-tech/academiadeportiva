import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function requireSuperAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user?.email) {
    return { error: NextResponse.json({ error: "Sesión inválida." }, { status: 401 }) }
  }

  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (!allowed.includes(data.user.email.toLowerCase())) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) }
  }

  return { admin, user: data.user }
}
