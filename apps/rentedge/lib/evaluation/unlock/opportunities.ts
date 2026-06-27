import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  UnlockOpportunity,
} from "./types"

type CandidateOpportunity = {
  title: string

  explanation: string

  whyItMatters: string

  benefit: string

  relevance: number

  value: number
}

function scoreOpportunity(
  candidate: CandidateOpportunity
) {
  return (
    candidate.relevance * 5 +
    candidate.value * 3
  )
}

export function buildOpportunities(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): UnlockOpportunity[] {

  const candidates: CandidateOpportunity[] =
    []

  /*
   * Credit Report Opportunity
   */

  candidates.push({
    title:
      "Knowing what's on your credit report before applying",

    explanation:
      "Many renters only discover unexpected information when an application is already underway.",

    whyItMatters:
      "Finding something early gives you time to prepare an explanation or correct an issue if necessary.",

    benefit:
      "Fewer surprises and more confidence when applications start moving quickly.",

    relevance: 10,
    value: 10,
  })

  /*
   * Reference Preparation
   */

  if (
    !renter.referencesReady
  ) {
    candidates.push({
      title:
        "Choosing references before they're needed",

      explanation:
        "Many people wait until an application asks for references before deciding who to use.",

      whyItMatters:
        "Good references are often easier to organise before there is any urgency.",

      benefit:
        "Less scrambling and a smoother application process.",

      relevance: 9,
      value: 8,
    })
  }

  /*
   * Application Fee Protection
   */

  if (
    evaluation.feeRisk !==
    "safe-to-apply"
  ) {
    candidates.push({
      title:
        "Avoiding application costs where possible",

      explanation:
        "Not every property creates the same opportunity. Sometimes timing or preparation can reduce unnecessary applications.",

      whyItMatters:
        "Submitting fewer low-probability applications can save both money and energy.",

      benefit:
        "More focused applications and potentially lower costs.",

      relevance: 10,
      value: 9,
    })
  }

  /*
   * Document Readiness
   */

  if (
    evaluation.readinessProfile !==
    "fully-prepared"
  ) {
    candidates.push({
      title:
        "Getting paperwork ready before it becomes urgent",

      explanation:
        "Applications often move faster than expected once the right property appears.",

      whyItMatters:
        "Delays sometimes happen because information isn't immediately available.",

      benefit:
        "More confidence when opportunities appear unexpectedly.",

      relevance: 9,
      value: 8,
    })
  }

  /*
   * Explain Your Story
   */

  if (
    evaluation.processingComplexity ===
      "explanation-required" ||
    evaluation.processingComplexity ===
      "high-friction"
  ) {
    candidates.push({
      title:
        "Preparing your explanation before anyone asks for it",

      explanation:
        "Some applications naturally create follow-up questions even when they are still strong overall.",

      whyItMatters:
        "A clear explanation is often easier to prepare before you're under pressure.",

      benefit:
        "Less uncertainty and a more confident application story.",

      relevance: 10,
      value: 9,
    })
  }

  /*
   * Timing Opportunity
   */

  candidates.push({
    title:
      "Being ready when the right property appears",

    explanation:
      "Many renters focus entirely on finding properties and only prepare afterwards.",

    whyItMatters:
      "Preparation often matters most when good opportunities appear unexpectedly.",

    benefit:
      "More options and fewer rushed decisions.",

    relevance: 8,
    value: 8,
  })

  /*
   * Deposit Readiness
   */

  if (
    !renter.depositReady
  ) {
    candidates.push({
      title:
        "Understanding the full upfront cost early",

      explanation:
        "Rent is only one part of the financial commitment when securing a property.",

      whyItMatters:
        "Knowing the likely upfront requirements can prevent delays later.",

      benefit:
        "Better planning and fewer unexpected costs.",

      relevance: 8,
      value: 7,
    })
  }

  /*
   * Competition Awareness
   */

  if (
    evaluation.marketPressure ===
      "high" ||
    evaluation.competitionLevel ===
      "behind-market" ||
    evaluation.competitionLevel ===
      "outmatched"
  ) {
    candidates.push({
      title:
        "Focusing effort where it can make the biggest difference",

      explanation:
        "In competitive properties, small improvements can matter more than submitting more applications.",

      whyItMatters:
        "Not every opportunity requires the same strategy.",

      benefit:
        "A stronger approach with less wasted effort.",

      relevance: 9,
      value: 8,
    })
  }

  return candidates
    .sort(
      (a, b) =>
        scoreOpportunity(b) -
        scoreOpportunity(a)
    )
    .slice(0, 4)
    .map(
      ({
        title,
        explanation,
        whyItMatters,
        benefit,
      }) => ({
        title,
        explanation,
        whyItMatters,
        benefit,
      })
    )
}