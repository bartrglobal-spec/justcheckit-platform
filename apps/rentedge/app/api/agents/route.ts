import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name || '').trim()
    const agency = String(body?.agency || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()

    if (!name) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const base = slugify(name) || 'agent'
    let slug = base
    let attempt = 0

    while (attempt < 50) {
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (lookupError) {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
      }
      if (!existing) break

      attempt += 1
      slug = `${base}-${attempt + 1}`
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('agents')
      .insert({
        slug,
        name,
        agency: agency || null,
        email,
        phone: phone || null,
        approved: false,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ error: 'Something went wrong saving your details. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ slug, id: inserted.id })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
