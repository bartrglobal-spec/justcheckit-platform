export type UnlockObservation = {
  observation: string
  explanation: string
}

export type UnlockStrength = {
  title: string
  explanation: string
  whyItMatters: string
  keepDoing: string
}

export type AgentQuestion = {
  question: string
  howAgentsThink: string
  howYouFit: string
  whyWeSayThat: string
  nextMove: string
}

export type PropertyConversation = {
  propertyLabel: string

  easierHere: string[]

  attentionHere: string[]

  focusHere: string[]
}

export type UnlockOpportunity = {
  title: string
  explanation: string
  whyItMatters: string
  benefit: string
}

export type FocusArea = {
  what: string
  why: string
  impact: string
}

export type UnlockStrategy = {
  narrative: string
}

export type UnlockIntroduction = {
  introduction: string
}

export type UnlockEvaluation = {
  observations: UnlockObservation[]

  strengths: UnlockStrength[]

  agentQuestions: AgentQuestion[]

  propertyConversations: PropertyConversation[]

  opportunities: UnlockOpportunity[]

  focusAreas: FocusArea[]

  strategy: UnlockStrategy

  introduction: UnlockIntroduction
}