'use client'

import { useState } from 'react'

type PdfCaptureModalProps = {
  onClose: () => void
  onSubmit: (data: { name: string; phone: string; email: string }) => void
}

export default function PdfCaptureModal({ onClose, onSubmit }: PdfCaptureModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!phone.trim()) {
      setError('Please enter a phone number.')
      return
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card card-elevated"
        style={{ maxWidth: 380, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="section-title">A few details for your PDF</p>
        <p className="section-subtitle" style={{ marginTop: 6 }}>
          This lets an agent contact you directly from the summary. It's only used on this document.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>Full name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thandiwe Nkosi"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-soft)', background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)', fontSize: 14,
              }}
            />
          </div>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>Phone number</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 082 123 4567"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-soft)', background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)', fontSize: 14,
              }}
            />
          </div>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>Email address</p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. thandiwe@email.com"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-soft)', background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)', fontSize: 14,
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-gold" style={{ flex: 1 }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
