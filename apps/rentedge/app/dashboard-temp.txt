"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { evaluateProperty } from "@/lib/evaluation";

type PropertyItem = {
  id?: number;
  area?: string;
  title?: string;
  label?: string;
  location?: string;
  rent?: number | string;
  bedrooms?: number | string;
  type?: string;
  demand?: string;
};

function safeParse<T>(
  value: string | null,
  fallback: T
): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [profileComplete, setProfileComplete] =
    useState(false);

  const [checkCount, setCheckCount] =
    useState(0);

  const [profileProgress, setProfileProgress] =
    useState(20);

  const [profile, setProfile] =
    useState<any>(null);

  const [properties, setProperties] =
    useState<PropertyItem[]>([]);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  useEffect(() => {
    const storedProfileComplete =
      localStorage.getItem(
        "rentedge_profile_complete"
      );

    const completed =
      storedProfileComplete === "true";

    setProfileComplete(completed);

    const storedProfileData =
      safeParse<any>(
        localStorage.getItem(
          "rentedge_profile"
        ),
        {}
      );

    setProfile({
      ...storedProfileData,

      pets:
        storedProfileData?.pets === true ||
        storedProfileData?.pets === "Yes",

      payslipReady:
        storedProfileData?.payslipReady ===
          true ||
        storedProfileData?.payslip === true,

      idReady:
        storedProfileData?.idReady === true,

      depositReady:
        storedProfileData?.depositReady ===
          true ||
        storedProfileData?.deposit === true,
    });

    const storedProperties =
      safeParse<PropertyItem[]>(
        localStorage.getItem(
          "rentedge_properties"
        ),
        []
      );

    setProperties(
      Array.isArray(storedProperties)
        ? storedProperties
        : []
    );

    setCheckCount(
      Array.isArray(storedProperties)
        ? storedProperties.length
        : 0
    );

    const selected =
      localStorage.getItem(
        "rentedge_selected_property_id"
      );

    if (selected) {
      setSelectedId(Number(selected));
    } else if (
      storedProperties.length > 0
    ) {
      setSelectedId(
        Number(storedProperties[0]?.id)
      );
    }

    let progress = 0;

    if (storedProfileData?.income)
      progress += 20;

    if (storedProfileData?.employment)
      progress += 20;

    if (storedProfileData?.duration)
      progress += 20;

    if (storedProfileData?.occupants)
      progress += 20;

    if (completed) progress = 100;

    setProfileProgress(progress || 20);

    setLoading(false);
  }, []);

  const selectedProperty =
    useMemo(() => {
      return (
        properties.find(
          (p) =>
            Number(p.id) === selectedId
        ) ||
        properties[0] ||
        null
      );
    }, [properties, selectedId]);

  const evaluation =
    useMemo(() => {
      if (!profile || !selectedProperty) {
        return null;
      }

      try {
        return evaluateProperty(
          profile,
          selectedProperty as any
        );
      } catch {
        return null;
      }
    }, [profile, selectedProperty]);

  const pressure =
    evaluation?.feeRisk ===
    "safe-to-apply"
      ? {
          label: "Lower pressure",
          short: "Lower",
          value: 28,
          bar: "bg-emerald-400",
          text: "text-emerald-300",
          surface:
            "border-emerald-500/20 bg-emerald-500/10",
          copy:
            evaluation.realityCheck,
        }
      : evaluation?.feeRisk ===
          "caution"
      ? {
          label: "Moderate pressure",
          short: "Moderate",
          value: 58,
          bar: "bg-amber-400",
          text: "text-amber-300",
          surface:
            "border-amber-500/20 bg-amber-500/10",
          copy:
            evaluation.pressure,
        }
      : {
          label: "Higher pressure",
          short: "Higher",
          value: 84,
          bar: "bg-rose-400",
          text: "text-rose-300",
          surface:
            "border-rose-500/20 bg-rose-500/10",
          copy:
            evaluation?.mainRisk ||
            "This property currently carries elevated approval pressure.",
        };

  if (loading) return null;

  return (
    <main className="text-white">

      {/* =======================================================
          HEADER
      ======================================================= */}

      <section className="space-y-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <div className="text-[10px] uppercase tracking-[0.32em] text-white/35">
                RentEdge Workspace
              </div>

            </div>

            <h1 className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em]">
              Rental Dashboard
            </h1>

            <p className="mt-3 max-w-[92%] text-sm leading-7 text-white/45">
              Positioning intelligence for
              competitive rental applications.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">

            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Profile
            </div>

            <div className="mt-1 text-sm font-semibold">
              {profileProgress}%
            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          PROFILE INCOMPLETE
      ======================================================= */}

      {!profileComplete ? (
        <div className="mt-6 space-y-5">

          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1220] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

            <div className="flex items-start justify-between gap-4">

              <div className="max-w-[75%]">

                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-200/60">
                  Workspace activation
                </div>

                <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.05em]">
                  Complete your renter profile
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/50">
                  Your renter identity powers
                  affordability analysis,
                  approval positioning, and
                  competitive pressure signals.
                </p>

              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/10">

                <span className="text-lg font-semibold text-blue-300">
                  R
                </span>

              </div>

            </div>

            <div className="mt-8">

              <div className="flex items-center justify-between text-[11px] text-white/40">

                <span>
                  Activation progress
                </span>

                <span>
                  {profileProgress}%
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{
                    width:
                      profileProgress + "%",
                  }}
                />

              </div>

            </div>

            <button
              onClick={() =>
                router.push("/profile")
              }
              className="mt-8 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Continue renter setup
            </button>

          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Workspace locked
                </div>

                <div className="mt-2 text-xl font-semibold tracking-tight">
                  Complete activation
                </div>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
                Locked
              </div>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              {[
                "Approval Pressure",
                "Positioning",
                "Property Matching",
                "Rental Readiness",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 opacity-50"
                >

                  <div className="text-sm font-medium">
                    {item}
                  </div>

                  <div className="mt-6 h-2 rounded-full bg-white/10" />

                  <div className="mt-3 h-2 w-3/4 rounded-full bg-white/10" />

                </div>
              ))}

            </div>

          </section>

        </div>
      ) : (
        <div className="mt-6 space-y-5">

          {/* =======================================================
              HERO PROPERTY CARD
          ======================================================= */}

          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1220] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1">

                <div className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Active target property
                </div>

                <div className="mt-4">

                  <h2 className="break-words text-[34px] font-semibold leading-[0.98] tracking-[-0.05em] text-white">

                    {selectedProperty
                      ? (
                          selectedProperty.area ||
                          selectedProperty.location ||
                          selectedProperty.label ||
                          selectedProperty.title ||
                          "Unknown area"
                        )
                      : "No active property"}

                  </h2>

                </div>

                {selectedProperty ? (

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/55">

                    <span>
                      R
                      {selectedProperty.rent}
                    </span>

                    <span className="text-white/25">
                      •
                    </span>

                    <span>
                      {
                        selectedProperty.bedrooms
                      }{" "}
                      bedroom
                    </span>

                  </div>

                ) : (

                  <div className="mt-5 text-sm text-white/45">
                    Run a property check to
                    begin analysis.
                  </div>

                )}

              </div>

              <div
                className={
                  "shrink-0 rounded-2xl border px-4 py-3 backdrop-blur-xl " +
                  pressure.surface
                }
              >

                <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Pressure
                </div>

                <div
                  className={
                    "mt-1 text-sm font-semibold " +
                    pressure.text
                  }
                >
                  {pressure.short}
                </div>

              </div>

            </div>

            {/* PRESSURE METER */}

            <div className="mt-8">

              <div className="flex items-center justify-between text-[11px] text-white/35">

                <span>Lower</span>
                <span>Moderate</span>
                <span>Higher</span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className={
                    "h-full rounded-full transition-all duration-500 " +
                    pressure.bar
                  }
                  style={{
                    width:
                      pressure.value + "%",
                  }}
                />

              </div>

            </div>

            <p className="mt-7 text-sm leading-7 text-white/55">
              {pressure.copy}
            </p>

            {/* QUICK STATS */}

            {evaluation && (

              <div className="mt-7 grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                    Approval
                  </div>

                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {
                      evaluation.approvalChance
                    }
                    %
                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                    Outcome
                  </div>

                  <div className="mt-2 text-sm font-semibold capitalize leading-6">
                    {evaluation.probableOutcome.replace(
                      /-/g,
                      " "
                    )}
                  </div>

                </div>

              </div>

            )}

            {/* ACTIONS */}

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  router.push("/check")
                }
                className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Check property
              </button>

              <button
                onClick={() =>
                  router.push("/unlock")
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold transition hover:bg-white/[0.05]"
              >
                Unlock insight
              </button>

            </div>

          </section>

          {/* =======================================================
              INSIGHT GRID
          ======================================================= */}

          <section className="grid grid-cols-3 gap-3">

            <div className="rounded-[24px] border border-white/10 bg-[#0b1220] p-4">

              <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Position
              </div>

              <div className="mt-3 text-sm font-semibold capitalize leading-6">

                {evaluation?.position?.replace(
                  /-/g,
                  " "
                ) || "Waiting"}

              </div>

            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0b1220] p-4">

              <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Tracking
              </div>

              <div className="mt-3 text-sm font-semibold">
                {checkCount}
              </div>

            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0b1220] p-4">

              <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Strategy
              </div>

              <div className="mt-3 text-sm font-semibold leading-6">

                {evaluation?.advantage ===
                "financial"
                  ? "Financial"
                  : evaluation?.advantage ===
                    "speed"
                  ? "Speed"
                  : evaluation?.advantage ===
                    "stability"
                  ? "Stability"
                  : "Balanced"}

              </div>

            </div>

          </section>

          {/* =======================================================
              ACTIVITY
          ======================================================= */}

          <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5">

            <div>

              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                Workspace activity
              </div>

              <div className="mt-3 text-2xl font-semibold tracking-tight">
                Continue positioning
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <button
                onClick={() =>
                  router.push("/check")
                }
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
              >

                <div className="text-left">

                  <div className="text-sm font-semibold">
                    Run another property
                    check
                  </div>

                  <div className="mt-1 text-xs text-white/40">
                    Evaluate another
                    rental environment
                  </div>

                </div>

                <span className="text-white/30">
                  →
                </span>

              </button>

              <button
                onClick={() =>
                  router.push("/unlock")
                }
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
              >

                <div className="text-left">

                  <div className="text-sm font-semibold">
                    Review latest insight
                  </div>

                  <div className="mt-1 text-xs text-white/40">
                    Open your most recent
                    positioning analysis
                  </div>

                </div>

                <span className="text-white/30">
                  →
                </span>

              </button>

              <button
                onClick={() =>
                  router.push("/profile")
                }
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
              >

                <div className="text-left">

                  <div className="text-sm font-semibold">
                    Update renter profile
                  </div>

                  <div className="mt-1 text-xs text-white/40">
                    Maintain accurate
                    renter positioning
                  </div>

                </div>

                <span className="text-white/30">
                  →
                </span>

              </button>

            </div>

          </section>

          <div className="h-2" />

        </div>
      )}
    </main>
  );
}