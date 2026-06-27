export function buildUnlockPresentation(
  evaluation:any,
  profile:any,
  property:any
){

const income=
(profile.income||0)+
(profile.additionalIncome||0)

const rent=
property.rent||0

const rentPercent=
income
?Math.round(
(rent/income)*100
)
:0

const heroDecision=

evaluation.approvalChance>=75
?'Strong Opportunity'

:evaluation.approvalChance>=50
?'Worth Investigating'

:'Proceed Carefully'

const heroSummary=

evaluation.approvalChance>=75

?`This property currently looks achievable based on affordability, preparation, and the amount of friction your profile creates during screening.`

:evaluation.approvalChance>=50

?`This property may still work, but there are areas that could create extra questions, slower approvals, or stronger competition.`

:`There are multiple pressure points here. That does not automatically mean no — but applying without a strategy could become expensive.`


const affordabilityExplanation=

rentPercent<=25

?`Around ${rentPercent}% of household income goes toward rent. This usually leaves room for living costs, unexpected expenses, and normal monthly pressure.`

:rentPercent<=33

?`Around ${rentPercent}% of household income goes toward rent. Many agents and landlords still view this range as manageable.`

:rentPercent<=40

?`Around ${rentPercent}% of household income goes toward rent. Expect affordability questions and requests for stronger supporting documents.`

:`Around ${rentPercent}% of household income goes toward rent. This creates higher affordability pressure and can reduce approval confidence.`


const approvalDifficulty=

evaluation.approvalChance>=75

?`Your current profile creates relatively low approval friction.`

:evaluation.approvalChance>=50

?`Approval is still possible, but stronger applications could create pressure.`

:`Expect approval pressure unless you improve positioning or target better matched properties.`


const competitionExplanation=

evaluation.marketPressure==="high"

?`Competition is likely higher here which means response speed, documents, and preparation matter more.`

:evaluation.marketPressure==="active"

?`Expect normal market competition where preparation can create an advantage.`

:`Competition pressure currently appears lower than faster moving rental environments.`


const agentView=

evaluation.processingComplexity==="straightforward"

?`An agent is less likely to spend additional time chasing documents, explanations, or follow ups.`

:evaluation.processingComplexity==="moderate-review"

?`Agents may request extra supporting documents or additional explanations.`

:`This application could create extra admin work which may reduce enthusiasm during screening.`


const moneyProtection=[

"Ask about application, admin, and screening fees before paying anything.",

"Get your own credit report first so you know what agents may already see.",

"Prepare documents before applying broadly to avoid paying repeatedly for weak applications.",

"Do not assume every property deserves an application fee simply because you like it."

]


const smartestMove=

evaluation.recommendedActions?.[0]

||

"Improve application strength before broad applications."


const signalCards=[

{

label:'Can You Comfortably Afford This?',

value:

rentPercent<=25

?`Looks comfortable`

:rentPercent<=33

?`Probably manageable`

:rentPercent<=40

?`Starting to stretch`

:`High affordability pressure`

},

{

label:'How Difficult Could Approval Be?',

value:

evaluation.approvalChance>=75

?`Lower friction`

:evaluation.approvalChance>=50

?`Some obstacles`

:`Expect more resistance`

},

{

label:'What Competition Might Look Like',

value:

evaluation.marketPressure==="high"

?'Competitive environment'

:evaluation.marketPressure==="active"

?'Moderate competition'

:'Lower competition'

},

{

label:'Biggest Improvement Opportunity',

value:smartestMove

}

]


const landlordSignals=[

affordabilityExplanation,

competitionExplanation,

agentView,

evaluation.strongestAdvantage

]


const whySignals=[

affordabilityExplanation,

evaluation.mainRisk||

"Your profile creates some additional pressure during screening.",

evaluation.strongestAdvantage,

approvalDifficulty

]


const applicationMessage=

`Hi,

I'm interested in ${property.title||property.location||'the property'} and wanted to ask whether it is still available.

A little about my application:

• Combined household income: R${income.toLocaleString()}

• Documents are ${
evaluation.applicationSpeed==="fast"
?'prepared and available'
:'being prepared'
}

• Intended move timeline: ${
profile.moveTimeline||
'flexible'
}

I would appreciate information about the next step and required documents so I can prepare everything correctly.

Thank you and I look forward to hearing from you.`


return{

heroDecision,

heroSummary,

signalCards,

landlordSignals,

whySignals,

fastestImprovement:
smartestMove,

actions:[

smartestMove,

...moneyProtection,

...(evaluation.recommendedActions||[])

],

message:
applicationMessage

}

}