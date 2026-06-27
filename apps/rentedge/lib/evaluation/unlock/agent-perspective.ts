import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  AgentQuestion,
} from "./types"

type CandidateQuestion = {
  question: string

  howAgentsThink: string

  howYouFit: string

  whyWeSayThat: string

  nextMove: string

  relevance: number

  discovery: number
}

function scoreCandidate(
  candidate: CandidateQuestion
) {
  return (
    candidate.relevance * 5 +
    candidate.discovery * 3
  )
}

export function buildAgentQuestions(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): AgentQuestion[] {

  const candidates: CandidateQuestion[] =
    []

  /*
   * Affordability
   */

  if (
    evaluation.financialStrength ===
      "stretched" ||
    evaluation.financialStrength ===
      "pressured"
  ) {
    candidates.push({
      question:
        "Will the rent feel manageable over time?",

      howAgentsThink:
        "Most people reviewing an application are trying to understand whether the rent will remain comfortable month after month, not just whether it can be paid once.",

      howYouFit:
        "The rent appears to take a larger share of income than some other applications might.",

      whyWeSayThat:
        "Affordability seems more likely to attract attention here than documentation or preparation.",

      nextMove:
        "We'd focus on presenting the full income picture as clearly as possible.",

      relevance: 10,
      discovery: 10,
    })
  }

  /*
   * Income Structure
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
    ) ||
    (renter.additionalIncome || 0) >
      0
  ) {
    candidates.push({
      question:
        "How predictable is the income behind this application?",

      howAgentsThink:
        "When income comes from multiple places or is earned differently from a traditional salary, people often want to understand how consistent it is.",

      howYouFit:
        "Your income picture appears to involve more than a single straightforward source.",

      whyWeSayThat:
        "The amount itself may not be the only thing someone reviewing the application wants to understand.",

      nextMove:
        "We'd make it easy to explain where income comes from and how regularly it arrives.",

      relevance: 10,
      discovery: 10,
    })
  }

  /*
   * References
   */

  if (!renter.referencesReady) {
    candidates.push({
      question:
        "Can someone independent help confirm the story being presented?",

      howAgentsThink:
        "References often help reduce uncertainty by providing another perspective beyond forms and documents.",

      howYouFit:
        "At the moment there may be fewer independent voices supporting the application.",

      whyWeSayThat:
        "References are one of the simplest ways many agents build confidence in an application.",

      nextMove:
        "We'd identify who could comfortably speak to your reliability if asked.",

      relevance: 9,
      discovery: 9,
    })
  }

  /*
   * Documentation
   */

  if (
    evaluation.readinessProfile ===
      "moderately-prepared" ||
    evaluation.readinessProfile ===
      "incomplete"
  ) {
    candidates.push({
      question:
        "Will everything needed to make a decision be available?",

      howAgentsThink:
        "Missing information doesn't always create problems, but it can slow down decisions and create uncertainty.",

      howYouFit:
        "There still appear to be parts of the application picture that may need to be completed.",

      whyWeSayThat:
        "Preparation seems more likely to become a discussion point than some other areas.",

      nextMove:
        "We'd focus on making sure the key documents are easy to provide when requested.",

      relevance: 9,
      discovery: 8,
    })
  }

  /*
   * Stability
   */

  if (
    evaluation.stabilityConfidence ===
    "developing"
  ) {
    candidates.push({
      question:
        "Is there enough history to understand the income story?",

      howAgentsThink:
        "People reviewing applications often look for consistency and context rather than focusing only on current income.",

      howYouFit:
        "Your current situation may have a shorter history behind it than some competing applications.",

      whyWeSayThat:
        "Questions may be more about understanding the journey than questioning the income itself.",

      nextMove:
        "We'd make it easy to explain how your current position developed.",

      relevance: 8,
      discovery: 8,
    })
  }

  /*
   * Credit Context
   */

  if (
    renter.creditIssues &&
    renter.creditIssues !== "none"
  ) {
    candidates.push({
      question:
        "Are there any financial details that may need additional context?",

      howAgentsThink:
        "Many financial issues become easier to understand when there is clear context around them.",

      howYouFit:
        "There may be parts of your financial history that naturally create follow-up questions.",

      whyWeSayThat:
        "Applications are usually reviewed as a complete picture rather than a single issue.",

      nextMove:
        "We'd be prepared to explain the context if questions arise.",

      relevance: 9,
      discovery: 9,
    })
  }

  /*
   * Rental History
   */

  if (
    renter.evictionHistory &&
    renter.evictionHistory !== "none"
  ) {
    candidates.push({
      question:
        "Is there anything in the rental history that needs explanation?",

      howAgentsThink:
        "Past rental experiences often matter most when the reviewer doesn't understand the surrounding circumstances.",

      howYouFit:
        "There may be parts of your rental history that invite additional questions.",

      whyWeSayThat:
        "Context often matters as much as the event itself.",

      nextMove:
        "We'd focus on explaining the situation clearly and honestly if needed.",

      relevance: 10,
      discovery: 8,
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
      question:
        "Does the household setup make sense for the property?",

      howAgentsThink:
        "Household size and property size are often reviewed together.",

      howYouFit:
        "The number of occupants may attract more attention than it would in some other applications.",

      whyWeSayThat:
        "Space usage is likely to be part of the conversation.",

      nextMove:
        "We'd make sure the household arrangement is easy to understand.",

      relevance: 8,
      discovery: 7,
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
      question:
        "How might this application compare with others?",

      howAgentsThink:
        "In competitive properties, applications are often reviewed relative to each other rather than in isolation.",

      howYouFit:
        "The property may attract multiple applicants competing for the same opportunity.",

      whyWeSayThat:
        "Market conditions can influence how much scrutiny an application receives.",

      nextMove:
        "We'd focus on strengthening the parts of the application that create confidence.",

      relevance: 8,
      discovery: 8,
    })
  }

  return candidates
    .sort(
      (a, b) =>
        scoreCandidate(b) -
        scoreCandidate(a)
    )
    .slice(0, 4)
    .map(
      ({
        question,
        howAgentsThink,
        howYouFit,
        whyWeSayThat,
        nextMove,
      }) => ({
        question,
        howAgentsThink,
        howYouFit,
        whyWeSayThat,
        nextMove,
      })
    )
}