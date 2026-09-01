import { NextRequest, NextResponse } from "next/server"
import { requireCoach, assertSameAcademy } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await requireCoach(req.headers.get("authorization"))
  if (!auth.ok) return auth.response
  const { admin, userId } = auth.caller

  const { user_id } = await req.json()
  if (!user_id) {
    return NextResponse.json({ error: "user_id es requerido." }, { status: 400 })
  }

  // Same unchecked pointer as update-account: any coach could delete any
  // account in the system by passing its id.
  const wrongAcademy = await assertSameAcademy(auth.caller, user_id)
  if (wrongAcademy) return wrongAcademy

  // Deleting yourself here would leave the academy with no coach and no way
  // back in — this screen manages player and assistant access, not your own.
  if (user_id === userId) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta desde aquí." }, { status: 400 })
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user_id)
  if (deleteError) {
    console.error("[delete-account] error:", deleteError.message)
    return NextResponse.json({ error: "No se pudo eliminar el acceso." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
