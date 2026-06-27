import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "../types"

import {
  UnlockIntroduction,
} from "./types"

export function buildIntroduction(
  renter: RenterProfile,
  property: PropertyInput,
  evaluation: PropertyEvaluation
): UnlockIntroduction {

  const lines: string[] = []

  const propertyTitle =
    property.title?.trim()

  const propertyLocation =
    property.location?.trim()

  const employment =
    renter.employment?.trim()

  const duration =
    renter.duration?.trim()

  /*
   * Opening
   */

  lines.push("Hi,")

  lines.push("")

  if (
    propertyTitle &&
    propertyLocation
  ) {
    lines.push(
      `I came across the ${propertyTitle} in ${propertyLocation} and wanted to reach out.`
    )
  } else if (
    propertyTitle
  ) {
    lines.push(
      `I came across the ${propertyTitle} and wanted to reach out.`
    )
  } else if (
    propertyLocation
  ) {
    lines.push(
      `I saw the property listing in ${propertyLocation} and wanted to introduce myself.`
    )
  } else {
    lines.push(
      "I came across your property listing and wanted to introduce myself."
    )
  }

  lines.push("")

  /*
   * Why this property
   */

  if (
    property.bedrooms >= 3
  ) {
    lines.push(
      "I've been looking for a place with a bit more space and this one stood out to me."
    )
  } else {
    lines.push(
      "I've been looking for a place that feels like a good fit and this one stood out to me."
    )
  }

  lines.push("")

  /*
   * Employment
   */

  if (
    employment
  ) {
    if (
      duration &&
      duration.includes("2+")
    ) {
      lines.push(
        `I'm currently ${employment.toLowerCase()} and have been in my position for a number of years.`
      )
    } else if (
      duration &&
      duration.includes("1-2")
    ) {
      lines.push(
        `I'm currently ${employment.toLowerCase()} and have been settled in my position for some time.`
      )
    } else {
      lines.push(
        `I'm currently ${employment.toLowerCase()}.`
      )
    }

    lines.push("")
  }

  /*
   * References & Documents
   */

  if (
    renter.referencesReady &&
    (
      evaluation.readinessProfile ===
        "fully-prepared" ||
      evaluation.readinessProfile ===
        "mostly-prepared"
    )
  ) {
    lines.push(
      "I can provide the usual application documents and references if needed."
    )

    lines.push("")
  } else if (
    renter.referencesReady
  ) {
    lines.push(
      "I'm also able to provide references if needed."
    )

    lines.push("")
  }

  /*
   * Deposit readiness
   */

  if (
    renter.depositReady
  ) {
    lines.push(
      "I've been preparing for my next move and would be ready to move forward if everything is a good fit."
    )

    lines.push("")
  }

  /*
   * Closing
   */

  lines.push(
    "If the property is still available, I'd love to hear a bit more about the next steps."
  )

  lines.push("")

  lines.push("Thanks")

  return {
    introduction:
      lines.join("\n"),
  }
}