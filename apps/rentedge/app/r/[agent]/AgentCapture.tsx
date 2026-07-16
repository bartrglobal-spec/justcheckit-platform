'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// No agent database yet — the slug in the URL *is* the source of truth for
// the display name. "john-smith" -> "John Smith". Good enough for handing
// a handful of test agents their own link without needing signup/auth.
function slugToName(slug: string) {
  return decodeURIComponent(slug)
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function AgentCapture({ agentSlug }: { agentSlug: string }) {
  const router = useRouter()

  useEffect(() => {
    const name = slugToName(agentSlug)
    if (name) {
      // Same key the Strategy tab's "Sending to: [Agent]" slot already reads.
      localStorage.setItem('rentedge_referring_agent', name)
    }
    router.replace('/check')
  }, [agentSlug, router])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Setting things up…</p>
    </div>
  )
}
