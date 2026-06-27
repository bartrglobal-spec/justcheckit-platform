import {
  getAffordabilityThresholds,
  getBufferLevel,
  getCleanPropertyName,
  getDemandLevel,
  getIncomeBand,
  getLikelyApplicantPool,
  getOccupancyStatus,
  getPropertyClass,
  normalizeText,
  uniqueStrings,
} from "./evaluation/helpers"

import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "./evaluation/types"

import { getFinancialRank } from "./evaluation/scoring"
import { evaluatePressure } from "./evaluation/pressure"
import { getFeeRisk } from "./evaluation/risk/fee-risk"
import { getProbableOutcome } from "./evaluation/risk/outcome"
import { getRecommendedRentRange } from "./evaluation/risk/rent-range"

export function evaluateProperty(
  renter: RenterProfile,
  property: PropertyInput
): PropertyEvaluation {

  const propertyClass =
    getPropertyClass(property)

  const propertyName =
    getCleanPropertyName(property)

  const totalIncome =
    (renter.income || 0) +
    (renter.additionalIncome || 0)

  const rent =
    Math.max(property.rent || 1, 1)

  const affordabilityRatio =
    totalIncome / rent

  const rentBurden =
    Math.round(
      (rent / Math.max(totalIncome, 1)) * 100
    )

  const bufferAmount =
    totalIncome - rent

  const bufferLevel =
    getBufferLevel(bufferAmount)

  const incomeBand =
    getIncomeBand(totalIncome)

  const demand =
    property.demand ||
    getDemandLevel(property)

  const applicantPool =
    getLikelyApplicantPool(
      propertyClass
    )

  const occupancyStatus =
    getOccupancyStatus(
      renter.occupants,
      property.bedrooms,
      propertyClass
    )

  const thresholds =
    getAffordabilityThresholds(
      propertyClass
    )

  const financialStrength =
    getFinancialRank(
      affordabilityRatio,
      thresholds,
      bufferLevel,
      incomeBand,
      renter.employment,
      propertyClass,
      applicantPool
    )

  const docsReady =
    renter.idReady &&
    renter.payslipReady

  const readinessCount = [
    renter.depositReady,
    renter.idReady,
    renter.payslipReady,
    renter.bankStatementsReady,
    renter.referencesReady,
    renter.guarantorAvailable
  ].filter(Boolean).length

  const readinessProfile =
    readinessCount >= 5
      ? "fully-prepared"
      : readinessCount >= 3
      ? "mostly-prepared"
      : readinessCount >= 2
      ? "moderately-prepared"
      : "incomplete"

  const stabilityConfidence =
    normalizeText(renter.duration)
      .includes("2+")
      ? "high"
      : normalizeText(
          renter.duration
        ).includes("1-2")
      ? "moderate"
      : "developing"

  const occupancyFit =
    occupancyStatus === "comfortable"
      ? "natural"
      : occupancyStatus === "acceptable"
      ? "moderate"
      : occupancyStatus === "dense"
      ? "tight"
      : "restricted"

  const pressure =
    evaluatePressure(
      renter,
      propertyClass,
      applicantPool,
      affordabilityRatio,
      occupancyFit,
      property.bedrooms
    )

  let approvalChance = 50

  approvalChance += {
    strong:22,
    stable:14,
    stretched:3,
    pressured:-24,
  }[financialStrength]

  approvalChance += {
    elite:12,
    strong:8,
    healthy:5,
    tight:-5,
    negative:-15,
  }[bufferLevel]

  approvalChance += {
    high:8,
    moderate:4,
    developing:0,
    unstable:-12,
  }[stabilityConfidence]

  approvalChance += {
    "fully-prepared":14,
    "mostly-prepared":8,
    "moderately-prepared":3,
    incomplete:-10,
  }[readinessProfile]

  approvalChance -=
    pressure.pressureScore * 1.5

  approvalChance =
    Math.max(
      5,
      Math.min(
        96,
        Math.round(
          approvalChance
        )
      )
    )

  const marketPressure =
    demand === "high"
      ? "high"
      : demand === "normal"
      ? "active"
      : "low"

  const processingComplexity =
    pressure.pressureScore >= 12
      ? "high-friction"
      : pressure.pressureScore >= 7
      ? "explanation-required"
      : pressure.pressureScore >= 4
      ? "moderate-review"
      : "straightforward"

  const competitionLevel =
    approvalChance >= 78
      ? "leading"
      : approvalChance >= 55
      ? "competitive"
      : approvalChance >= 40
      ? "behind-market"
      : "outmatched"

  const probableOutcome =
    getProbableOutcome({
      approvalChance,
      propertyClass,
      financialStrength,
      readinessProfile,
      processingComplexity,
      marketPressure,
      competitionLevel
    })

  const feeRisk =
    getFeeRisk({
      approvalChance,
      propertyClass,
      probableOutcome,
      financialStrength,
      processingComplexity,
      marketPressure,
      petsMismatch:false,
      evictionHistory:
        renter.evictionHistory
    })

  const rentRange =
    getRecommendedRentRange({
      totalIncome,
      propertyClass,
      financialStrength,
      stabilityConfidence,
      readinessProfile,
      marketPressure
    })

  const frictionPoints =
    uniqueStrings(
      pressure.pressureReasons,
      3
    )

  const recommendedActions =
    uniqueStrings(
      pressure.advantages,
      5
    )

  return {

    label: property.label,

    fit:
      approvalChance >= 70
      ? "strong"
      : approvalChance >= 45
      ? "borderline"
      : "weak",

    position:
      approvalChance >= 75
      ? "strong"
      : approvalChance >= 45
      ? "competitive"
      : "high-risk",

    friction:
      processingComplexity ===
      "straightforward"
      ? "low"
      : processingComplexity ===
        "moderate-review"
      ? "medium"
      : "high",

    propertyClass,

    likelyApplicantPool:
      applicantPool,

    incomeBand,

    bufferAmount,

    bufferLevel,

    financialStrength,

    readinessProfile,

    stabilityConfidence,

    occupancyFit,

    marketPressure,

    processingComplexity,

    agentPriority:
      approvalChance >= 75
      ? "top-tier"
      : approvalChance >= 50
      ? "review-worthy"
      : "backup-only",

    rejectionRisk:
      approvalChance >= 70
      ? "low"
      : approvalChance >= 50
      ? "moderate"
      : "high",

    competitionLevel,

    feeRisk,

    probableOutcome,

    recommendedRentRange:
      rentRange,

    idealPropertyClass:
      propertyClass === "premium" ||
      propertyClass === "luxury"
      ? "upper-mid"
      : propertyClass,

    avoidPropertyClasses:[],

    targetingAccuracy:
      approvalChance >= 70
      ? "well-targeted"
      : approvalChance >= 45
      ? "slightly-overreaching"
      : "overreaching",

    bestApplicationEnvironment:
      "agency-managed",

    estimatedApplicationWasteRisk:
      feeRisk === "safe-to-apply"
      ? "low"
      : "high",

    estimatedFeeLossExposure:
      feeRisk,

    recoveryDifficulty:
      approvalChance >= 70
      ? "easy"
      : "manageable",

    fastestImprovementLever:
      recommendedActions[0] || "",

    landlordConfidence:
      approvalChance >= 70
      ? "high"
      : "cautious",

    perceivedAdminBurden:
      processingComplexity ===
      "straightforward"
      ? "easy"
      : "manageable",

    marketPositionEstimate:
      approvalChance >= 75
      ? "top-25%"
      : "middle-pack",

    propertyTrapRisk:
      feeRisk ===
      "likely-money-loss"
      ? "high"
      : "low",

    confidenceLevel:
      approvalChance >= 70
      ? "high-confidence"
      : "moderate-confidence",

    affordabilityRatio,

    approvalChance,

    applicationSpeed:
      docsReady
      ? "fast"
      : "normal",

    primaryPressure:
      frictionPoints[0] ||
      "",

    secondaryPressure:
      frictionPoints[1] ||
      "",

    strongestAdvantage:
      pressure.advantages[0] ||
      "",

    strategicFocus:
      recommendedActions[0] ||
      "",

    approvalNarrative:
      `${rentBurden}% of income goes toward rent.`,

    landlordView:
      approvalChance >= 70
      ? "Landlords are likely to view this as lower risk."
      : "Expect comparison against stronger files.",

    betterStrategy:
      recommendedActions[0] || "",

    realityCheck:
      approvalChance >= 70
      ? "This property is realistically within reach."
      : "This may require stronger positioning.",

    confidenceSignals:
      pressure.advantages,

    recommendedActions,

    recoveryPath:[],

    lossPrevention:[],

    agentConcerns:
      pressure.risks,

    applicationTone:
      approvalChance >= 70
      ? "Confident"
      : "Measured",

    mainRisk:
      frictionPoints[0] || "",

    bestMove:
      recommendedActions[0] || "",

    applicationStrategy:
      `${rentBurden}% affordability load.`,

    positioningReason:
      `${rentBurden}% affordability load.`,

    pressure:
      frictionPoints[0] ||
      "",

    message:

`Hi,

I'm interested in ${propertyName} and would like to move forward if it's still available.

Combined household income: R${totalIncome.toLocaleString()}

Please let me know the next step.`,

    demand,

    advantage:
      financialStrength === "strong"
      ? "financial"
      : "none",

    frictionPoints,

    actionPlan:
      recommendedActions,

    insights:[],

    feeWarnings:[],

    isBestTarget:false,

    reasonToChoose:""

  }

}