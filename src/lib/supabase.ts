import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

let _client: SupabaseClient | undefined

function getConfig(): { url: string; key: string } {
  if (typeof window !== "undefined") {
    const sc = (window as unknown as { __SC__?: { u: string; k: string } }).__SC__
    if (sc?.u && sc?.k) return { url: sc.u, key: sc.k }
  }
  // Local dev fallback — values are baked in by Next.js at build time when set in .env.local
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  }
}

function getClient(): SupabaseClient {
  if (!_client) {
    const { url, key } = getConfig()
    _client = createBrowserClient<Database>(url, key)
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
