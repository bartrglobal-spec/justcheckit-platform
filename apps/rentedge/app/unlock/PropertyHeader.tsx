'use client'

import { NeedleGauge } from '@/components/NeedleGauge'

type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
}

// Deposit readiness is a 3-state answer from the profile (Yes / Partially /
// Not yet) — never a percentage — so it renders as a stepped pill rather
// than a needle, which would falsely imply continuous progress.
function DepositPill({ status }: { status: 'ready' | 'partial' | 'not-ready' }) {
  const level = status === 'ready' ? 3 : status === 'partial' ? 2 : 1
  const colour = status === 'ready' ? 'var(--success)' : status === 'partial' ? 'var(--warning)' : 'var(--danger)'
  const label = status === 'ready' ? 'Ready' : status === 'partial' ? 'Partial' : 'Not yet'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: '100%' }}>
      <div style={{ display: 'flex', gap: 3, width: 70 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 7, borderRadius: 3,
            background: i <= level ? colour : 'var(--border-soft)',
            transition: 'background 0.4s ease',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Deposit</p>
    </div>
  )
}

function cleanTitle(value?: string) {
  if (!value) return 'Property'
  return value
    .replace(/property24/gi, '')
    .replace(/\|/g, ' ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export default function PropertyHeader({
  properties, selectedId, onSelectProperty,
  docsReadyCount, docsTotal, depositStatus,
  selectedProperty, ratio, posLabel, posColour, posBg, posBorder,
}: {
  properties: Property[]
  selectedId: number | null
  onSelectProperty: (id: number) => void
  docsReadyCount: number
  docsTotal: number
  depositStatus: 'ready' | 'partial' | 'not-ready'
  selectedProperty: Property
  ratio: number
  posLabel: string
  posColour: string
  posBg: string
  posBorder: string
}) {
  // Affordability gauge: 0x sits at the far left (red), 3x — the standard
  // agent threshold — lands roughly two-thirds across into the green zone,
  // and the gauge caps out visually at 5x so the needle never goes off-scale.
  const affordabilityValue = Math.min(ratio / 5, 1)

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        About you
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        paddingBottom: 16, borderBottom: '1px solid var(--border-soft)',
      }}>
        <NeedleGauge
          value={docsTotal > 0 ? docsReadyCount / docsTotal : 0}
          label={`${docsReadyCount} of ${docsTotal}`}
          sublabel="Documents"
        />
        <DepositPill status={depositStatus} />
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '16px 0 8px' }}>
        This property
      </p>

      {properties.length > 1 && (
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2,
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {properties.map(p => {
            const active = p.id === selectedId
            return (
              <button
                key={p.id}
                onClick={() => onSelectProperty(p.id)}
                style={{
                  flexShrink: 0, width: 92, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
                  border: `1px solid ${active ? 'var(--gold-border)' : 'var(--border-soft)'}`,
                  background: active ? 'var(--gold-soft)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <p style={{
                  fontSize: 12, fontWeight: active ? 600 : 400, margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  color: active ? 'var(--gold-text)' : 'var(--text-primary)',
                }}>
                  {cleanTitle(p.area || p.title)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  R{Number(p.rent || 0).toLocaleString()}
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {cleanTitle(selectedProperty.area || selectedProperty.title)} · R{Number(selectedProperty.rent || 0).toLocaleString()}/mo
        </p>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '4px 9px', whiteSpace: 'nowrap', marginLeft: 8,
          borderRadius: 'var(--radius-pill)',
          background: posBg, border: `1px solid ${posBorder}`,
          color: posColour, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {posLabel}
        </span>
      </div>

      <NeedleGauge
        value={affordabilityValue}
        label={`${ratio.toFixed(1)}x`}
        sublabel="Affordability at this rent"
        size={150}
      />
    </div>
  )
}
