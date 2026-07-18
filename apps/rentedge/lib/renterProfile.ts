import { normalizeText } from './evaluation/helpers'

// Single source of truth for turning raw adaptive-profile answers into the
// shape evaluateProperty/evaluateUnlock expect. Previously duplicated
// separately in unlock/page.tsx and dashboard/page.tsx — the dashboard copy
// was missing the employmentStability mapping fix below, which meant
// evaluateProperty's normalizeText().includes('2+') check silently failed
// for anyone who answered "More than 2 years" or "1 to 2 years", producing
// wrong stability/readiness signals on that page. Both pages now import
// this one function so that class of bug can't reappear.
export function buildRenterProfile(profile: any) {
  const mapDuration = (s: string) => {
    if (!s) return ''
    if (s === 'More than 2 years' || s.includes('2+')) return '2+ years'
    if (s === '1 to 2 years'      || s.includes('1-2')) return '1-2 years'
    return s
  }

  const gaps: string[] = profile?.documentationGaps || []

  // 'Possibly' used to be treated identically to 'No' everywhere — this
  // keeps that distinction alive so callers (like the PDF copy) can tell
  // the two apart instead of re-parsing profile.guarantorSupport themselves.
  const guarantorStatus: 'yes' | 'possibly' | 'no' =
    profile?.guarantorSupport === 'Yes' ? 'yes' :
    profile?.guarantorSupport === 'Possibly' ? 'possibly' :
    'no'

  // Self-employed, freelance, and contract income are scored identically by
  // getFinancialRank/evaluatePressure (both check for the exact string
  // "self-employed"). Previously page.tsx treated all three as needing
  // extra documents in the UI, but only "self-employed" got the matching
  // financial-strength/pressure adjustment in the engine — a freelancer's
  // document requirements and their score disagreed with each other.
  const rawEmployment = normalizeText(profile?.incomeSource)
  const employment =
    rawEmployment.includes('self') || rawEmployment.includes('freelance') || rawEmployment.includes('contract')
      ? 'self-employed'
      : rawEmployment.includes('unemployed')
      ? 'unemployed'
      : profile?.incomeSource || ''

  return {
    income:              Number(profile?.monthlyIncome || 0),
    additionalIncome:    0,
    employment,
    duration:            mapDuration(profile?.employmentStabilityMapped || profile?.employmentStability || ''),
    occupants:           Number(profile?.occupancy || 0),
    depositReady:        profile?.depositReadiness === 'Yes',
    idReady:             !gaps.includes('ID Document'),
    payslipReady:        !gaps.includes('Payslips'),
    bankStatementsReady: !gaps.includes('Bank Statements'),
    employmentConfirmationReady: !gaps.includes('Employment Confirmation'),
    referencesReady:     profile?.referenceAvailability === 'Available',
    guarantorAvailable:  guarantorStatus === 'yes',
    guarantorStatus,
    evictionHistory:     'none' as string,
    pets:                false,
  }
}