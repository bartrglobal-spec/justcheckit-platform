import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  UnlockStrength,
} from "./types"

type CandidateStrength = {
  title: string

  explanation: string

  whyItMatters: string

  keepDoing: string

  relevance: number

  momentum: number

  discoveryValue: number
}

function scoreCandidate(
  candidate: CandidateStrength
) {
  return (
    candidate.relevance * 5 +
    candidate.momentum * 3 +
    candidate.discoveryValue * 2
  )
}

function addCandidate(
  candidates: CandidateStrength[],
  candidate: CandidateStrength
) {
  candidates.push(candidate)
}

export function buildStrengths(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): UnlockStrength[] {

  const candidates: CandidateStrength[] =
    []

  /*
   * Financial Position
   */

  if (
    evaluation.financialStrength ===
      "strong" ||
    evaluation.bufferLevel ===
      "strong" ||
    evaluation.bufferLevel ===
      "elite"
  ) {
    addCandidate(
      candidates,
      {
        title:
          "The rent doesn't appear to be carrying the whole application",

        explanation:
          "Based on the information you've shared, affordability doesn't seem to be the only thing shaping the conversation.",

        whyItMatters:
          "When rent looks manageable, attention often shifts to the rest of the application rather than staying focused on affordability.",

        keepDoing:
          "Continue applying for properties that fit comfortably within your income picture.",

        relevance: 10,
        momentum: 10,
        discoveryValue: 8,
      }
    )
  }

  /*
   * Stability
   */

  if (
    evaluation.stabilityConfidence ===
    "high"
  ) {
    addCandidate(
      candidates,
      {
        title:
          "Consistency is already helping tell your story",

        explanation:
          "You've indicated a stable income situation over a longer period of time.",

        whyItMatters:
          "Longer periods of stability often answer questions before they're asked.",

        keepDoing:
          "Keep presenting your employment history clearly and consistently.",

        relevance: 10,
        momentum: 9,
        discoveryValue: 7,
      }
    )
  }

  /*
   * Preparation
   */

  if (
    evaluation.readinessProfile ===
      "fully-prepared"
  ) {
    addCandidate(
      candidates,
      {
        title:
          "Many of the usual application hurdles may already be behind you",

        explanation:
          "Most of the documents and supporting information commonly requested appear to already be available.",

        whyItMatters:
          "Preparation often reduces delays and uncertainty during the application process.",

        keepDoing:
          "Keep your documents organised and ready to share when needed.",

        relevance: 10,
        momentum: 10,
        discoveryValue: 9,
      }
    )
  }

  if (
    evaluation.readinessProfile ===
    "mostly-prepared"
  ) {
    addCandidate(
      candidates,
      {
        title:
          "Some questions may already be answered before they're asked",

        explanation:
          "Several important documents appear to already be in place.",

        whyItMatters:
          "Having information ready can make the overall process feel smoother.",

        keepDoing:
          "Finish gathering the remaining pieces so everything is ready when you need it.",

        relevance: 9,
        momentum: 8,
        discoveryValue: 8,
      }
    )
  }

  /*
   * References
   */

  if (
    renter.referencesReady
  ) {
    addCandidate(
      candidates,
      {
        title:
          "Independent confirmation can make a difference",

        explanation:
          "References provide an additional perspective beyond forms and documents.",

        whyItMatters:
          "A strong reference can help reinforce the overall picture being presented.",

        keepDoing:
          "Keep your references informed and ready if they're contacted.",

        relevance: 8,
        momentum: 8,
        discoveryValue: 7,
      }
    )
  }

  /*
   * Deposit
   */

  if (
    renter.depositReady
  ) {
    addCandidate(
      candidates,
      {
        title:
          "Being financially ready often removes delays later",

        explanation:
          "You've indicated that deposit funding is already available.",

        whyItMatters:
          "Financial readiness can simplify the next steps if a property becomes available.",

        keepDoing:
          "Keep those funds accessible if you're actively searching.",

        relevance: 8,
        momentum: 8,
        discoveryValue: 6,
      }
    )
  }

  /*
   * Multiple Income Sources
   */

  if (
    (renter.additionalIncome || 0) > 0
  ) {
    addCandidate(
      candidates,
      {
        title:
          "The household isn't relying entirely on one source of income",

        explanation:
          "More than one income source appears to contribute to the overall picture.",

        whyItMatters:
          "Additional income streams can help create a broader financial picture.",

        keepDoing:
          "Make sure all income sources are documented consistently.",

        relevance: 8,
        momentum: 7,
        discoveryValue: 8,
      }
    )
  }

  /*
   * Guarantor
   */

  if (
    renter.guarantorAvailable
  ) {
    addCandidate(
      candidates,
      {
        title:
          "There is already additional support available if needed",

        explanation:
          "You've indicated that a guarantor could potentially be part of the conversation.",

        whyItMatters:
          "Additional support can provide flexibility in situations where extra reassurance is helpful.",

        keepDoing:
          "Keep guarantor information current and available if required.",

        relevance: 7,
        momentum: 7,
        discoveryValue: 7,
      }
    )
  }

  /*
   * Occupancy
   */

  if (
    evaluation.occupancyFit ===
    "natural"
  ) {
    addCandidate(
      candidates,
      {
        title:
          "The household setup appears straightforward",

        explanation:
          "Nothing immediately stands out about how the space would be used.",

        whyItMatters:
          "Straightforward occupancy arrangements often create fewer questions.",

        keepDoing:
          "Continue presenting household information clearly and accurately.",

        relevance: 6,
        momentum: 6,
        discoveryValue: 5,
      }
    )
  }

  const selected =
    candidates
      .sort(
        (a, b) =>
          scoreCandidate(b) -
          scoreCandidate(a)
      )
      .slice(0, 4)

  while (
    selected.length < 4
  ) {
    selected.push({
      title:
        "Your rental picture is already starting to take shape",

      explanation:
        "Even small pieces of information can contribute to a clearer overall picture.",

      whyItMatters:
        "Understanding your position early creates more opportunities later.",

      keepDoing:
        "Keep building a complete picture of your situation.",

      relevance: 0,
      momentum: 0,
      discoveryValue: 0,
    })
  }

  return selected.map(
    ({
      title,
      explanation,
      whyItMatters,
      keepDoing,
    }) => ({
      title,
      explanation,
      whyItMatters,
      keepDoing,
    })
  )
}