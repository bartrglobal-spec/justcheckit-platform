'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
}

export default function CheckPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<Property[]>([])
  const [extracting, setExtracting] = useState(false)
  const [extractMessage, setExtractMessage] = useState('')
  const [extractOk, setExtractOk] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState({ title: '', area: '', rent: '', bedrooms: '' })
  const [current, setCurrent] = useState({ link: '', title: '', area: '', rent: '', bedrooms: '' })

  const hasLoaded = useRef(false)

  // ─── Load from localStorage ───────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rentedge_properties') || '[]')
    if (Array.isArray(saved) && saved.length > 0) {
      setProperties(
        saved.map((p: any) => ({
          id: p.id,
          title: p.title || p.label || 'Property',
          area: p.area || p.location || '',
          rent: Number(p.rent),
          bedrooms: Number(p.bedrooms),
        }))
      )
    }
    hasLoaded.current = true
  }, [])

  // ─── Persist to localStorage ──────────────────────────
  useEffect(() => {
    if (!hasLoaded.current) return
    localStorage.setItem('rentedge_properties', JSON.stringify(properties))
  }, [properties])

  // ─── Autofill from URL ────────────────────────────────
  const handleAutofill = async () => {
    if (!current.link) return
    setExtracting(true)
    setExtractMessage('')
    setExtractOk(false)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: current.link }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCurrent(prev => ({
        ...prev,
        title: data.title || data.location || prev.title,
        area: data.location || prev.area,
        rent: data.price ? String(data.price) : prev.rent,
        bedrooms: data.bedrooms ? String(data.bedrooms) : prev.bedrooms,
      }))
      setExtractOk(true)
      setExtractMessage('Details found — check everything before saving.')
    } catch {
      setExtractOk(false)
      setExtractMessage('Could not extract details. Fill in manually below.')
    } finally {
      setExtracting(false)
    }
  }

  // ─── Add property ─────────────────────────────────────
  const addProperty = () => {
    if (properties.length >= 5) return
    if (!current.area || !current.rent || !current.bedrooms) return
    const property: Property = {
      id: Date.now(),
      title: current.title || `${current.bedrooms} Bedroom Property`,
      area: current.area,
      rent: Number(current.rent),
      bedrooms: Number(current.bedrooms),
    }
    setProperties(prev => [...prev, property])
    setCurrent({ link: '', title: '', area: '', rent: '', bedrooms: '' })
    setExtractMessage('')
    setExtractOk(false)
    setShowAddProperty(false)
  }

  // ─── Remove / Edit ────────────────────────────────────
  const removeProperty = (id: number) => {
    if (editingPropertyId === id) setEditingPropertyId(null)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  const startEditing = (p: Property) => {
    setEditingPropertyId(p.id)
    setEditValues({ title: p.title, area: p.area, rent: String(p.rent), bedrooms: String(p.bedrooms) })
  }

  const cancelEditing = () => {
    setEditingPropertyId(null)
    setEditValues({ title: '', area: '', rent: '', bedrooms: '' })
  }

  const saveEdits = (id: number) => {
    if (!editValues.area || !editValues.rent || !editValues.bedrooms) return
    setProperties(prev =>
      prev.map(p =>
        p.id !== id ? p : {
          ...p,
          title: editValues.title || `${editValues.bedrooms} Bedroom Property`,
          area: editValues.area,
          rent: Number(editValues.rent),
          bedrooms: Number(editValues.bedrooms),
        }
      )
    )
    cancelEditing()
  }

  // ─── Guidance copy ────────────────────────────────────
  const guidanceText = () => {
    if (properties.length === 0) return 'Add at least one property to get started.'
    if (properties.length <= 2) return 'Add a few more to compare your options.'
    if (properties.length < 5) return 'Good comparison set. Add more or continue.'
    return 'Property limit reached. Continue to build your profile.'
  }

  const canContinue = properties.length > 0

  return (
    <div className="section-gap" style={{ paddingTop: 8 }}>

      {/* ─── Header ─── */}
      <section>
        <p className="app-eyebrow">Step 1 of 3</p>
        <h1 className="app-title" style={{ marginTop: 8 }}>
          Target Properties
        </h1>
        <p className="section-subtitle">
          Add the rentals you are seriously considering. We will compare them once your profile is complete.
        </p>
      </section>

      {/* ─── Counter + guidance ─── */}
      <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className="body-text" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {guidanceText()}
        </span>
        <span
          className="app-badge"
          style={{
            flexShrink: 0,
            color: properties.length >= 3 ? 'var(--success)' : 'var(--text-muted)',
            borderColor: properties.length >= 3 ? 'var(--success-border)' : undefined,
            background: properties.length >= 3 ? 'var(--success-soft)' : undefined,
          }}
        >
          {properties.length} / 5
        </span>
      </div>

      {/* ─── Property list ─── */}
      {properties.length > 0 && (
        <section className="section-gap">
          {properties.map(property => (
            <div key={property.id} className="card card-elevated">

              {editingPropertyId === property.id ? (
                /* Edit mode */
                <div className="section-gap">
                  <p className="label" style={{ marginBottom: -4 }}>Editing property</p>
                  <input
                    placeholder="Property name (optional)"
                    value={editValues.title}
                    onChange={e => setEditValues({ ...editValues, title: e.target.value })}
                    className="input"
                  />
                  <input
                    placeholder="Area / suburb *"
                    value={editValues.area}
                    onChange={e => setEditValues({ ...editValues, area: e.target.value })}
                    className="input"
                  />
                  <input
                    placeholder="Monthly rent in R *"
                    value={editValues.rent}
                    onChange={e => setEditValues({ ...editValues, rent: e.target.value })}
                    className="input"
                    inputMode="numeric"
                  />
                  <input
                    placeholder="Bedrooms *"
                    value={editValues.bedrooms}
                    onChange={e => setEditValues({ ...editValues, bedrooms: e.target.value })}
                    className="input"
                    inputMode="numeric"
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => saveEdits(property.id)} className="btn-primary" style={{ flex: 1 }}>
                      Save
                    </button>
                    <button onClick={cancelEditing} className="btn-secondary" style={{ width: 'auto', padding: '15px 18px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="section-title" style={{ fontSize: 15 }}>{property.title}</p>
                    <p className="body-text" style={{ marginTop: 4, fontSize: 13 }}>{property.area}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <span className="app-badge badge-accent">
                        R{property.rent.toLocaleString()}/mo
                      </span>
                      <span className="app-badge">
                        {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <button
                      onClick={() => startEditing(property)}
                      className="btn-ghost"
                      style={{ padding: '6px 10px', fontSize: 13 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="btn-ghost"
                      style={{ padding: '6px 10px', fontSize: 13, color: 'var(--danger)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </section>
      )}

      {/* ─── Add property ─── */}
      <section>
        {!showAddProperty && properties.length < 5 && (
          <button
            onClick={() => setShowAddProperty(true)}
            className="btn-secondary"
            style={{ borderStyle: 'dashed' }}
          >
            + Add Property
          </button>
        )}

        {showAddProperty && (
          <div className="card card-elevated section-gap">
            <div>
              <p className="section-title" style={{ fontSize: 15 }}>Add a property</p>
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                Paste a listing URL to autofill, or enter details manually.
              </p>
            </div>

            {/* URL autofill */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                placeholder="Paste listing URL (optional)"
                value={current.link}
                onChange={e => setCurrent({ ...current, link: e.target.value })}
                className="input"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAutofill}
                disabled={extracting || !current.link}
                className="btn-secondary"
                style={{
                  width: 'auto',
                  padding: '15px 16px',
                  flexShrink: 0,
                  opacity: !current.link ? 0.4 : 1,
                }}
              >
                {extracting ? '...' : 'Fill'}
              </button>
            </div>

            {/* Extract feedback */}
            {extractMessage && (
              <div className={extractOk ? 'card-success' : 'card-warning'}>
                <p className="body-text" style={{ fontSize: 13, color: extractOk ? 'var(--success)' : 'var(--warning)' }}>
                  {extractMessage}
                </p>
              </div>
            )}

            <div className="divider" />

            {/* Manual fields */}
            <input
              placeholder="Property name (optional)"
              value={current.title}
              onChange={e => setCurrent({ ...current, title: e.target.value })}
              className="input"
            />
            <input
              placeholder="Area / suburb *"
              value={current.area}
              onChange={e => setCurrent({ ...current, area: e.target.value })}
              className="input"
            />
            <input
              placeholder="Monthly rent in R *"
              value={current.rent}
              onChange={e => setCurrent({ ...current, rent: e.target.value })}
              className="input"
              inputMode="numeric"
            />
            <input
              placeholder="Bedrooms *"
              value={current.bedrooms}
              onChange={e => setCurrent({ ...current, bedrooms: e.target.value })}
              className="input"
              inputMode="numeric"
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={addProperty}
                disabled={!current.area || !current.rent || !current.bedrooms}
                className="btn-primary"
                style={{
                  flex: 1,
                  opacity: !current.area || !current.rent || !current.bedrooms ? 0.4 : 1,
                }}
              >
                Save Property
              </button>
              <button
                onClick={() => {
                  setShowAddProperty(false)
                  setExtractMessage('')
                  setExtractOk(false)
                }}
                className="btn-secondary"
                style={{ width: 'auto', padding: '15px 18px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── Continue CTA ─── */}
      <section>
        <button
          disabled={!canContinue}
          onClick={() => router.push('/adaptive-profile')}
          className="btn-primary"
          style={{ opacity: canContinue ? 1 : 0.35 }}
        >
          Continue to Profile
        </button>
        {!canContinue && (
          <p className="body-text" style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>
            Add at least one property to continue
          </p>
        )}
      </section>

    </div>
  )
}
