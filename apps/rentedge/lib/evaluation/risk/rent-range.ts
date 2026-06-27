// lib/evaluation/risk/rent-range.ts

import {
  PropertyClass,
  RecommendedRentRange,
} from "../types"

type Params = {
  totalIncome: number

  propertyClass: PropertyClass

  financialStrength:
    | "strong"
    | "stable"
    | "stretched"
    | "pressured"

  stabilityConfidence:
    | "high"
    | "moderate"
    | "developing"
    | "unstable"

  readinessProfile:
    | "fully-prepared"
    | "mostly-prepared"
    | "moderately-prepared"
    | "incomplete"

  marketPressure:
    | "low"
    | "active"
    | "fast-moving"
    | "high"
}

export function getRecommendedRentRange({
  totalIncome,
  propertyClass,
  financialStrength,
  stabilityConfidence,
  readinessProfile,
  marketPressure,
}: Params): RecommendedRentRange {
  // ----------------------------------------
  // BASE RATIOS
  // ----------------------------------------
  let comfortableRatio = 0.25
  let competitiveRatio = 0.3
  let stretchRatio = 0.36

  // ----------------------------------------
  // PROPERTY CLASS ADJUSTMENTS
  // ----------------------------------------
  if (
    propertyClass === "premium"
  ) {
    comfortableRatio -= 0.02
    competitiveRatio -= 0.02
    stretchRatio -= 0.02
  }

  if (
    propertyClass === "luxury"
  ) {
    comfortableRatio -= 0.04
    competitiveRatio -= 0.04
    stretchRatio -= 0.04
  }

  // ----------------------------------------
  // FINANCIAL STRENGTH
  // ----------------------------------------
  if (
    financialStrength === "strong"
  ) {
    competitiveRatio += 0.02
    stretchRatio += 0.02
  }

  if (
    financialStrength === "pressured"
  ) {
    comfortableRatio -= 0.02
    competitiveRatio -= 0.03
    stretchRatio -= 0.04
  }

  // ----------------------------------------
  // STABILITY
  // ----------------------------------------
  if (
    stabilityConfidence === "high"
  ) {
    competitiveRatio += 0.01
  }

  if (
    stabilityConfidence ===
      "unstable"
  ) {
    competitiveRatio -= 0.03
    stretchRatio -= 0.05
  }

  // ----------------------------------------
  // READINESS
  // ----------------------------------------
  if (
    readinessProfile ===
    "fully-prepared"
  ) {
    competitiveRatio += 0.01
  }

  if (
    readinessProfile ===
    "incomplete"
  ) {
    competitiveRatio -= 0.03
    stretchRatio -= 0.04
  }

  // ----------------------------------------
  // MARKET PRESSURE
  // ----------------------------------------
  if (
    marketPressure === "high"
  ) {
    competitiveRatio -= 0.02
    stretchRatio -= 0.03
  }

  if (
    marketPressure ===
    "fast-moving"
  ) {
    stretchRatio -= 0.02
  }

  // ----------------------------------------
  // SAFETY LIMITS
  // ----------------------------------------
  comfortableRatio = Math.max(
    0.18,
    comfortableRatio
  )

  competitiveRatio = Math.max(
    comfortableRatio + 0.02,
    competitiveRatio
  )

  stretchRatio = Math.max(
    competitiveRatio + 0.03,
    stretchRatio
  )

  // ----------------------------------------
  // FINAL VALUES
  // ----------------------------------------
  const comfortable = Math.round(
    totalIncome * comfortableRatio
  )

  const competitive = Math.round(
    totalIncome * competitiveRatio
  )

  const stretch = Math.round(
    totalIncome * stretchRatio
  )

  const unrealisticAbove =
    Math.round(
      totalIncome *
        (stretchRatio + 0.06)
    )

  return {
    comfortable,
    competitive,
    stretch,
    unrealisticAbove,
  }
}