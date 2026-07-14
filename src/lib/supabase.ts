import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

let _client: SupabaseClient | undefined

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}

// Proxy so the module can be imported at build time without throwing.
// The real client is created only when first accessed in the browser.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
