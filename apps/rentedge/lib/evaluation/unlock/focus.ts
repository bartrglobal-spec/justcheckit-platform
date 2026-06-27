import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  FocusArea,
} from "./types"

type CandidateFocus = {
  what: string

  why: string

  impact: string

  priority: number
}

export function buildFocusAreas(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): FocusArea[] {

  const candidates: CandidateFocus[] =
    []

  /*
   * Documents
   */

  if (
    evaluation.readinessProfile ===
      "incomplete" ||
    evaluation.readinessProfile ===
      "moderately-prepared"
  ) {
    candidates.push({
      what:
        "Getting the important paperwork ready",

      why:
        "Several parts of the application picture may still need supporting documents.",

      impact:
        "Less uncertainty and fewer delays once you find a property you want to pursue.",

      priority: 100,
    })
  }

  /*
   * Affordability Story
   */

  if (
    evaluation.financialStrength ===
      "stretched" ||
    evaluation.financialStrength ===
      "pressured"
  ) {
    candidates.push({
      what:
        "Presenting the income picture clearly",

      why:
        "The rent may attract more attention than some other parts of the application.",

      impact:
        "A clearer understanding of how the rent fits into the household budget.",

      priority: 95,
    })
  }

  /*
   * References
   */

  if (
    !renter.referencesReady
  ) {
    candidates.push({
      what:
        "Identifying strong references",

      why:
        "Independent confirmation can help answer questions that documents cannot.",

      impact:
        "Additional confidence if someone wants to verify your reliability.",

      priority: 90,
    })
  }

  /*
   * Stability Story
   */

  if (
    evaluation.stabilityConfidence ===
    "developing"
  ) {
    candidates.push({
      what:
        "Adding context to your recent history",

      why:
        "The current position may have a shorter track record behind it.",

      impact:
        "A more complete understanding of how your situation developed.",

      priority: 88,
    })
  }

  /*
   * Credit Context
   */

  if (
    renter.creditIssues &&
    renter.creditIssues !==
      "none"
  ) {
    candidates.push({
      what:
        "Preparing for possible credit questions",

      why:
        "It is usually easier to explain context before you're under pressure.",

      impact:
        "Fewer surprises if financial history becomes part of the conversation.",

      priority: 92,
    })
  }

  /*
   * Rental History Context
   */

  if (
    renter.evictionHistory &&
    renter.evictionHistory !==
      "none"
  ) {
    candidates.push({
      what:
        "Being ready to explain your rental history",

      why:
        "Questions are often easier to answer when the context is already clear.",

      impact:
        "More confidence when discussing previous rental experiences.",

      priority: 94,
    })
  }

  /*
   * Occupancy
   */

  if (
    evaluation.occupancyFit ===
      "tight" ||
    evaluation.occupancyFit ===
      "restricted"
  ) {
    candidates.push({
      what:
        "Making the household arrangement easy to understand",

      why:
        "The number of occupants may attract more attention in this situation.",

      impact:
        "Less uncertainty about how the property will be used.",

      priority: 85,
    })
  }

  /*
   * Competition
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
      what:
        "Strengthening the parts that create confidence",

      why:
        "Competitive properties often lead to closer comparisons between applicants.",

      impact:
        "A stronger overall application story.",

      priority: 87,
    })
  }

  /*
   * Fallback
   */

  if (
    candidates.length === 0
  ) {
    candidates.push(
      {
        what:
          "Keeping the application picture organised",

        why:
          "Most of the major pieces already appear to be in place.",

        impact:
          "Staying ready when the right opportunity appears.",

        priority: 50,
      }
    )
  }

  return candidates
    .sort(
      (a, b) =>
        b.priority -
        a.priority
    )
    .slice(0, 3)
    .map(
      ({
        what,
        why,
        impact,
      }) => ({
        what,
        why,
        impact,
      })
    )
}