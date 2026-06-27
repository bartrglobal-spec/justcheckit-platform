'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────

type Profile = {
  income: string
  additionalIncome: string
  employment: string
  duration: string
  occupants: string
  pets: string
  smoking: string
  depositReady: boolean
  idReady: boolean
  payslipReady: boolean
  bankStatementsReady: boolean
  referencesReady: boolean
  guarantorAvailable: boolean
  evictionHistory: string
}

const EMPTY: Profile = {
  income: '',
  additionalIncome: '',
  employment: '',
  duration: '',
  occupants: '1',
  pets: '',
  smoking: '',
  depositReady: false,
  idReady: false,
  payslipReady: false,
  bankStatementsReady: false,
  referencesReady: false,
  guarantorAvailable: false,
  evictionHistory: 'No',
}

// ─── Step definitions ─────────────────────────────────────

const STEPS = [
  {
    id: 'income',
    eyebrow: 'Step 1 of 4',
    title: 'Your income',
    why: 'The first thing an agent wants to understand is whether the rent is affordable. There\'s no judgment here — we just need the numbers to give you useful insight.',
  },
  {
    id: 'situation',
    eyebrow: 'Step 2 of 4',
    title: 'Your situation',
    why: 'Agents think about who will be living in the property. More people isn\'t necessarily a problem — but knowing your situation helps us show you how it may be viewed.',
  },
  {
    id: 'documents',
    eyebrow: 'Step 3 of 4',
    title: 'What you have ready',
    why: 'Prepared applicants move faster and often get preference. Tick what you already have — even partial readiness is useful to know.',
  },
  {
    id: 'history',
    eyebrow: 'Step 4 of 4',
    title: 'One last thing',
    why: 'This is the last question. Being upfront about your history helps us give you better advice about how to approach your application.',
  },
]

// ─── Small reusable components ────────────────────────────

function ChipSelect({
  options,
  value,
  onSelect,
}: {
  options: string[]
  value: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          style={{
            padding: '10px 18px',
            borderRadius: '999px',
            border: value === opt
              ? '1px solid var(--accent-border)'
              : '1px solid var(--border-soft)',
            background: value === opt
              ? 'var(--accent-soft)'
              : 'rgba(255,255,255,0.03)',
            color: value === opt
              ? 'var(--accent-primary)'
              : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: value === opt ? 600 : 400,
            transition: 'all 140ms ease',
            cursor: 'pointer',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ToggleRow({
  label,
  sub,
  value,
  onClick,
}: {
  label: string
  sub?: string
  value: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '16px',
        border: value
          ? '1px solid var(--accent-border)'
          : '1px solid var(--border-soft)',
        background: value
          ? 'var(--accent-soft)'
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '2px',
          }}>
            {sub}
          </div>
        )}
      </div>

      {/* Toggle pill */}
      <div style={{
        width: '44px',
        height: '26px',
        borderRadius: '999px',
        background: value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 140ms ease',
      }}>
        <div style={{
          position: 'absolute',
          top: '3px',
          left: value ? '21px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '999px',
          background: 'white',
          transition: 'left 140ms ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  )
}

function MoneyInput({
  placeholder,
  value,
  onChange,
  hint,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          fontSize: '15px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}>
          R
        </span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
          style={{ paddingLeft: '28px' }}
        />
      </div>
      {hint && (
        <p style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          paddingLeft: '4px',
        }}>
          {hint}
        </p>
      )}
    </div>
  )
}

// ─── Step screens ─────────────────────────────────────────

function StepIncome({
  profile,
  update,
}: {
  profile: Profile
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <MoneyInput
        placeholder="Monthly income (take-home)"
        value={profile.income}
        onChange={(v) => update('income', v)}
        hint="Your net monthly income after tax"
      />

      <MoneyInput
        placeholder="Additional income (optional)"
        value={profile.additionalIncome}
        onChange={(v) => update('additionalIncome', v)}
        hint="Freelance, rental income, grants — anything extra"
      />

      <div>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          Employment type
        </p>
        <ChipSelect
          options={['Employed', 'Self-employed', 'Student', 'Retired', 'Other']}
          value={profile.employment}
          onSelect={(v) => update('employment', v)}
        />
      </div>

      <div>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          How long have you been in your current income situation?
        </p>
        <ChipSelect
          options={['Under 6 months', '6–12 months', '1–2 years', '2+ years']}
          value={profile.duration}
          onSelect={(v) => update('duration', v)}
        />
      </div>
    </div>
  )
}

function StepSituation({
  profile,
  update,
}: {
  profile: Profile
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void
}) {
  const occupantOptions = ['Just me', '2 people', '3 people', '4+ people']

  // Map display to value
  function occupantValue() {
    const n = Number(profile.occupants)
    if (n === 1) return 'Just me'
    if (n === 2) return '2 people'
    if (n === 3) return '3 people'
    if (n >= 4) return '4+ people'
    return profile.occupants
  }

  function occupantFromDisplay(v: string) {
    if (v === 'Just me') return '1'
    if (v === '2 people') return '2'
    if (v === '3 people') return '3'
    if (v === '4+ people') return '4'
    return '1'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          How many people will be living there?
        </p>
        <ChipSelect
          options={occupantOptions}
          value={occupantValue()}
          onSelect={(v) => update('occupants', occupantFromDisplay(v))}
        />
      </div>

      <div>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          Do you have pets?
        </p>
        <ChipSelect
          options={['Yes', 'No']}
          value={profile.pets}
          onSelect={(v) => update('pets', v)}
        />
      </div>

      <div>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          Does anyone in the household smoke?
        </p>
        <ChipSelect
          options={['Yes', 'No']}
          value={profile.smoking}
          onSelect={(v) => update('smoking', v)}
        />
      </div>

      <ToggleRow
        label="Guarantor available"
        sub="Someone who can co-sign if needed"
        value={profile.guarantorAvailable}
        onClick={() => update('guarantorAvailable', !profile.guarantorAvailable)}
      />
    </div>
  )
}

function StepDocuments({
  profile,
  update,
}: {
  profile: Profile
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void
}) {
  const docs = [
    {
      key: 'depositReady' as keyof Profile,
      label: 'Deposit ready',
      sub: 'Usually 1–2 months rent',
    },
    {
      key: 'idReady' as keyof Profile,
      label: 'ID document',
      sub: 'South African ID or passport',
    },
    {
      key: 'payslipReady' as keyof Profile,
      label: 'Recent payslips',
      sub: 'Last 1–3 months',
    },
    {
      key: 'bankStatementsReady' as keyof Profile,
      label: 'Bank statements',
      sub: 'Last 3 months',
    },
    {
      key: 'referencesReady' as keyof Profile,
      label: 'References',
      sub: 'Previous landlord or employer',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {docs.map((doc) => (
        <ToggleRow
          key={doc.key}
          label={doc.label}
          sub={doc.sub}
          value={profile[doc.key] as boolean}
          onClick={() =>
            update(doc.key, !profile[doc.key] as Profile[typeof doc.key])
          }
        />
      ))}
    </div>
  )
}

function StepHistory({
  profile,
  update,
}: {
  profile: Profile
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '16px',
        }}>
          Have you ever been evicted, or had a lease terminated early by a landlord?
        </p>
        <ChipSelect
          options={['No', 'Yes — I can explain', 'Yes']}
          value={profile.evictionHistory}
          onSelect={(v) => update('evictionHistory', v)}
        />
      </div>

      {profile.evictionHistory !== 'No' &&
        profile.evictionHistory !== '' && (
          <div className="card-inner">
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
            }}>
              That's okay. RentEdge will help you frame your situation honestly
              and show you what you can do to build confidence with an agent.
            </p>
          </div>
        )}
    </div>
  )
}

// ─── Step validity ─────────────────────────────────────────

function isStepValid(step: number, profile: Profile): boolean {
  if (step === 0) return !!profile.income && !!profile.employment && !!profile.duration
  if (step === 1) return !!profile.pets && !!profile.smoking
  if (step === 2) return true // documents are optional
  if (step === 3) return !!profile.evictionHistory
  return false
}

// ─── Main page ─────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()

  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)
  const [profile, setProfile] = useState<Profile>(EMPTY)

  useEffect(() => {
    try {
      const existing = localStorage.getItem('rentedge_profile')
      if (existing) {
        const parsed = JSON.parse(existing)
        // Convert back to string for form use
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          income: String(parsed.income || ''),
          additionalIncome: String(parsed.additionalIncome || ''),
          occupants: String(parsed.occupants || '1'),
          pets: parsed.pets === true ? 'Yes' : parsed.pets === false ? 'No' : parsed.pets || '',
          smoking: parsed.smoking === true ? 'Yes' : parsed.smoking === false ? 'No' : parsed.smoking || '',
        }))
      }
    } catch {}
  }, [])

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSave()
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleSave() {
    setSaving(true)

    const normalized = {
      ...profile,
      income: Number(profile.income) || 0,
      additionalIncome: Number(profile.additionalIncome) || 0,
      occupants: Number(profile.occupants) || 1,
      pets: profile.pets === 'Yes',
      smoking: profile.smoking === 'Yes',
    }

    localStorage.setItem('rentedge_profile',          JSON.stringify(normalized))
    localStorage.setItem('rentedge_renter',           JSON.stringify(normalized))
    localStorage.setItem('rentedge_profile_complete', 'true')

    // Go to check page — user just told us about themselves, now add a property
    setTimeout(() => router.push('/check'), 600)
  }

  const currentStep = STEPS[step]
  const valid       = isStepValid(step, profile)
  const isLast      = step === STEPS.length - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 80px)' }}>

      {/* PROGRESS BAR */}
      <div style={{
        height: '3px',
        background: 'var(--border-soft)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <div style={{
          height: '100%',
          width: `${((step + 1) / STEPS.length) * 100}%`,
          background: 'var(--accent-primary)',
          borderRadius: '999px',
          transition: 'width 300ms ease',
        }} />
      </div>

      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <div className="app-eyebrow" style={{ marginBottom: '8px' }}>
          {currentStep.eyebrow}
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 650,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          {currentStep.title}
        </h1>

        {/* WHY WE'RE ASKING */}
        <div className="card-inner">
          <p style={{
            fontSize: '13px',
            lineHeight: '1.65',
            color: 'var(--text-secondary)',
          }}>
            {currentStep.why}
          </p>
        </div>
      </div>

      {/* STEP CONTENT */}
      <div style={{ flex: 1 }}>
        {step === 0 && <StepIncome    profile={profile} update={update} />}
        {step === 1 && <StepSituation profile={profile} update={update} />}
        {step === 2 && <StepDocuments profile={profile} update={update} />}
        {step === 3 && <StepHistory   profile={profile} update={update} />}
      </div>

      {/* NAV BUTTONS */}
      <div style={{
        paddingTop: '28px',
        paddingBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button
          className={`btn-primary ${saving ? 'opacity-70' : ''}`}
          disabled={!valid || saving}
          onClick={handleNext}
          style={{
            opacity: valid ? 1 : 0.4,
            transition: 'opacity 200ms ease',
          }}
        >
          {saving
            ? 'Saving...'
            : isLast
            ? 'Save & Continue'
            : 'Continue'}
        </button>

        {step > 0 && (
          <button
            className="btn-secondary"
            onClick={handleBack}
          >
            Back
          </button>
        )}

        {/* Step dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          paddingTop: '4px',
        }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '999px',
                background: i === step
                  ? 'var(--accent-primary)'
                  : i < step
                  ? 'rgba(76,141,255,0.4)'
                  : 'var(--border-strong)',
                transition: 'all 220ms ease',
              }}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
