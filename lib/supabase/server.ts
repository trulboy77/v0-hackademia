import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
