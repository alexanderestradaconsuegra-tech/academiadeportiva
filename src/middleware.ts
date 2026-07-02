import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = new Set(["/", "/onboarding"])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Static assets and API routes skip auth check
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // static files (favicon, etc.)
  ) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Build a response to forward Set-Cookie headers from Supabase token refresh
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  // Match all routes except Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
