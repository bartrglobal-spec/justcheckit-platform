import AgentCapture from './AgentCapture'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function AgentReferralPage({
  params,
}: {
  params: Promise<{ agent: string }>
}) {
  const { agent } = await params

  const { data } = await supabaseAdmin
    .from('agents')
    .select('id, name, phone, email')
    .eq('slug', agent)
    .eq('approved', true)
    .maybeSingle()

  // Logs a "landed" referral event for this agent. Fire-and-forget-ish —
  // awaited so it completes before the redirect happens client-side, but
  // failures here shouldn't block the renter's journey, so no error is
  // surfaced if the insert fails.
  if (data?.id) {
    await supabaseAdmin.from('referrals').insert({ agent_id: data.id, event: 'landed' })
  }

  return (
    <AgentCapture
      agentSlug={agent}
      agentName={data?.name ?? null}
      agentPhone={data?.phone ?? null}
      agentEmail={data?.email ?? null}
    />
  )
}
