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
