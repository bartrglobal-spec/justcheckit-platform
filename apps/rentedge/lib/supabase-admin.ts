import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key, which bypasses Row Level
// Security. NEVER import this from a 'use client' component — the service
// role key must not reach the browser bundle. Safe to use in API routes
// and server components (e.g. app/api/agents/route.ts, the agent referral
// page), since those only ever run on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
