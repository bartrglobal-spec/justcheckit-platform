'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
// NOTE: if your PostHog client is initialised/exported differently elsewhere
// in the app, swap this import for that — this assumes the standard
// posthog-js client import pattern.

type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
}

type ProfileAnswers = {
  incomeSource: string
  incomeStructure: string
  monthlyIncome: string
  employmentStability: string
  rentalHistory: string
  referenceLikelihood: string
  referenceAvailability: string
  occupancy: string
  moveTiming: string
  depositReadiness: string
  documentationGaps: string[]
  guarantorSupport: string
}

const EMPTY_ANSWERS: ProfileAnswers = {
  incomeSource: '',
  incomeStructure: '',
  monthlyIncome: '',
  employmentStability: '',
  rentalHistory: '',
  referenceLikelihood: '',
  referenceAvailability: '',
  occupancy: '',
  moveTiming: '',
  depositReadiness: '',
  documentationGaps: [],
  guarantorSupport: '',
}

// ── BETA MODE ──────────────────────────────────────────
// Flip this to false once Payfast checkout + the beta-code system are live.
// The matching flag lives in /unlock's page.tsx — keep both in sync.
// While true: pricing stays visible (for real intent-signal data), but
// nobody is actually blocked or charged.
const BETA_FREE_ACCESS = true

export default function PreviewPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<Property[]>([])
  const [answers, setAnswers] = useState<ProfileAnswers>(EMPTY_ANSWERS)
  // Matches the unlock page's model: unlock one property, or the whole bundle.
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'bundle' | null>(null)

  useEffect(() => {
    const savedProperties = JSON.parse(
      localStorage.getItem('rentedge_properties') || '[]'
    )
    setProperties(savedProperties)

    const savedAnswers = JSON.parse(
      localStorage.getItem('rentedge_profile_answers') || 'null'
    )
    if (savedAnswers) {
      setAnswers({ ...EMPTY_ANSWERS, ...savedAnswers })
    }
  }, [])

  // ─── Personalised teasers ─────────────────────────────
  const teasers = useMemo(() => {
    const rents = properties.map(p => Number(p.rent)).filter(r => !isNaN(r))
    const highestRent = rents.length > 0 ? Math.max(...rents) : 0
    const lowestRent  = rents.length > 0 ? Math.min(...rents) : 0
    const rentGap = highestRent - lowestRent

    let propertyTeaser = 'One of the properties you are tracking appears to stand apart from the others in a way that deserves a closer look.'
    if (properties.length >= 2 && rentGap > 5000) {
      propertyTeaser = 'Not every property is asking the same question of your situation. One currently deserves extra attention.'
    } else if (properties.length >= 2) {
      propertyTeaser = 'A difference between the properties you selected may be more important than it first appears.'
    }

    let profileTeaser = 'Part of your profile appears stronger than many renters expect when comparing properties.'
    if (answers.depositReadiness === 'Yes' && (answers.referenceLikelihood === 'Very Likely' || answers.referenceAvailability === 'Available')) {
      profileTeaser = 'A combination of preparation and supporting information appears to be working in your favour.'
    } else if (answers.rentalHistory === 'Currently Renting' || answers.rentalHistory === 'Rented Before') {
      profileTeaser = 'Something within your rental background may be more valuable than it initially seems.'
    }

    let influenceTeaser = 'We found a detail that may influence different properties in different ways.'
    if (answers.documentationGaps.length > 0) {
      influenceTeaser = 'A detail within your current preparation could affect some properties differently than others.'
    } else if (answers.moveTiming === 'Immediately') {
      influenceTeaser = 'Your planned timing may create different opportunities depending on which property you pursue.'
    } else if (answers.guarantorSupport === 'Yes') {
      influenceTeaser = 'One part of your support structure may become more relevant for certain properties than others.'
    }

    return { propertyTeaser, profileTeaser, influenceTeaser }
  }, [properties, answers])

  // ─── Continue handler ────────────────────────────────
  // TODO(payfast): this currently sets the unlock flag optimistically on the
  // client, exactly like the placeholder handlers on /unlock. Once Payfast
  // checkout + the ITN webhook + beta access codes are wired up, this should
  // redirect to the real checkout and only set unlock state after a
  // confirmed server-side payment (or a validated code), not immediately
  // on click like this.
  const handleContinue = () => {
    if (selectedPlan) {
      posthog.capture('preview_plan_selected', { plan: selectedPlan, beta_free_access: BETA_FREE_ACCESS })

      const existing = JSON.parse(localStorage.getItem('rentedge_unlock_state') || 'null')
        || { all: false, propertyIds: [] as number[] }

      const next = selectedPlan === 'bundle'
        ? { all: true, propertyIds: existing.propertyIds }
        : { all: existing.all, propertyIds: properties[0] ? [...existing.propertyIds, properties[0].id] : existing.propertyIds }

      localStorage.setItem('rentedge_unlock_state', JSON.stringify(next))
    }
    router.push('/unlock')
  }

  // The always-available free path during beta. Separate from handleContinue
  // above so we still capture which plan people *would* have picked, without
  // forcing them to pick one just to get through right now.
  const handleContinueFree = () => {
    posthog.capture('preview_continued_free_beta', { plan_hovered: selectedPlan })
    router.push('/unlock')
  }

  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      {/* ─── Header ─── */}
      <section>
        <p className="app-eyebrow">Step 3 of 3</p>
        <h1 className="app-title" style={{ marginTop: 8 }}>
          We found things worth looking at
        </h1>
        <p className="section-subtitle">
          Based on your profile and the properties you are tracking, RentEdge has already identified opportunities that deserve a closer look.
        </p>
      </section>

      {/* ─── Opportunity count ─── */}
      <div className="card-hero" style={{ textAlign: 'center', padding: '28px 20px' }}>
        <p style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
          3
        </p>
        <p className="section-title" style={{ marginTop: 8 }}>Opportunities identified</p>
        <p className="section-subtitle">
          We have already uncovered things that may influence which properties deserve your attention.
        </p>
      </div>

      {/* ─── Three teaser cards ─── */}
      <div className="section-gap">

        {/* Teaser 1 */}
        <div className="card card-elevated" style={{ borderColor: 'var(--accent-border)', background: 'linear-gradient(150deg, rgba(76,141,255,0.10) 0%, rgba(76,141,255,0.03) 100%)' }}>
          <span className="app-badge badge-accent">Property opportunity</span>
          <p className="section-title" style={{ marginTop: 12 }}>
            One property deserves a closer look
          </p>
          <p className="body-text" style={{ marginTop: 8 }}>{teasers.propertyTeaser}</p>
          <div className="card-inner" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600 }}>Discovery hidden</span>
              <span style={{ color: 'var(--accent-primary)', fontSize: 16 }}>→</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['████ Property opportunity identified','████ Profile strength detected','████ Situation-specific insight'].map(line => (
                <p key={line} style={{ fontSize: 11, color: 'rgba(245,247,251,0.20)', filter: 'blur(2px)', letterSpacing: '0.02em' }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Teaser 2 */}
        <div className="card card-elevated" style={{ borderColor: 'var(--success-border)', background: 'linear-gradient(150deg, rgba(66,201,122,0.10) 0%, rgba(66,201,122,0.03) 100%)' }}>
          <span className="app-badge badge-success">Profile strength</span>
          <p className="section-title" style={{ marginTop: 12 }}>
            Part of your profile appears stronger than expected
          </p>
          <p className="body-text" style={{ marginTop: 8 }}>{teasers.profileTeaser}</p>
          <div className="card-inner" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Discovery hidden</span>
              <span style={{ color: 'var(--success)', fontSize: 16 }}>→</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['████ Property opportunity identified','████ Profile strength detected','████ Situation-specific insight'].map(line => (
                <p key={line} style={{ fontSize: 11, color: 'rgba(245,247,251,0.20)', filter: 'blur(2px)', letterSpacing: '0.02em' }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Teaser 3 */}
        <div className="card card-elevated" style={{ borderColor: 'var(--warning-border)', background: 'linear-gradient(150deg, rgba(240,185,64,0.10) 0%, rgba(240,185,64,0.03) 100%)' }}>
          <span className="app-badge badge-warning">Cross-property insight</span>
          <p className="section-title" style={{ marginTop: 12 }}>
            We found something that could influence multiple properties differently
          </p>
          <p className="body-text" style={{ marginTop: 8 }}>{teasers.influenceTeaser}</p>
          <div className="card-inner" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>Discovery hidden</span>
              <span style={{ color: 'var(--warning)', fontSize: 16 }}>→</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['████ Property opportunity identified','████ Profile strength detected','████ Situation-specific insight'].map(line => (
                <p key={line} style={{ fontSize: 11, color: 'rgba(245,247,251,0.20)', filter: 'blur(2px)', letterSpacing: '0.02em' }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── What you will discover ─── */}
      <div className="card">
        <p className="label" style={{ marginBottom: 14 }}>What you will discover</p>
        <div className="section-gap" style={{ gap: 10 }}>
          {[
            'Which property deserves the closest attention',
            'What appears strongest in your situation',
            'What may require attention before applying',
            'Property-specific insights and opportunities',
            'A personalised rental strategy built around your situation',
            'An introduction message ready to send',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PAYWALL ─────────────────────────────────────── */}
      <div className="card-gold">
        <span className="app-badge badge-gold">
          {BETA_FREE_ACCESS ? 'Free during beta' : 'Unlock full access'}
        </span>
        <p className="section-title" style={{ marginTop: 12 }}>
          Your rental strategy is ready
        </p>
        <p className="section-subtitle">
          {BETA_FREE_ACCESS
            ? 'RentEdge has already identified opportunities, strengths, and questions within your situation. Here\u2019s what it\u2019ll cost after our beta — but it\u2019s free to unlock right now.'
            : 'RentEdge has already identified opportunities, strengths, and questions within your situation. Unlock to reveal everything we found.'}
        </p>

        {/* Plan selector — matches the unlock page's R49 / R89 model */}
        <div style={{ display: 'grid', gridTemplateColumns: properties.length > 1 ? '1fr 1fr' : '1fr', gap: 10, marginTop: 20 }}>

          {/* Single property */}
          <button
            onClick={() => setSelectedPlan('single')}
            style={{
              padding: '16px 14px',
              borderRadius: 'var(--radius-card)',
              border: `1px solid ${selectedPlan === 'single' ? 'var(--gold)' : 'var(--gold-border)'}`,
              background: selectedPlan === 'single' ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.06)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>This property</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginTop: 6 }}>R49</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Once-off unlock</p>
          </button>

          {/* Bundle — all tracked properties */}
          {properties.length > 1 && (
            <button
              onClick={() => setSelectedPlan('bundle')}
              style={{
                padding: '16px 14px',
                borderRadius: 'var(--radius-card)',
                border: `1px solid ${selectedPlan === 'bundle' ? 'var(--gold)' : 'var(--gold-border)'}`,
                background: selectedPlan === 'bundle' ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.06)',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 140ms ease',
              }}
            >
              <div style={{
                position: 'absolute', top: 8, right: -18, background: 'var(--gold)', color: '#1a1200',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 24px',
                transform: 'rotate(35deg)', textTransform: 'uppercase',
              }}>
                Best value
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>All {properties.length} properties</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginTop: 6 }}>R89</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Once-off unlock</p>
            </button>
          )}

        </div>

        {/* Guarantee */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(95,168,143,0.08)', border: '1px solid var(--success-border)',
          marginTop: 14,
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: 'var(--success-soft)', border: '1px solid var(--success-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--success)',
          }}>🛡</span>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--success)' }}>7-day money-back guarantee.</strong> Not useful? Get a full refund, no questions asked.
          </p>
        </div>

        {/* Pay CTA — kept functional so plan-intent data is real, once Payfast is live this becomes the actual paid path */}
        <button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="btn-gold"
          style={{ marginTop: 16, opacity: selectedPlan ? 1 : 0.4 }}
        >
          {selectedPlan === 'single' ? 'Unlock for R49' : selectedPlan === 'bundle' ? 'Unlock for R89' : 'Select an option to continue'}
        </button>

        {BETA_FREE_ACCESS && (
          <>
            <div style={{
              marginTop: 14, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)',
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--gold-text)', fontWeight: 600 }}>Beta access: </span>
                We're still in beta, so everything above is free right now — you will not be charged. Pricing shown is what it will cost once beta ends.
              </p>
            </div>
            <button
              onClick={handleContinueFree}
              className="btn-secondary"
              style={{ marginTop: 10, fontSize: 14 }}
            >
              Continue free during beta →
            </button>
          </>
        )}

      </div>

    </div>
  )
}
