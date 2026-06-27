import {
  BufferLevel,
  IncomeBand,
  LikelyApplicantPool,
  PropertyClass,
} from "./types"

type FinancialStrength =
  | "strong"
  | "stable"
  | "stretched"
  | "pressured"

export function getFinancialRank(
  ratio: number,

  thresholds: {
    strong: number
    stable: number
    stretched: number
  },

  bufferLevel: BufferLevel,

  incomeBand: IncomeBand,

  employment: string,

  propertyClass: PropertyClass,

  applicantPool: LikelyApplicantPool
): FinancialStrength {

  let score = 0

  // -----------------------------
  // AFFORDABILITY
  // -----------------------------

  if (ratio >= thresholds.strong) {

    score += 4

  } else if (
    ratio >= thresholds.stable
  ) {

    score += 2

  } else if (
    ratio >= thresholds.stretched
  ) {

    score += 0

  } else {

    score -= 4

  }

  // -----------------------------
  // BUFFER
  // -----------------------------

  if (
    bufferLevel === "elite"
  ) {

    score += 3

  } else if (
    bufferLevel === "strong"
  ) {

    score += 2

  } else if (
    bufferLevel === "healthy"
  ) {

    score += 1

  } else if (
    bufferLevel === "negative"
  ) {

    score -= 3

  }

  // -----------------------------
  // INCOME QUALITY
  // -----------------------------

  if (
    incomeBand === "elite"
  ) {

    score += 3

  } else if (
    incomeBand === "very-strong"
  ) {

    score += 2

  } else if (
    incomeBand === "strong"
  ) {

    score += 1

  } else if (
    incomeBand === "low"
  ) {

    score -= 2

  }

  // -----------------------------
  // EMPLOYMENT
  // -----------------------------

  const job =
    employment
      ?.trim()
      .toLowerCase()

  if (
    job === "unemployed"
  ) {

    score -= 6

  }

  if (
    job === "self-employed"
  ) {

    score -= 1

  }

  // -----------------------------
  // PREMIUM ADJUSTMENTS
  // -----------------------------

  if (
    propertyClass === "premium"
  ) {

    score -= 1

  }

  if (
    propertyClass === "luxury"
  ) {

    score -= 2

  }

  // -----------------------------
  // COMPETITION
  // -----------------------------

  if (
    applicantPool === "elite"
  ) {

    score -= 2

  }

  if (
    applicantPool === "affluent"
  ) {

    score -= 1

  }

  if (
    applicantPool === "volume-driven"
  ) {

    score += 1

  }

  // -----------------------------
  // FINAL CLASSIFICATION
  // -----------------------------

  if (score >= 7) {

    return "strong"

  }

  if (score >= 3) {

    return "stable"

  }

  if (score >= -1) {

    return "stretched"

  }

  return "pressured"

}