'use client'

import { ReactNode } from 'react'

export default function MarketingShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto max-w-7xl px-6">

        {children}

      </div>

    </main>
  )
}