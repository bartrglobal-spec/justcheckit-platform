'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ImproveContent() {

  const params = useSearchParams()

  const rent =
    Number(params.get('rent') || 0)

  const income =
    Number(params.get('income') || 0)

  const affordability =
    income > 0
      ? Math.round((rent / income) * 100)
      : 0

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-xl font-semibold">
          Improve your position
        </h1>

        <p className="text-sm text-slate-500">
          Small improvements can change approval outcomes
        </p>

      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <p className="font-semibold">
          Current affordability
        </p>

        <p className="mt-2 text-lg">
          {affordability}%
        </p>

      </div>

    </div>

  )
}

export default function ImprovePage() {

  return (

    <Suspense
      fallback={
        <div className="p-6">
          Loading...
        </div>
      }
    >

      <ImproveContent />

    </Suspense>

  )

}