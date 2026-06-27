export type RenterProfile = {
  income: number

  additionalIncome?: number

  employment: string

  duration: string

  occupants: number

  pets?: boolean

  petType?: string

  petSize?: "small" | "medium" | "large"

  smoking?: boolean

  leasePreference?: string

  moveTimeline?: string

  depositReady?: boolean

  idReady?: boolean

  payslipReady?: boolean

  bankStatementsReady?: boolean

  referencesReady?: boolean

  guarantorAvailable?: boolean

  creditIssues?: string

  evictionHistory?: string
}

export type PropertyInput = {
  rent: number

  bedrooms: number

  label: string

  type?: string

  availability?: string

  title?: string

  location?: string

  demand?: string

  priceBand?: string

  petsAllowed?: boolean
}

export type PropertyClass =
  | "entry"
  | "mid-market"
  | "upper-mid"
  | "premium"
  | "luxury"

export type LikelyApplicantPool =
  | "volume-driven"
  | "mixed"
  | "professional"
  | "affluent"
  | "elite"

export type BufferLevel =
  | "negative"
  | "tight"
  | "healthy"
  | "strong"
  | "elite"

export type IncomeBand =
  | "low"
  | "moderate"
  | "strong"
  | "very-strong"
  | "elite"

export type FeeRisk =
  | "safe-to-apply"
  | "caution"
  | "high-waste-risk"
  | "likely-money-loss"

export type ProbableOutcome =
  | "likely-shortlist"
  | "review-possible"
  | "unlikely-callback"
  | "very-low-probability"

export type RecommendedRentRange = {
  comfortable: number

  competitive: number

  stretch: number

  unrealisticAbove: number
}

export type TargetingAccuracy =
  | "well-targeted"
  | "slightly-overreaching"
  | "overreaching"

export type BestApplicationEnvironment =
  | "private-landlord"
  | "agency-managed"
  | "high-volume"
  | "relationship-driven"

export type RecoveryDifficulty =
  | "easy"
  | "manageable"
  | "difficult"
  | "major-reset"

export type LandlordConfidence =
  | "high"
  | "cautious"
  | "uncertain"
  | "avoidance"

export type PerceivedAdminBurden =
  | "easy"
  | "manageable"
  | "high-effort"

export type MarketPositionEstimate =
  | "top-10%"
  | "top-25%"
  | "middle-pack"
  | "below-average"
  | "bottom-tier"

export type PropertyTrapRisk =
  | "low"
  | "moderate"
  | "high"

export type ConfidenceLevel =
  | "high-confidence"
  | "moderate-confidence"
  | "limited-confidence"

export type PropertyEvaluation = {
  label: string

  fit:
    | "strong"
    | "borderline"
    | "weak"

  position:
    | "strong"
    | "competitive"
    | "high-risk"

  friction:
    | "low"
    | "medium"
    | "high"

  propertyClass: PropertyClass

  likelyApplicantPool: LikelyApplicantPool

  incomeBand: IncomeBand

  bufferAmount: number

  bufferLevel: BufferLevel

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

  stabilityConfidence:
    | "high"
    | "moderate"
    | "developing"
    | "unstable"

  occupancyFit:
    | "natural"
    | "moderate"
    | "tight"
    | "restricted"

  marketPressure:
    | "low"
    | "active"
    | "fast-moving"
    | "high"

  processingComplexity:
    | "straightforward"
    | "moderate-review"
    | "explanation-required"
    | "high-friction"

  agentPriority:
    | "top-tier"
    | "review-worthy"
    | "backup-only"
    | "unlikely"

  rejectionRisk:
    | "low"
    | "moderate"
    | "high"
    | "extreme"

  competitionLevel:
    | "leading"
    | "competitive"
    | "behind-market"
    | "outmatched"

  feeRisk: FeeRisk

  probableOutcome: ProbableOutcome

  recommendedRentRange: RecommendedRentRange

  idealPropertyClass:
    | "entry"
    | "mid-market"
    | "upper-mid"

  avoidPropertyClasses: PropertyClass[]

  targetingAccuracy: TargetingAccuracy

  bestApplicationEnvironment:
    BestApplicationEnvironment

  estimatedApplicationWasteRisk:
    | "low"
    | "moderate"
    | "high"
    | "severe"

  estimatedFeeLossExposure: string

  recoveryDifficulty: RecoveryDifficulty

  fastestImprovementLever: string

  landlordConfidence: LandlordConfidence

  perceivedAdminBurden:
    PerceivedAdminBurden

  marketPositionEstimate:
    MarketPositionEstimate

  propertyTrapRisk:
    PropertyTrapRisk

  trapReason?: string

  confidenceLevel:
    ConfidenceLevel

  affordabilityRatio: number

  approvalChance: number

  applicationSpeed:
    | "fast"
    | "normal"
    | "slow"

  primaryPressure: string

  secondaryPressure: string

  strongestAdvantage: string

  strategicFocus: string

  approvalNarrative: string

  landlordView: string

  betterStrategy: string

  realityCheck: string

  confidenceSignals: string[]

  recommendedActions: string[]

  recoveryPath: string[]

  lossPrevention: string[]

  agentConcerns: string[]

  applicationTone: string

  mainRisk: string

  bestMove: string

  applicationStrategy: string

  positioningReason: string

  pressure: string

  message: string

  demand: string

  advantage:
    | "financial"
    | "speed"
    | "stability"
    | "none"

  frictionPoints: string[]

  actionPlan: string[]

  insights: string[]

  feeWarnings: string[]

  isBestTarget: boolean

  reasonToChoose: string
}