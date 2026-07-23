'use client'

import { useState } from 'react'

export default function CopyLinkCard({ label, link, hint }: { label: string; link: string; hint?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="card card-elevated">
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      <div style={{
        padding: '12px 14px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link}
        </span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="btn-gold"
          style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}
        >
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>
      {hint && <p className="body-text" style={{ marginTop: 8, fontSize: 12 }}>{hint}</p>}
    </div>
  )
}
