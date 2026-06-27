import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL" }, { status: 400 });
    }

    // Fetch page HTML
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();

    // -------------------------
    // VERY SIMPLE PARSING (WORKS SURPRISINGLY WELL)
    // -------------------------
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();

    // RENT
    let rent: number | null = null;
    const rentMatch = text.match(/r\s?(\d{3,6})/);
    if (rentMatch) {
      rent = Number(rentMatch[1]);
    }

    // LOCATION
    let location = "";
    const locMatch = text.match(
      /(mossel bay|cape town|johannesburg|pretoria|durban|stellenbosch)/
    );
    if (locMatch) {
      location = locMatch[1]
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    return NextResponse.json({
      rent,
      location,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}