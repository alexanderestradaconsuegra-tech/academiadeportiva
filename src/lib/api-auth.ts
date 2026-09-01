import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "./supabase-admin"

type Admin = ReturnType<typeof getSupabaseAdmin>

export interface CoachCaller {
  admin: Admin
  userId: string
  academyId: string
}

/**
 * Authenticates a coach and hands back their academy.
 *
 * Routes here run on the service-role client, which bypasses RLS entirely —
 * so the academy boundary that the database enforces everywhere else has to
 * be enforced by hand. Getting `academyId` from this helper (rather than
 * checking only `role === "coach"`) is what keeps a route from acting on
 * another academy's data: three admin routes checked the role and then
 * trusted a user_id straight from the request body, which let any coach read
 * every account in the system and change any of their credentials.
 *
 * Returns either the caller's identity or the response to send back.
 */
export async function requireCoach(authHeader: string | null): Promise<
  { ok: true; caller: CoachCaller } | { ok: false; response: NextResponse }
> {
  const token = (authHeader ?? "").replace(/^Bearer\s+/i, "")
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "No autenticado." }, { status: 401 }) }
  }

  const admin = getSupabaseAdmin()
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !callerData.user) {
    return { ok: false, response: NextResponse.json({ error: "Sesión inválida." }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles").select("role, academy_id").eq("id", callerData.user.id).single()
  if (profileError || profile?.role !== "coach") {
    return { ok: false, response: NextResponse.json({ error: "Acceso denegado." }, { status: 403 }) }
  }
  if (!profile.academy_id) {
    return { ok: false, response: NextResponse.json({ error: "Tu cuenta no tiene una academia asociada." }, { status: 403 }) }
  }

  return { ok: true, caller: { admin, userId: callerData.user.id, academyId: profile.academy_id } }
}

/**
 * Confirms a target user belongs to the caller's academy before the caller
 * acts on them. Without this a user_id from the request body is just an
 * unchecked pointer at any account in the database.
 */
export async function assertSameAcademy(
  caller: CoachCaller,
  targetUserId: string,
): Promise<NextResponse | null> {
  const { data: target } = await caller.admin
    .from("profiles").select("academy_id").eq("id", targetUserId).maybeSingle()

  if (!target || target.academy_id !== caller.academyId) {
    // Deliberately the same message either way: a coach probing ids
    // shouldn't be able to tell "doesn't exist" from "another academy".
    return NextResponse.json({ error: "Cuenta no encontrada en tu academia." }, { status: 404 })
  }
  return null
}
