'use client'

import { useState } from 'react'

// No backend/CRM wired up yet, so submitting opens a pre-filled email to
// your inbox instead of hitting an API. Swap AGENT_CONTACT_EMAIL for your
// real inbox, and once there's somewhere to actually store these leads
// (a database, a CRM, even just a shared inbox with structure), this form
// can post to a real endpoint instead.
const AGENT_CONTACT_EMAIL = 'agents@rentedge.co.za' // TODO: confirm real inbox

function BenefitCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card-inner">
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
      <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{text}</p>
    </div>
  )
}

export default function AgentsLandingPage() {
  const [name, setName] = useState('')
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
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

    const subject = encodeURIComponent(`Agent signup — ${name.trim()}`)
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nAgency: ${agency.trim() || 'Not provided'}\nEmail: ${email.trim()}\nPhone: ${phone.trim() || 'Not provided'}`
    )
    window.location.href = `mailto:${AGENT_CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

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

        {sent ? (
          <div style={{
            padding: '14px 16px', borderRadius: 'var(--radius-card)',
            background: 'var(--success-soft)', border: '1px solid var(--success-border)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              Your email app should have opened with your details filled in.
            </p>
            <p className="body-text" style={{ marginTop: 6, fontSize: 12 }}>
              If it didn't, email us directly at {AGENT_CONTACT_EMAIL}.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Full name</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="input"
                />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Agency</p>
                <input
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="e.g. Smith & Co Properties"
                  className="input"
                />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Email address</p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@smithco.co.za"
                  className="input"
                />
              </div>
              <div>
                <p className="label" style={{ marginBottom: 6 }}>Phone number</p>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 082 123 4567"
                  className="input"
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10 }}>{error}</p>
            )}

            <button onClick={handleSubmit} className="btn-gold" style={{ marginTop: 16, width: '100%' }}>
              Request my link
            </button>
          </>
        )}
      </div>

    </div>
  )
}
