import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "../types"

import {
  PropertyConversation,
} from "./types"

export function buildPropertyConversation(
  renter: RenterProfile,
  property: PropertyInput,
  evaluation: PropertyEvaluation
): PropertyConversation {

  const easierHere: string[] = []

  const attentionHere: string[] = []

  const focusHere: string[] = []

  /*
   * Affordability
   */

  if (
    evaluation.financialStrength ===
      "strong" ||
    evaluation.financialStrength ===
      "stable"
  ) {
    easierHere.push(
      "The rent itself may attract fewer questions than some other parts of the application."
    )
  } else {
    attentionHere.push(
      "People reviewing the application may spend more time understanding how the rent fits into the overall budget."
    )

    focusHere.push(
      "Show the strongest and clearest picture of household income."
    )
  }

  /*
   * Stability
   */

  if (
    evaluation.stabilityConfidence ===
    "high"
  ) {
    easierHere.push(
      "A longer period of stability may already answer some of the questions normally asked."
    )
  }

  if (
    evaluation.stabilityConfidence ===
    "developing"
  ) {
    attentionHere.push(
      "There may be more interest in understanding how your current position developed."
    )

    focusHere.push(
      "Provide context around recent employment or income changes."
    )
  }

  /*
   * Preparation
   */

  if (
    evaluation.readinessProfile ===
      "fully-prepared" ||
    evaluation.readinessProfile ===
      "mostly-prepared"
  ) {
    easierHere.push(
      "Being prepared may help the application move through the process more smoothly."
    )
  }

  if (
    evaluation.readinessProfile ===
      "moderately-prepared" ||
    evaluation.readinessProfile ===
      "incomplete"
  ) {
    attentionHere.push(
      "Missing information may create additional follow-up questions."
    )

    focusHere.push(
      "Make sure key documents are ready before applying."
    )
  }

  /*
   * Occupancy
   */

  if (
    evaluation.occupancyFit ===
    "natural"
  ) {
    easierHere.push(
      "The household setup appears to fit comfortably within the property."
    )
  }

  if (
    evaluation.occupancyFit ===
      "tight" ||
    evaluation.occupancyFit ===
      "restricted"
  ) {
    attentionHere.push(
      "The household setup may attract additional questions about how the space will be used."
    )

    focusHere.push(
      "Be prepared to explain the planned household arrangement clearly."
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
    attentionHere.push(
      "This property may attract stronger competition than some alternatives."
    )

    focusHere.push(
      "Lead with the parts of the application that create the most confidence."
    )
  } else {
    easierHere.push(
      "The application may receive slightly less competitive pressure than highly sought-after properties."
    )
  }

  /*
   * References
   */

  if (
    renter.referencesReady
  ) {
    easierHere.push(
      "References may help reduce uncertainty if the property receives multiple applications."
    )
  } else {
    attentionHere.push(
      "Some reviewers may want additional reassurance beyond the application itself."
    )

    focusHere.push(
      "Consider who could provide a reference if requested."
    )
  }

  /*
   * Deposit
   */

  if (
    renter.depositReady
  ) {
    easierHere.push(
      "Being financially ready may remove delays if things move quickly."
    )
  }

  return {
    propertyLabel:
      property.label,

    easierHere:
      easierHere.slice(0, 4),

    attentionHere:
      attentionHere.slice(0, 4),

    focusHere:
      focusHere.slice(0, 3),
  }
}