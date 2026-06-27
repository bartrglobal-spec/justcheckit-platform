'use client'

import { Suspense } from 'react'
import {
  useRouter,
  useSearchParams
} from 'next/navigation'

function RenterPositionContent() {

  const router = useRouter()
  const params = useSearchParams()

  const rent =
    Number(params.get('rent') || 0)

  const bedrooms =
    Number(params.get('bedrooms') || 0)

  let context = ''

  let uncertainty:string[] = []

  if (rent && bedrooms) {

    context =
      `For a ${bedrooms}-bedroom property around R${rent.toLocaleString()}, this is typically a competitive range`

    uncertainty = [
      'Your income level',
      'Number of occupants',
      'Employment stability',
    ]

  } else {

    context =
      'We’ve picked up the property, but we need a bit more detail to position you properly'

    uncertainty = [
      'Rental level',
      'Property size',
      'Your personal profile',
    ]

  }

  function handleNext() {
    router.push('/check/result')
  }

  return (

    <main className="relative min-h-screen">

      <div className="absolute inset-0">

        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1560185127-6ed189bf02f4')] bg-cover bg-center" />

        <div className="absolute inset-0 bg-black/40" />

      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-between">

        <div />

        <div className="px-4">

          <section className="rounded-2xl bg-white px-6 py-6 shadow-xl">

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Initial view
            </p>

            <p className="mt-3 text-lg font-semibold leading-snug text-slate-900">
              {context}
            </p>

            <div className="mt-5 space-y-2">

              <p className="text-sm text-slate-600">
                Your actual position depends on:
              </p>

              {uncertainty.map((item,index)=>(

                <p
                  key={index}
                  className="text-sm text-slate-700"
                >
                  • {item}
                </p>

              ))}

            </div>

          </section>

        </div>

        <div className="px-4 pb-4">

          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white"
          >
            Refine my position
          </button>

        </div>

      </div>

    </main>

  )

}

export default function RenterPositionPage() {

  return (

    <Suspense fallback={<div />}>
      <RenterPositionContent />
    </Suspense>

  )

}