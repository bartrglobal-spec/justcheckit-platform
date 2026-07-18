import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "./types"

import { evaluateProperty } from "../evaluation"

export type PropertyEvaluationEntry = {
  property: PropertyInput & { id?: number }
  evaluation: PropertyEvaluation
}

// Evaluates every tracked property against the same renter profile in one
// pass. Used by the property switcher (so each tile can show its own real
// dial) and the affordability explorer (so dragging the income slider or
// toggling the guarantor updates every tracked property at once, not just
// the one currently selected).
export function evaluateProperties(
  renter: RenterProfile,
  properties: PropertyInput[]
): PropertyEvaluationEntry[] {
  return properties.map((property) => ({
    property,
    evaluation: evaluateProperty(renter, property),
  }))
}