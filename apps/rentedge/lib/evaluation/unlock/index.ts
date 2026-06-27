import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "../types"

import {
  UnlockEvaluation,
} from "./types"

import {
  buildObservations,
} from "./observations"

import {
  buildStrengths,
} from "./strengths"

import {
  buildAgentQuestions,
} from "./agent-perspective"

import {
  buildPropertyConversation,
} from "./property-lens"

import {
  buildOpportunities,
} from "./opportunities"

import {
  buildFocusAreas,
} from "./focus"

import {
  buildStrategy,
} from "./strategy"

import {
  buildIntroduction,
} from "./introduction"

export function evaluateUnlock(
  renter: RenterProfile,
  properties: PropertyInput[],
  selectedProperty: PropertyInput,
  selectedEvaluation: PropertyEvaluation
): UnlockEvaluation {

  return {

    observations:
      buildObservations(
        renter,
        selectedEvaluation
      ),

    strengths:
      buildStrengths(
        renter,
        selectedEvaluation
      ),

    agentQuestions:
      buildAgentQuestions(
        renter,
        selectedEvaluation
      ),

    propertyConversations: [
  buildPropertyConversation(
    renter,
    selectedProperty,
    selectedEvaluation
  ),
],

    opportunities:
      buildOpportunities(
        renter,
        selectedEvaluation
      ),

    focusAreas:
      buildFocusAreas(
        renter,
        selectedEvaluation
      ),

    strategy:
  buildStrategy(
    renter,
    selectedEvaluation
  ),

    introduction:
      buildIntroduction(
        renter,
        selectedProperty,
        selectedEvaluation
      ),
  }
}