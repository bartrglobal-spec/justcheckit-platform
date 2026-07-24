import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import CopyLinkRow from './CopyLinkRow'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card-inner">
      <p className="label">{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</p>
      {sub && <p className="body-text" style={{ marginTop: 4, fontSize: 12 }}>{sub}</p>}
    </div>
  )
}

export default async function AgentDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, name, agency, slug, approved')
    .eq('id', id)
    .maybeSingle()

  if (!agent) {
    return (
      <div className="section-gap" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p className="section-title">We couldn't find that dashboard link</p>
        <p className="section-subtitle" style={{ marginTop: 8 }}>
          Double-check the link you were given, or get in touch if you think this is a mistake.
        </p>
      </div>
    )
  }

  const { data: referrals } = await supabaseAdmin
    .from('referrals')
    .select('event, channel')
    .eq('agent_id', agent.id)

  const rows = referrals || []
  const landedCount = rows.filter(r => r.event === 'landed').length
  const messageSentRows = rows.filter(r => r.event === 'message_sent')
  const whatsappCount = messageSentRows.filter(r => r.channel === 'whatsapp').length
  const emailCount = messageSentRows.filter(r => r.channel === 'email').length

  // Building the real, full, clickable link — reads the actual host this
  // request came in on (works the same in local dev and once deployed),
  // instead of showing a path fragment and asking the agent to assemble
  // the rest themselves.
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  const referralLink = `${proto}://${host}/r/${agent.slug}`

  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      <section>
        <p className="app-eyebrow">Your dashboard</p>
        <h1 className="app-title" style={{ marginTop: 8 }}>{agent.name}</h1>
        {agent.agency && <p className="section-subtitle" style={{ marginTop: 4 }}>{agent.agency}</p>}
      </section>

      {!agent.approved && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-card)',
          background: 'var(--warning-soft)', border: '1px solid var(--warning-border)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--warning)' }}>
            Your link is still being reviewed. Stats will start appearing here once it's active.
          </p>
        </div>
      )}

      <div className="card card-elevated">
        <CopyLinkRow
          label="Your link"
          link={referralLink}
          hint="Tap Copy, then send it wherever you'd normally reach renters — WhatsApp, email, a printed flyer, or pasted into a listing. Anyone who taps it is automatically tagged as coming from you."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard label="Link visits" value={landedCount} sub="People who opened your link" />
        <StatCard label="Messages sent to you" value={messageSentRows.length} sub={`${whatsappCount} WhatsApp · ${emailCount} email`} />
      </div>

      {landedCount === 0 && (
        <div className="card-inner" style={{ textAlign: 'center' }}>
          <p className="body-text" style={{ fontSize: 13 }}>
            No visits yet. Once you've shared your link, activity will start showing up here.
          </p>
        </div>
      )}

      <div className="card-inner">
        <p className="body-text" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          This page is private — anyone with this exact link can see your stats, so keep it somewhere only you can find, like a saved message to yourself or a bookmark.
        </p>
      </div>

    </div>
  )
}
