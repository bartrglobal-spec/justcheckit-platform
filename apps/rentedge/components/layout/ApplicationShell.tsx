'use client'

import { ReactNode } from 'react'

export default function ApplicationShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div
      className="
        min-h-screen
        bg-[#030712]
        text-white
      "
    >

      {/* OUTER WRAPPER */}

      <div
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[430px]
          border-x
          border-white/5
          bg-[#050B17]
          shadow-[0_0_60px_rgba(0,0,0,0.45)]
        "
      >

        {/* TOP BAR */}

        <header
          className="
            sticky
            top-0
            z-50
            flex
            items-center
            justify-between
            border-b
            border-white/5
            bg-[rgba(5,11,23,0.92)]
            px-5
            py-4
            backdrop-blur-xl
          "
        >

          <div
            className="
              text-sm
              font-semibold
              tracking-[-0.02em]
            "
          >
            RentEdge
          </div>

          <div
            className="
              text-xs
              text-white/40
            "
          >
            Workspace
          </div>

        </header>

        {/* PAGE */}

        <main
          className="
            px-5
            pt-6
            pb-28
          "
        >
          {children}
        </main>

      </div>

    </div>
  )
}