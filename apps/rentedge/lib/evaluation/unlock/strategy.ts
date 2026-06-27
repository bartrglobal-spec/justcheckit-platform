import {
  PropertyEvaluation,
  RenterProfile,
} from "../types"

import {
  UnlockStrategy,
} from "./types"

export function buildStrategy(
  renter: RenterProfile,
  evaluation: PropertyEvaluation
): UnlockStrategy {

  const paragraphs: string[] = []

  /*
   * Opening
   */

  paragraphs.push(
    "If we were in your shoes, we wouldn't start by trying to change everything. We'd start by understanding what is already working and then focus our energy on the areas most likely to create questions."
  )

  /*
   * Financial Position
   */

  if (
    evaluation.financialStrength ===
      "strong" ||
    evaluation.financialStrength ===
      "stable"
  ) {
    paragraphs.push(
      "The rent doesn't seem to be the biggest challenge here. We'd be more interested in making sure the rest of the application tells a clear and complete story."
    )
  }

  if (
    evaluation.financialStrength ===
      "stretched" ||
    evaluation.financialStrength ===
      "pressured"
  ) {
    paragraphs.push(
      "We'd spend a bit of time making sure the income picture is easy to understand. The goal wouldn't be to defend it. The goal would be to help someone quickly see how the rent fits into your overall situation."
    )
  }

  /*
   * Documentation
   */

  if (
    evaluation.readinessProfile ===
      "incomplete" ||
    evaluation.readinessProfile ===
      "moderately-prepared"
  ) {
    paragraphs.push(
      "Before submitting applications, we'd make sure the important paperwork is ready. Good opportunities sometimes move faster than expected, and it's easier to prepare now than when there's pressure."
    )
  }

  /*
   * References
   */

  if (
    !renter.referencesReady
  ) {
    paragraphs.push(
      "We'd also think about who could provide a reference if needed. It's one of those things many renters only think about when they're asked, but it can be useful to have ready beforehand."
    )
  }

  /*
   * Stability
   */

  if (
    evaluation.stabilityConfidence ===
    "developing"
  ) {
    paragraphs.push(
      "If your current income or employment situation is relatively new, we'd focus on making the journey easy to understand. People are often more comfortable when they can see how a situation developed rather than only where it is today."
    )
  }

  /*
   * Credit Context
   */

  if (
    renter.creditIssues &&
    renter.creditIssues !==
      "none"
  ) {
    paragraphs.push(
      "If there are any credit-related questions that could come up, we'd rather think through the explanation now than try to do it under pressure later. A clear explanation is usually more useful than a rushed one."
    )
  }

  /*
   * Rental History
   */

  if (
    renter.evictionHistory &&
    renter.evictionHistory !==
      "none"
  ) {
    paragraphs.push(
      "The same applies to rental history. If there is context that helps explain a previous situation, we'd make sure we're comfortable talking about it clearly and honestly."
    )
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
    paragraphs.push(
      "We also wouldn't assume that applying to more properties is automatically the answer. In competitive situations, a stronger application often matters more than simply submitting more applications."
    )
  }

  /*
   * Strong Position
   */

  if (
    evaluation.financialStrength ===
      "strong" &&
    (
      evaluation.readinessProfile ===
        "fully-prepared" ||
      evaluation.readinessProfile ===
        "mostly-prepared"
    )
  ) {
    paragraphs.push(
      "Overall, we'd feel reasonably positive about the foundation that's already in place. The focus would be on presenting the picture clearly rather than trying to reinvent it."
    )
  }

  /*
   * Closing
   */

  paragraphs.push(
    "Most importantly, we'd remember that applications are rarely about one thing. They're about helping someone understand the full picture. The clearer that picture becomes, the easier it is for confidence to grow."
  )

  return {
    narrative:
      paragraphs.join("\n\n"),
  }
}