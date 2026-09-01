import { NextRequest, NextResponse } from "next/server"
import { requireCoach } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await requireCoach(req.headers.get("authorization"))
  if (!auth.ok) return auth.response
  const { admin, academyId } = auth.caller

  // Only this academy's people. listUsers() returns every auth user in the
  // project, so the profile set is what narrows it — without this a coach
  // received the email address of every user of every other academy.
  const { data: profiles, error: profilesError } = await admin
    .from("profiles").select("id").eq("academy_id", academyId)
  if (profilesError) {
    console.error("[list-accounts] error:", profilesError.message)
    return NextResponse.json({ error: "No se pudieron cargar los accesos." }, { status: 500 })
  }
  const academyUserIds = new Set((profiles ?? []).map(p => p.id))
  if (academyUserIds.size === 0) return NextResponse.json([])

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = (data.users ?? [])
    .filter(u => academyUserIds.has(u.id))
    .map(u => ({ id: u.id, email: u.email ?? "" }))
  return NextResponse.json(users)
}
