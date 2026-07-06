'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { evaluateProperty } from '@/lib/evaluation'
import { evaluateUnlock } from '@/lib/evaluation/unlock'
import posthog from 'posthog-js'
// NOTE: swap this import if your PostHog client is set up differently elsewhere.

// ── BETA MODE ──────────────────────────────────────────────
// Must match the flag in /preview's page.tsx. While true, every tab is
// unlocked for everyone — the paywall gating below stays fully built and
// dormant, ready to activate by flipping this to false once Payfast
// checkout + the beta-code system are live.
const BETA_FREE_ACCESS = true

// ── Types ─────────────────────────────────────────────────
type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
  label?: string
  location?: string
  demand?: string
}

type Tab = 'overview' | 'opportunities' | 'strengths' | 'agent' | 'properties' | 'strategy'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview',      label: 'Overview',      emoji: '○' },
  { id: 'opportunities', label: 'Opportunities',  emoji: '◎' },
  { id: 'strengths',     label: 'Strengths',      emoji: '↑' },
  { id: 'agent',         label: 'Agent View',     emoji: '◈' },
  { id: 'properties',    label: 'Properties',     emoji: '⌂' },
  { id: 'strategy',      label: 'Strategy',       emoji: '→' },
]

// ── Helpers ───────────────────────────────────────────────
function cleanTitle(value?: string) {
  if (!value) return 'Property'
  return value
    .replace(/property24/gi, '')
    .replace(/\|/g, ' ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildRenterProfile(profile: any) {
  const mapDuration = (s: string) => {
    if (!s) return ''
    if (s === 'More than 2 years' || s.includes('2+')) return '2+ years'
    if (s === '1 to 2 years'      || s.includes('1-2')) return '1-2 years'
    return s
  }
  const gaps: string[] = profile?.documentationGaps || []
  return {
    income:              Number(profile?.monthlyIncome || 0),
    additionalIncome:    0,
    employment:          profile?.incomeSource || '',
    duration:            mapDuration(profile?.employmentStabilityMapped || profile?.employmentStability || ''),
    occupants:           profile?.occupancy || '',
    depositReady:        profile?.depositReadiness === 'Yes',
    idReady:             !gaps.includes('ID Document'),
    payslipReady:        !gaps.includes('Payslips'),
    bankStatementsReady: !gaps.includes('Bank Statements'),
    referencesReady:     profile?.referenceAvailability === 'Available',
    guarantorAvailable:  profile?.guarantorSupport === 'Yes',
    evictionHistory:     'none' as string,
    pets:                false,
  }
}

// ── Copy button ───────────────────────────────────────────
function CopyBtn({ text, label = 'Copy introduction message' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className={copied ? 'btn-primary btn-copied' : 'btn-gold'}
      style={{ marginTop: 16 }}
    >
      {copied ? '✓ Copied to clipboard' : label}
    </button>
  )
}

// ── Context bar — shows user-specific data at top of each tab ──
function ContextBar({
  income, rent, ratio, property, posLabel, posColour, posBg, posBorder
}: {
  income: number
  rent: number
  ratio: number
  property: Property
  posLabel: string
  posColour: string
  posBg: string
  posBorder: string
}) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginBottom: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          {cleanTitle(property.area || property.title)} · R{Number(rent).toLocaleString()}/mo
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
          Income ratio: <strong style={{ color: ratio >= 3 ? 'var(--success)' : 'var(--warning)' }}>{ratio.toFixed(1)}x</strong>
          {' '}(need 3x)
        </p>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '4px 9px', whiteSpace: 'nowrap',
        borderRadius: 'var(--radius-pill)',
        background: posBg, border: `1px solid ${posBorder}`,
        color: posColour, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {posLabel}
      </span>
    </div>
  )
}

// ── Info card ─────────────────────────────────────────────
function InfoCard({ label, text, colour = 'var(--text-muted)' }: { label: string; text: string; colour?: string }) {
  return (
    <div className="card-inner">
      <p className="label" style={{ color: colour }}>{label}</p>
      <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{text}</p>
    </div>
  )
}

// ── Pricing card ──────────────────────────────────────────
function PricingCard({
  label, price, sub, features, highlight, onSelect, ctaLabel,
}: {
  label: string
  price: string
  sub: string
  features: string[]
  highlight?: boolean
  onSelect: () => void
  ctaLabel: string
}) {
  return (
    <div style={{
      padding: '18px 18px 16px', borderRadius: 'var(--radius-card)',
      border: `1px solid ${highlight ? 'var(--gold-border)' : 'var(--border-soft)'}`,
      background: highlight
        ? 'linear-gradient(150deg, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.04) 100%)'
        : 'rgba(255,255,255,0.03)',
      position: 'relative',
    }}>
      {highlight && (
        <span style={{
          position: 'absolute', top: -10, left: 18,
          fontSize: 10, fontWeight: 700, padding: '3px 9px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--gold-text)', color: '#1a1400',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>Best value</span>
      )}
      <p className="label" style={{ color: highlight ? 'var(--gold-text)' : 'var(--text-muted)' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{price}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, color: highlight ? 'var(--gold-text)' : 'var(--success)', marginTop: 1, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onSelect}
        className={highlight ? 'btn-gold' : 'btn-primary'}
        style={{ marginTop: 16, width: '100%' }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ── Guarantee badge ───────────────────────────────────────
function GuaranteeBadge() {
  return (
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
  )
}

// ── Paywall gate — shown in place of locked tab content ────
function PaywallGate({
  itemCount, itemNoun, teaserTitle, teaserBody, propertyCount,
  onUnlockSingle, onUnlockBundle,
}: {
  itemCount: number
  itemNoun: string
  teaserTitle: string
  teaserBody: string
  propertyCount: number
  onUnlockSingle: () => void
  onUnlockBundle: () => void
}) {
  return (
    <div className="section-gap">
      {/* Teaser — proves the content is real and specific */}
      <div className="card card-elevated" style={{ position: 'relative', overflow: 'hidden' }}>
        <p className="app-eyebrow">{itemCount} {itemNoun} found for your profile</p>
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {teaserTitle}
          </p>
          <p className="body-text" style={{ marginTop: 8 }}>{teaserBody}</p>
        </div>
        {/* Blurred fake lines to signal "more below" without giving anything away */}
        <div style={{ marginTop: 16, filter: 'blur(5px)', opacity: 0.5, userSelect: 'none', pointerEvents: 'none' }}>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--text-muted)', width: '88%', marginBottom: 8 }} />
          <div style={{ height: 12, borderRadius: 6, background: 'var(--text-muted)', width: '72%', marginBottom: 8 }} />
          <div style={{ height: 12, borderRadius: 6, background: 'var(--text-muted)', width: '81%' }} />
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 90,
          background: 'linear-gradient(to bottom, transparent, var(--surface-elevated, #14171c))',
        }} />
      </div>

      {/* Pricing */}
      <div className="card">
        <p className="label" style={{ marginBottom: 4 }}>Unlock your full rental strategy</p>
        <p className="section-subtitle" style={{ marginBottom: 16 }}>
          Everything the free check doesn't show you — opportunities, agent questions, and a ready-to-send introduction message.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: propertyCount > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
          <PricingCard
            label="This property"
            price="R49"
            sub="once-off"
            features={[
              'Full opportunities, strengths & agent view',
              'Ready-to-send introduction message',
              'Document readiness checklist',
            ]}
            onSelect={onUnlockSingle}
            ctaLabel="Unlock this property"
          />
          {propertyCount > 1 && (
            <PricingCard
              label={`All ${propertyCount} tracked properties`}
              price="R89"
              sub="once-off"
              highlight
              features={[
                'Everything in the single unlock',
                'Every property you\u2019re tracking, compared',
                'Free re-run for 30 days as you add more',
              ]}
              onSelect={onUnlockBundle}
              ctaLabel="Unlock all properties"
            />
          )}
        </div>
        <GuaranteeBadge />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════
export default function UnlockPage() {
  const router = useRouter()
  const [profile, setProfile]           = useState<any>(null)
  const [properties, setProperties]     = useState<Property[]>([])
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [activeTab, setActiveTab]       = useState<Tab>('overview')
  const [revealedTabs, setRevealedTabs] = useState<Set<Tab>>(new Set(['overview']))
  const [ready, setReady]               = useState(false)

  // ── Unlock state ─────────────────────────────────────
  // { all: true } once the bundle is purchased, or propertyIds contains
  // individually-unlocked property ids. Persisted to localStorage for now —
  // TODO(payfast): once the Payfast ITN webhook is wired up, this should be
  // read from / written to the backend (Supabase) after a confirmed once-off
  // payment, not just localStorage on the client.
  const [unlockState, setUnlockState] = useState<{ all: boolean; propertyIds: number[] }>({ all: false, propertyIds: [] })

  useEffect(() => {
    const savedProfile    = JSON.parse(localStorage.getItem('rentedge_profile_answers') || 'null')
    const savedProperties = JSON.parse(localStorage.getItem('rentedge_properties') || '[]')
    setProfile(savedProfile)
    setProperties(Array.isArray(savedProperties) ? savedProperties : [])
    const sel = localStorage.getItem('rentedge_selected_property_id')
    if (sel) setSelectedId(Number(sel))
    else if (savedProperties.length > 0) setSelectedId(savedProperties[0].id)
    const savedUnlock = JSON.parse(localStorage.getItem('rentedge_unlock_state') || 'null')
    if (savedUnlock) setUnlockState(savedUnlock)
    setReady(true)
  }, [])

  const persistUnlockState = (next: { all: boolean; propertyIds: number[] }) => {
    setUnlockState(next)
    localStorage.setItem('rentedge_unlock_state', JSON.stringify(next))
  }

  // TODO(payfast): replace these two handlers with a redirect to the Payfast
  // once-off checkout (R49 / R89). On successful payment, the ITN webhook
  // should confirm server-side and this client state should be refreshed
  // from that confirmation rather than set optimistically like this.
  const handleUnlockSingle = (propertyId: number) => {
    persistUnlockState({ ...unlockState, propertyIds: [...unlockState.propertyIds, propertyId] })
  }
  const handleUnlockBundle = () => {
    persistUnlockState({ all: true, propertyIds: unlockState.propertyIds })
  }

  const selectedProperty = useMemo(
    () => properties.find(p => p.id === selectedId) || properties[0] || null,
    [properties, selectedId]
  )

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    setRevealedTabs(prev => new Set([...prev, tab]))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Tracked against the *real* unlock state, not the beta override —
    // this is what tells us later which tabs actually drive purchase intent.
    const wouldBeLocked = tab !== 'overview' && !(unlockState.all || (selectedProperty && unlockState.propertyIds.includes(selectedProperty.id)))
    posthog.capture('unlock_tab_viewed', { tab, would_be_locked: wouldBeLocked, beta_free_access: BETA_FREE_ACCESS })
  }

  const selectProperty = (id: number) => {
    setSelectedId(id)
    localStorage.setItem('rentedge_selected_property_id', String(id))
  }

  if (!ready) return null

  if (!profile || !selectedProperty) {
    return (
      <div className="section-gap" style={{ paddingTop: 60, alignItems: 'center', textAlign: 'center' }}>
        <div className="empty-state-icon" style={{ fontSize: 28 }}>🔒</div>
        <p className="section-title">Nothing to unlock yet</p>
        <p className="section-subtitle" style={{ maxWidth: 280 }}>
          Complete your profile and add at least one property to unlock your rental strategy.
        </p>
        <button onClick={() => router.push('/check')} className="btn-primary" style={{ marginTop: 12 }}>
          Start from Check
        </button>
      </div>
    )
  }

  // ── Run all engines ───────────────────────────────────
  const renter     = buildRenterProfile(profile)

  // Map Property → PropertyInput
  // Cleans scraped titles and separates title from location
  // to prevent buildIntroduction duplicating them
  const toPropertyInput = (p: Property) => {
    const rawTitle = p.title || ''
    // Remove site names, IDs, prices, "to rent" etc from scraped titles
    const cleanTitle = rawTitle
      .replace(/property24/gi, '')
      .replace(/\|.*$/, '')
      .replace(/-?\s*p\d+.*$/i, '')
      .replace(/to rent/gi, '')
      .replace(/for rent/gi, '')
      .replace(/r\s?\d[\d\s,]*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const area = p.area || ''

    // If the cleaned title already contains the area name, don't set location
    // — prevents "I came across X in X" duplication in the intro message
    const titleContainsArea = area.length > 3 &&
      cleanTitle.toLowerCase().includes(area.toLowerCase())

    return {
      ...p,
      label: cleanTitle || area || 'Property',
      title: cleanTitle,
      location: titleContainsArea ? '' : area,
      bedrooms: Number(p.bedrooms) || 0,
    }
  }

  const selectedInput  = toPropertyInput(selectedProperty)
  const propertiesInput = properties.map(toPropertyInput)

  const evaluation = evaluateProperty(renter, selectedInput)
  const unlock     = evaluateUnlock(renter, propertiesInput, selectedInput, evaluation)
  const otherProps = properties.filter(p => p.id !== selectedProperty.id)

  // ── Derived user-specific values ──────────────────────
  const rent        = Number(selectedProperty.rent || 0)
  const income      = renter.income
  const ratio       = income > 0 && rent > 0 ? income / rent : 0
  const rentBurden  = income > 0 ? Math.round((rent / income) * 100) : 0
  const isSelfEmpl  = ['self', 'freelance', 'contract'].some(k =>
    (profile?.incomeSource || '').toLowerCase().includes(k))

  const posLabel =
    evaluation.fit === 'strong'     ? 'Strong'
    : evaluation.fit === 'borderline' ? 'Competitive'
    : 'Needs work'

  const posColour =
    evaluation.fit === 'strong'     ? 'var(--success)'
    : evaluation.fit === 'borderline' ? 'var(--warning)'
    : 'var(--danger)'

  const posBg =
    evaluation.fit === 'strong'     ? 'var(--success-soft)'
    : evaluation.fit === 'borderline' ? 'var(--warning-soft)'
    : 'var(--danger-soft)'

  const posBorder =
    evaluation.fit === 'strong'     ? 'var(--success-border)'
    : evaluation.fit === 'borderline' ? 'var(--warning-border)'
    : 'var(--danger-border)'

  // ── User-specific context sentences ──────────────────
  const incomeContext = income > 0
    ? `Your income of R${income.toLocaleString()} covers the rent at ${ratio.toFixed(1)}x. ${ratio >= 3 ? 'You meet the 3x threshold most agents require.' : 'Most agents require 3x — this is worth addressing.'}`
    : ''

  const employmentContext = profile?.incomeSource
    ? `You earn through ${profile.incomeSource.toLowerCase()}.${isSelfEmpl ? ' As a self-employed applicant, agents will typically want 6 months of bank statements and financial records.' : ''}`
    : ''

  const readinessContext = evaluation.readinessProfile === 'fully-prepared'
    ? 'Your documentation appears to be in good shape.'
    : evaluation.readinessProfile === 'mostly-prepared'
    ? 'Most documents are ready. A few gaps remain worth addressing.'
    : 'There are documentation gaps that may slow down or complicate your application.'

  const stabilityContext =
    evaluation.stabilityConfidence === 'high'
      ? `Your ${profile?.employmentStability || 'employment'} history adds significant confidence to your application.`
      : evaluation.stabilityConfidence === 'moderate'
      ? 'Your income history is developing — some agents may ask for more context.'
      : 'Your current income situation is relatively new. Be prepared to explain your trajectory.'

  // ── Required docs list (user-specific) ───────────────
  const gaps: string[] = profile?.documentationGaps?.filter((g: string) => g !== 'none') || []
  const docList = [
    { doc: 'Certified ID copy',                                              done: !gaps.includes('ID Document') },
    { doc: isSelfEmpl ? '6 months bank statements' : '3 months bank statements', done: !gaps.includes('Bank Statements') },
    { doc: isSelfEmpl ? '6 months payslips or financial statements' : '3 months payslips', done: !gaps.includes('Payslips') },
    { doc: 'Employment confirmation letter',                                 done: !gaps.includes('Employment Confirmation') },
    { doc: 'Landlord reference contact details',                             done: profile?.referenceAvailability === 'Available' },
    { doc: `Deposit ready — up to R${(rent * 2).toLocaleString()} (2x rent)`, done: profile?.depositReadiness === 'Yes' },
  ]

  const contextBarProps = { income, rent, ratio, property: selectedProperty, posLabel, posColour, posBg, posBorder }

  const isUnlocked = BETA_FREE_ACCESS || unlockState.all || unlockState.propertyIds.includes(selectedProperty.id)

  // ═══════════════════════════════════════════════════════
  return (
    <div style={{ paddingTop: 8 }}>

      {/* ══ GOLD HERO — full on Overview, compact strip elsewhere ══ */}
      {activeTab === 'overview' ? (
        <div className="card-gold" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <span className="app-badge badge-gold">Rental strategy unlocked</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 10px', whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-pill)',
              background: posBg, border: `1px solid ${posBorder}`,
              color: posColour, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{posLabel}</span>
          </div>

          <h1 className="app-title" style={{ marginTop: 16, fontSize: 23 }}>
            {evaluation.fit === 'strong'
              ? 'Your position looks strong for this property.'
              : evaluation.fit === 'borderline'
              ? 'You are competitive — with a few things worth focusing on.'
              : 'There are specific areas to address before applying.'}
          </h1>

          {/* User-specific summary — different for every user */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[incomeContext, employmentContext, stabilityContext, readinessContext]
              .filter(Boolean)
              .map((sentence, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 10, marginTop: 3, flexShrink: 0,
                    color: i === 0
                      ? (ratio >= 3 ? 'var(--success)' : 'var(--warning)')
                      : 'var(--text-muted)',
                  }}>●</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sentence}</p>
                </div>
              ))}
          </div>

          {/* Selected property */}
          <div style={{
            marginTop: 16, padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--gold-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <p className="label" style={{ color: 'var(--gold-text)' }}>Analysis for</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cleanTitle(selectedProperty.area || selectedProperty.title)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span className="app-badge">R{rent.toLocaleString()}</span>
              <span className="app-badge">{selectedProperty.bedrooms}bd</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 20, padding: '12px 16px',
          borderRadius: 'var(--radius-card)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 100%)',
          border: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cleanTitle(selectedProperty.area || selectedProperty.title)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              R{rent.toLocaleString()}/mo · {selectedProperty.bedrooms}bd
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '4px 10px', whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-pill)',
            background: posBg, border: `1px solid ${posBorder}`,
            color: posColour, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>{posLabel}</span>
        </div>
      )}

      {BETA_FREE_ACCESS && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(95,168,143,0.08)', border: '1px solid var(--success-border)',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 13 }}>🎁</span>
          <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
            Everything on this page is free during our beta.
          </p>
        </div>
      )}

      {/* ══ TAB BAR ══════════════════════════════════════ */}
      {/* Tab bar scrolls horizontally on mobile — 6 tabs need room on small screens */}
      <div
        className="tab-scroll-bar"
        style={{
          display: 'flex', gap: 6,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 4,
          paddingRight: 4,
          marginBottom: 16,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-pill)',
          padding: 4,
          border: '1px solid var(--border-soft)',
        }}
      >
        {TABS.map(tab => {
          const isActive   = activeTab === tab.id
          const isRevealed = revealedTabs.has(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                flexShrink: 0, padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isActive ? 'var(--gold-border)' : 'transparent'}`,
                background: isActive
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.10) 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(201,168,76,0.15)' : 'none',
                color: isActive ? 'var(--gold-text)' : isRevealed ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                whiteSpace: 'nowrap',
                outline: 'none', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.label}
              {tab.id !== 'overview' && !isUnlocked && (
                <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>🔒</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══ TAB: OVERVIEW ════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          {/* Observations — personalised by engine */}
          <div className="card card-elevated">
            <p className="app-eyebrow">What we noticed — specific to your situation</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.observations.length} things stood out
            </p>
            <div className="section-gap" style={{ marginTop: 16 }}>
              {unlock.observations.map((obs, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
                }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {obs.observation}
                  </p>
                  <p className="body-text" style={{ marginTop: 8 }}>{obs.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rent burden — user-specific calculation */}
          {income > 0 && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              background: ratio >= 3 ? 'var(--success-soft)' : ratio >= 2.5 ? 'var(--warning-soft)' : 'var(--danger-soft)',
              border: `1px solid ${ratio >= 3 ? 'var(--success-border)' : ratio >= 2.5 ? 'var(--warning-border)' : 'var(--danger-border)'}`,
            }}>
              <p className="label" style={{ color: ratio >= 3 ? 'var(--success)' : ratio >= 2.5 ? 'var(--warning)' : 'var(--danger)' }}>
                Affordability — the first thing agents check
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8, letterSpacing: '-0.03em' }}>
                {ratio.toFixed(1)}x
              </p>
              <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>
                Your income is <strong>{ratio.toFixed(1)}x</strong> the rent. The rent takes <strong>{rentBurden}%</strong> of your gross income.
                {' '}{ratio >= 3
                  ? 'You meet the standard 3x threshold. Affordability is unlikely to be the main question for this property.'
                  : ratio >= 2.5
                  ? 'You are close to the 3x threshold. Some agents may approve, others may ask for a guarantor.'
                  : 'Below the 3x threshold. This is the most likely point of friction for this specific property.'}
              </p>
              {ratio < 3 && (
                <div className="card-inner" style={{ marginTop: 12 }}>
                  <p className="label">What to do</p>
                  <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>
                    {ratio >= 2.5
                      ? 'Consider adding a guarantor or targeting a property where your income meets 3x comfortably. Your other signals may compensate.'
                      : 'Target properties under R' + Math.floor(income / 3).toLocaleString() + '/month where your income meets the threshold. A guarantor may also help.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isUnlocked && (
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-card)',
              background: 'linear-gradient(150deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 100%)',
              border: '1px solid var(--gold-border)', textAlign: 'center',
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {unlock.opportunities.length + unlock.strengths.length + unlock.agentQuestions.length} more things found — including your ready-to-send introduction message.
              </p>
            </div>
          )}

          <button onClick={() => switchTab('opportunities')} className="btn-gold">
            {isUnlocked ? 'See your personalised opportunities →' : 'Unlock your full rental strategy →'}
          </button>
        </div>
      )}

      {/* ══ TAB: OPPORTUNITIES (previously unused engine) ═ */}
      {activeTab === 'opportunities' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          <div className="card card-elevated">
            <p className="app-eyebrow">Personalised to your profile</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.opportunities.length} opportunities identified
            </p>
            <p className="section-subtitle">
              These are not generic tips. They are ranked specifically for your situation based on what is most likely to strengthen your application.
            </p>
          </div>

          {!isUnlocked ? (
            <PaywallGate
              itemCount={unlock.opportunities.length}
              itemNoun="opportunities"
              teaserTitle={unlock.opportunities[0]?.title || 'Your top opportunity'}
              teaserBody={unlock.opportunities[0]?.explanation || ''}
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (<>

          {/* Opportunities — full engine output, previously unused */}
          {unlock.opportunities.map((opp, i) => (
            <div key={i} className="card card-elevated">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--gold-text)',
                }}>{i + 1}</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {opp.title}
                </p>
              </div>
              <p className="body-text" style={{ marginTop: 12 }}>{opp.explanation}</p>
              <InfoCard label="Why it matters" text={opp.whyItMatters} />
              <div className="card-success" style={{ marginTop: 10 }}>
                <p className="label" style={{ color: 'var(--success)' }}>Potential benefit</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{opp.benefit}</p>
              </div>
            </div>
          ))}

          {/* Credit check — always here, with live deposit calc */}
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-card)',
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)',
            border: '1px solid var(--gold-border)',
          }}>
            <p className="label" style={{ color: 'var(--gold-text)', marginBottom: 10 }}>
              Save R150–R250 before you apply
            </p>
            <p className="body-text" style={{ fontSize: 13 }}>
              Agents charge up to R250 for a credit check. Under the National Credit Act you are entitled to one free report per year from every bureau. Pull yours before any agent runs one — you see the same information and it costs nothing.
            </p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'ClearScore',       detail: 'Free forever via Experian',    url: 'https://www.clearscore.com/za' },
                { name: 'TransUnion SA',    detail: 'Free once a year',             url: 'https://www.transunion.co.za/product/annual-free-credit-report' },
                { name: 'Experian SA',      detail: 'Free once a year',             url: 'https://www.experian.co.za' },
                { name: 'Compuscan',        detail: 'Free once a year',             url: 'https://www.compuscan.co.za' },
              ].map(item => (
                <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)',
                    textDecoration: 'none', gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.detail}</p>
                  </div>
                  <span style={{ color: 'var(--gold-text)', fontSize: 14 }}>→</span>
                </a>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
              Under the Consumer Protection Act, agents may only charge for a credit check with your explicit consent. You can present your own recent report instead.
            </p>
          </div>

          {/* Upfront costs — specific to their property */}
          <div className="card card-elevated">
            <p className="app-eyebrow">Upfront cost reality check</p>
            <p className="section-title" style={{ marginTop: 8, fontSize: 15 }}>
              What you need ready for {cleanTitle(selectedProperty.area || selectedProperty.title)}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              {[
                { label: 'Deposit (1.5–2x)',  value: `R${(rent * 1.5).toLocaleString()} – R${(rent * 2).toLocaleString()}` },
                { label: 'First month rent',  value: `R${rent.toLocaleString()}` },
                { label: 'Admin fee (est)',   value: 'R800 – R1,200' },
                { label: 'Total to have ready', value: `R${(rent * 2.5 + 1000).toLocaleString()}+` },
              ].map(item => (
                <div key={item.label} className="card-inner">
                  <p className="label">{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
              background: renter.depositReady ? 'var(--success-soft)' : 'var(--warning-soft)',
              border: `1px solid ${renter.depositReady ? 'var(--success-border)' : 'var(--warning-border)'}`,
            }}>
              <p style={{ fontSize: 13, color: renter.depositReady ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                {renter.depositReady ? 'You indicated deposit is ready ✓' : 'You indicated deposit is not fully ready'}
              </p>
              <p className="body-text" style={{ marginTop: 4, fontSize: 12 }}>
                {renter.depositReady
                  ? 'Keep these funds accessible. Properties can move quickly.'
                  : 'This is worth resolving before applying. Agents often ask for proof of deposit availability upfront.'}
              </p>
            </div>
          </div>

          </>)}

          <button onClick={() => switchTab('strengths')} className="btn-primary">
            {isUnlocked ? 'See what is working in your favour →' : 'See what else is behind Strengths →'}
          </button>
        </div>
      )}

      {/* ══ TAB: STRENGTHS ═══════════════════════════════ */}
      {activeTab === 'strengths' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          <div className="card">
            <p className="app-eyebrow">Engine-scored for your profile</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.strengths.length} things already working in your favour
            </p>
            <p className="section-subtitle">
              These are ranked by how much weight they carry for your specific situation — not every strength is equally valuable for every application.
            </p>
          </div>

          {!isUnlocked ? (
            <PaywallGate
              itemCount={unlock.strengths.length}
              itemNoun="strengths"
              teaserTitle={unlock.strengths[0]?.title || 'Your strongest signal'}
              teaserBody={unlock.strengths[0]?.explanation || ''}
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (<>

          {unlock.strengths.map((s, i) => (
            <div key={i} className="card card-elevated">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'var(--success-soft)', border: '1px solid var(--success-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: 'var(--success)', fontWeight: 700,
                }}>✓</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {s.title}
                </p>
              </div>
              <p className="body-text" style={{ marginTop: 12 }}>{s.explanation}</p>
              <InfoCard label="Why this matters for your application" text={s.whyItMatters} />
              <div className="card-accent" style={{ marginTop: 10 }}>
                <p className="label" style={{ color: 'var(--accent-primary)' }}>Keep doing this</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{s.keepDoing}</p>
              </div>
            </div>
          ))}

          {/* Document readiness — user-specific checklist */}
          <div className="card card-elevated">
            <p className="app-eyebrow">Application readiness</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <p className="section-title" style={{ fontSize: 15 }}>
                {isSelfEmpl ? 'Self-employed document checklist' : 'Standard document checklist'}
              </p>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                background: docList.every(d => d.done) ? 'var(--success-soft)' : 'var(--warning-soft)',
                border: `1px solid ${docList.every(d => d.done) ? 'var(--success-border)' : 'var(--warning-border)'}`,
                color: docList.every(d => d.done) ? 'var(--success)' : 'var(--warning)',
              }}>
                {docList.filter(d => d.done).length}/{docList.length}
              </span>
            </div>
            {isSelfEmpl && (
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                As a self-employed applicant, agents require more documentation than salaried employees.
              </p>
            )}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docList.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: item.done ? 'var(--success-soft)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.done ? 'var(--success-border)' : 'var(--border-soft)'}`,
                }}>
                  <span style={{ fontSize: 13, color: item.done ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <p style={{ fontSize: 13, color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.doc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          </>)}

          <button onClick={() => switchTab('agent')} className="btn-primary">
            {isUnlocked ? 'See the agent perspective →' : 'See what else is behind Agent View →'}
          </button>
        </div>
      )}

      {/* ══ TAB: AGENT VIEW ══════════════════════════════ */}
      {activeTab === 'agent' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          <div className="card card-elevated">
            <p className="app-eyebrow">Scored for your specific profile</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.agentQuestions.length} questions likely to come up
            </p>
            <p className="section-subtitle">
              These are not generic agent questions. They were selected based on your income structure, rental history, and readiness — the signals most likely to attract scrutiny in your specific situation.
            </p>
          </div>

          {!isUnlocked ? (
            <PaywallGate
              itemCount={unlock.agentQuestions.length}
              itemNoun="likely questions"
              teaserTitle={unlock.agentQuestions[0]?.question || 'What an agent will ask first'}
              teaserBody={unlock.agentQuestions[0]?.howYouFit || ''}
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (<>

          {unlock.agentQuestions.map((q, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                  color: 'var(--accent-primary)', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>Question {i + 1} of {unlock.agentQuestions.length}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {q.question}
              </p>
              <div className="section-gap" style={{ marginTop: 14, gap: 8 }}>
                <InfoCard label="How agents often think about this" text={q.howAgentsThink} />
                <InfoCard label="In your specific situation" text={q.howYouFit} colour="var(--text-secondary)" />
                <InfoCard label="Why we flagged this for you" text={q.whyWeSayThat} />
                <div className="card-accent">
                  <p className="label" style={{ color: 'var(--accent-primary)' }}>What we would do next</p>
                  <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{q.nextMove}</p>
                </div>
              </div>
            </div>
          ))}

          {/* PPRA verification */}
          <div className="card" style={{ borderColor: 'var(--warning-border)', background: 'var(--warning-soft)' }}>
            <p className="label" style={{ color: 'var(--warning)' }}>Know your rights</p>
            <p className="section-title" style={{ marginTop: 8, fontSize: 15 }}>Application fees are not permitted</p>
            <p className="body-text" style={{ marginTop: 8 }}>
              Under the Consumer Protection Act, agents cannot charge an application fee. They may only charge for services rendered — like credit checks — with your explicit consent.
            </p>
            <a href="https://www.theppra.org.za" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)',
                textDecoration: 'none',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Verify your agent on PPRA</p>
              <span style={{ color: 'var(--accent-primary)', fontSize: 14 }}>→</span>
            </a>
          </div>

          </>)}

          <button onClick={() => switchTab('properties')} className="btn-primary">
            {isUnlocked ? 'Compare your properties →' : 'See what else is behind Properties →'}
          </button>
        </div>
      )}

      {/* ══ TAB: PROPERTIES ══════════════════════════════ */}
      {activeTab === 'properties' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          <div className="card card-elevated">
            <p className="app-eyebrow">Property-specific analysis</p>
            <p className="section-title" style={{ marginTop: 8 }}>Same renter. Different property. Different picture.</p>
            <p className="section-subtitle">
              Switching the property below re-runs the analysis against your profile. Your strengths stay the same — what changes is how they are weighted against each property's requirements.
            </p>
          </div>

          {/* Property switcher */}
          <div className="section-gap" style={{ gap: 8 }}>
            <div style={{
              padding: '14px 16px', borderRadius: 'var(--radius-card)',
              border: '1px solid var(--gold-border)', background: 'var(--gold-soft)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Currently viewing
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>
                {cleanTitle(selectedProperty.area || selectedProperty.title)}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <span className="app-badge">R{rent.toLocaleString()}/mo</span>
                <span className="app-badge">{selectedProperty.bedrooms} beds</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: posBg, border: `1px solid ${posBorder}`,
                  color: posColour,
                }}>{posLabel}</span>
              </div>
            </div>

            {otherProps.length > 0 ? otherProps.map(p => (
              <button key={p.id} onClick={() => selectProperty(p.id)} style={{
                width: '100%', textAlign: 'left', padding: '14px 16px',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-soft)',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer', transition: 'all 140ms ease', outline: 'none',
              }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cleanTitle(p.area || p.title)}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="app-badge">R{Number(p.rent||0).toLocaleString()}/mo</span>
                  <span className="app-badge">{p.bedrooms} beds</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--accent-primary)', marginTop: 8 }}>
                  Tap to switch analysis to this property →
                </p>
              </button>
            )) : (
              <div className="card-inner" style={{ textAlign: 'center' }}>
                <p className="body-text" style={{ fontSize: 13 }}>
                  You have one property tracked. Add more in Check to compare how your profile performs against different rentals.
                </p>
                <button onClick={() => router.push('/check')} className="btn-ghost" style={{ marginTop: 8 }}>
                  Add another property
                </button>
              </div>
            )}
          </div>

          {/* Property conversation — engine output */}
          {!isUnlocked ? (
            <PaywallGate
              itemCount={otherProps.length + 1}
              itemNoun="property comparisons"
              teaserTitle={`How ${cleanTitle(selectedProperty.area || selectedProperty.title)} compares to your other properties`}
              teaserBody="See exactly what works in your favour here versus what might attract more scrutiny."
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (<>

          {unlock.propertyConversations.map((conv, i) => (
            <div key={i} className="section-gap" style={{ gap: 10 }}>
              <div className="card-success">
                <p className="label" style={{ color: 'var(--success)' }}>
                  May feel easier at {cleanTitle(selectedProperty.area || selectedProperty.title)}
                </p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.easierHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0, fontSize: 14 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-warning">
                <p className="label" style={{ color: 'var(--warning)' }}>May attract attention here</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.attentionHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--warning)', flexShrink: 0, fontSize: 14 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-accent">
                <p className="label" style={{ color: 'var(--accent-primary)' }}>What to focus on for this property</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.focusHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent-primary)', flexShrink: 0, fontSize: 14 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          </>)}

          <button onClick={() => switchTab('strategy')} className="btn-primary">
            {isUnlocked ? 'See your rental strategy →' : 'See what else is behind Strategy →'}
          </button>
        </div>
      )}

      {/* ══ TAB: STRATEGY ════════════════════════════════ */}
      {activeTab === 'strategy' && (
        <div className="section-gap">
          <ContextBar {...contextBarProps} />

          {!isUnlocked ? (
            <PaywallGate
              itemCount={unlock.focusAreas.length}
              itemNoun="focus areas"
              teaserTitle="Your ready-to-send introduction message is waiting here"
              teaserBody="Built from your actual profile answers — the single most useful thing in your full report."
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (<>

          {/* Focus areas — engine output, now in strategy where it belongs */}
          <div className="card card-elevated">
            <p className="app-eyebrow">Ranked by impact for your situation</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.focusAreas.length} areas to focus on before applying
            </p>
            <p className="section-subtitle">
              These are ranked by our engine based on what is most likely to make a difference for your specific profile and this property.
            </p>
            <div className="section-gap" style={{ marginTop: 16, gap: 10 }}>
              {unlock.focusAreas.map((focus, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)',
                  }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{focus.what}</p>
                    <p className="body-text" style={{ marginTop: 4, fontSize: 13 }}>{focus.why}</p>
                    <div className="card-accent" style={{ marginTop: 10 }}>
                      <p className="label" style={{ color: 'var(--accent-primary)' }}>Potential impact</p>
                      <p className="body-text" style={{ marginTop: 4, fontSize: 12 }}>{focus.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy narrative — personalised by engine */}
          <div className="card-hero">
            <p className="app-eyebrow" style={{ color: 'var(--accent-primary)' }}>Your rental strategy</p>
            <p className="section-title" style={{ marginTop: 8 }}>If we were in your shoes</p>
            <div style={{ marginTop: 16 }}>
              {unlock.strategy.narrative.split('\n\n').map((para, i) => (
                <p key={i} className="body-text" style={{ marginTop: i > 0 ? 14 : 0, lineHeight: 1.8 }}>{para}</p>
              ))}
            </div>
          </div>

          {/* Introduction message — the payoff moment */}
          <div className="card-gold" style={{ padding: '22px 20px' }}>
            <span className="app-badge badge-gold">Ready to send</span>
            <p className="section-title" style={{ marginTop: 12 }}>Your introduction message</p>
            <p className="section-subtitle">
              Built from your profile answers. Edit it before sending — make it sound like you.
            </p>
            <div style={{
              marginTop: 16, padding: '16px',
              borderRadius: 'var(--radius-card)',
              background: 'rgba(0,0,0,0.20)',
              border: '1px solid var(--gold-border)',
              whiteSpace: 'pre-line',
            }}>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}>
                {unlock.introduction.introduction}
              </p>
            </div>
            <CopyBtn text={unlock.introduction.introduction} />
          </div>

          </>)}

          {/* Final CTA — only shown once actually unlocked */}
          {isUnlocked && (
          <div style={{
            padding: '28px 20px', borderRadius: 'var(--radius-hero)', textAlign: 'center',
            background: 'linear-gradient(150deg, rgba(201,168,76,0.10) 0%, rgba(76,141,255,0.08) 100%)',
            border: '1px solid var(--gold-border)',
          }}>
            <span className="app-badge badge-gold">Rental picture complete</span>
            <p className="section-title" style={{ marginTop: 12 }}>
              You now know more than most renters before they apply
            </p>
            <p className="section-subtitle" style={{ marginTop: 8 }}>
              Save this page. Come back when you find a new property. Switch the property to re-run the analysis.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-gold" style={{ marginTop: 20 }}>
              Go to my dashboard
            </button>
            <button
              onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="btn-secondary" style={{ marginTop: 10 }}
            >
              Review from the beginning
            </button>
          </div>
          )}

        </div>
      )}

    </div>
  )
}
