'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '0 16px' }}>

      <div style={{ paddingTop: 32, paddingBottom: 8 }}>
        <span className="app-eyebrow" style={{ letterSpacing: '0.28em' }}>RENTEDGE</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, paddingTop: 24, paddingBottom: 24 }}>

        <div className="card-hero">
          <span className="app-badge badge-gold">South Africa - Free during beta</span>

          <h1 style={{ marginTop: 20, fontSize: 28, fontWeight: 660, lineHeight: 1.2, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Know in 3 minutes what's holding your application back.
          </h1>

          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            Before you apply, see exactly how an agent or landlord will read your application, and what to fix first.
          </p>

          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No account, nothing stored. Your income details stay on your device.
            </p>
          </div>

          <div style={{ marginTop: 20, height: 1, background: 'var(--accent-border)' }} />

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Find out the exact rent you qualify for using the 3x income rule agents apply',
              'See the documents you need before they ask - most applicants get caught out here',
              'Get your free credit report the right way, before paying R250 for one',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ marginTop: 2, width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'var(--gold-soft)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gold-text)', fontWeight: 700 }}>✓</div>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="label">How it works</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { step: '01', label: 'Add the properties you are considering', sub: 'Paste a listing link or enter the details manually' },
              { step: '02', label: 'Tell us about your rental situation', sub: 'Income, history, readiness - a few quick questions' },
              { step: '03', label: 'Get your personalised rental strategy', sub: 'Specific to your profile and your target properties' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{item.step}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.label}</p>
                  <p style={{ marginTop: 3, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-inner" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { text: 'Built specifically for the South African rental market' },
            { text: 'Takes about 3 minutes to complete' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{item.text}</p>
            </div>
          ))}
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
        <button className="btn-primary" onClick={() => router.push('/check')}>
          Check my rental position - free
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          Free during beta - No account - South Africa
        </p>
      </div>

    </div>
  )
}