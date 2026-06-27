'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#eef2f6]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#eef2f6]">
        <header className="bg-[#0b1f3a] px-5 pt-6 pb-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-300">
                RentEdge
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">
                Get ahead before you apply
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                Anonymous first. One reusable renter profile. Many applications.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
              <p className="text-[11px] text-slate-300">Mode</p>
              <p className="text-sm font-medium">Private</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 space-y-4">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Start here
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Check your chances before you apply
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              RentEdge helps you see how you compare to other renters and keeps one
              profile ready for every application.
            </p>

            <button
              onClick={() => router.push('/check')}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white active:scale-[0.99] transition"
            >
              Start Property Check
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              No signup required to begin
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <StatusTile
              title="Profile strength"
              value="Not checked"
              accent="bg-slate-900"
              note="Separate from fit"
            />
            <StatusTile
              title="Property fit"
              value="Not checked"
              accent="bg-emerald-500"
              note="Compared per property"
            />
            <StatusTile
              title="Reusable profile"
              value="Ready"
              accent="bg-blue-600"
              note="One profile, many apps"
            />
            <StatusTile
              title="Signup"
              value="Optional"
              accent="bg-amber-500"
              note="Later, not first"
            />
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              How it works
            </p>

            <div className="mt-4 space-y-3">
              <StepRow
                step="01"
                title="Build once"
                description="Create a renter profile you can reuse."
              />
              <StepRow
                step="02"
                title="Check a property"
                description="Compare against the specific listing before you apply."
              />
              <StepRow
                step="03"
                title="Apply with context"
                description="See your position before money changes hands."
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Why this matters
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              RentEdge is built to help a renter understand their position and move
              with more confidence than other applicants competing for the same property.
            </p>
          </section>
        </div>

        <nav className="border-t border-slate-200 bg-white">
          <div className="grid grid-cols-4 text-center text-xs">
            
          </div>
        </nav>
      </div>
    </main>
  )
}

function StatusTile({
  title,
  value,
  note,
  accent,
}: {
  title: string
  value: string
  note: string
  accent: string
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-3 w-3 rounded-full ${accent}`} />
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  )
}

function StepRow({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center justify-center py-3 ${
        active ? 'text-slate-900' : 'text-slate-400'
      }`}
    >
      <span
        className={`mb-1 h-5 w-5 rounded-full border-2 ${
          active ? 'border-slate-900' : 'border-slate-300'
        }`}
      />
      <span>{label}</span>
    </button>
  )
}