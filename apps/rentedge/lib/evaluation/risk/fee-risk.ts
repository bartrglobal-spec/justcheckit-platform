// lib/evaluation/risk/fee-risk.ts

import {
  FeeRisk,
  PropertyClass,
  ProbableOutcome,
} from "../types"

type Params = {
  approvalChance: number

  propertyClass: PropertyClass

  probableOutcome: ProbableOutcome

  financialStrength:
    | "strong"
    | "stable"
    | "stretched"
    | "pressured"

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

  petsMismatch: boolean

  evictionHistory?: string
}

export function getFeeRisk({
  approvalChance,
  propertyClass,
  probableOutcome,
  financialStrength,
  processingComplexity,
  marketPressure,
  petsMismatch,
  evictionHistory,
}: Params): FeeRisk {
  // ----------------------------------------
  // HARD MONEY LOSS CONDITIONS
  // ----------------------------------------
  if (petsMismatch) {
    return "likely-money-loss"
  }

  if (
    evictionHistory?.toLowerCase() ===
    "yes"
  ) {
    return "likely-money-loss"
  }

  if (
    approvalChance < 25 &&
    (propertyClass === "premium" ||
      propertyClass === "luxury")
  ) {
    return "likely-money-loss"
  }

  // ----------------------------------------
  // HIGH WASTE RISK
  // ----------------------------------------
  if (
    probableOutcome ===
      "very-low-probability" ||
    approvalChance < 40
  ) {
    return "high-waste-risk"
  }

  if (
    financialStrength === "pressured" &&
    marketPressure === "high"
  ) {
    return "high-waste-risk"
  }

  if (
    processingComplexity ===
      "high-friction" &&
    (propertyClass === "premium" ||
      propertyClass === "luxury")
  ) {
    return "high-waste-risk"
  }

  // ----------------------------------------
  // CAUTION
  // ----------------------------------------
  if (
    probableOutcome ===
      "review-possible"
  ) {
    return "caution"
  }

  if (
    financialStrength === "stretched"
  ) {
    return "caution"
  }

  if (
    processingComplexity ===
    "explanation-required"
  ) {
    return "caution"
  }

  if (
    marketPressure === "fast-moving"
  ) {
    return "caution"
  }

  // ----------------------------------------
  // SAFE
  // ----------------------------------------
  return "safe-to-apply"
}