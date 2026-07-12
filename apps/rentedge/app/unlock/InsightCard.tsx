'use client'

import { useState } from 'react'

export type InsightCategory = 'opportunity' | 'strength' | 'agent' | 'resource'

const CATEGORY_META: Record<InsightCategory, { glyph: string; colour: string }> = {
  opportunity: { glyph: '◎', colour: 'var(--gold-text)' },
  strength:    { glyph: '↑', colour: 'var(--success)' },
  agent:       { glyph: '◈', colour: 'var(--accent-primary)' },
  resource:    { glyph: '▤', colour: 'var(--text-muted)' },
}

// Collapsed by default — title alone is meant to be scannable on its own.
// Only the header row toggles open/close, so links and buttons inside the
// expanded body don't accidentally re-collapse the card when clicked.
export default function InsightCard({
  category, title, children, defaultOpen = false,
}: {
  category: InsightCategory
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = CATEGORY_META[category]

  return (
    <div className="card">
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 16, color: meta.colour, flexShrink: 0, marginTop: 1 }}>{meta.glyph}</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>{title}</p>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginTop: 3,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease',
        }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  )
}
