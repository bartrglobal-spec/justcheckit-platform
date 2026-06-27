type ShortlistProperty = {
  rent: number;
  bedrooms: number;
  label: string;
};

let shortlist: ShortlistProperty[] = [];

// -----------------------------
// ADD PROPERTY
// -----------------------------
export function addToShortlist(property: ShortlistProperty) {
  // limit to 3 properties max
  if (shortlist.length >= 3) return;

  shortlist.push(property);
}

// -----------------------------
// GET ALL
// -----------------------------
export function getShortlist() {
  return shortlist;
}

// -----------------------------
// CLEAR
// -----------------------------
export function clearShortlist() {
  shortlist = [];
}

// -----------------------------
// COUNT
// -----------------------------
export function getShortlistCount() {
  return shortlist.length;
}