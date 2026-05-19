'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type GuestTicket = {
  id: string
  event_id: string
  full_name: string
  phone: string
  instagram: string | null
  ticket_type: string
  price_paid: number | null
  status: string | null
  payment_status: string | null
  qr_code: string | null
  is_guest_list?: boolean | null
  created_at?: string
}

type EventMini = {
  id: string
  title: string
  date: string
  location: string
}

const makeQrValue = () => {
  return `guest_${crypto.randomUUID()}_${Date.now()}`
}

const isValidInstagramUrl = (url: string) => {
  if (!url) return false
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    return (host === 'instagram.com' || host === 'www.instagram.com') && u.pathname.length > 1
  } catch {
    return false
  }
}

export default function GuestListPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const eventId = params.id

  const [event, setEvent] = useState<EventMini | null>(null)
  const [tickets, setTickets] = useState<GuestTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')

  const load = async () => {
    setLoading(true)

    const [{ data: eventData, error: eventError }, { data: guestData, error: guestError }] = await Promise.all([
      supabase.from('events').select('id,title,date,location').eq('id', eventId).single(),
      supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .eq('ticket_type', 'guest')
        .order('created_at', { ascending: false }),
    ])

    if (eventError) {
      alert('Event load error: ' + eventError.message)
    }

    if (guestError) {
      alert('Guest list load error: ' + guestError.message)
    }

    setEvent((eventData as EventMini) || null)
    setTickets((guestData as GuestTicket[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }

    if (eventId) load()
  }, [eventId])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setPhone('')
    setInstagram('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')

    if (!name.trim() || !phone.trim() || !instagram.trim()) {
      alert('Please fill name, phone number, and Instagram URL.')
      return
    }

    if (!isValidInstagramUrl(instagram.trim())) {
      alert('Please enter a valid Instagram URL.')
      return
    }

    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('tickets')
        .update({
          full_name: name.trim(),
          phone: phone.trim(),
          instagram: instagram.trim(),
        })
        .eq('id', editingId)
        .select()

      if (error) {
        alert('Update error: ' + error.message)
        setSaving(false)
        return
      }

      setMsg('✅ Guest updated successfully!')
    } else {
      const qr = makeQrValue()

      const { error } = await supabase
        .from('tickets')
        .insert({
          event_id: eventId,
          full_name: name.trim(),
          phone: phone.trim(),
          instagram: instagram.trim(),
          ticket_type: 'guest',
          price_paid: 0,
          payment_status: 'free',
          status: 'active',
          is_guest_list: true,
          qr_code: qr,
        })
        .select()

      if (error) {
        alert('Insert error: ' + error.message)
        setSaving(false)
        return
      }

      setMsg('✅ Guest added successfully!')
    }

    resetForm()
    await load()
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleEdit = (ticket: GuestTicket) => {
    setEditingId(ticket.id)
    setName(ticket.full_name || '')
    setPhone(ticket.phone || '')
    setInstagram(ticket.instagram || '')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest ticket?')) return

    const { error } = await supabase.from('tickets').delete().eq('id', id)
    if (error) {
      alert('Delete error: ' + error.message)
      return
    }

    if (editingId === id) resetForm()

    setMsg('✅ Guest deleted successfully!')
    await load()
    setTimeout(() => setMsg(''), 3000)
  }

  const handleRegenerateQr = async (ticket: GuestTicket) => {
    if (!confirm('Generate a new QR code for this guest? The old code will stop working.')) return

    const newQr = makeQrValue()

    const { error } = await supabase
      .from('tickets')
      .update({ qr_code: newQr })
      .eq('id', ticket.id)
      .select()

    if (error) {
      alert('QR update error: ' + error.message)
      return
    }

    setMsg('✅ QR code regenerated successfully!')
    await load()
    setTimeout(() => setMsg(''), 3000)
  }

  const guestCount = useMemo(() => tickets.length, [tickets])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '13px 16px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const actionBtn = (color: string, bg: string): React.CSSProperties => ({
    background: bg,
    border: `1px solid ${color}40`,
    color,
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  })

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: '0', fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(10,15,30,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(96,165,250,0.15)',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            🎟️
          </div>

          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: 13 }}> / Guest List</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push(`/dashboard/events/${eventId}/summary`)}
            style={{
              background: 'rgba(240,165,0,0.08)',
              border: '1px solid rgba(240,165,0,0.25)',
              color: '#F0A500',
              padding: '8px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
            }}
          >
            Summary
          </button>

          <button
            onClick={() => router.push('/dashboard/events')}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              padding: '8px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
            }}
          >
            ← Events
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '2px', margin: '0 0 10px' }}>
            MANAGE GUEST TICKETS
          </p>

          <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', letterSpacing: '-1px' }}>
            {event?.title || 'Loading event...'}
          </h1>

          {event && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
              📍 {event.location} · 📅{' '}
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              })}{' '}
              · Guests: {guestCount}
            </p>
          )}
        </div>

        {msg && (
          <div
            style={{
              background: 'rgba(39,174,96,0.1)',
              border: '1px solid rgba(39,174,96,0.25)',
              borderRadius: 12,
              padding: '12px 18px',
              color: '#86efac',
              fontSize: 14,
              marginBottom: 22,
            }}
          >
            {msg}
          </div>
        )}

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(96,165,250,0.22)',
            borderRadius: 20,
            padding: 28,
            marginBottom: 22,
          }}
        >
          <p style={{ color: '#60a5fa', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 18px' }}>
            {editingId ? 'EDIT GUEST TICKET' : 'ADD GUEST TICKET'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <input
                style={inputStyle}
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                style={inputStyle}
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <input
                style={inputStyle}
                placeholder="https://instagram.com/username"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? 'rgba(46,117,182,0.2)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                  color: saving ? 'rgba(255,255,255,0.4)' : '#fff',
                  border: 'none',
                  padding: '13px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes →' : 'Add Guest →'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.75)',
                    padding: '13px 18px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 24,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Loading guest tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 40,
                color: 'rgba(255,255,255,0.25)',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 16,
              }}
            >
              No guest tickets yet.
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                      {ticket.full_name}
                    </h3>

                    <span
                      style={{
                        background: 'rgba(96,165,250,0.08)',
                        border: '1px solid rgba(96,165,250,0.24)',
                        color: '#60a5fa',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1px',
                      }}
                    >
                      GUEST
                    </span>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '0 0 5px' }}>
                    📞 {ticket.phone}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '0 0 5px' }}>
                    Instagram: {ticket.instagram}
                  </p>
                  <p style={{ color: '#86efac', fontSize: 13, fontWeight: 700, margin: '0 0 5px' }}>
                    Price: 0 EGP
                  </p>
                  <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, margin: 0, wordBreak: 'break-all' }}>
                    QR: {ticket.qr_code}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleEdit(ticket)}
                    style={actionBtn('#2E75B6', 'rgba(46,117,182,0.08)')}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleRegenerateQr(ticket)}
                    style={actionBtn('#60a5fa', 'rgba(96,165,250,0.08)')}
                  >
                    New QR
                  </button>

                  <button
                    onClick={() => handleDelete(ticket.id)}
                    style={actionBtn('#E74C3C', 'rgba(231,76,60,0.08)')}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}