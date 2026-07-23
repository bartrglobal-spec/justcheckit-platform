import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const slug = String(body?.slug || '').trim()
    const channel = String(body?.channel || '').trim()

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 })
    }

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!agent) {
      // Not an error worth surfacing to the renter — the message still
      // sent, we just couldn't log it against an agent record.
      return NextResponse.json({ ok: false })
    }

    await supabaseAdmin.from('referrals').insert({
      agent_id: agent.id,
      event: 'message_sent',
      channel: channel || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
