import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = new Set(["/login", "/onboarding", "/forgot-password", "/reset-password", "/expired", "/subscribe", "/subscribe/success", "/legal/privacy", "/legal/terms"])

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

  // The marketing site now lives on its own domain (metrikas.pro) — this
  // app's own "/" is no longer a landing page, just an entry point that
  // routes straight into the system.
  if (pathname === "/") {
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY)!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { session } } = await supabase.auth.getSession()
    return NextResponse.redirect(new URL(session ? "/dashboard" : "/login", req.url))
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Build a response to forward Set-Cookie headers from Supabase token refresh
  const res = NextResponse.next()

  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY)!,
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
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  // Skip Next.js internals, API routes, and anything with a file extension.
  // The function already returns early for these, but excluding them here
  // means it is never invoked at all — every photo and API request was
  // paying for a middleware invocation it did nothing with.
  matcher: ["/((?!_next/static|_next/image|api/|favicon.ico|.*\\.).*)"],
}
