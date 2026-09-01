import { NextRequest, NextResponse } from "next/server"
import { requireCoach } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await requireCoach(req.headers.get("authorization"))
  if (!auth.ok) return auth.response
  const { admin, academyId } = auth.caller

  const { email, password, player_id, full_name, role, category } = await req.json()
  const targetRole = role === "assistant" ? "assistant" : "player"

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 })
  }
  if (targetRole === "player" && !player_id) {
    return NextResponse.json({ error: "El jugador es requerido." }, { status: 400 })
  }

  // player_id comes from the client. Linking an account to another academy's
  // player would hand this login that player's data: every player-side RLS
  // policy keys off get_my_player_id(), so the profile row is the grant.
  if (targetRole === "player") {
    const { data: player } = await admin
      .from("players").select("id").eq("id", player_id).eq("academy_id", academyId).maybeSingle()
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado en tu academia." }, { status: 404 })
    }
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (userError || !userData.user) {
    console.error("[create-account] createUser error:", userError?.message)
    return NextResponse.json({ error: "No se pudo crear el acceso." }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileInsert: any = {
    id: userData.user.id,
    role: targetRole,
    player_id: targetRole === "player" ? player_id : null,
    full_name: full_name || null,
    academy_id: academyId,
  }
  if (targetRole === "assistant" && category) {
    profileInsert.category = category
  }

  const { error: profileError } = await admin.from("profiles").insert(profileInsert)
  if (profileError) {
    console.error("[create-account] createProfile error:", profileError.message)
    return NextResponse.json({ error: "No se pudo configurar el perfil." }, { status: 500 })
  }

  return NextResponse.json({ success: true, user: { id: userData.user.id } })
}
