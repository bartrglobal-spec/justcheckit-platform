'use client'

import { useState } from 'react'

const AGENT_CONTACT_EMAIL = 'agents@rentedge.co.za' // TODO: confirm real inbox

function BenefitCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card-inner">
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
      <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{text}</p>
    </div>
  )
}

function LinkRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{label}</p>
      <div style={{
        marginTop: 6, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(0,0,0,0.15)', border: '1px solid var(--success-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="btn-ghost"
          style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="body-text" style={{ marginTop: 6, fontSize: 12 }}>{hint}</p>
    </div>
  )
}

export default function AgentsLandingPage() {
  const [name, setName] = useState('')
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ slug: string; id: string } | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          agency: agency.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again or email us directly.')
        return
      }
      setResult({ slug: data.slug, id: data.id })
    } catch {
      setError(`Something went wrong. Please try again, or email us directly at ${AGENT_CONTACT_EMAIL}.`)
    } finally {
      setSubmitting(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const referralLink = result ? `${origin}/r/${result.slug}` : ''
  const dashboardLink = result ? `${origin}/agent-dashboard/${result.id}` : ''

  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      <section>
        <p className="app-eyebrow">For letting agents</p>
        <h1 className="app-title" style={{ marginTop: 8 }}>
          Renters who arrive already qualified.
        </h1>
        <p className="section-subtitle" style={{ marginTop: 8 }}>
          RentEdge renters complete an income check, document readiness review, and reference check before they ever contact you — so the applications you receive are faster to process, not slower.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <BenefitCard
          title="Less admin"
          text="Income ratio, document checklist, and references arrive with the applicant — not chased after the fact."
        />
        <BenefitCard
          title="No cost, no signup"
          text="There's no account to create and nothing to pay. Applicants simply arrive better prepared."
        />
        <BenefitCard
          title="Your own link"
          text="Share a personal RentEdge link on listings, your signature, or a viewing sheet."
        />
        <BenefitCard
          title="You stay in control"
          text="RentEdge doesn't replace your own credit, reference, or affordability checks — it just speeds up getting there."
        />
      </div>

      <div className="card card-elevated">
        <p className="label" style={{ marginBottom: 4 }}>Get your agent link</p>
        <p className="section-subtitle" style={{ marginBottom: 16 }}>
          Leave your details and we'll set up your personal RentEdge link.
        </p>

        {result ? (
          <div style={{
            padding: '14px 16px', borderRadius: 'var(--radius-card)',
            background: 'var(--success-soft)', border: '1px solid var(--success-border)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              You're set up.
            </p>
            <p className="body-text" style={{ marginTop: 6, fontSize: 12 }}>
              New agent links are reviewed before they go live — we'll activate yours shortly.
            </p>

            <LinkRow
              label="Your referral link — share this on listings"
              value={referralLink}
              hint="Every renter who arrives through this link is tagged as sent by you."
            />
            <LinkRow
              label="Your private dashboard — bookmark this one"
              value={dashboardLink}
              hint="Only you have this link. It shows how many people have visited and reached out, no login needed. Don't share it publicly."
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Full name</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Smith" className="input" />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Agency</p>
                <input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="e.g. Smith & Co Properties" className="input" />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Email address</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@smithco.co.za" className="input" />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Phone number</p>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 082 123 4567" className="input" />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10 }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="btn-gold"
              style={{ marginTop: 16, width: '100%', opacity: submitting ? 0.6 : 1 }}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Request my link'}
            </button>
          </>
        )}
      </div>

    </div>
  )
}
