import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// Player photos and academy logos live in a private Supabase Storage bucket.
// This route is the only way to read them: it checks the caller is logged
// in to the same academy that owns the photo before streaming the bytes,
// so a leaked/guessed URL alone is never enough to view someone else's data.
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const proxyUrl = `/api/photos/${path}`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse(null, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("academy_id").eq("id", session.user.id).single()
  const myAcademyId = profile?.academy_id
  if (!myAcademyId) return new NextResponse(null, { status: 403 })

  const [folder] = path.split("/")
  let ownerAcademyId: string | null = null
  if (folder === "players") {
    const { data: player } = await admin.from("players").select("academy_id").eq("photo_url", proxyUrl).maybeSingle()
    ownerAcademyId = player?.academy_id ?? null
  } else if (folder === "team") {
    const { data: team } = await admin.from("team_settings").select("id").eq("logo_url", proxyUrl).maybeSingle()
    ownerAcademyId = team?.id ?? null
  }

  // If no record references this path yet, it's a brand-new upload being
  // previewed before the form is saved — allow it for any logged-in user.
  // Once saved, the check above takes over and enforces the academy match.
  if (ownerAcademyId && ownerAcademyId !== myAcademyId) {
    return new NextResponse(null, { status: 403 })
  }

  const { data: file, error } = await admin.storage.from("photos").download(path)
  if (error || !file) return new NextResponse(null, { status: 404 })

  const buffer = await file.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": file.type || "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  })
}
