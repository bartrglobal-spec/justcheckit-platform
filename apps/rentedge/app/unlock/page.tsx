'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { evaluateProperty } from '@/lib/evaluation'
import { evaluateProperties } from '@/lib/evaluation/portfolio'
import { evaluateUnlock } from '@/lib/evaluation/unlock'
import { getAffordabilityThresholds, getPropertyClass } from '@/lib/evaluation/helpers'
import posthog from 'posthog-js'
import PdfCaptureModal from './PdfCaptureModal'
import PropertyHeader from './PropertyHeader'
import InsightsTab from './InsightsTab'
import { NeedleGauge } from '@/components/NeedleGauge'
import { buildRenterProfile } from '@/lib/renterProfile'
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

// Reduced from 6 tabs to 4 — Opportunities, Strengths, and Agent View merged
// into one Insights tab. Four fits as a fixed, non-scrolling row on mobile,
// which removes the "hidden tabs" discovery problem entirely.
type Tab = 'overview' | 'insights' | 'properties' | 'strategy'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'insights',   label: 'Insights' },
  { id: 'properties', label: 'Properties' },
  { id: 'strategy',   label: 'Strategy' },
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

// Upfront costs shown on Overview. Deposit is estimated at 1.5x-2x rent
// (typical local range), first month is the rent itself, admin fee is a
// flat estimate since the profile doesn't currently capture a specific
// agency's fee. The headline total uses the low end of each range with a
// "+" suffix, since the true number depends on the specific landlord.
function computeUpfrontCosts(rent: number) {
  const depositLow = Math.round(rent * 1.5)
  const depositHigh = rent * 2
  const firstMonth = rent
  const adminLow = 800
  const adminHigh = 1200
  const total = depositLow + firstMonth + adminLow
  return { depositLow, depositHigh, firstMonth, adminLow, adminHigh, total }
}

const FINANCIAL_STRENGTH_LABEL: Record<string, string> = {
  strong: 'Strong',
  stable: 'Stable',
  stretched: 'Stretched',
  pressured: 'Pressured',
}

const FIT_LABEL: Record<string, string> = {
  strong: 'Strong',
  borderline: 'Competitive',
  weak: 'Needs work',
}

const FIT_COLOUR: Record<string, string> = {
  strong: 'var(--success)',
  borderline: 'var(--warning)',
  weak: 'var(--danger)',
}

// ── PDF payload helpers ─────────────────────────────────────
// depositReadiness only ever holds these three exact strings from the
// adaptive profile question — never a specific rand amount.
function mapDepositStatus(value: string): 'ready' | 'partial' | 'not-ready' {
  if (value === 'Yes') return 'ready'
  if (value === 'Partially') return 'partial'
  return 'not-ready'
}

// guarantorSupport and referenceAvailability are status-only fields — no
// contact details are captured anywhere in the profile — so these produce
// plain status sentences rather than inventing contact info that isn't there.
// Now reads the resolved status from renter.guarantorStatus (built once in
// buildRenterProfile) instead of re-parsing the raw profile answer here —
// previously this and the readiness engine could disagree on what
// "Possibly" meant.
function buildGuarantorText(status: 'yes' | 'possibly' | 'no'): string {
  if (status === 'yes') return 'A guarantor is available if required.'
  if (status === 'possibly') return 'Guarantor support may be available — happy to confirm if needed.'
  return 'No guarantor currently arranged.'
}

function buildReferenceContactText(value: string): string {
  if (value === 'Available') return 'Landlord reference available on request.'
  if (value === 'Possibly') return 'Reference may be available — confirming details.'
  return 'No landlord reference currently available.'
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

// ── Affordability dial — real gauge, real ratio, used in the switcher and explorer ──
function AffordabilityDial({ ratio, size = 70, highlight = false }: { ratio: number; size?: number; highlight?: boolean }) {
  const gradientId = useId()
  const clamped = Math.max(0, Math.min(ratio, 5))
  const angle = (clamped / 5) * 180 - 90
  const height = size * (40 / 70)
  return (
    <svg width={size} height={height} viewBox="0 0 70 40" role="img" aria-label={`Affordability dial, ${ratio.toFixed(1)} times rent`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E24B4A" />
          <stop offset="35%" stopColor="#EF9F27" />
          <stop offset="65%" stopColor="#639922" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      <path d="M 5 35 A 30 30 0 0 1 65 35" fill="none" stroke={`url(#${gradientId})`} strokeWidth={highlight ? 6 : 5} strokeLinecap="round" />
      <line x1="35" y1="35" x2="24" y2="14" stroke="#fff" strokeWidth={2} strokeLinecap="round" transform={`rotate(${angle} 35 35)`} />
      <circle cx="35" cy="35" r="2.5" fill="#fff" />
    </svg>
  )
}

// ── Focus item — collapsible, used on the Strategy tab ─────
function FocusItem({ index, what, why, impact }: { index: number; what: string; why: string; impact: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 'var(--radius-card)',
      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
    }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)',
        }}>{index}</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{what}</p>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 3, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease',
        }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, marginLeft: 40 }}>
          <p className="body-text" style={{ fontSize: 13 }}>{why}</p>
          <div className="card-accent" style={{ marginTop: 10 }}>
            <p className="label" style={{ color: 'var(--accent-primary)' }}>Potential impact</p>
            <p className="body-text" style={{ marginTop: 4, fontSize: 12 }}>{impact}</p>
          </div>
        </div>
      )}
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
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfDownloading, setPdfDownloading] = useState(false)

  // Populated later by the agent-referral capture mechanism (separate work,
  // not part of this page) — reads a simple stored agent name if a renter
  // arrived via an agent's referral link. Stays null for organic traffic,
  // which is everyone right now, so this renders nothing until that
  // capture mechanism exists.
  const [referringAgent, setReferringAgent] = useState<string | null>(null)

  // ── Unlock state ─────────────────────────────────────
  // { all: true } once the bundle is purchased, or propertyIds contains
  // individually-unlocked property ids. Persisted to localStorage for now —
  // TODO(payfast): once the Payfast ITN webhook is wired up, this should be
  // read from / written to the backend (Supabase) after a confirmed once-off
  // payment, not just localStorage on the client.
  const [unlockState, setUnlockState] = useState<{ all: boolean; propertyIds: number[] }>({ all: false, propertyIds: [] })

  // ── Explorer state ────────────────────────────────────
  // Drives the "explore your affordability" section on Overview. Starts out
  // null so it can be seeded from the real profile once it loads; every
  // recalculation calls the real evaluateProperty/evaluateProperties
  // functions with this hypothetical income instead of approximating the
  // math client-side, so the numbers shown are always genuinely correct.
  const [exploreIncome, setExploreIncome] = useState<number | null>(null)
  const [exploreGuarantor, setExploreGuarantor] = useState(false)

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
    // TODO(agent-referral): this key doesn't get written anywhere yet — the
    // capture mechanism (agent link → stored on entry) is separate future
    // work. Reading it here now means the Strategy tab slot is ready to go
    // live the moment that capture step exists, with no further page changes.
    const savedAgent = localStorage.getItem('rentedge_referring_agent')
    if (savedAgent) setReferringAgent(savedAgent)
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && profile && exploreIncome === null) {
      setExploreIncome(Number(profile?.monthlyIncome || 0))
      setExploreGuarantor(profile?.guarantorSupport === 'Yes')
    }
  }, [ready, profile, exploreIncome])

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
    const cleanTitleValue = rawTitle
      .replace(/property24/gi, '')
      .replace(/\|.*$/, '')
      .replace(/-?\s*p\d+.*$/i, '')
      .replace(/to rent/gi, '')
      .replace(/for rent/gi, '')
      .replace(/r\s?\d[\d\s,]*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    // Area now gets the same defensive cleaning as title. Previously this
    // was used raw — if a scrape (or manual entry) ever put site names,
    // IDs, or a full address blob into `area`, it flowed straight into the
    // intro message with nothing to catch it. This is the safety net;
    // /api/scrape is the actual fix for where the bad data came from.
    const cleanArea = (p.area || '')
      .replace(/property24/gi, '')
      .replace(/\|.*$/, '')
      .replace(/-?\s*p\d+.*$/i, '')
      .replace(/r\s?\d[\d\s,]*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\d+\s+\S+.*$/, '') // drop street-address-looking values, e.g. "34 Cathedral Street"
      .trim()

    const area = cleanArea

    // If the cleaned title already contains the area name, don't set location
    // — prevents "I came across X in X" duplication in the intro message
    const titleContainsArea = area.length > 3 &&
      cleanTitleValue.toLowerCase().includes(area.toLowerCase())

    return {
      ...p,
      label: cleanTitleValue || area || 'Property',
      title: cleanTitleValue,
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

  // Now reads renter.employment directly instead of re-matching keywords
  // against the raw profile.incomeSource — renter.employment is already
  // normalized to "self-employed" for self-employed/freelance/contract by
  // buildRenterProfile, so this now agrees with what the scoring engine
  // (getFinancialRank / evaluatePressure) actually used.
  const isSelfEmpl  = renter.employment === 'self-employed'

  const posLabel  = FIT_LABEL[evaluation.fit]
  const posColour = FIT_COLOUR[evaluation.fit]

  const posBg =
    evaluation.fit === 'strong'     ? 'var(--success-soft)'
    : evaluation.fit === 'borderline' ? 'var(--warning-soft)'
    : 'var(--danger-soft)'

  const posBorder =
    evaluation.fit === 'strong'     ? 'var(--success-border)'
    : evaluation.fit === 'borderline' ? 'var(--warning-border)'
    : 'var(--danger-border)'

  // ── Required docs list (user-specific) ───────────────
  const gaps: string[] = profile?.documentationGaps?.filter((g: string) => g !== 'none') || []
  const docList = [
    { doc: 'Certified ID copy',                                              done: !gaps.includes('ID Document') },
    { doc: isSelfEmpl ? '6 months bank statements' : '3 months bank statements', done: !gaps.includes('Bank Statements') },
    { doc: isSelfEmpl ? '6 months payslips or financial statements' : '3 months payslips', done: !gaps.includes('Payslips') },
    // These two now read the resolved renter fields (built once in
    // buildRenterProfile) instead of re-checking raw profile fields here —
    // this is the same 6-document count the evaluation engine's
    // readinessProfile now uses, so the header's "X of 6" and the engine's
    // internal readiness always describe the same 6 things.
    { doc: 'Employment confirmation letter',                                 done: renter.employmentConfirmationReady },
    { doc: 'Landlord reference contact details',                             done: renter.referencesReady },
    { doc: `Deposit ready — up to R${(rent * 2).toLocaleString()} (2x rent)`, done: profile?.depositReadiness === 'Yes' },
  ]

  const docsReadyCount = docList.filter(d => d.done).length
  const docsTotal = docList.length
  const depositStatus = mapDepositStatus(profile?.depositReadiness)

  // ── Overview additions: real per-property thresholds, upfront costs, explorer ──
  const propertyClass = getPropertyClass(selectedInput)
  const thresholds = getAffordabilityThresholds(propertyClass)
  const upfrontCosts = computeUpfrontCosts(rent)

  const effectiveIncome = exploreIncome ?? renter.income
  const exploreRenter = {
    ...renter,
    income: effectiveIncome,
    guarantorAvailable: exploreGuarantor,
    guarantorStatus: (exploreGuarantor ? 'yes' : 'no') as 'yes' | 'no',
  }
  const explorePortfolio = evaluateProperties(exploreRenter, propertiesInput)
  const exploreSelected =
    explorePortfolio.find(e => e.property.id === selectedProperty.id) || explorePortfolio[0]

  const maxScale = thresholds.strong * 1.4
  const barPct = (v: number) => Math.min(Math.max(v, 0) / maxScale, 1) * 100
  const barGradient =
    `linear-gradient(to right, #E24B4A 0%, #E24B4A ${barPct(thresholds.stretched)}%, ` +
    `#EF9F27 ${barPct(thresholds.stretched)}%, #EF9F27 ${barPct(thresholds.stable)}%, ` +
    `#8BC34A ${barPct(thresholds.stable)}%, #8BC34A ${barPct(thresholds.strong)}%, ` +
    `#1D9E75 ${barPct(thresholds.strong)}%, #1D9E75 100%)`

  // Builds the real payload from the same data already driving this page,
  // calls the PDF API, and triggers a browser download of the result.
  const handleDownloadPdf = async (contact: { name: string; phone: string; email: string }) => {
    setPdfDownloading(true)
    try {
      const payload = {
        applicantName: contact.name,
        phone: contact.phone,
        email: contact.email,
        propertyTitle: cleanTitle(selectedProperty.area || selectedProperty.title),
        rent,
        income,
        ratio: Number(ratio.toFixed(1)),
        isSelfEmployed: isSelfEmpl,
        documents: {
          idReady: renter.idReady,
          bankStatementsReady: renter.bankStatementsReady,
          payslipsReady: renter.payslipReady,
          employmentConfirmationReady: renter.employmentConfirmationReady,
          referenceReady: renter.referencesReady,
          depositStatus: mapDepositStatus(profile?.depositReadiness),
        },
        // Now passes the resolved renter.guarantorStatus instead of the raw
        // profile.guarantorSupport string — buildGuarantorText's signature
        // changed to match.
        guarantorText: buildGuarantorText(renter.guarantorStatus),
        referenceContactText: buildReferenceContactText(profile?.referenceAvailability),
        introMessage: unlock.introduction.introduction,
      }

      const res = await fetch('/api/summary-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('PDF generation failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'RentEdge-Summary.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
      alert('Something went wrong generating your PDF. Please try again.')
    } finally {
      setPdfDownloading(false)
    }
  }

  const isUnlocked = BETA_FREE_ACCESS || unlockState.all || unlockState.propertyIds.includes(selectedProperty.id)

  // ═══════════════════════════════════════════════════════
  return (
    <div style={{ paddingTop: 8 }}>

      {/* ══ HEADER — About you (constant) + This property (per-property) ══ */}
      {/* Documents and deposit come from the profile and don't change when
          switching properties; only the affordability gauge and property
          name/badge do. Replaces the old dual hero/context-bar pattern. */}
      <PropertyHeader
        properties={properties}
        selectedId={selectedId}
        onSelectProperty={selectProperty}
        docsReadyCount={docsReadyCount}
        docsTotal={docsTotal}
        depositStatus={depositStatus}
        selectedProperty={selectedProperty}
        ratio={ratio}
        posLabel={posLabel}
        posColour={posColour}
        posBg={posBg}
        posBorder={posBorder}
      />

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

      {/* ══ TAB BAR — fixed, 4 tabs, no scrolling needed ══ */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
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
                padding: '9px 6px',
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

          {/* Verdict headline — leads with a sentence, not a number */}
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              {cleanTitle(selectedProperty.area || selectedProperty.title)} · R{rent.toLocaleString()}/mo
            </p>
            <p className="section-title" style={{ marginTop: 4 }}>{posLabel} fit for this property</p>
          </div>

          {/* Do this first — the single top-ranked gap from the engine, always
              visible, never behind a tap. */}
          {unlock.focusAreas[0] && (
            <div className="card" style={{
              border: '1px solid var(--gold-border)',
              background: 'linear-gradient(150deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 100%)',
            }}>
              <p className="app-eyebrow" style={{ color: 'var(--gold-text)' }}>Do this first</p>
              <p style={{ fontSize: 16, fontWeight: 600, marginTop: 8, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                {unlock.focusAreas[0].what}
              </p>
              <p className="body-text" style={{ marginTop: 8 }}>{unlock.focusAreas[0].why}</p>
            </div>
          )}

          {/* Readiness snapshot — documents, deposit, and real upfront costs,
              all visible without a tap. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="card-inner">
              <p className="label">Documents</p>
              <p style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{docsReadyCount} of {docsTotal}</p>
            </div>
            <div className="card-inner" style={{ background: 'var(--success-soft)', border: '1px solid var(--success-border)' }}>
              <p className="label" style={{ color: 'var(--success)' }}>Deposit</p>
              <p style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--success)' }}>
                {depositStatus === 'ready' ? 'Ready' : depositStatus === 'partial' ? 'Partial' : 'Not ready'}
              </p>
            </div>
          </div>

          <div className="card-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p className="label">Upfront costs to have ready</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>R{upfrontCosts.total.toLocaleString()}+</p>
            </div>
            <p className="body-text" style={{ marginTop: 8, fontSize: 12 }}>
              Deposit R{upfrontCosts.depositLow.toLocaleString()}–R{upfrontCosts.depositHigh.toLocaleString()}
              {' · '}first month R{upfrontCosts.firstMonth.toLocaleString()}
              {' · '}admin R{upfrontCosts.adminLow.toLocaleString()}–R{upfrontCosts.adminHigh.toLocaleString()}
            </p>
          </div>

          {/* Property switcher — real dial per tracked property, driven by
              evaluateProperties, not a flat inline ratio. */}
          {properties.length > 0 && (
            <div>
              <p className="label" style={{ marginBottom: 8 }}>Your tracked properties</p>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {explorePortfolio.map(({ property, evaluation: pe }) => {
                  const isSelected = property.id === selectedProperty.id
                  return (
                    <div
                      key={property.id}
                      onClick={() => property.id !== undefined && selectProperty(property.id)}
                      style={{
                        flex: '0 0 auto', minWidth: 104, borderRadius: 'var(--radius-card)',
                        padding: '10px 12px', cursor: 'pointer',
                        border: isSelected ? '2px solid var(--gold-border)' : '1px solid var(--border-soft)',
                        background: isSelected ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <AffordabilityDial ratio={pe.affordabilityRatio} size={64} highlight={isSelected} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', marginTop: 2 }}>
                        {pe.affordabilityRatio.toFixed(1)}x
                      </p>
                      <p style={{
                        fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {cleanTitle(property.label)}
                      </p>
                      <p style={{ fontSize: 10.5, textAlign: 'center', marginTop: 2, color: FIT_COLOUR[pe.fit] }}>
                        {FIT_LABEL[pe.fit]}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Affordability explorer — real evaluateProperty math, not a
              client-side approximation. Guarantor toggle changes
              readinessProfile + pressureScore the same way it does in the
              real engine, so the shift shown here is the shift that
              actually happens. */}
          <div className="card-inner">
            <p className="label" style={{ marginBottom: 8 }}>Explore your affordability</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AffordabilityDial ratio={exploreSelected.evaluation.affordabilityRatio} size={130} highlight />
              <p style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>
                {exploreSelected.evaluation.affordabilityRatio.toFixed(1)}x
              </p>
              <p className="body-text" style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Financial strength: <strong>{FINANCIAL_STRENGTH_LABEL[exploreSelected.evaluation.financialStrength]}</strong>
              </p>
            </div>

            <div style={{ position: 'relative', height: 8, borderRadius: 4, marginTop: 16, background: barGradient }}>
              <div style={{
                position: 'absolute', top: -3, width: 2, height: 14, background: '#fff',
                left: `${barPct(exploreSelected.evaluation.affordabilityRatio)}%`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0x</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Strong at {thresholds.strong.toFixed(1)}x</span>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="exploreIncome" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Try a different monthly income
                </label>
                <span style={{ fontSize: 14, fontWeight: 600 }}>R{effectiveIncome.toLocaleString()}</span>
              </div>
              <input
                id="exploreIncome"
                type="range"
                min={5000}
                max={Math.max(100000, renter.income * 2)}
                step={500}
                value={effectiveIncome}
                onChange={(e) => setExploreIncome(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={exploreGuarantor} onChange={(e) => setExploreGuarantor(e.target.checked)} />
                With a guarantor
              </label>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                This is just exploring — it does not change your saved profile.
              </p>
            </div>
          </div>

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

          {/* Urgency framing — in a tight vacancy market, being first with a complete
              application often beats being the strongest applicant who's slow. */}
          <div style={{
            padding: '14px 16px', borderRadius: 'var(--radius-card)',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⏱</span>
            <p className="body-text" style={{ fontSize: 13 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Speed matters as much as fit.</strong> Rental vacancy nationally sits near record lows, so agents are often choosing between several complete applications submitted within hours of a viewing. Have your documents ready before you view — the fastest complete application frequently wins over a stronger but slower one.
            </p>
          </div>

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

          <button onClick={() => switchTab('insights')} className="btn-gold">
            {isUnlocked ? 'See your personalised insights →' : 'Unlock your full rental strategy →'}
          </button>
        </div>
      )}

      {/* ══ TAB: INSIGHTS (merged Opportunities + Strengths + Agent View + Resources) ══ */}
      {activeTab === 'insights' && (
        <div className="section-gap">

          <div className="card card-elevated">
            <p className="app-eyebrow">Personalised to your profile</p>
            <p className="section-title" style={{ marginTop: 8 }}>
              {unlock.opportunities.length + unlock.strengths.length + unlock.agentQuestions.length} things worth knowing
            </p>
            <p className="section-subtitle">
              Opportunities, strengths, likely agent questions, and reference material. Tap any card to expand it.
            </p>
          </div>

          {!isUnlocked ? (
            <PaywallGate
              itemCount={unlock.opportunities.length + unlock.strengths.length + unlock.agentQuestions.length}
              itemNoun="insights"
              teaserTitle={unlock.opportunities[0]?.title || 'Your top opportunity'}
              teaserBody={unlock.opportunities[0]?.explanation || ''}
              propertyCount={properties.length}
              onUnlockSingle={() => handleUnlockSingle(selectedProperty.id)}
              onUnlockBundle={handleUnlockBundle}
            />
          ) : (
            <InsightsTab
              opportunities={unlock.opportunities}
              strengths={unlock.strengths}
              agentQuestions={unlock.agentQuestions}
              rent={rent}
              selectedPropertyLabel={cleanTitle(selectedProperty.area || selectedProperty.title)}
              depositReady={renter.depositReady}
              docList={docList}
              isSelfEmpl={isSelfEmpl}
              referenceAvailable={renter.referencesReady}
            />
          )}

          <button onClick={() => switchTab('properties')} className="btn-primary">
            {isUnlocked ? 'Compare your properties →' : 'See what else is behind Properties →'}
          </button>
        </div>
      )}

      {/* ══ TAB: PROPERTIES ══════════════════════════════ */}
      {activeTab === 'properties' && (
        <div className="section-gap">

          <div className="card card-elevated">
            <p className="app-eyebrow">Property-specific analysis</p>
            <p className="section-title" style={{ marginTop: 8 }}>Same renter. Different property. Different picture.</p>
            <p className="section-subtitle">
              Switching the property in the header above re-runs the analysis against your profile. Your strengths stay the same — what changes is how they are weighted against each property's requirements.
            </p>
          </div>

          {/* Quick affordability comparison across every tracked property —
              documents and deposit don't vary per property (see header), so
              only affordability needs repeating here. */}
          {properties.length > 1 && (
            <div className="card card-elevated">
              <p className="app-eyebrow">Compare at a glance</p>
              <p className="section-subtitle" style={{ marginTop: 4, marginBottom: 4 }}>
                Affordability for each property you're tracking, based on your income.
              </p>
              <div style={{
                display: 'flex', gap: 12, overflowX: 'auto', paddingTop: 8, paddingBottom: 2,
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
              }}>
                {properties.map(p => {
                  const pRatio = income > 0 && Number(p.rent) > 0 ? income / Number(p.rent) : 0
                  return (
                    <div key={p.id} style={{ flexShrink: 0, width: 92, textAlign: 'center' }}>
                      <NeedleGauge value={Math.min(pRatio / 5, 1)} label={`${pRatio.toFixed(1)}x`} sublabel="Affordability" size={80} />
                      <p style={{
                        fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {cleanTitle(p.area || p.title)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Switching properties happens in the header above — this tab
              only needs a nudge for people tracking just one property. */}
          {otherProps.length === 0 && (
            <div className="card-inner" style={{ textAlign: 'center' }}>
              <p className="body-text" style={{ fontSize: 13 }}>
                You have one property tracked. Add more in Check to compare how your profile performs against different rentals.
              </p>
              <button onClick={() => router.push('/check')} className="btn-ghost" style={{ marginTop: 8 }}>
                Add another property
              </button>
            </div>
          )}

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

          {/* Focus areas — engine output, collapsible so the list scans fast */}
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
                <FocusItem key={i} index={i + 1} what={focus.what} why={focus.why} impact={focus.impact} />
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
            {referringAgent && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                borderRadius: 'var(--radius-pill)', background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)', marginBottom: 14, width: 'fit-content',
              }}>
                <span style={{ fontSize: 12 }}>→</span>
                <p style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Sending to: {referringAgent}
                </p>
              </div>
            )}
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

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
              Includes your income ratio, document checklist, and this introduction message — one page, ready to send to an agent.
            </p>

            <button
              onClick={() => setShowPdfModal(true)}
              className="btn-primary"
              style={{ marginTop: 6, opacity: pdfDownloading ? 0.6 : 1 }}
              disabled={pdfDownloading}
            >
              {pdfDownloading ? 'Preparing your PDF…' : 'Download PDF'}
            </button>

            {showPdfModal && (
              <PdfCaptureModal
                onClose={() => setShowPdfModal(false)}
                onSubmit={async (contact) => {
                  setShowPdfModal(false)
                  await handleDownloadPdf(contact)
                }}
              />
            )}
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
