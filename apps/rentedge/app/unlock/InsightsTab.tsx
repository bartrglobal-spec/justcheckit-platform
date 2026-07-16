'use client'

import { useState } from 'react'
import InsightCard from './InsightCard'

type Filter = 'all' | 'opportunity' | 'strength' | 'agent' | 'resource' | 'faq'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'strength',    label: 'Strengths' },
  { id: 'agent',       label: 'For agents' },
  { id: 'resource',    label: 'Resources' },
  { id: 'faq',         label: 'FAQ' },
]

function InfoCard({ label, text, colour = 'var(--text-muted)' }: { label: string; text: string; colour?: string }) {
  return (
    <div className="card-inner">
      <p className="label" style={{ color: colour }}>{label}</p>
      <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{text}</p>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '4px 0 -2px' }}>
      {text}
    </p>
  )
}

export default function InsightsTab({
  opportunities, strengths, agentQuestions,
  rent, selectedPropertyLabel, depositReady, docList, isSelfEmpl, referenceAvailable,
}: {
  opportunities: { title: string; explanation: string; whyItMatters: string; benefit: string }[]
  strengths: { title: string; explanation: string; whyItMatters: string; keepDoing: string }[]
  agentQuestions: { question: string; howAgentsThink: string; howYouFit: string; whyWeSayThat: string; nextMove: string }[]
  rent: number
  selectedPropertyLabel: string
  depositReady: boolean
  docList: { doc: string; done: boolean }[]
  isSelfEmpl: boolean
  referenceAvailable: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const showAll = filter === 'all'

  return (
    <div className="section-gap">

      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {FILTERS.map(f => {
          const active = f.id === filter
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-soft)' : 'var(--border-soft)'}`,
                borderRadius: 999, padding: '6px 12px', cursor: 'pointer', outline: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* ── Opportunities ─────────────────────────────── */}
      {(showAll || filter === 'opportunity') && (
        <div className="section-gap" style={{ gap: 8 }}>
          {showAll && <SectionLabel text="Opportunities" />}
          {opportunities.map((opp, i) => (
            <InsightCard key={i} category="opportunity" title={opp.title}>
              <p className="body-text">{opp.explanation}</p>
              <InfoCard label="Why it matters" text={opp.whyItMatters} />
              <div className="card-success">
                <p className="label" style={{ color: 'var(--success)' }}>Potential benefit</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{opp.benefit}</p>
              </div>
            </InsightCard>
          ))}
        </div>
      )}

      {/* ── Strengths ──────────────────────────────────── */}
      {(showAll || filter === 'strength') && (
        <div className="section-gap" style={{ gap: 8 }}>
          {showAll && <SectionLabel text="Strengths" />}
          {strengths.map((s, i) => (
            <InsightCard key={i} category="strength" title={s.title}>
              <p className="body-text">{s.explanation}</p>
              <InfoCard label="Why this matters for your application" text={s.whyItMatters} />
              <div className="card-accent">
                <p className="label" style={{ color: 'var(--accent-primary)' }}>Keep doing this</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{s.keepDoing}</p>
              </div>
            </InsightCard>
          ))}
        </div>
      )}

      {/* ── For agents ─────────────────────────────────── */}
      {(showAll || filter === 'agent') && (
        <div className="section-gap" style={{ gap: 8 }}>
          {showAll && <SectionLabel text="For agents" />}
          {agentQuestions.map((q, i) => (
            <InsightCard key={i} category="agent" title={q.question}>
              <InfoCard label="How agents often think about this" text={q.howAgentsThink} />
              <InfoCard label="In your specific situation" text={q.howYouFit} colour="var(--text-secondary)" />
              <InfoCard label="Why we flagged this for you" text={q.whyWeSayThat} />
              <div className="card-accent">
                <p className="label" style={{ color: 'var(--accent-primary)' }}>What we would do next</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{q.nextMove}</p>
              </div>
            </InsightCard>
          ))}
        </div>
      )}

      {/* ── Resources — reference material, same for everyone ── */}
      {(showAll || filter === 'resource') && (
        <div className="section-gap" style={{ gap: 8 }}>
          {showAll && <SectionLabel text="Resources" />}

          <InsightCard category="resource" title="Know your TPN score before the agent does">
            <p className="body-text" style={{ fontSize: 13 }}>
              Almost every SA letting agent screens applicants through <strong>TPN (Tenant Profile Network)</strong> — not a generic credit bureau. TPN produces a <strong>Credex score from 0–10</strong>, colour-banded so agents can decide at a glance:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { band: '8 – 10', label: 'Low risk', colour: 'var(--success)' },
                { band: '6 – 7.9', label: 'Acceptable, some caution', colour: 'var(--warning)' },
                { band: '4 – 5.9', label: 'Medium-high risk — guarantor likely requested', colour: 'var(--warning)' },
                { band: '0 – 3.9', label: 'High risk — defaults or arrears usually present', colour: 'var(--danger)' },
              ].map(row => (
                <div key={row.band} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, minWidth: 52, textAlign: 'center',
                    padding: '2px 6px', borderRadius: 'var(--radius-pill)',
                    color: row.colour, border: `1px solid ${row.colour}`,
                  }}>{row.band}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{row.label}</span>
                </div>
              ))}
            </div>
            <p className="body-text" style={{ fontSize: 13 }}>
              Agents charge up to R250 to run this — but under the National Credit Act you're entitled to one free report per year from every bureau feeding into it. Pull yours first. You'll see the same picture the agent will, before they do.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'TPN RentCheck', detail: 'The exact report agents pull — request as an individual', url: 'https://www.tpn.co.za/guest/faq_tenant.aspx' },
                { name: 'ClearScore', detail: 'Free forever via Experian', url: 'https://www.clearscore.com/za' },
                { name: 'TransUnion SA', detail: 'Free once a year', url: 'https://www.transunion.co.za/product/annual-free-credit-report' },
                { name: 'Experian SA', detail: 'Free once a year', url: 'https://www.experian.co.za' },
                { name: 'Compuscan', detail: 'Free once a year', url: 'https://www.compuscan.co.za' },
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
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Under the Consumer Protection Act, agents may only charge for a credit check with your explicit consent. You can present your own recent report instead.
            </p>
          </InsightCard>

          <InsightCard category="resource" title="If your report isn't clean, it doesn't automatically end an application">
            <p className="body-text" style={{ fontSize: 13 }}>
              A large share of applicants have arrears, a default, or a judgment somewhere on file — you're not unusual, and agents see this often. What changes the outcome is how you handle it:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Raise it yourself, before the agent finds it. Being upfront reads as responsible; being caught out reads as hiding something.',
                'If you\u2019re settling a default or on a payment plan, bring proof — a letter from the creditor or a payment schedule carries real weight.',
                'A guarantor with a clean TPN and credit record can offset a weak score on its own.',
                'If a listing is fixed on the number, it may be faster to target a property where your income and references are strong enough to carry a borderline score.',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--warning)', flexShrink: 0, fontSize: 14 }}>·</span>
                  <p className="body-text" style={{ fontSize: 13 }}>{tip}</p>
                </div>
              ))}
            </div>
          </InsightCard>

          <InsightCard category="resource" title={`Upfront costs — what you need ready for ${selectedPropertyLabel}`}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Deposit (1.5–2x)', value: `R${(rent * 1.5).toLocaleString()} – R${(rent * 2).toLocaleString()}` },
                { label: 'First month rent', value: `R${rent.toLocaleString()}` },
                { label: 'Admin fee (est)', value: 'R800 – R1,200' },
                { label: 'Total to have ready', value: `R${(rent * 2.5 + 1000).toLocaleString()}+` },
              ].map(item => (
                <div key={item.label} className="card-inner">
                  <p className="label">{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 'var(--radius-sm)',
              background: depositReady ? 'var(--success-soft)' : 'var(--warning-soft)',
              border: `1px solid ${depositReady ? 'var(--success-border)' : 'var(--warning-border)'}`,
            }}>
              <p style={{ fontSize: 13, color: depositReady ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                {depositReady ? 'You indicated deposit is ready ✓' : 'You indicated deposit is not fully ready'}
              </p>
              <p className="body-text" style={{ marginTop: 4, fontSize: 12 }}>
                {depositReady
                  ? 'Keep these funds accessible. Properties can move quickly.'
                  : 'This is worth resolving before applying. Agents often ask for proof of deposit availability upfront.'}
              </p>
            </div>
          </InsightCard>

          <InsightCard category="resource" title={`${docList.filter(d => d.done).length} of ${docList.length} — full document checklist`}>
            {isSelfEmpl && (
              <p className="section-subtitle">
                As a self-employed applicant, agents require more documentation than salaried employees.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            {referenceAvailable && (
              <div className="card-inner">
                <p className="label">Make your reference count</p>
                <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>
                  Agents phone references directly — a reference who's unreachable or caught off guard counts against you almost as much as a bad one. Give your previous landlord a heads-up call, confirm the number on file is current, and mention you're applying so they're expecting the call.
                </p>
              </div>
            )}
          </InsightCard>

          <InsightCard category="resource" title="Application fees are not permitted">
            <p className="body-text">
              Under the Consumer Protection Act, agents cannot charge an application fee. They may only charge for services rendered — like credit checks — with your explicit consent.
            </p>
            <a href="https://www.theppra.org.za" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)',
                textDecoration: 'none',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Verify your agent on PPRA</p>
              <span style={{ color: 'var(--accent-primary)', fontSize: 14 }}>→</span>
            </a>
          </InsightCard>
        </div>
      )}

      {/* ── FAQ — common questions, same for everyone ─── */}
      {(showAll || filter === 'faq') && (
        <div className="section-gap" style={{ gap: 8 }}>
          {showAll && <SectionLabel text="FAQ" />}

          <InsightCard category="faq" title="Is RentEdge free?">
            <p className="body-text">
              Everything is free during our beta. If that changes, any paid unlock comes with a 7-day money-back guarantee — not useful, get a full refund, no questions asked.
            </p>
          </InsightCard>

          <InsightCard category="faq" title="Does this replace the agent's own checks?">
            <p className="body-text">
              No. RentEdge is prepared by you, based on information you provide, to speed up your application. It is not a substitute for the letting agent's own credit, reference, and affordability checks — they'll still run their own process.
            </p>
          </InsightCard>

          <InsightCard category="faq" title="Is my information safe?">
            <p className="body-text">
              Your profile answers and tracked properties are stored only in your own browser — nothing is sent to or stored on our servers. The one exception is generating your PDF summary: that information is used to build the document and returned straight to you, not saved anywhere.
            </p>
          </InsightCard>

          <InsightCard category="faq" title="How many properties can I track?">
            <p className="body-text">
              Up to 5 at a time. Switch between them from the property strip at the top of this page — your profile stays the same, only the affordability picture changes per property.
            </p>
          </InsightCard>

          <InsightCard category="faq" title="What if some of my documents aren't ready yet?">
            <p className="body-text">
              That's normal — RentEdge shows you exactly what's ready, partially ready, or missing, so you know what to prepare before applying. It won't stop you from using the tool in the meantime.
            </p>
          </InsightCard>
        </div>
      )}
    </div>
  )
}


