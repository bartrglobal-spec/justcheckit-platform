'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { evaluateProperty } from '@/lib/evaluation'

type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
  label?: string
}

function toInput(p: Property): any {
  return { ...p, label: p.label || p.area || p.title || 'Property', location: p.area }
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

// Translate evaluation output into plain positioning language.
// No numbers, no percentages, no grades shown to user.
function getPositioningLanguage(evaluation: any) {
  const fit = evaluation?.fit || 'borderline'
  const financialStrength = evaluation?.financialStrength || 'stable'
  const readinessProfile = evaluation?.readinessProfile || 'moderately-prepared'
  const stabilityConfidence = evaluation?.stabilityConfidence || 'moderate'
  const friction = evaluation?.friction || 'medium'

  const positionLabel =
    fit === 'strong' ? 'Well positioned'
    : fit === 'borderline' ? 'Competitive'
    : 'Room to strengthen'

  const positionDescription =
    fit === 'strong'
      ? 'Your profile compares well against what agents typically look for in this price range.'
      : fit === 'borderline'
      ? 'Your profile is competitive. A few targeted improvements could make a meaningful difference.'
      : 'There are specific areas worth addressing before applying. Your unlock contains the detail.'

  const readinessLabel =
    readinessProfile === 'fully-prepared' ? 'Ready to apply'
    : readinessProfile === 'mostly-prepared' ? 'Nearly ready'
    : readinessProfile === 'moderately-prepared' ? 'Getting there'
    : 'Preparation needed'

  const stabilityLabel =
    stabilityConfidence === 'high' ? 'Strong income history'
    : stabilityConfidence === 'moderate' ? 'Developing income history'
    : 'Early income stage'

  const frictionLabel =
    friction === 'low' ? 'Straightforward application'
    : friction === 'medium' ? 'Some explanation may help'
    : 'Preparation will pay off'

  const strategyLabel =
    financialStrength === 'strong' ? 'Lead with financials'
    : financialStrength === 'stable' ? 'Lead with stability'
    : 'Lead with readiness'

  return {
    positionLabel,
    positionDescription,
    readinessLabel,
    stabilityLabel,
    frictionLabel,
    strategyLabel,
  }
}

export default function DashboardPage() {
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const complete = localStorage.getItem('rentedge_profile_complete') === 'true'
    setProfileComplete(complete)

    // ── KEY FIX: read rentedge_profile_answers not rentedge_profile ──
    const savedProfile = JSON.parse(
      localStorage.getItem('rentedge_profile_answers') || 'null'
    )
    setProfile(savedProfile)

    const savedProperties = JSON.parse(
      localStorage.getItem('rentedge_properties') || '[]'
    )
    setProperties(Array.isArray(savedProperties) ? savedProperties : [])

    const selected = localStorage.getItem('rentedge_selected_property_id')
    if (selected) {
      setSelectedId(Number(selected))
    } else if (savedProperties.length > 0) {
      setSelectedId(Number(savedProperties[0]?.id))
    }

    setReady(false) // brief settle
    setTimeout(() => setReady(true), 80)
  }, [])

  const selectedProperty = useMemo(
    () => properties.find(p => Number(p.id) === selectedId) || properties[0] || null,
    [properties, selectedId]
  )

  // Map profile_answers → renter profile shape for evaluateProperty
  const renterProfile = useMemo(() => {
    if (!profile) return null
    return {
      income: Number(profile.monthlyIncome || 0),
      additionalIncome: 0,
      employment: profile.incomeSource || '',
      duration: profile.employmentStability || '',
      occupants: profile.occupancy || '',
      depositReady: profile.depositReadiness === 'Yes',
      idReady: !profile.documentationGaps?.includes('ID Document'),
      payslipReady: !profile.documentationGaps?.includes('Payslips'),
      bankStatementsReady: !profile.documentationGaps?.includes('Bank Statements'),
      referencesReady: profile.referenceAvailability === 'Available',
      guarantorAvailable: profile.guarantorSupport === 'Yes',
      evictionHistory: 'none' as string,
      pets:            false,
    }
  }, [profile])

  const evaluation = useMemo(() => {
    if (!renterProfile || !selectedProperty) return null
    try { return evaluateProperty(renterProfile, toInput(selectedProperty)) }
    catch { return null }
  }, [renterProfile, selectedProperty])

  const positioning = evaluation ? getPositioningLanguage(evaluation) : null

  if (!ready) return null

  // ─── INCOMPLETE STATE ─────────────────────────────────
  if (!profileComplete) {
    return (
      <div className="section-gap" style={{ paddingTop: 8 }}>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warning)' }} />
            <p className="app-eyebrow">Setup required</p>
          </div>
          <h1 className="app-title" style={{ marginTop: 10 }}>Dashboard</h1>
          <p className="section-subtitle">
            Complete your renter profile to activate your workspace.
          </p>
        </section>

        {/* Activation card */}
        <div className="card card-elevated" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p className="app-eyebrow">Workspace activation</p>
              <p className="section-title" style={{ marginTop: 10, fontSize: 20 }}>
                Complete your renter profile
              </p>
              <p className="section-subtitle">
                Your profile powers positioning analysis, property comparison, and your personalised rental strategy.
              </p>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18 }}>R</span>
            </div>
          </div>

          <button
            onClick={() => router.push(properties.length === 0 ? '/check' : '/adaptive-profile')}
            className="btn-primary"
            style={{ marginTop: 20 }}
          >
            {properties.length === 0 ? 'Start with Check' : 'Continue profile setup'}
          </button>
        </div>

        {/* Locked preview */}
        <div className="card" style={{ opacity: 0.5 }}>
          <p className="app-eyebrow">Workspace locked</p>
          <p className="section-title" style={{ marginTop: 8 }}>
            Unlock after profile is complete
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {['Positioning','Strategy','Property comparison','Rental readiness'].map(label => (
              <div key={label} className="card-inner">
                <p className="label">{label}</p>
                <div style={{ marginTop: 14, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ marginTop: 8, height: 6, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    )
  }

  // ─── COMPLETE STATE ───────────────────────────────────
  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      {/* ── Header ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
          <p className="app-eyebrow">Workspace active</p>
        </div>
        <h1 className="app-title" style={{ marginTop: 10 }}>Dashboard</h1>
        <p className="section-subtitle">
          Positioning intelligence for your rental applications.
        </p>
      </section>

      {/* ── Active property hero ── */}
      {selectedProperty && (
        <div className="card card-elevated" style={{ padding: 22 }}>
          <p className="app-eyebrow">Active target property</p>
          <p className="section-title" style={{ marginTop: 10, fontSize: 20 }}>
            {cleanTitle(selectedProperty.area || selectedProperty.title)}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <span className="app-badge badge-accent">
              R{Number(selectedProperty.rent || 0).toLocaleString()}/mo
            </span>
            <span className="app-badge">
              {selectedProperty.bedrooms} bed{selectedProperty.bedrooms !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Positioning summary — qualitative only, no numbers */}
          {positioning && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--accent-border)',
                  background: 'var(--accent-soft)',
                }}
              >
                <p className="label" style={{ color: 'var(--accent-primary)' }}>
                  {positioning.positionLabel}
                </p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>
                  {positioning.positionDescription}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <button onClick={() => router.push('/check')} className="btn-primary" style={{ fontSize: 14 }}>
              Check property
            </button>
            <button onClick={() => router.push('/unlock')} className="btn-secondary" style={{ fontSize: 14 }}>
              View strategy
            </button>
          </div>
        </div>
      )}

      {/* ── Insight tiles — qualitative only ── */}
      {positioning && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Readiness',  value: positioning.readinessLabel },
            { label: 'Income',     value: positioning.stabilityLabel },
            { label: 'Process',    value: positioning.frictionLabel },
            { label: 'Strategy',   value: positioning.strategyLabel },
          ].map(tile => (
            <div key={tile.label} className="card-inner">
              <p className="label">{tile.label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8, lineHeight: 1.4 }}>
                {tile.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Properties being tracked ── */}
      {properties.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="label">Properties tracked</p>
            <span className="app-badge">{properties.length}</span>
          </div>
          <div className="section-gap" style={{ gap: 8 }}>
            {properties.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedId(p.id)
                  localStorage.setItem('rentedge_selected_property_id', String(p.id))
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${p.id === selectedId ? 'var(--accent-border)' : 'var(--border-soft)'}`,
                  background: p.id === selectedId ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cleanTitle(p.area || p.title)}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  R{Number(p.rent || 0).toLocaleString()}/mo · {p.bedrooms} beds
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="card card-elevated">
        <p className="label" style={{ marginBottom: 14 }}>Continue positioning</p>
        <div className="section-gap" style={{ gap: 8 }}>
          {[
            {
              label: 'Run another property check',
              sub: 'Evaluate another rental',
              path: '/check',
            },
            {
              label: 'Review your rental strategy',
              sub: 'Open your positioning analysis',
              path: '/unlock',
            },
            {
              label: 'Update renter profile',
              sub: 'Keep your profile accurate',
              path: '/adaptive-profile',
            },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => router.push(action.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-soft)',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 140ms ease',
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{action.sub}</p>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Why property choice matters ── */}
      <div className="card">
        <p className="app-eyebrow">Good to know</p>
        <p className="section-title" style={{ marginTop: 8, fontSize: 15 }}>
          Why property choice matters
        </p>
        <p className="body-text" style={{ marginTop: 10 }}>
          The same renter can be viewed very differently depending on the property they apply for. A property with lower competition or different affordability pressure may create fewer questions — even though nothing about you has changed.
        </p>
        <p className="body-text" style={{ marginTop: 10 }}>
          That is why RentEdge keeps your story constant and changes the property instead.
        </p>
      </div>

    </div>
  )
}
