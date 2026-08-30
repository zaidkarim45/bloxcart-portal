import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS entirely -- server-only code
 * (Server Components, route handlers, server actions) may import this;
 * nothing in `components/` or any client-marked file should ever see the
 * service role key. The `server-only` import above makes accidentally
 * importing this from a client component a build error, not a runtime leak.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
