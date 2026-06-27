// lib/evaluation/risk/outcome.ts

import {
  ProbableOutcome,
  PropertyClass,
} from "../types"

type Params = {
  approvalChance: number

  propertyClass: PropertyClass

  financialStrength:
    | "strong"
    | "stable"
    | "stretched"
    | "pressured"

  readinessProfile:
    | "fully-prepared"
    | "mostly-prepared"
    | "moderately-prepared"
    | "incomplete"

  processingComplexity:
    | "straightforward"
    | "moderate-review"
    | "explanation-required"
    | "high-friction"

  marketPressure:
    | "low"
    | "active"
    | "fast-moving"
    | "high"

  competitionLevel:
    | "leading"
    | "competitive"
    | "behind-market"
    | "outmatched"
}

export function getProbableOutcome({
  approvalChance,
  propertyClass,
  financialStrength,
  readinessProfile,
  processingComplexity,
  marketPressure,
  competitionLevel,
}: Params): ProbableOutcome {
  // ----------------------------------------
  // VERY LOW PROBABILITY
  // ----------------------------------------
  if (approvalChance < 30) {
    return "very-low-probability"
  }

  if (
    competitionLevel ===
      "outmatched" &&
    marketPressure === "high"
  ) {
    return "very-low-probability"
  }

  if (
    financialStrength === "pressured" &&
    (propertyClass === "premium" ||
      propertyClass === "luxury")
  ) {
    return "very-low-probability"
  }

  // ----------------------------------------
  // UNLIKELY CALLBACK
  // ----------------------------------------
  if (approvalChance < 50) {
    return "unlikely-callback"
  }

  if (
    processingComplexity ===
      "high-friction"
  ) {
    return "unlikely-callback"
  }

  if (
    readinessProfile === "incomplete" &&
    marketPressure !== "low"
  ) {
    return "unlikely-callback"
  }

  // ----------------------------------------
  // REVIEW POSSIBLE
  // ----------------------------------------
  if (approvalChance < 75) {
    return "review-possible"
  }

  if (
    competitionLevel ===
      "competitive"
  ) {
    return "review-possible"
  }

  if (
    processingComplexity ===
    "moderate-review"
  ) {
    return "review-possible"
  }

  // ----------------------------------------
  // LIKELY SHORTLIST
  // ----------------------------------------
  return "likely-shortlist"
}