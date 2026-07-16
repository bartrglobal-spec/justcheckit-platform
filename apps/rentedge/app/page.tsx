'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ── Animated demo gauge ──────────────────────────────────
// Purely illustrative — cycles through preset example states on a loop.
// Deliberately NOT the shared NeedleGauge used on Dashboard/Unlock: those
// render real user data and shouldn't grow animation/cycling behaviour
// just for this homepage demo. Self-contained so it can't affect either.
function HomeDemoGauge() {
  const states = [
    { value: '2.1x', label: 'Affordability at this rent' },
    { value: '2.6x', label: 'If you added a guarantor' },
    { value: '3.4x', label: 'At a slightly lower rent' },
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % states.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="180" height="120" viewBox="0 0 180 120">
          <defs>
            <linearGradient id="homeGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--danger, #e05656)" />
              <stop offset="50%" stopColor="var(--warning, #e0c056)" />
              <stop offset="100%" stopColor="var(--success, #56b876)" />
            </linearGradient>
          </defs>
          <path
            d="M 15 105 A 75 75 0 0 1 165 105"
            fill="none"
            stroke="url(#homeGaugeGrad)"
            strokeWidth={12}
            strokeLinecap="round"
            opacity={0.9}
          />
          <g className="home-gauge-needle">
            <line x1="90" y1="105" x2="90" y2="40" stroke="var(--text-primary)" strokeWidth={3} strokeLinecap="round" />
            <circle cx="90" cy="105" r="5" fill="var(--text-primary)" />
          </g>
        </svg>
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', margin: '6px 0 0', letterSpacing: '-0.02em' }}>
        {states[index].value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: '2px 0 0' }}>
        {states[index].label}
      </p>

      {/* Slowed down from the first pass — holds ~2.5s at each value, then
          glides smoothly over ~1.5s on a single easing curve. The earlier,
          faster version snapped between values and read as glitchy rather
          than alive. */}
      <style>{`
        .home-gauge-needle {
          transform-origin: 90px 105px;
          animation: needleSweepHomepage 12s cubic-bezier(0.45, 0, 0.2, 1) infinite;
        }
        @keyframes needleSweepHomepage {
          0%     { transform: rotate(-55deg); }
          20.8%  { transform: rotate(-55deg); }
          33.3%  { transform: rotate(-10deg); }
          54.2%  { transform: rotate(-10deg); }
          66.6%  { transform: rotate(35deg); }
          87.5%  { transform: rotate(35deg); }
          100%   { transform: rotate(-55deg); }
        }
      `}</style>
    </div>
  )
}

// ── Downloadable PDF proof card ──────────────────────────
// Shows the deliverable is real and specific WITHOUT revealing any actual
// message text — deliberately traded the earlier "read the intro message"
// version for this, since showing the real payoff up front reduced the
// reason to actually go through the check.
function PdfProofCard() {
  const items = [
    'Your affordability check',
    'Document readiness checklist',
    'A ready-to-send introduction message',
  ]
  return (
    <div className="card" style={{ borderColor: 'var(--gold-border)' }}>
      <p className="app-eyebrow" style={{ color: 'var(--gold-text)' }}>Yours to download</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        {/* Small stylised document thumbnail — blurred placeholder lines only */}
        <div style={{
          width: 50, height: 64, flexShrink: 0, position: 'relative',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
          borderRadius: 5, padding: '10px 7px',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 12, height: 12,
            background: 'var(--border-soft)', borderRadius: '0 5px 0 6px',
          }} />
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-soft)', width: '85%', marginBottom: 5 }} />
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-soft)', width: '60%', marginBottom: 5 }} />
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-soft)', width: '70%', marginBottom: 5 }} />
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-soft)', width: '50%' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>RentEdge-Summary.pdf</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>One page. Ready to send.</p>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((text, i) => (
          <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            <span style={{ color: 'var(--success)', marginRight: 6 }}>✓</span>{text}
          </p>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
        Built from your real answers. Downloadable the moment your check is done.
      </p>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()

  // Redirect check only matters for RETURNING visitors with saved data — a
  // fresh visitor has empty localStorage, so this never fires for them.
  // Content renders immediately regardless; the redirect happens quietly
  // in the background if it applies.
  useEffect(() => {
    const navEntry = performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined
    const isReload = navEntry?.type === 'reload'
    const isBackForward = navEntry?.type === 'back_forward'
    const isFreshLoad = !navEntry || navEntry.type === 'navigate'
    if (isFreshLoad && !isReload && !isBackForward) {
      const profileComplete = localStorage.getItem('rentedge_profile_complete') === 'true'
      if (profileComplete) { router.replace('/dashboard'); return }
      const properties = localStorage.getItem('rentedge_properties')
      if (properties && properties !== '[]') { router.replace('/check') }
    }
  }, [router])

  const howItWorks = [
    { step: '01', label: 'Add the properties you are considering', sub: 'Paste a listing link or enter the details manually' },
    { step: '02', label: 'Tell us about your rental situation', sub: 'Income, history, readiness - a few quick questions' },
    { step: '03', label: 'Get your ready-to-send strategy', sub: 'Specific to your profile and your target properties' },
    { step: '04', label: 'Know what agents check first', sub: 'See exactly what stands out before you apply', accent: true },
  ]

  // App-shell layout: the outer div is pinned to the full viewport with
  // `position: fixed; inset: 0`, and ONLY the inner content div scrolls.
  // The CTA bar below is a normal flex child, not independently
  // `position: fixed` — so there's no separate page-level scroll for a
  // mobile browser's collapsing address bar / in-app-browser chrome to
  // desync from. Previously the CTA was `position: fixed; bottom: 0`
  // against the page's own scroll, which is exactly the setup that causes
  // the bar to render below the visible viewport on Facebook's in-app
  // browser and some mobile Safari cases — it "existed" but wasn't
  // reachable without an extra scroll.
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated, #14171c)' }}>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 16px' }}>

      <div style={{ paddingTop: 32, paddingBottom: 8 }}>
        <span className="app-eyebrow" style={{ letterSpacing: '0.28em' }}>RENTEDGE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, paddingTop: 24, paddingBottom: 24 }}>

        {/* ── Hero ── */}
        <div className="card-hero">
          <span className="app-badge badge-gold">South Africa - Free during beta</span>

          <h1 style={{ marginTop: 20, fontSize: 27, fontWeight: 660, lineHeight: 1.28, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            See where you stand.<br />
            Have your strategy ready.<br />
            <span style={{ color: 'var(--gold-text)' }}>Don&apos;t be the one still scrambling.</span>
          </h1>

          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            Rentals in high-demand areas are moving fast — the renter who&apos;s ready first usually has the edge.
          </p>

          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No account, nothing stored. Your income details stay on your device.
            </p>
          </div>
        </div>

        {/* ── Animated demo gauge ── */}
        <div className="card">
          <p className="app-eyebrow" style={{ textAlign: 'center' }}>This is what you&apos;ll see</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
            A real read on where you stand — not a guess.
          </p>
          <HomeDemoGauge />
        </div>

        {/* ── Downloadable PDF proof ── */}
        <PdfProofCard />

        {/* ── How it works (now 4 lines) ── */}
        <div className="card">
          <p className="label">How it works</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {howItWorks.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                  background: item.accent ? 'var(--gold-soft)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${item.accent ? 'var(--gold-border)' : 'var(--border-soft)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: item.accent ? 'var(--gold-text)' : 'var(--text-muted)',
                }}>{item.step}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: item.accent ? 700 : 600, color: item.accent ? 'var(--gold-text)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.label}
                  </p>
                  <p style={{ marginTop: 3, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      </div>
      {/* ↑ closes the scrollable content div. Everything below is OUTSIDE
          the scroll area — a normal flex child pinned to the bottom of the
          fixed-size app shell, not independently viewport-fixed. This is
          what actually keeps it reachable across mobile browsers. */}

      {/* CTA bar — no longer position:fixed. It's guaranteed visible
          because it's the last child of a fixed, full-viewport flex
          column; there's no separate scrolling context for it to fall
          outside of. */}
      <div style={{
        flexShrink: 0,
        padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--surface-elevated, #14171c)',
        borderTop: '1px solid var(--border-soft)',
      }}>
        <button className="btn-primary" onClick={() => router.push('/check')} style={{ width: '100%' }}>
          Check my rental position - free
        </button>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
          Free during beta - No account - South Africa
        </p>
      </div>

    </div>
  )
}
