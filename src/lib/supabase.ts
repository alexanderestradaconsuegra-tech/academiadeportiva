import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Cookie-based client — session is readable by the middleware (server-side)
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
