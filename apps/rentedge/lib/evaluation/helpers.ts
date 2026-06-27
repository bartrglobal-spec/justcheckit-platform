import {
  BufferLevel,
  IncomeBand,
  PropertyClass,
  PropertyInput,
} from "./types"

export function normalizeText(
  value?: string
) {
  return (value || "")
    .trim()
    .toLowerCase()
}

export function uniqueStrings(
  items: Array<string | undefined | null>,
  limit?: number
) {
  const out: string[] = []

  const seen = new Set<string>()

  for (const item of items) {
    const text =
      typeof item === "string"
        ? item.trim()
        : ""

    if (!text) {
      continue
    }

    const key = text.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    out.push(text)

    if (
      typeof limit === "number" &&
      out.length >= limit
    ) {
      break
    }
  }

  return out
}

export function getCleanPropertyName(
  property: PropertyInput
) {
  if (property.title) {
    return property.title
  }

  if (
    property.bedrooms &&
    property.location
  ) {
    return (
      String(property.bedrooms) +
      "-bedroom property in " +
      property.location
    )
  }

  if (property.location) {
    return (
      "property in " +
      property.location
    )
  }

  return "the property"
}

export function getPropertyClass(
  property: PropertyInput
): PropertyClass {
  const rent = property.rent || 0

  const descriptor = [
    property.title,
    property.label,
    property.location,
    property.type,
    property.priceBand,
    property.demand,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const premiumKeywords = [
    "luxury",
    "penthouse",
    "executive",
    "beachfront",
    "villa",
    "mansion",
    "prestige",
    "upmarket",
    "exclusive",
    "high-end",
  ]

  const estateKeywords = [
    "golf estate",
    "estate",
    "gated",
    "country club",
    "estate living",
  ]

  let rank = 0

  if (rent >= 50000) {
    rank = 4
  } else if (rent >= 30000) {
    rank = 3
  } else if (rent >= 18000) {
    rank = 2
  } else if (rent >= 9000) {
    rank = 1
  } else {
    rank = 0
  }

  if (
    premiumKeywords.some((keyword) =>
      descriptor.includes(keyword)
    )
  ) {
    rank += 1
  }

  if (
    estateKeywords.some((keyword) =>
      descriptor.includes(keyword)
    ) &&
    rank <= 2
  ) {
    rank += 1
  }

  const priceBand = normalizeText(
    property.priceBand
  )

  if (
    priceBand.includes("luxury")
  ) {
    rank += 1
  } else if (
    priceBand.includes("premium")
  ) {
    rank += 1
  } else if (
    priceBand.includes("upper")
  ) {
    rank += 1
  }

  rank = Math.max(
    0,
    Math.min(4, rank)
  )

  switch (rank) {
    case 0:
      return "entry"

    case 1:
      return "mid-market"

    case 2:
      return "upper-mid"

    case 3:
      return "premium"

    default:
      return "luxury"
  }
}

export function getDemandLevel(
  property: PropertyInput
): "high" | "normal" | "low" {
  const rent = property.rent || 0

  const descriptor = [
    property.title,
    property.label,
    property.location,
    property.type,
    property.priceBand,
    property.demand,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (
    descriptor.includes("golf estate") ||
    descriptor.includes("estate") ||
    descriptor.includes("beachfront") ||
    descriptor.includes("luxury") ||
    descriptor.includes("executive")
  ) {
    if (rent >= 22000) {
      return "high"
    }
  }

  if (rent <= 12000) {
    return "high"
  }

  if (
    rent <= 25000 &&
    property.bedrooms <= 2
  ) {
    return "high"
  }

  if (rent > 35000) {
    return "low"
  }

  return "normal"
}

export function getOccupancyStatus(
  occupants: number,
  bedrooms: number,
  propertyClass?: PropertyClass
) {
  if (!bedrooms) {
    return "unknown"
  }

  const peoplePerBedroom =
    occupants / bedrooms

  const compactUnit =
    bedrooms <= 2

  const premiumCompact =
    compactUnit &&
    (
      propertyClass === "premium" ||
      propertyClass === "luxury"
    )

  if (peoplePerBedroom <= 1) {
    return "comfortable"
  }

  if (
    peoplePerBedroom <= 1.5 &&
    occupants <= bedrooms + 1
  ) {
    return premiumCompact
      ? "acceptable"
      : "comfortable"
  }

  if (peoplePerBedroom <= 2) {
    if (premiumCompact) {
      return "overcrowded"
    }

    return compactUnit
      ? "dense"
      : "acceptable"
  }

  if (peoplePerBedroom <= 3) {
    return compactUnit
      ? "overcrowded"
      : "dense"
  }

  return "extreme"
}

export function getAffordabilityThresholds(
  propertyClass: PropertyClass
) {
  if (propertyClass === "entry") {
    return {
      strong: 3.0,
      stable: 2.4,
      stretched: 2.0,
    }
  }

  if (propertyClass === "mid-market") {
    return {
      strong: 3.3,
      stable: 2.65,
      stretched: 2.15,
    }
  }

  if (propertyClass === "upper-mid") {
    return {
      strong: 3.6,
      stable: 2.9,
      stretched: 2.4,
    }
  }

  if (propertyClass === "premium") {
    return {
      strong: 4.0,
      stable: 3.15,
      stretched: 2.6,
    }
  }

  return {
    strong: 4.4,
    stable: 3.5,
    stretched: 2.8,
  }
}

export function getIncomeBand(
  totalIncome: number
): IncomeBand {
  if (totalIncome >= 100000) {
    return "elite"
  }

  if (totalIncome >= 70000) {
    return "very-strong"
  }

  if (totalIncome >= 45000) {
    return "strong"
  }

  if (totalIncome >= 25000) {
    return "moderate"
  }

  return "low"
}

export function getBufferLevel(
  bufferAmount: number
): BufferLevel {
  if (bufferAmount >= 50000) {
    return "elite"
  }

  if (bufferAmount >= 30000) {
    return "strong"
  }

  if (bufferAmount >= 15000) {
    return "healthy"
  }

  if (bufferAmount >= 0) {
    return "tight"
  }

  return "negative"
}

export function getMoveTone(
  moveTimeline?: string
) {
  const value =
    normalizeText(moveTimeline)

  if (value === "immediately") {
    return "immediate"
  }

  if (value === "within 30 days") {
    return "fast"
  }

  if (value === "1-3 months") {
    return "later"
  }

  if (value === "just browsing") {
    return "casual"
  }

  return "unknown"
}

export function getCreditWeight(
  creditIssues?: string
) {
  const value =
    normalizeText(creditIssues)

  if (value === "serious") {
    return 3
  }

  if (value === "minor") {
    return 1
  }

  return 0
}

export function getLikelyApplicantPool(
  propertyClass: PropertyClass
) {
  switch (propertyClass) {
    case "entry":
      return "volume-driven"

    case "mid-market":
      return "mixed"

    case "upper-mid":
      return "professional"

    case "premium":
      return "affluent"

    case "luxury":
      return "elite"

    default:
      return "mixed"
  }
}