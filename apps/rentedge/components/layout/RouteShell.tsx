'use client'

// RouteShell — replaces the MarketingShell / ApplicationShell split.
// Everything now goes through Shell which handles:
//   - The app frame (max-w-430px, dark background)
//   - Option B nav: hidden during onboarding, appears after profile complete
//   - Onboarding progress bar on /check, /adaptive-profile, /preview
//   - Bottom nav on /unlock, /dashboard and all post-onboarding pages

export { default } from './Shell'
