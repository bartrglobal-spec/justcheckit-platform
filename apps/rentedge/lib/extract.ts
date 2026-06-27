export function extractPropertyFromLink(link: string) {
  if (!link) return null;

  let location = "";
  let rent: number | null = null;
  let bedrooms: number | null = null;
  let type = "";
  let availability = "Immediate";

  let demand = "normal";
  let priceBand = "";

  try {
    const url = new URL(link);
    const full = decodeURIComponent(link.toLowerCase());

    // -----------------------------------
    // 1. DOMAIN DETECTION
    // -----------------------------------
    const host = url.hostname;

    // -----------------------------------
    // 2. PRIVATEPROPERTY (REAL FIX)
    // -----------------------------------
    if (host.includes("privateproperty")) {
      const parts = url.pathname.split("/").filter(Boolean);

      // location is near the end
      const suburbPart = parts.slice(-1)[0];
      if (suburbPart) {
        location = suburbPart
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // rent from page is NOT in URL → fallback below
    }

    // -----------------------------------
    // 3. PROPERTY24
    // -----------------------------------
    if (host.includes("property24")) {
      const parts = url.pathname.split("/").filter(Boolean);

      const suburbPart = parts[parts.length - 1];
      if (suburbPart) {
        location = suburbPart
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    // -----------------------------------
    // 4. UNIVERSAL RENT EXTRACTION (FIXED)
    // -----------------------------------
    // Look for realistic rent values only
    const rentMatch = full.match(/r?\s?(\d{3,5})/g);

    if (rentMatch) {
      const numbers = rentMatch
        .map((m) => Number(m.replace(/\D/g, "")))
        .filter((n) => n >= 1000 && n <= 100000); // realistic SA rent

      if (numbers.length > 0) {
        // pick the most reasonable (middle value)
        rent = numbers.sort((a, b) => a - b)[
          Math.floor(numbers.length / 2)
        ];
      }
    }

    // -----------------------------------
    // 5. BEDROOM DETECTION
    // -----------------------------------
    const bedMatch = full.match(/(\d+)[-\s]?bed/);
    if (bedMatch) {
      bedrooms = Number(bedMatch[1]);
    }

    // -----------------------------------
    // 6. TYPE DETECTION
    // -----------------------------------
    if (full.includes("apartment")) type = "Apartment";
    else if (full.includes("house")) type = "House";
    else if (full.includes("townhouse")) type = "Townhouse";

    // -----------------------------------
    // 7. PRICE BAND + DEMAND
    // -----------------------------------
    if (rent) {
      if (rent < 8000) {
        priceBand = "budget";
        demand = "high";
      } else if (rent < 15000) {
        priceBand = "mid";
        demand = "high";
      } else {
        priceBand = "premium";
        demand = "low";
      }
    }

    // -----------------------------------
    // 8. FINAL CLEANUP (CRITICAL)
    // -----------------------------------
    if (location.toLowerCase().includes("western cape")) {
      location = ""; // remove garbage location
    }

    return {
      location,
      rent,
      bedrooms,
      type,
      availability,
      demand,
      priceBand,
    };

  } catch (err) {
    console.log("Extraction failed:", err);
    return null;
  }
}