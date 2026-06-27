import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  UnlockObservation,
} from "./types"

type CandidateObservation = {
  observation: string

  explanation: string

  relevance: number

  momentum: number

  uniqueness: number
}

function scoreCandidate(
  candidate: CandidateObservation
) {
  return (
    candidate.relevance * 5 +
    candidate.momentum * 3 +
    candidate.uniqueness * 2
  )
}

function addCandidate(
  candidates: CandidateObservation[],
  candidate: CandidateObservation
) {
  candidates.push(candidate)
}

export function buildObservations(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): UnlockObservation[] {

  const candidates: CandidateObservation[] = []

  /*
   * Affordability
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
        observation:
          "The rent doesn't seem to be the biggest question here.",
        explanation:
          "Based on the information you've shared, there appears to be some room left after rent each month.",
        relevance: 10,
        momentum: 10,
        uniqueness: 6,
      }
    )
  }

  if (
    evaluation.financialStrength ===
      "stable"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "Affordability doesn't appear to be the only thing shaping this picture.",
        explanation:
          "The rent appears manageable, which means other parts of the application may carry more weight.",
        relevance: 8,
        momentum: 8,
        uniqueness: 7,
      }
    )
  }

  if (
    evaluation.financialStrength ===
      "stretched"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "The rent may attract more attention than some of the other parts of your application.",
        explanation:
          "When rent takes a larger share of income, agents often spend more time understanding the overall picture.",
        relevance: 10,
        momentum: 5,
        uniqueness: 8,
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
        observation:
          "Your employment history may be doing more work for you than you realise.",
        explanation:
          "You've indicated that your current income situation has been stable for a while.",
        relevance: 10,
        momentum: 9,
        uniqueness: 7,
      }
    )
  }

  if (
    evaluation.stabilityConfidence ===
    "moderate"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "There is already some consistency in the income picture you've shared.",
        explanation:
          "Nothing immediately suggests a rapidly changing employment situation.",
        relevance: 7,
        momentum: 6,
        uniqueness: 5,
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
        observation:
          "You've already done a lot of the preparation that many renters leave until later.",
        explanation:
          "Most of the common supporting documents appear to already be available.",
        relevance: 10,
        momentum: 10,
        uniqueness: 8,
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
        observation:
          "You've already gathered some of the things people usually get asked for later.",
        explanation:
          "Several supporting documents appear to be ready before you've even started applying.",
        relevance: 9,
        momentum: 8,
        uniqueness: 7,
      }
    )
  }

  if (
    evaluation.readinessProfile ===
    "moderately-prepared"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "Parts of the application process may already be easier than you expect.",
        explanation:
          "Some of the information agents typically request appears to already be available.",
        relevance: 7,
        momentum: 7,
        uniqueness: 6,
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
        observation:
          "The property size and household size seem fairly aligned.",
        explanation:
          "Nothing immediately stands out about how the space would be used.",
        relevance: 6,
        momentum: 5,
        uniqueness: 5,
      }
    )
  }

  if (
    evaluation.occupancyFit ===
    "tight"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "The household setup may become part of the conversation.",
        explanation:
          "When more people are sharing a space, agents sometimes look more closely at how the property will be used.",
        relevance: 8,
        momentum: 5,
        uniqueness: 7,
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
        observation:
          "More than one source of income is contributing to the household.",
        explanation:
          "Your situation isn't relying entirely on a single income stream.",
        relevance: 8,
        momentum: 7,
        uniqueness: 8,
      }
    )
  }

  /*
   * Documentation Signals
   */

  const documentCount = [
    renter.idReady,
    renter.payslipReady,
    renter.bankStatementsReady,
    renter.referencesReady,
  ].filter(Boolean).length

  if (documentCount >= 4) {
    addCandidate(
      candidates,
      {
        observation:
          "A large part of the paperwork picture already seems to be in place.",
        explanation:
          "Several of the documents commonly requested during applications appear to be ready.",
        relevance: 8,
        momentum: 8,
        uniqueness: 6,
      }
    )
  }

  /*
   * Credit Context
   */

  if (
    renter.creditIssues &&
    renter.creditIssues !== "none"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "Your situation may contain a few details that benefit from additional context.",
        explanation:
          "Not every application is judged purely on income or documents alone.",
        relevance: 8,
        momentum: 5,
        uniqueness: 8,
      }
    )
  }

  /*
   * Rental History Context
   */

  if (
    renter.evictionHistory &&
    renter.evictionHistory !== "none"
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "Some parts of your rental history may naturally lead to additional questions.",
        explanation:
          "Applications are often reviewed as a complete story rather than a single detail.",
        relevance: 9,
        momentum: 4,
        uniqueness: 8,
      }
    )
  }

  /*
   * Employment Type
   */

  const employment =
    renter.employment
      ?.toLowerCase()
      .trim() || ""

  if (
    employment.includes(
      "self"
    ) ||
    employment.includes(
      "freelance"
    ) ||
    employment.includes(
      "business"
    )
  ) {
    addCandidate(
      candidates,
      {
        observation:
          "The way income is earned may attract as much attention as the income itself.",
        explanation:
          "Different income structures sometimes require a little more context for someone reviewing an application.",
        relevance: 9,
        momentum: 7,
        uniqueness: 9,
      }
    )
  }

  /*
   * Ranking
   */

  const selected =
    candidates
      .sort(
        (a, b) =>
          scoreCandidate(b) -
          scoreCandidate(a)
      )
      .slice(0, 3)

  /*
   * Fallbacks
   */

  while (
    selected.length < 3
  ) {
    selected.push({
      observation:
        "You've already started building a clearer rental picture.",
      explanation:
        "Even a small amount of information can help uncover useful opportunities later on.",
      relevance: 0,
      momentum: 0,
      uniqueness: 0,
    })
  }

  return selected.map(
    ({
      observation,
      explanation,
    }) => ({
      observation,
      explanation,
    })
  )
}