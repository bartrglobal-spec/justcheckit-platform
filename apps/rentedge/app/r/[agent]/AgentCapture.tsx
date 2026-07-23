'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  agentSlug: string
  agentName: string | null
  agentPhone: string | null
  agentEmail: string | null
}

export default function AgentCapture({ agentSlug, agentName, agentPhone, agentEmail }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (agentName) {
      localStorage.setItem('rentedge_referring_agent', agentName)
      // Slug specifically (not just the display name) so the unlock page
      // can reliably attribute a "message sent" event back to the right
      // agent record later, even if two agents share a similar name.
      localStorage.setItem('rentedge_referring_agent_slug', agentSlug)
    }
    if (agentPhone) {
      localStorage.setItem('rentedge_referring_agent_phone', agentPhone)
    }
    if (agentEmail) {
      localStorage.setItem('rentedge_referring_agent_email', agentEmail)
    }
    router.replace('/check')
  }, [agentSlug, agentName, agentPhone, agentEmail, router])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Setting things up…</p>
    </div>
  )
}
