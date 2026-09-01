import { NextRequest, NextResponse } from "next/server"
import { requireCoach, assertSameAcademy } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await requireCoach(req.headers.get("authorization"))
  if (!auth.ok) return auth.response
  const { admin } = auth.caller

  const { user_id, email, password } = await req.json()
  if (!user_id || (!email && !password)) {
    return NextResponse.json({ error: "user_id y al menos email o contraseña son requeridos." }, { status: 400 })
  }

  // user_id arrives from the client. Unchecked, it pointed at any account in
  // the database — a coach could set the password of another academy's coach
  // and sign in as them.
  const wrongAcademy = await assertSameAcademy(auth.caller, user_id)
  if (wrongAcademy) return wrongAcademy

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
