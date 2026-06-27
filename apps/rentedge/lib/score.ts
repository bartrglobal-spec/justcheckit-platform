export type RenterProfile = {
  income: number;
  employment: string;
  duration: string;
  deposit: string;
  risk: string;
  occupants: number;
};

export type PropertyInput = {
  rent: number;
  bedrooms: number;
  label: string;

  type?: string;
  availability?: string;

  // 🔥 NEW REAL-WORLD IDENTITY
  title?: string;
  location?: string;

  demand?: string;     // low | normal | high
  priceBand?: string;  // budget | mid | premium
};

export type PropertyEvaluation = {
  label: string;

  fit: "strong" | "borderline" | "weak";
  mainRisk: string;
  bestMove: string;
  friction: "low" | "medium" | "high";

  advantage: "financial" | "speed" | "stability" | "none";

  applicationStrategy: string;
  isBestTarget: boolean;
  reasonToChoose: string;

  demand: string;
  pressure: string;
  positioningReason: string;
  message: string;

  frictionPoints: string[];
};

// -----------------------------
// HELPER → HUMAN PROPERTY NAME
// -----------------------------
function getPropertyName(property: PropertyInput) {
  if (property.title) return property.title;

  if (property.bedrooms && property.location) {
    return `${property.bedrooms}-bedroom property in ${property.location}`;
  }

  if (property.location) return `the property in ${property.location}`;

  return "the property";
}

// -----------------------------
// CORE ENGINE
// -----------------------------
export function evaluateProperty(
  renter: RenterProfile,
  property: PropertyInput
): PropertyEvaluation {

  const rentToIncome = renter.income / (property.rent || 1);
  const durationYears = parseInt(renter.duration || "0");
  const demand = property.demand || "normal";

  const propertyName = getPropertyName(property);

  // -----------------------------
  // FIT
  // -----------------------------
  let fit: "strong" | "borderline" | "weak";

  if (rentToIncome >= 2.7) fit = "strong";
  else if (rentToIncome >= 2.2) fit = "borderline";
  else fit = "weak";

  // -----------------------------
  // FRICTION
  // -----------------------------
  let friction: "low" | "medium" | "high";

  if (
    rentToIncome >= 2.7 &&
    renter.deposit !== "Not ready yet" &&
    renter.employment === "Employed" &&
    durationYears >= 1
  ) {
    friction = "low";
  } else if (rentToIncome >= 2.2) {
    friction = "medium";
  } else {
    friction = "high";
  }

  // -----------------------------
  // 🔥 FRICTION POINTS (REAL REASONS AGENTS HESITATE)
  // -----------------------------
  const frictionPoints: string[] = [];

  if (renter.deposit === "Not ready yet") {
    frictionPoints.push("Deposit not ready — delays commitment");
  }

  if (renter.employment !== "Employed") {
    frictionPoints.push("Income structure requires more verification");
  }

  if (durationYears < 1) {
    frictionPoints.push("Short income track record");
  }

  if (rentToIncome < 2.5) {
    frictionPoints.push("Affordability not clearly strong");
  }

  if (
    property.bedrooms &&
    renter.occupants / property.bedrooms > 2
  ) {
    frictionPoints.push("Occupancy density may concern agent");
  }

  if (
    property.availability === "Immediate" &&
    renter.deposit === "Not ready yet"
  ) {
    frictionPoints.push("Timing mismatch with availability");
  }

  // -----------------------------
  // DEMAND PRESSURE
  // -----------------------------
  let pressure = "";

  if (demand === "high") {
    pressure = "High competition — agents shortlist quickly";
  } else if (demand === "low") {
    pressure = "Lower competition — more flexibility";
  } else {
    pressure = "Moderate competition — positioning matters";
  }

  // -----------------------------
  // MAIN RISK
  // -----------------------------
  let mainRisk = "";

  if (rentToIncome < 2.2) {
    mainRisk = "Your income is too tight for this rent";
  } else if (frictionPoints.length > 0) {
    mainRisk = frictionPoints[0];
  } else {
    mainRisk = "You may lose to a faster applicant";
  }

  // -----------------------------
  // ADVANTAGE
  // -----------------------------
  let advantage: "financial" | "speed" | "stability" | "none" = "none";

  if (demand === "high" && renter.deposit !== "Not ready yet") {
    advantage = "speed";
  } else if (rentToIncome >= 3) {
    advantage = "financial";
  } else if (durationYears >= 2) {
    advantage = "stability";
  }

  // -----------------------------
  // BEST MOVE
  // -----------------------------
  let bestMove = "";

  if (demand === "high") {
    bestMove =
      "Apply immediately with full documents — remove all friction and be first";
  } else {
    bestMove =
      "Make your application easy to approve by removing uncertainty";
  }

  // -----------------------------
  // POSITIONING
  // -----------------------------
  let positioningReason = "";

  if (demand === "high") {
    positioningReason =
      "Agents choose the fastest complete applicant, not the best one later.";
  } else {
    positioningReason =
      "Clarity and affordability matter more than speed alone.";
  }

  // -----------------------------
  // 🔥 MESSAGE (FIXED + REAL)
  // -----------------------------
  let message = "";

  if (demand === "high") {
    message = `Hi, I’m interested in ${propertyName} and would like to move forward immediately if it’s still available.

I’ve already confirmed affordability and I’m ready to proceed without delays.

• Income: R${renter.income}
• Employment: ${renter.employment}
• Occupants: ${renter.occupants}
• Deposit: ${renter.deposit}

I have all documents ready (ID, payslips, bank statements) and can send everything through immediately.

If the property is still available, I can complete the application today.

Please let me know the next step — I’m ready to move quickly.`;
  } else {
    message = `Hi, I’m interested in ${propertyName} and would like to apply.

• Income: R${renter.income}
• Employment: ${renter.employment}
• Occupants: ${renter.occupants}
• Deposit: ${renter.deposit}

I’ve reviewed affordability and have all documents ready.

Please let me know the next step.`;
  }

  // -----------------------------
  // STRATEGY
  // -----------------------------
  let applicationStrategy = "";

  if (demand === "high") {
    applicationStrategy =
      "Speed wins — apply immediately and remove all friction.";
  } else if (fit === "strong") {
    applicationStrategy =
      "You are strong — focus on clarity and completeness.";
  } else {
    applicationStrategy =
      "Reduce risk perception to compete.";
  }

  return {
    label: property.label,
    fit,
    mainRisk,
    bestMove,
    friction,
    advantage,
    applicationStrategy,
    isBestTarget: false,
    reasonToChoose: "",
    demand,
    pressure,
    positioningReason,
    message,
    frictionPoints,
  };
}

// -----------------------------
// RANKING
// -----------------------------
export function rankProperties(evaluations: PropertyEvaluation[]) {
  const fitScore = { strong: 3, borderline: 2, weak: 1 };
  const frictionScore = { low: 3, medium: 2, high: 1 };

  const ranked = evaluations.sort((a, b) => {
    const demandWeight = a.demand === "high" ? 2 : 1;

    const aScore =
      fitScore[a.fit] * demandWeight +
      frictionScore[a.friction] * demandWeight;

    const bScore =
      fitScore[b.fit] * demandWeight +
      frictionScore[b.friction] * demandWeight;

    return bScore - aScore;
  });

  const bestLabel = ranked[0]?.label;

  return ranked.map((item) => ({
    ...item,
    isBestTarget: item.label === bestLabel,
    reasonToChoose:
      item.label === bestLabel
        ? "This is where you are easiest to approve right now."
        : "You are less competitive here compared to your best option.",
  }));
}