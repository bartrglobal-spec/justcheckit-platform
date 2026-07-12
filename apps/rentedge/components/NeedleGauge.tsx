'use client'

// Needle sweeps a semicircle from red (0) through amber to green (1).
// Rotation is animated via CSS transition on the inline transform — React
// re-rendering with a new degree value is enough to trigger the sweep.
// Shared between the Unlock header and Dashboard so the app has exactly one
// gauge visual, not two similar-but-slightly-different ones.
export function NeedleGauge({
  value, label, sublabel, size = 90,
}: {
  value: number
  label: string
  sublabel: string
  size?: number
}) {
  const clamped = Math.max(0, Math.min(1, value))
  const deg = -90 + clamped * 180
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 100 62" width={size} style={{ maxWidth: size }}>
        <path d="M10 55 A40 40 0 0 1 30 20.36" fill="none" stroke="var(--danger)" strokeWidth={9} strokeLinecap="round" />
        <path d="M30 20.36 A40 40 0 0 1 70 20.36" fill="none" stroke="var(--warning)" strokeWidth={9} strokeLinecap="round" />
        <path d="M70 20.36 A40 40 0 0 1 90 55" fill="none" stroke="var(--success)" strokeWidth={9} strokeLinecap="round" />
        <g style={{
          transformOrigin: '50px 55px',
          transform: `rotate(${deg}deg)`,
          transition: 'transform 0.7s cubic-bezier(0.34,1.15,0.64,1)',
        }}>
          <line x1="50" y1="55" x2="50" y2="23" stroke="var(--text-primary)" strokeWidth={3} strokeLinecap="round" />
          <circle cx="50" cy="55" r="4.5" fill="var(--text-primary)" />
        </g>
      </svg>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sublabel}</p>
    </div>
  )
}
