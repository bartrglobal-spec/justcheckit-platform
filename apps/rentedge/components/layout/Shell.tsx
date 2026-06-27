'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// ─── Icons ───────────────────────────────────────────────

function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M16.5 16.5L21 21"/>
    </svg>
  )
}

function IconUser({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function IconUnlock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0"/>
    </svg>
  )
}

function IconGrid({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}

// ─── Config ──────────────────────────────────────────────

// Onboarding funnel pages — show progress bar, hide nav
const ONBOARDING_PAGES = ['/check', '/adaptive-profile', '/preview']
const ONBOARDING_LABELS = ['Properties', 'Profile', 'Preview']

// Nav is hidden on landing + all onboarding pages
const NAV_HIDDEN_PATHS = ['/', '/check', '/adaptive-profile', '/preview']

const NAV_ITEMS = [
  { name: 'Home',      path: '/',                  icon: <IconHome /> },
  { name: 'Check',     path: '/check',             icon: <IconSearch /> },
  { name: 'Profile',   path: '/adaptive-profile',  icon: <IconUser /> },
  { name: 'Unlock',    path: '/unlock',            icon: <IconUnlock /> },
  { name: 'Dashboard', path: '/dashboard',         icon: <IconGrid /> },
]

// ─── Onboarding progress bar ─────────────────────────────

function OnboardingBar({ pathname }: { pathname: string }) {
  const idx = ONBOARDING_PAGES.indexOf(pathname)
  if (idx === -1) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px 0',
    }}>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        {ONBOARDING_PAGES.map((_, i) => (
          <div
            key={i}
            style={{
              height: 3, flex: 1, borderRadius: 999,
              background: i < idx
                ? 'rgba(76,141,255,0.40)'
                : i === idx
                ? 'var(--accent-primary)'
                : 'rgba(255,255,255,0.08)',
              transition: 'background 220ms ease',
            }}
          />
        ))}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
      }}>
        {ONBOARDING_LABELS[idx]}
      </span>
    </div>
  )
}

// ─── Shell ───────────────────────────────────────────────

export default function Shell({ children }: { children: ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    setProfileComplete(
      localStorage.getItem('rentedge_profile_complete') === 'true'
    )
  }, [pathname])

  // Option B: show nav only after profile complete, or if already past onboarding
  const isOnboardingPath = NAV_HIDDEN_PATHS.includes(pathname)
  const showNav = profileComplete || !isOnboardingPath
  const showOnboardingBar = ONBOARDING_PAGES.includes(pathname)

  const NAV_HEIGHT = 80

  return (
    // Outer full-screen background
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      display: 'flex',
      justifyContent: 'center',
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(76,141,255,0.09) 0%, transparent 55%),
        linear-gradient(180deg, #050811 0%, #04070d 50%, #03050a 100%)
      `,
    }}>
      {/* App frame — max 430px, mobile-first */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100dvh',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(13,20,33,0.98) 0%, rgba(6,9,16,1) 100%)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>

        {/* Onboarding progress bar */}
        {showOnboardingBar && <OnboardingBar pathname={pathname} />}

        {/* Page content */}
        <div style={{
          width: '100%',
          padding: `20px 16px ${showNav ? NAV_HEIGHT + 32 : 40}px`,
          overflowX: 'hidden',
          // Hide scrollbar
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {children}
        </div>

        {/* Bottom nav — hidden during onboarding */}
        {showNav && (
          <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 430,
            height: NAV_HEIGHT,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            padding: `10px 8px calc(env(safe-area-inset-bottom, 0px) + 10px)`,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(180deg, rgba(7,10,18,0.92) 0%, rgba(4,7,13,0.98) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 100,
          }}>
            {NAV_ITEMS.map(item => {
              const active =
                pathname === item.path ||
                (item.path !== '/' && pathname.startsWith(item.path))

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    minHeight: 48,
                    borderRadius: 14,
                    border: 'none',
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'color 140ms ease, background 140ms ease',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {item.icon}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    lineHeight: 1,
                  }}>
                    {item.name}
                  </span>
                  {/* Active dot */}
                  <div style={{
                    width: 4, height: 4,
                    borderRadius: 999,
                    background: active ? 'var(--accent-primary)' : 'transparent',
                    transition: 'background 140ms ease',
                  }} />
                </button>
              )
            })}
          </nav>
        )}

      </div>
    </div>
  )
}
