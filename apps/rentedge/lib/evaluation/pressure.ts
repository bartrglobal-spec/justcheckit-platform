import {
  LikelyApplicantPool,
  PropertyClass,
  RenterProfile,
} from "./types"

type PressureResult = {
  pressureScore: number

  pressureLevel:
    | "low"
    | "moderate"
    | "high"
    | "extreme"

  pressureReasons: string[]

  advantages: string[]

  risks: string[]
}

export function evaluatePressure(
  renter: RenterProfile,
  propertyClass: PropertyClass,
  applicantPool: LikelyApplicantPool,
  ratio: number,
  occupancyFit?:
    | "natural"
    | "moderate"
    | "tight"
    | "restricted",
  bedrooms?: number
): PressureResult {
  let pressureScore = 0

  const pressureReasons: string[] = []

  const advantages: string[] = []

  const risks: string[] = []

  const employment =
    renter.employment
      ?.trim()
      .toLowerCase() || ""

  const duration =
    renter.duration
      ?.trim()
      .toLowerCase() || ""

  const occupants =
    renter.occupants || 1

  const referencesReady =
    renter.referencesReady === true

  const guarantorAvailable =
    renter.guarantorAvailable ===
    true

  const pets = renter.pets === true

  const creditIssues =
    renter.creditIssues
      ?.trim()
      .toLowerCase() || "none"

  // --------------------------------------------------
  // AFFORDABILITY
  // --------------------------------------------------

  if (ratio < 2.2) {
    pressureScore += 3

    pressureReasons.push(
      "income is tight against the rental amount"
    )

    risks.push(
      "affordability could concern agents or landlords"
    )
  } else if (ratio < 2.8) {
    pressureScore += 1

    pressureReasons.push(
      "income flexibility is limited"
    )
  } else {
    advantages.push(
      "income position appears stable for the rental"
    )
  }

  // --------------------------------------------------
  // EMPLOYMENT
  // --------------------------------------------------

  if (
    employment === "unemployed"
  ) {
    pressureScore += 4

    pressureReasons.push(
      "lack of active employment increases approval difficulty"
    )

    risks.push(
      "most landlords prefer stable verified income"
    )
  }

  if (
    employment ===
      "self-employed" &&
    ratio < 3
  ) {
    pressureScore += 2

    pressureReasons.push(
      "self-employed applicants usually face higher verification pressure"
    )

    risks.push(
      "additional financial proof may be expected"
    )
  }

  if (
    duration.includes("less than 6")
  ) {
    pressureScore += 2

    pressureReasons.push(
      "short employment duration may reduce confidence"
    )
  } else if (
    duration.includes("2+ years") ||
    duration.includes("5+ years")
  ) {
    advantages.push(
      "employment history shows stability"
    )
  }

  // --------------------------------------------------
  // DOCUMENTATION
  // --------------------------------------------------

  if (!referencesReady) {
    pressureScore += 2

    pressureReasons.push(
      "missing references slows landlord confidence"
    )

    risks.push(
      "competition may move ahead faster"
    )
  } else {
    advantages.push(
      "references are ready for verification"
    )
  }

  if (guarantorAvailable) {
    pressureScore -= 1

    advantages.push(
      "guarantor support improves fallback security"
    )
  }

  // --------------------------------------------------
  // PETS
  // --------------------------------------------------

  if (pets) {
    if (
      propertyClass === "premium" ||
      propertyClass === "luxury"
    ) {
      pressureScore += 2

      pressureReasons.push(
        "pets can reduce approval odds in higher-end rentals"
      )
    } else {
      pressureScore += 1

      pressureReasons.push(
        "pet approval may narrow available options"
      )
    }
  }

  // --------------------------------------------------
  // OCCUPANCY PRESSURE
  // --------------------------------------------------

  if (occupancyFit === "moderate") {
    pressureScore += 2

    pressureReasons.push(
      "occupancy levels may feel slightly tight for the property"
    )

    risks.push(
      "some landlords prefer lower occupant density"
    )
  }

  if (occupancyFit === "tight") {
    pressureScore += 6

    pressureReasons.push(
      "occupancy density may concern landlords during screening"
    )

    risks.push(
      "overcrowding concerns may reduce approval confidence"
    )

    if (
      bedrooms !== undefined &&
      bedrooms <= 2
    ) {
      pressureScore += 2

      pressureReasons.push(
        "compact rentals usually apply stricter occupancy expectations"
      )
    }

    if (
      propertyClass === "premium" ||
      propertyClass === "luxury"
    ) {
      pressureScore += 3

      pressureReasons.push(
        "higher-end rentals are usually stricter about occupant density"
      )

      risks.push(
        "premium landlords often avoid heavily occupied units"
      )
    }
  }

  if (occupancyFit === "restricted") {
    pressureScore += 8

    pressureReasons.push(
      "the occupancy setup creates major approval friction"
    )

    risks.push(
      "the application may fall outside the landlord's preferred occupancy profile"
    )
  }

  // Hard overcrowding escalation

  if (
    bedrooms !== undefined &&
    bedrooms > 0
  ) {
    const ratioPerBedroom =
      occupants / bedrooms

    if (ratioPerBedroom >= 3) {
      pressureScore += 5

      pressureReasons.push(
        "occupancy levels appear significantly above normal rental expectations"
      )

      risks.push(
        "many landlords may reject the application before deeper review"
      )
    } else if (
      ratioPerBedroom >= 2.5
    ) {
      pressureScore += 3

      pressureReasons.push(
        "occupancy density may feel excessive for the space"
      )
    }
  }

  // --------------------------------------------------
  // CREDIT
  // --------------------------------------------------

  if (
    creditIssues === "serious"
  ) {
    pressureScore += 4

    pressureReasons.push(
      "credit history may heavily affect approvals"
    )

    risks.push(
      "financial screening could become stricter"
    )
  } else if (
    creditIssues === "minor"
  ) {
    pressureScore += 1

    pressureReasons.push(
      "minor credit concerns may require explanation"
    )
  }

  // --------------------------------------------------
// COMPETITION
// --------------------------------------------------

if (
  applicantPool === "elite"
) {

  pressureScore += 3

  pressureReasons.push(
    "competition for this property is extremely high"
  )

  risks.push(
    "stronger competing applicants are likely"
  )

} else if (

  applicantPool === "affluent" ||

  applicantPool === "professional"

) {

  pressureScore += 2

  pressureReasons.push(
    "competition is higher than normal"
  )

} else if (

  applicantPool === "volume-driven"

) {

  pressureScore -= 1

  advantages.push(
    "reduced competition improves flexibility"
  )

}

  // --------------------------------------------------
  // PROPERTY CLASS
  // --------------------------------------------------

  if (
    propertyClass === "luxury"
  ) {
    pressureScore += 2

    pressureReasons.push(
      "luxury rentals usually apply stricter screening"
    )
  } else if (
    propertyClass === "premium"
  ) {
    pressureScore += 1
  }

  pressureScore = Math.max(
    0,
    pressureScore
  )

  let pressureLevel:
    | "low"
    | "moderate"
    | "high"
    | "extreme"

  if (pressureScore >= 14) {
    pressureLevel = "extreme"
  } else if (
    pressureScore >= 9
  ) {
    pressureLevel = "high"
  } else if (
    pressureScore >= 5
  ) {
    pressureLevel = "moderate"
  } else {
    pressureLevel = "low"
  }

  return {
    pressureScore,
    pressureLevel,
    pressureReasons,
    advantages,
    risks,
  }
}