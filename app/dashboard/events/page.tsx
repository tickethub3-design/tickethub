'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const empty = {
  title: '',
  description: '',
  date: '',
  location: '',
  location_url: '',
  transfer_number: '',
  image_url: '',
  is_active: true,
  // Standing
  standing_wave_1_price: '',
  standing_wave_2_price: '',
  standing_wave_3_price: '',
  // Backstage
  backstage_wave_1_price: '',
  backstage_wave_2_price: '',
  backstage_wave_3_price: '',
  // VIP
  vip_wave_1_price: '',
  vip_wave_2_price: '',
  vip_wave_3_price: '',
}

export default function DashboardEvents() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState<any>(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
    setEvents(data || [])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setImagePreview(URL.createObjectURL(file))
    const ext = file.name.split('.').pop()
    const path = `event-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('event-images').upload(path, file, { upsert: true })
    if (error) { alert('Image upload failed: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(path)
    setForm((prev: any) => ({ ...prev, image_url: urlData.publicUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: any = {
      title: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), // ← أضف السطر ده
      description: form.description,
      date: form.date,
      location: form.location,
      location_url: form.location_url || null,
      image_url: form.image_url || null,
      is_active: !!form.is_active,
      transfer_number: form.transfer_number || null,

      // Standing
      standing_wave_1_price: Number(form.standing_wave_1_price),
      standing_wave_1_sold_out: form.standing_wave_1_sold_out ?? false,
      standing_wave_2_price: form.standing_wave_2_price ? Number(form.standing_wave_2_price) : null,
      standing_wave_2_sold_out: form.standing_wave_2_sold_out ?? false,
      standing_wave_3_price: form.standing_wave_3_price ? Number(form.standing_wave_3_price) : null,
      standing_wave_3_sold_out: form.standing_wave_3_sold_out ?? false,

      // Backstage
      backstage_wave_1_price: form.backstage_wave_1_price ? Number(form.backstage_wave_1_price) : null,
      backstage_wave_1_sold_out: form.backstage_wave_1_sold_out ?? false,
      backstage_wave_2_price: form.backstage_wave_2_price ? Number(form.backstage_wave_2_price) : null,
      backstage_wave_2_sold_out: form.backstage_wave_2_sold_out ?? false,
      backstage_wave_3_price: form.backstage_wave_3_price ? Number(form.backstage_wave_3_price) : null,
      backstage_wave_3_sold_out: form.backstage_wave_3_sold_out ?? false,

      // VIP
      vip_wave_1_price: form.vip_wave_1_price ? Number(form.vip_wave_1_price) : null,
      vip_wave_1_sold_out: form.vip_wave_1_sold_out ?? false,
      vip_wave_2_price: form.vip_wave_2_price ? Number(form.vip_wave_2_price) : null,
      vip_wave_2_sold_out: form.vip_wave_2_sold_out ?? false,
      vip_wave_3_price: form.vip_wave_3_price ? Number(form.vip_wave_3_price) : null,
      vip_wave_3_sold_out: form.vip_wave_3_sold_out ?? false,

      price: form.standing_wave_1_price ? Number(form.standing_wave_1_price) : null,
    }

    if (!payload.standing_wave_1_price || isNaN(payload.standing_wave_1_price)) {
      alert('Standing Wave 1 price is required.')
      setLoading(false)
      return
    }

    if (editing) {
      const { error } = await supabase.from('events').update(payload).eq('id', editing)
      if (error) { alert('Update error: ' + error.message); setLoading(false); return }
      setMsg('✅ Event updated successfully!')
    } else {
      const { error } = await supabase.from('events').insert(payload)
      if (error) { alert('Insert error: ' + error.message); setLoading(false); return }
      setMsg('✅ Event created successfully!')
    }

    await load()
    setForm(empty)
    setEditing(null)
    setShowForm(false)
    setImagePreview(null)
    setLoading(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleEdit = (event: any) => {
    setForm({
      ...empty, ...event,
      date: event.date?.slice(0, 16),
      standing_wave_1_price: event.standing_wave_1_price ?? '',
      standing_wave_2_price: event.standing_wave_2_price ?? '',
      standing_wave_3_price: event.standing_wave_3_price ?? '',
      backstage_wave_1_price: event.backstage_wave_1_price ?? '',
      backstage_wave_2_price: event.backstage_wave_2_price ?? '',
      backstage_wave_3_price: event.backstage_wave_3_price ?? '',
      vip_wave_1_price: event.vip_wave_1_price ?? '',
      vip_wave_2_price: event.vip_wave_2_price ?? '',
      vip_wave_3_price: event.vip_wave_3_price ?? '',
      transfer_number: event.transfer_number ?? '',
    })
    setEditing(event.id)
    setShowForm(true)
    setImagePreview(event.image_url || null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { alert('Delete error: ' + error.message); return }
    await load()
  }

  const handleFinish = async (id: string, current: boolean) => {
    if (!current && !confirm('Mark this event as finished?')) return
    const { error } = await supabase.from('events').update({ is_finished: !current }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('events').update({ is_active: !current }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  // ─── WAVE ACTION FACTORY ───────────────────────────────────────────────────
  const makeWaveHandler = (type: 'standing' | 'backstage' | 'vip') =>
    async (event: any) => {
      const w1p = event[`${type}_wave_1_price`]
      const w1s = event[`${type}_wave_1_sold_out`]
      const w2p = event[`${type}_wave_2_price`]
      const w2s = event[`${type}_wave_2_sold_out`]
      const w3p = event[`${type}_wave_3_price`]
      const w3s = event[`${type}_wave_3_sold_out`]
      const label = type.toUpperCase()

      // لو مفيش سعر W1 خالص
      if (w1p == null) {
        if (!confirm(`Set ${label} WAVE 1 price and open it?`)) return
        const priceStr = prompt(`Enter ${label} WAVE 1 price (EGP):`, '')
        const price = priceStr ? Number(priceStr) : NaN
        if (!price || isNaN(price)) { alert('Invalid price.'); return }
        await supabase.from('events').update({ [`${type}_wave_1_price`]: price, [`${type}_wave_1_sold_out`]: false }).eq('id', event.id)
        await load(); return
      }

      // W1 مفتوحة → Sold Out + افتح W2
      if (!w1s) {
        if (!confirm(`Mark ${label} WAVE 1 as SOLD OUT and open WAVE 2?`)) return
        const priceStr = prompt(`Enter ${label} WAVE 2 price (EGP):`, w2p ? String(w2p) : '')
        const price = priceStr ? Number(priceStr) : NaN
        if (!price || isNaN(price)) { alert('Invalid price.'); return }
        await supabase.from('events').update({ [`${type}_wave_1_sold_out`]: true, [`${type}_wave_2_price`]: price, [`${type}_wave_2_sold_out`]: false }).eq('id', event.id)
        await load(); return
      }

      // W2 مفتوحة → Sold Out + افتح W3
      if (w1s && w2p != null && !w2s) {
        if (!confirm(`Mark ${label} WAVE 2 as SOLD OUT and open WAVE 3?`)) return
        const priceStr = prompt(`Enter ${label} WAVE 3 price (EGP):`, w3p ? String(w3p) : '')
        const price = priceStr ? Number(priceStr) : NaN
        if (!price || isNaN(price)) { alert('Invalid price.'); return }
        await supabase.from('events').update({ [`${type}_wave_2_sold_out`]: true, [`${type}_wave_3_price`]: price, [`${type}_wave_3_sold_out`]: false }).eq('id', event.id)
        await load(); return
      }

      // W3 مفتوحة → Sold Out
      if (w1s && w2s && w3p != null && !w3s) {
        if (!confirm(`Mark ${label} WAVE 3 as SOLD OUT (no more ${type})?`)) return
        await supabase.from('events').update({ [`${type}_wave_3_sold_out`]: true }).eq('id', event.id)
        await load(); return
      }

      alert(`All ${label} waves are SOLD OUT.`)
    }

  const handleStandingWaveAction  = makeWaveHandler('standing')
  const handleBackstageWaveAction = makeWaveHandler('backstage')
  const handleVipWaveAction       = makeWaveHandler('vip')
  // ──────────────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  const sectionLabel = (text: string, color: string) => (
    <p style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '2px', margin: '20px 0 10px' }}>{text}</p>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: '0', fontFamily: 'Inter, sans-serif' }}>

      {/* TOPBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(46,117,182,0.12)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Events</span>
          </span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: 8,
          cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif',
        }}>← Dashboard</button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>MANAGE</span>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 36, color: '#fff', margin: '8px 0 0', letterSpacing: '-1px' }}>Events</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(empty); setEditing(null); setImagePreview(null) }}
            style={{
              background: showForm ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: showForm ? 'rgba(255,255,255,0.5)' : '#fff',
              border: showForm ? '1px solid rgba(255,255,255,0.08)' : 'none',
              padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              boxShadow: showForm ? 'none' : '0 6px 20px rgba(46,117,182,0.3)',
            }}
          >{showForm ? 'Cancel' : '+ New Event'}</button>
        </div>

        {/* Success msg */}
        {msg && (
          <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 12, padding: '12px 20px', color: '#27AE60', fontSize: 14, marginBottom: 24 }}>{msg}</div>
        )}

        {/* ── FORM ─────────────────────────────────────────────────────────── */}
        {showForm && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.25)', borderRadius: 20, padding: 32, marginBottom: 32 }}>
            <p style={{ color: '#2E75B6', fontSize: 11, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 24px' }}>
              {editing ? '✏️ EDIT EVENT' : '➕ NEW EVENT'}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 10px' }}>EVENT IMAGE</p>
                <div onClick={() => fileRef.current?.click()} style={{
                  border: `2px dashed ${imagePreview ? 'rgba(46,117,182,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.02)', minHeight: 140,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                      {uploading
                        ? <p style={{ color: '#F0A500', fontSize: 13, letterSpacing: '2px', margin: 0 }}>⏳ UPLOADING...</p>
                        : <>
                          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🖼️</p>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: '0 0 4px' }}>Click to upload image</p>
                          <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11, margin: 0 }}>JPG, PNG, WEBP</p>
                        </>
                      }
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                {uploading && <p style={{ color: '#F0A500', fontSize: 11, marginTop: 8 }}>⏳ Please wait for image to finish uploading...</p>}
              </div>

              {/* Basic Info */}
              {sectionLabel('BASIC INFO', 'rgba(255,255,255,0.3)')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <input style={inputStyle} placeholder="Event title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <input style={inputStyle} placeholder="Location (text) *" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                <input style={inputStyle} type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                <input style={inputStyle} placeholder="📍 Google Maps link (optional)" value={form.location_url} onChange={e => setForm({ ...form, location_url: e.target.value })} />
              </div>
              <input style={{ ...inputStyle, marginBottom: 14 }} placeholder="💳 Transfer Number" value={form.transfer_number} onChange={e => setForm({ ...form, transfer_number: e.target.value })} />
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical', marginBottom: 14 }} placeholder="Description *" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              {/* Standing */}
              {sectionLabel('🟡 STANDING WAVES', '#F0A500')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                <input style={inputStyle} type="number" placeholder="Wave 1 Price (EGP) *" required value={form.standing_wave_1_price} onChange={e => setForm({ ...form, standing_wave_1_price: e.target.value })} />
                <input style={inputStyle} type="number" placeholder="Wave 2 (optional)" value={form.standing_wave_2_price} onChange={e => setForm({ ...form, standing_wave_2_price: e.target.value })} />
                <input style={inputStyle} type="number" placeholder="Wave 3 (optional)" value={form.standing_wave_3_price} onChange={e => setForm({ ...form, standing_wave_3_price: e.target.value })} />
              </div>

              {/* Backstage */}
              {sectionLabel('🟣 BACKSTAGE WAVES', '#8b5cf6')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                <input style={inputStyle} type="number" placeholder="Wave 1 (optional)" value={form.backstage_wave_1_price} onChange={e => setForm({ ...form, backstage_wave_1_price: e.target.value })} />
                <input style={inputStyle} type="number" placeholder="Wave 2 (optional)" value={form.backstage_wave_2_price} onChange={e => setForm({ ...form, backstage_wave_2_price: e.target.value })} />
                <input style={inputStyle} type="number" placeholder="Wave 3 (optional)" value={form.backstage_wave_3_price} onChange={e => setForm({ ...form, backstage_wave_3_price: e.target.value })} />
              </div>

              {/* VIP */}
              {sectionLabel('VIP WAVES', '#F0A500')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <input style={{ ...inputStyle, borderColor: 'rgba(240,165,0,0.2)' }} type="number" placeholder="VIP Wave 1 (optional)" value={form.vip_wave_1_price} onChange={e => setForm({ ...form, vip_wave_1_price: e.target.value })} />
                <input style={{ ...inputStyle, borderColor: 'rgba(240,165,0,0.2)' }} type="number" placeholder="VIP Wave 2 (optional)" value={form.vip_wave_2_price} onChange={e => setForm({ ...form, vip_wave_2_price: e.target.value })} />
                <input style={{ ...inputStyle, borderColor: 'rgba(240,165,0,0.2)' }} type="number" placeholder="VIP Wave 3 (optional)" value={form.vip_wave_3_price} onChange={e => setForm({ ...form, vip_wave_3_price: e.target.value })} />
              </div>

              {/* Visibility */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="active" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer' }}>Visible to public</label>
              </div>

              <button type="submit" disabled={loading || uploading} style={{
                background: loading || uploading ? 'rgba(46,117,182,0.2)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: loading || uploading ? 'rgba(255,255,255,0.3)' : '#fff',
                border: 'none', padding: '14px 32px', borderRadius: 10,
                fontWeight: 700, fontSize: 14, cursor: loading || uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: loading || uploading ? 'none' : '0 6px 20px rgba(46,117,182,0.3)',
              }}>
                {loading ? 'Saving...' : uploading ? 'Wait — Image uploading...' : editing ? 'Save Changes →' : 'Create Event →'}
              </button>
            </form>
          </div>
        )}

        {/* ── EVENTS LIST ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {events.map(event => (
            <div key={event.id} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24,
              display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
              opacity: event.is_finished ? 0.6 : 1,
            }}>
              {/* Image */}
              {event.image_url
                ? <img src={event.image_url} alt={event.title} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0, filter: event.is_finished ? 'grayscale(80%)' : 'none' }} />
                : <div style={{ width: 80, height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🎶</div>
              }

              {/* Info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ color: event.is_finished ? '#555' : '#fff', fontSize: 16, fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>{event.title}</h3>
                  <span style={{
                    background: event.is_finished ? 'rgba(100,100,100,0.1)' : event.is_active ? 'rgba(39,174,96,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${event.is_finished ? '#333' : event.is_active ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: event.is_finished ? '#555' : event.is_active ? '#27AE60' : '#555',
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                  }}>
                    {event.is_finished ? '🏁 FINISHED' : event.is_active ? 'LIVE' : 'HIDDEN'}
                  </span>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: '0 0 4px' }}>
                  📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · 📍 {event.location}
                </p>

                {event.transfer_number && (
                  <p style={{ color: '#F0A500', fontSize: 12, fontWeight: 600, margin: '2px 0 6px' }}>💳 Transfer: {event.transfer_number}</p>
                )}

                {/* Prices grid */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                  {/* Standing */}
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>STANDING</p>
                    {[1, 2, 3].map(w => event[`standing_wave_${w}_price`] != null && (
                      <p key={w} style={{ color: event[`standing_wave_${w}_sold_out`] ? '#555' : '#F0A500', fontSize: 12, fontWeight: 600, margin: '1px 0', textDecoration: event[`standing_wave_${w}_sold_out`] ? 'line-through' : 'none' }}>
                        W{w}: {event[`standing_wave_${w}_price`]} EGP {event[`standing_wave_${w}_sold_out`] ? '✗' : '●'}
                      </p>
                    ))}
                  </div>
                  {/* Backstage */}
                  {event.backstage_wave_1_price != null && (
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>BACKSTAGE</p>
                      {[1, 2, 3].map(w => event[`backstage_wave_${w}_price`] != null && (
                        <p key={w} style={{ color: event[`backstage_wave_${w}_sold_out`] ? '#555' : '#8b5cf6', fontSize: 12, fontWeight: 600, margin: '1px 0', textDecoration: event[`backstage_wave_${w}_sold_out`] ? 'line-through' : 'none' }}>
                          W{w}: {event[`backstage_wave_${w}_price`]} EGP {event[`backstage_wave_${w}_sold_out`] ? '✗' : '●'}
                        </p>
                      ))}
                    </div>
                  )}
                  {/* VIP */}
                  {event.vip_wave_1_price != null && (
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>VIP</p>
                      {[1, 2, 3].map(w => event[`vip_wave_${w}_price`] != null && (
                        <p key={w} style={{ color: event[`vip_wave_${w}_sold_out`] ? '#555' : '#F0A500', fontSize: 12, fontWeight: 700, margin: '1px 0', textDecoration: event[`vip_wave_${w}_sold_out`] ? 'line-through' : 'none' }}>
                          W{w}: {event[`vip_wave_${w}_price`]} EGP {event[`vip_wave_${w}_sold_out`] ? '✗' : '👑'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                {/* Wave Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  {[
                    { label: '🟡 STANDING WAVE', fn: handleStandingWaveAction, clr: '#F0A500', bg: 'rgba(240,165,0,0.08)' },
                    { label: '🟣 BACKSTAGE WAVE', fn: handleBackstageWaveAction, clr: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                    { label: '👑 VIP WAVE', fn: handleVipWaveAction, clr: '#F0A500', bg: 'rgba(240,165,0,0.06)' },
                  ].map(({ label, fn, clr, bg }) => (
                    <button key={label} onClick={() => fn(event)} style={{
                      background: bg, border: `1px solid ${clr}50`,
                      color: clr, padding: '7px 11px', borderRadius: 8,
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', letterSpacing: '1px',
                    }}>{label} →</button>
                  ))}
                </div>

                {/* Base Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button onClick={() => handleFinish(event.id, event.is_finished)} style={{
                    background: event.is_finished ? 'rgba(255,255,255,0.03)' : 'rgba(39,174,96,0.08)',
                    border: `1px solid ${event.is_finished ? 'rgba(255,255,255,0.06)' : 'rgba(39,174,96,0.25)'}`,
                    color: event.is_finished ? '#555' : '#27AE60',
                    padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>{event.is_finished ? 'Unfinish' : '🏁 Finish'}</button>

                  {!event.is_finished && (
                    <button onClick={() => toggleActive(event.id, event.is_active)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.3)', padding: '7px 14px', borderRadius: 8,
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>{event.is_active ? 'Hide' : 'Show'}</button>
                  )}

                  <button onClick={() => router.push(`/dashboard/events/${event.id}/summary`)} style={{
                    background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)',
                    color: '#F0A500', padding: '7px 14px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>Summary</button>

                  <button onClick={() => handleEdit(event)} style={{
                    background: 'rgba(46,117,182,0.08)', border: '1px solid rgba(46,117,182,0.25)',
                    color: '#2E75B6', padding: '7px 14px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>Edit</button>

                  <button onClick={() => handleDelete(event.id)} style={{
                    background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)',
                    color: '#E74C3C', padding: '7px 14px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 16 }}>
              <p style={{ fontSize: 12, letterSpacing: '3px' }}>NO EVENTS YET — CREATE YOUR FIRST EVENT</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}