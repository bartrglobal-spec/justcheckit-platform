'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AdaptiveProfilePage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [answers, setAnswers] = useState<ProfileAnswers>(EMPTY_ANSWERS)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [incomeBuffer, setIncomeBuffer] = useState('')

  useEffect(() => {
    const savedProperties = JSON.parse(localStorage.getItem('rentedge_properties') || '[]')
    setProperties(savedProperties)
    const savedAnswers = JSON.parse(localStorage.getItem('rentedge_profile_answers') || 'null')
    if (savedAnswers) setAnswers({ ...EMPTY_ANSWERS, ...savedAnswers })
  }, [])

  useEffect(() => {
    localStorage.setItem('rentedge_profile_answers', JSON.stringify(answers))
  }, [answers])

  const rents = properties.map(p => Number(p.rent)).filter(r => !isNaN(r))
  const highestRent = rents.length > 0 ? Math.max(...rents) : 0
  const lowestRent  = rents.length > 0 ? Math.min(...rents) : 0
  const averageRent = rents.length > 0 ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0

  const signals = useMemo(() => {
    const income = Number(answers.monthlyIncome || 0)
    let affordability = 0
    if (income > 0 && highestRent > 0) {
      const ratio = income / highestRent
      affordability = ratio >= 3 ? 100 : ratio >= 2.5 ? 80 : ratio >= 2 ? 60 : 30
    }
    return { affordability }
  }, [answers, highestRent])

  const needsReferences = answers.rentalHistory === 'Currently Renting' || answers.rentalHistory === 'Rented Before'
  const needsGuarantor  = answers.incomeSource === 'Student' || answers.rentalHistory === 'First-time renter' || signals.affordability < 60

  // KEY FIX: documentationGaps is answered when length > 0
  // 'none' sentinel = user explicitly said they have everything
  // [] = unanswered (question must still show)
  const docGapsAnswered = answers.documentationGaps.length > 0

  const questionQueue = [
    'incomeSource', 'incomeStructure', 'monthlyIncome', 'employmentStability', 'rentalHistory',
    ...(needsReferences ? ['referenceLikelihood', 'referenceAvailability'] : []),
    'occupancy', 'moveTiming', 'depositReadiness', 'documentationGaps',
    ...(needsGuarantor ? ['guarantorSupport'] : []),
  ]

  const currentQuestion = editingField || questionQueue.find(key => {
    if (key === 'documentationGaps') return !docGapsAnswered
    const value = answers[key as keyof ProfileAnswers]
    return Array.isArray(value) ? value.length === 0 : !value
  })

  const profileComplete = !currentQuestion

  const updateAnswer = (field: keyof ProfileAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setEditingField(null)
    // Reset income buffer after confirming
    if (field === 'monthlyIncome') setIncomeBuffer('')
  }

  // Pre-fill income buffer when editing an existing answer
  useEffect(() => {
    if (editingField === 'monthlyIncome' && answers.monthlyIncome) {
      setIncomeBuffer(answers.monthlyIncome)
    }
  }, [editingField])

  // KEY FIX: Map employmentStability to format evaluateProperty can read
  // evaluateProperty uses normalizeText().includes("2+") — "More than 2 years" does NOT match
  const mapDuration = (s: string) => {
    if (s === 'More than 2 years') return '2+ years'
    if (s === '1 to 2 years')      return '1-2 years'
    return s
  }

  const handleContinue = () => {
    const finalAnswers = {
      ...answers,
      employmentStabilityMapped: mapDuration(answers.employmentStability),
    }
    localStorage.setItem('rentedge_profile_complete', 'true')
    localStorage.setItem('rentedge_profile_answers', JSON.stringify(finalAnswers))
    router.push('/preview')
  }

  const guidance = useMemo(() => {
    if (!answers.incomeSource) return 'We start with income because affordability is usually the biggest factor in rental approvals.'
    if (!answers.monthlyIncome) return 'We understand how you earn. Next we need to understand affordability relative to your target properties.'
    if (signals.affordability < 60 && answers.monthlyIncome) return 'Affordability is one of the bigger uncertainties here. We are collecting more information to understand your overall strength.'
    if (!answers.rentalHistory) return 'Income is clearer. Now we need to understand your rental experience and track record.'
    if (!answers.depositReadiness) return 'We are now focusing on readiness — how prepared you would be if the right property appeared.'
    return 'We have enough to evaluate how competitive your profile may be for the properties you are targeting.'
  }, [answers, signals])

  const answeredItems = [
    { key: 'incomeSource',          label: 'Income Source',        value: answers.incomeSource },
    { key: 'incomeStructure',       label: 'Income Structure',     value: answers.incomeStructure },
    { key: 'monthlyIncome',         label: 'Monthly Income',       value: answers.monthlyIncome ? `R${Number(answers.monthlyIncome).toLocaleString()}` : '' },
    { key: 'employmentStability',   label: 'Stability',            value: answers.employmentStability },
    { key: 'rentalHistory',         label: 'Rental History',       value: answers.rentalHistory },
    { key: 'referenceLikelihood',   label: 'Reference Likelihood', value: answers.referenceLikelihood },
    { key: 'referenceAvailability', label: 'References',           value: answers.referenceAvailability },
    { key: 'occupancy',             label: 'Occupancy',            value: answers.occupancy },
    { key: 'moveTiming',            label: 'Move Timing',          value: answers.moveTiming },
    { key: 'depositReadiness',      label: 'Deposit',              value: answers.depositReadiness },
    { key: 'documentationGaps',     label: 'Documentation',        value: answers.documentationGaps.includes('none') ? 'All documents available' : answers.documentationGaps.join(', ') },
    { key: 'guarantorSupport',      label: 'Guarantor',            value: answers.guarantorSupport },
  ].filter(item => item.value && item.value.length > 0)

  const Opt = ({ option, onClick, selected = false }: { option: string; onClick: () => void; selected?: boolean }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px',
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border-soft)'}`,
        background: selected ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)',
        color: selected ? 'var(--accent-primary)' : 'var(--text-primary)',
        fontSize: 14, fontWeight: selected ? 600 : 400,
        cursor: 'pointer', transition: 'all 140ms ease',
      }}
    >
      {selected ? '✓  ' : ''}{option}
    </button>
  )

  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      <section>
        <p className="app-eyebrow">Step 2 of 3</p>
        <h1 className="app-title" style={{ marginTop: 8 }}>Rental Profile</h1>
        <p className="section-subtitle">Let's understand your rental position against the properties you are targeting.</p>
      </section>

      <div className="card card-elevated">
        <p className="label">Property market</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          {[
            { label: 'Tracked',      value: String(properties.length) },
            { label: 'Highest rent', value: `R${highestRent.toLocaleString()}` },
            { label: 'Lowest rent',  value: `R${lowestRent.toLocaleString()}` },
            { label: 'Average rent', value: `R${averageRent.toLocaleString()}` },
          ].map(item => (
            <div key={item.label} className="card-inner">
              <p className="label">{item.label}</p>
              <p className="section-title" style={{ marginTop: 6, fontSize: 17 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-accent">
        <p className="label">Guidance</p>
        <p className="body-text" style={{ marginTop: 8 }}>{guidance}</p>
      </div>

      {!profileComplete && (
        <div className="card card-elevated">
          <p className="label" style={{ marginBottom: 14, color: 'var(--accent-primary)' }}>Next question</p>

          {currentQuestion === 'incomeSource' && (<>
            <p className="section-title">How do you currently earn your income?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Full-time Employment','Self-employed','Contract / Freelance','Student','Multiple Income Sources','Other'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('incomeSource', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'incomeStructure' && (<>
            <p className="section-title">How is your income usually received?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Fixed Salary','Mostly Fixed','Variable Income','Combination'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('incomeStructure', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'monthlyIncome' && (<>
            <p className="section-title">What is your average monthly income before deductions?</p>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Enter your gross monthly amount. We use this to check the 3x income rule agents apply.
            </p>
            <input
              value={incomeBuffer}
              onChange={e => setIncomeBuffer(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 25000"
              className="input"
              inputMode="numeric"
              style={{ marginTop: 14 }}
            />
            {incomeBuffer ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                = R{Number(incomeBuffer).toLocaleString()} per month
              </p>
            ) : null}
            <button
              onClick={() => { if (incomeBuffer) updateAnswer('monthlyIncome', incomeBuffer) }}
              className="btn-primary"
              style={{ marginTop: 10, opacity: !incomeBuffer ? 0.4 : 1 }}
              disabled={!incomeBuffer}
            >
              Confirm income
            </button>
          </>)}

          {currentQuestion === 'employmentStability' && (<>
            <p className="section-title">How long have you been receiving this income?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Less than 3 months','3 to 12 months','1 to 2 years','More than 2 years'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('employmentStability', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'rentalHistory' && (<>
            <p className="section-title">What best describes your rental history?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Currently Renting','Rented Before','First-time renter'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('rentalHistory', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'referenceLikelihood' && (<>
            <p className="section-title">How likely is a previous landlord to give a positive reference?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Very Likely','Likely','Not Sure'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('referenceLikelihood', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'referenceAvailability' && (<>
            <p className="section-title">Could you provide landlord reference details if requested?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Available','Possibly','No'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('referenceAvailability', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'occupancy' && (<>
            <p className="section-title">Who will be living in the property?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Just me','Me and partner','Family','Shared accommodation','Other'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('occupancy', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'moveTiming' && (<>
            <p className="section-title">When are you hoping to move?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Immediately','Within 30 days','Within 3 months','Just exploring'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('moveTiming', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'depositReadiness' && (<>
            <p className="section-title">If you found the right property tomorrow, could you pay the deposit?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Yes','Partially','Not yet'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('depositReadiness', o)} />
              ))}
            </div>
          </>)}

          {currentQuestion === 'documentationGaps' && (<>
            <p className="section-title">Which documents could be difficult to provide?</p>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Select all that apply. Tap Continue when done.
            </p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Payslips','Bank Statements','Employment Confirmation','Landlord Reference','ID Document'].map(option => {
                const noneActive = answers.documentationGaps.includes('none')
                const selected = !noneActive && answers.documentationGaps.includes(option)
                return (
                  <Opt key={option} option={option} selected={selected} onClick={() => {
                    if (noneActive) {
                      setAnswers(p => ({ ...p, documentationGaps: [option] }))
                      return
                    }
                    const next = selected
                      ? answers.documentationGaps.filter((i: string) => i !== option)
                      : [...answers.documentationGaps, option]
                    setAnswers(p => ({ ...p, documentationGaps: next }))
                  }} />
                )
              })}
              <div className="divider" style={{ margin: '4px 0' }} />
              <Opt
                option="I have all documents ready"
                selected={answers.documentationGaps.includes('none')}
                onClick={() => {
                  const noneActive = answers.documentationGaps.includes('none')
                  setAnswers(p => ({ ...p, documentationGaps: noneActive ? [] : ['none'] }))
                }}
              />
            </div>
            <button
              onClick={() => updateAnswer('documentationGaps', answers.documentationGaps)}
              className="btn-primary"
              style={{ marginTop: 14, opacity: answers.documentationGaps.length === 0 ? 0.4 : 1 }}
              disabled={answers.documentationGaps.length === 0}
            >
              Continue
            </button>
          </>)}

          {currentQuestion === 'guarantorSupport' && (<>
            <p className="section-title">If needed, would you have access to a guarantor or financial support?</p>
            <div className="section-gap" style={{ marginTop: 14 }}>
              {['Yes','Possibly','No'].map(o => (
                <Opt key={o} option={o} onClick={() => updateAnswer('guarantorSupport', o)} />
              ))}
            </div>
          </>)}

        </div>
      )}

      {answeredItems.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 14 }}>Your answers</p>
          <div className="section-gap" style={{ gap: 8 }}>
            {answeredItems.map(item => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="label">{item.label}</p>
                  <p style={{ fontSize: 14, marginTop: 3, color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
                <button onClick={() => setEditingField(item.key)} className="btn-ghost"
                  style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }}>Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {profileComplete && (
        <div className="card-hero">
          <p className="app-eyebrow" style={{ color: 'var(--accent-primary)' }}>Profile complete</p>
          <p className="section-title" style={{ marginTop: 10 }}>Your rental profile is ready</p>
          <p className="section-subtitle">We understand your income, rental history, and application readiness.</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Income structure & level','Employment stability','Rental experience','Application readiness','Documentation position'].map(item => (
              <p key={item} style={{ fontSize: 13, color: 'var(--success)' }}>✓ {item}</p>
            ))}
          </div>
          <button onClick={handleContinue} className="btn-primary" style={{ marginTop: 20 }}>
            Continue to Evaluation
          </button>
        </div>
      )}

    </div>
  )
}
