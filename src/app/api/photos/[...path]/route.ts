import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { isServablePhotoPath, safeImageType } from "@/lib/photo-safety"

export const dynamic = "force-dynamic"

// Player photos and academy logos live in a private Supabase Storage bucket.
// This route is the only way to read them: it checks the caller is logged
// in to the same academy that owns the photo before streaming the bytes,
// so a leaked/guessed URL alone is never enough to view someone else's data.
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  // Only the two folders the app actually writes to. The bucket accepted any
  // path, and everything outside players/ and team/ used to fall through the
  // ownership check below as "not claimed by anyone".
  if (!isServablePhotoPath(params.path)) return new NextResponse(null, { status: 404 })

  const path = params.path.join("/")
  const proxyUrl = `/api/photos/${path}`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  )
  // getUser() asks the auth server to validate the token. getSession() only
  // reads the cookie back: the library itself warns that on a server its user
  // object "must not be trusted", and this route used that id to decide whose
  // academy the caller belongs to.
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return new NextResponse(null, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("academy_id").eq("id", user.id).single()
  const myAcademyId = profile?.academy_id
  if (!myAcademyId) return new NextResponse(null, { status: 403 })

  const [folder] = params.path
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

  // The content type is whatever the uploader declared. It used to be echoed
  // straight back, and since this is served from the app's own origin, a file
  // uploaded as text/html or image/svg+xml and opened by a logged-in user would
  // have run as the app, with that user's session. Only plain raster images
  // are served; anything else is refused rather than guessed at.
  const type = safeImageType(file.type)
  if (!type) return new NextResponse(null, { status: 415 })

  const buffer = await file.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      // Belt and braces: even if a non-image slipped through, the browser may
      // not run anything from it.
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  })
}
