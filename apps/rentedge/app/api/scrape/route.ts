import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    let html = await res.text();

    // -------------------------
    // CLEAN HTML ENTITIES
    // -------------------------
    html = html.replace(/&#160;/g, " ");

    // -------------------------
    // META HELPER
    // -------------------------
    const getMeta = (name: string) => {
      const match = html.match(
        new RegExp(`<meta[^>]+${name}[^>]+content="([^"]+)"`, "i")
      );
      return match ? match[1] : "";
    };

    const ogTitle = getMeta("property=\"og:title\"");
    const description = getMeta("name=\"description\"");

    const combinedText = `${ogTitle} ${description}`;

    // -------------------------
    // PRICE (SMART FILTER)
    // -------------------------
    let price: number | null = null;

    const priceMatches = combinedText.match(/R\s?([\d\s,]+)/gi);

    if (priceMatches) {
      for (const match of priceMatches) {
        const num = Number(match.replace(/[^\d]/g, ""));
        if (num > 1000 && num < 100000) {
          price = num;
          break;
        }
      }
    }

    // -------------------------
    // BEDROOMS
    // -------------------------
    let bedrooms: number | null = null;

    const bedMatch = combinedText.match(/(\d+)\s?(bed|beds|bedroom|bedrooms)/i);
    if (bedMatch) {
      bedrooms = Number(bedMatch[1]);
    }

    if (!bedrooms) {
      const rawMatch = html.match(/(\d+)\s?(bed|beds|bedroom|bedrooms)/i);
      if (rawMatch) {
        bedrooms = Number(rawMatch[1]);
      }
    }

    // -------------------------
    // RAW TITLE
    // -------------------------
    let rawTitle = ogTitle;

    // ❌ REJECT og:title if it looks like a price
    if (rawTitle && /R\s?\d+/i.test(rawTitle)) {
      rawTitle = "";
    }

    // FALLBACK to <title>
    if (!rawTitle) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        rawTitle = titleMatch[1];
      }
    }

    // -------------------------
    // KNOWN SITE NAMES
    // -------------------------
    // Extend this list as you support more listing sites. Matched as a
    // trailing " - SiteName" segment or standalone, case-insensitive.
    const SITE_NAMES = ["Property24", "Private Property", "PropertyJunction"];

    const stripSiteName = (s: string) => {
      let out = s;
      for (const site of SITE_NAMES) {
        const escaped = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        out = out.replace(new RegExp(`\\s*-\\s*${escaped}\\s*`, "gi"), " ");
        out = out.replace(new RegExp(escaped, "gi"), "");
      }
      return out.trim();
    };

    // -------------------------
    // TITLE (cleaned, full descriptive phrase)
    // -------------------------
    let title = "";
    if (rawTitle) {
      title = stripSiteName(rawTitle)
        .replace(/-?\s*p\d+.*$/i, "")       // trailing listing IDs, e.g. "-P12345"
        .replace(/r\s?\d[\d\s,]*/gi, "")    // price if it slipped into the title
        .replace(/\s{2,}/g, " ")
        .replace(/\s*-\s*$/, "")            // trailing dangling dash left by cleanup above
        .trim();
    }

    // -------------------------
    // LOCATION / AREA (short suburb, not the full title)
    // -------------------------
    // Property listing titles are typically either:
    //   "<Description> in <Suburb> - Property24"
    //   "<Description> - <Street address> - <Suburb> - Property24"
    // We split on " - ", drop the site name and anything that looks like a
    // street address (starts with a number), then prefer the last remaining
    // segment — unless it still contains " in ", in which case the real
    // suburb is whatever follows the last " in ".
    let location = "";
    if (title) {
      const segments = title
        .split(" - ")
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => !/^\d/.test(s)); // drop street-address-looking segments

      if (segments.length > 0) {
        const candidate = segments[segments.length - 1];
        const inMatch = candidate.match(/\bin\s+(.+)$/i);
        location = (inMatch ? inMatch[1] : candidate).trim();
      }

      // Fallback: if segment-splitting produced nothing usable, try
      // extracting straight from the full title via " in <suburb>"
      if (!location) {
        const inMatch = title.match(/\bin\s+([^-]+)$/i);
        if (inMatch) location = inMatch[1].trim();
      }
    }

    return NextResponse.json({
      title,
      price,
      location,
      bedrooms,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Scraping failed" },
      { status: 500 }
    );
  }
}