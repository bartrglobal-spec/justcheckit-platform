import './globals.css'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'

import RouteShell from '../components/layout/RouteShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'RentEdge — Know your rental position before you apply',
  description:
    'RentEdge helps South African renters understand how agents and landlords will view their application — and what to focus on to strengthen their position. Free during beta.',
  metadataBase: new URL('https://justcheckit.app'),
  openGraph: {
    title: 'RentEdge — Know your rental position before you apply',
    description:
      'Understand your rental picture. See what questions might come up. Get a personalised strategy before you apply.',
    url: 'https://justcheckit.app',
    siteName: 'RentEdge',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentEdge — Know your rental position before you apply',
    description:
      'Free rental positioning tool for South African renters. No account required.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en-ZA" className={inter.variable}>
      <body>
        <RouteShell>
          {children}
        </RouteShell>
      </body>
    </html>
  )
}
