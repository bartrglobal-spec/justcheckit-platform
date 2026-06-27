'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractPropertyFromLink } from "@/lib/extract";

export default function PropertyWebviewPage() {
  const router = useRouter();

  // -------------------------
  // STATE
  // -------------------------
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const [property, setProperty] = useState({
    location: "",
    rent: "",
    bedrooms: "",
    type: "",
    availability: "",
  });

  // -------------------------
  // EXTRACT
  // -------------------------
  function handleExtract() {
    if (!link) return;

    setLoading(true);

    setTimeout(() => {
      const extracted = extractPropertyFromLink(link);

      if (extracted) {
        setProperty({
          location: extracted.location || "",
          rent: extracted.rent ? String(extracted.rent) : "",
          bedrooms: extracted.bedrooms ? String(extracted.bedrooms) : "",
          type: extracted.type || "",
          availability: extracted.availability || "",
        });
      }

      setLoading(false);
    }, 800);
  }

  // -------------------------
  // UPDATE FIELD
  // -------------------------
  function updateField(field: string, value: string) {
    setProperty((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // -------------------------
  // USE PROPERTY → BACK TO CHECK
  // -------------------------
  function handleUseProperty() {
    const query = new URLSearchParams({
      location: property.location,
      rent: property.rent,
      bedrooms: property.bedrooms,
      type: property.type,
      availability: property.availability,
    }).toString();

    router.push(`/check?${query}`);
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-xs tracking-widest text-slate-400">
          ADD PROPERTY
        </p>
        <h1 className="text-xl font-semibold text-slate-900">
          Paste and confirm the listing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          We’ll pull what we can — you just confirm
        </p>
      </div>

      {/* LINK INPUT */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <input
          type="text"
          placeholder="Paste listing link (Property24, PrivateProperty, etc.)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <button
          onClick={handleExtract}
          className="w-full bg-[#0b1f3a] text-white py-3 rounded-xl text-sm"
        >
          Extract details
        </button>

        {loading && (
          <p className="text-xs text-slate-500">
            Extracting property details...
          </p>
        )}
      </div>

      {/* EDITABLE FIELDS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">

        <input
          type="text"
          placeholder="Area / Suburb"
          value={property.location}
          onChange={(e) => updateField("location", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <input
          type="number"
          placeholder="Monthly rent (R)"
          value={property.rent}
          onChange={(e) => updateField("rent", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <input
          type="number"
          placeholder="Bedrooms"
          value={property.bedrooms}
          onChange={(e) => updateField("bedrooms", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        {/* TYPE */}
        <select
          value={property.type}
          onChange={(e) => updateField("type", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        >
          <option value="">Property type</option>
          <option>Apartment</option>
          <option>House</option>
          <option>Townhouse</option>
        </select>

        {/* AVAILABILITY */}
        <select
          value={property.availability}
          onChange={(e) => updateField("availability", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        >
          <option value="">Availability</option>
          <option>Immediate</option>
          <option>Next month</option>
          <option>Flexible</option>
        </select>

      </div>

      {/* CTA */}
      <button
        onClick={handleUseProperty}
        className="w-full bg-[#0b1f3a] text-white py-4 rounded-2xl text-sm font-semibold"
      >
        Use this property
      </button>

    </div>
  );
}