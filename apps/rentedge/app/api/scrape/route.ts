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
    // TITLE FIX (IMPORTANT)
    // -------------------------
    let location = "";

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

    if (rawTitle) {
      location = rawTitle
        .replace(/\|.*$/, "")                 // remove site name
        .replace(/-?\s*p\d+.*$/i, "")         // remove IDs
        .replace(/to rent/gi, "")
        .replace(/for rent/gi, "")
        .replace(/r\s?\d[\d\s]*/gi, "")       // remove price from title
        .replace(/\s+/g, " ")
        .trim();
    }

    return NextResponse.json({
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