'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  pending:          '#F0A500',
  reviewing:        '#fb923c',
  awaiting_payment: '#2E75B6',
  payment_review:   '#8b5cf6',
  confirmed:        '#27AE60',
  rejected:         '#E74C3C',
}

const allStatuses = ['pending', 'reviewing', 'awaiting_payment', 'payment_review', 'confirmed', 'rejected']

const ticketTypeColor: Record<string, string> = {
  standing:  '#27AE60',
  backstage: '#8b5cf6',
  vip:       '#F0A500',
}

export default function DashboardReservations() {
  const router = useRouter()
  const [reservations, setReservations] = useState<any[]>([])
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('reservations')
      .select(`*, events (title, date, location, image_url)`)
      .order('created_at', { ascending: false })
    setReservations(data || [])
    if (selected) {
      const updated = (data || []).find((r: any) => r.id === selected.id)
      if (updated) setSelected(updated)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setLoading(true)
    const updateData: any = { status }
    if (status === 'awaiting_payment') {
      updateData.payment_deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }
    const { error } = await supabase.from('reservations').update(updateData).eq('id', id)
    if (error) { alert('Update failed: ' + error.message); setLoading(false); return }
    await load()
    setLoading(false)
  }

  // ✅ الإصلاح الكامل
  const handleConfirmAndSendTickets = async (reservation: any) => {
    setLoading(true)
    const { error: confirmError } = await supabase
      .from('reservations').update({ status: 'confirmed' }).eq('id', reservation.id)
    if (confirmError) { alert('Error confirming: ' + confirmError.message); setLoading(false); return }

    const people: any[] = Array.isArray(reservation.people_details) ? reservation.people_details : []

    const mainName      = reservation.full_name || reservation.name || 'Guest'
    const mainPhone     = reservation.phone     || ''
    const mainInstagram = reservation.instagram || ''

    const allPeople = people.length > 0 ? people : [{
      name:        mainName,
      phone:       mainPhone,
      instagram:   mainInstagram,
      ticket_type: reservation.standing_count  > 0 ? 'standing'
                 : reservation.backstage_count > 0 ? 'backstage'
                 : reservation.vip_count       > 0 ? 'vip'
                 : 'standing',
    }]

    const ticketsToInsert = allPeople.map((person: any, index: number) => ({
      reservation_id:   reservation.id,
      event_id:         reservation.event_id,
      user_id:          reservation.user_id,
      holder_name:      person.name      || mainName,
      holder_phone:     person.phone     || mainPhone   || null,
      holder_instagram: person.instagram || mainInstagram || null,
      ticket_type:      person.ticket_type || 'standing',
      ticket_number:    index + 1,
      qr_code: `TH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${index}`,
    }))

    const { data: createdTickets, error: ticketsError } = await supabase
      .from('tickets').insert(ticketsToInsert).select()
    if (ticketsError) { alert('Error creating tickets: ' + ticketsError.message); setLoading(false); return }

    const eventTitle    = reservation.events?.title    || 'EVENT'
    const eventDate     = reservation.events?.date
      ? new Date(reservation.events.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBA'
    const eventLocation = reservation.events?.location || 'TBA'

    // ✅ اللينك بيستخدم الـ domain الفعلي
    const origin = window.location.origin

    const ticketBlock = (createdTickets || []).map((t: any) =>
      `[${String(t.ticket_number).padStart(2, '0')}] ${t.holder_name}\n` +
      `Type: ${t.ticket_type.toUpperCase()}\n` +
      `🎫 Ticket: ${origin}/ticket/${t.qr_code}`
    ).join('\n\n')

    const waMessage = encodeURIComponent(
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `TicketHub — BOOKING CONFIRMED ✅\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Dear ${mainName},\n\n` +
      `Your reservation has been officially confirmed.\n\n` +
      `Event: ${eventTitle}\nDate: ${eventDate}\nVenue: ${eventLocation}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `YOUR TICKETS (${(createdTickets || []).length})\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${ticketBlock}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Open your QR link at the door\n` +
      `Valid ID required at entry\n` +
      `Non-transferable — one scan only\n\n` +
      `See you there! 🎉\nTicketHub — ${origin}`
    )

    const phone = mainPhone.replace(/\D/g, '')
    window.open(`https://wa.me/2${phone}?text=${waMessage}`, '_blank')
    await load()
    setLoading(false)
  }

  const handleSendGmail = async (reservation: any) => {
    if (!reservation.email) { alert('No email found for this reservation'); return }

    const eventTitle    = reservation.events?.title    || 'EVENT'
    const eventDate     = reservation.events?.date
      ? new Date(reservation.events.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBA'
    const eventLocation = reservation.events?.location || 'TBA'

    const { data: tickets } = await supabase
      .from('tickets').select('*')
      .eq('reservation_id', reservation.id)
      .order('ticket_number', { ascending: true })

    const origin      = window.location.origin
    const mainName    = reservation.full_name || reservation.name || 'Guest'

    const ticketBlock = (tickets || []).map((t: any) =>
      `[${String(t.ticket_number).padStart(2, '0')}] ${t.holder_name}\n` +
      `Type: ${t.ticket_type.toUpperCase()}\n` +
      `Ticket Link: ${origin}/ticket/${t.qr_code}`
    ).join('\n\n')

    const subject = encodeURIComponent(`🎫 Booking Confirmed — ${eventTitle} | TicketHub`)
    const body = encodeURIComponent(
      `Dear ${mainName},\n\n` +
      `Your reservation has been confirmed.\n\n` +
      `════════════════════════════════\n` +
      `   EVENT DETAILS\n` +
      `════════════════════════════════\n\n` +
      `Event: ${eventTitle}\nDate: ${eventDate}\nVenue: ${eventLocation}\n\n` +
      `════════════════════════════════\n` +
      `   YOUR TICKETS (${(tickets || []).length})\n` +
      `════════════════════════════════\n\n` +
      `${ticketBlock}\n\n` +
      `════════════════════════════════\n` +
      `   ENTRY INSTRUCTIONS\n` +
      `════════════════════════════════\n\n` +
      `📲 Open your QR link at the entrance.\n` +
      `🪪 Valid photo ID required.\n` +
      `⚠️ One scan only — non-transferable.\n\n` +
      `TicketHub Team\n${origin}\n`
    )
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(reservation.email)}&su=${subject}&body=${body}`,
      '_blank'
    )
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)

  const btnStyle = (color: string, isActive = false): React.CSSProperties => ({
    backgroundColor: isActive ? color : `${color}18`,
    border: `1px solid ${color}50`,
    color: isActive ? '#fff' : color,
    padding: '9px 18px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px',
    fontFamily: 'Inter, sans-serif', opacity: loading ? 0.5 : 1, transition: 'all 0.15s',
  })

  // ─── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (selected) {
    const guests: any[] = Array.isArray(selected.people_details) ? selected.people_details : []
    const mainGuest     = guests[0]
    const standingCount  = selected.standing_count  ?? 0
    const backstageCount = selected.backstage_count ?? 0
    const vipCount       = selected.vip_count       ?? 0
    const alreadySent    = selected.status === 'confirmed'
    const displayName    = selected.full_name || selected.name || 'Guest'

    const summaryCards = [
      { label: 'TOTAL PEOPLE', value: `${selected.num_people || selected.quantity} person${(selected.num_people || selected.quantity) > 1 ? 's' : ''}`, color: '#fff' },
      ...(standingCount  > 0 ? [{ label: 'STANDING',  value: `${standingCount}x @ ${selected.standing_price_per_person ?? '-'} EGP`,  color: '#27AE60' }] : []),
      ...(backstageCount > 0 ? [{ label: 'BACKSTAGE', value: `${backstageCount}x @ ${selected.backstage_price_per_person ?? '-'} EGP`, color: '#8b5cf6' }] : []),
      ...(vipCount       > 0 ? [{ label: 'VIP',    value: `${vipCount}x @ ${selected.vip_price_per_person ?? '-'} EGP`,            color: '#F0A500' }] : []),
      { label: 'TOTAL', value: `${selected.total || selected.total_price} EGP`, color: '#fff' },
    ]

    const flowSteps = [
      { key: 'pending',          label: '1. PENDING'   },
      { key: 'reviewing',        label: '2. REVIEWING' },
      { key: 'awaiting_payment', label: '3. PAYMENT'   },
      { key: 'payment_review',   label: '4. REVIEW'    },
      { key: 'confirmed',        label: '5. CONFIRMED' },
    ]
    const stepOrder  = flowSteps.map(s => s.key)
    const currentIdx = stepOrder.indexOf(selected.status)

    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: '0', fontFamily: 'Inter, sans-serif' }}>

        {/* TOPBAR */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Reservations / Detail</span>
            </span>
          </div>
          <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>← Back</button>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px 80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.12)', borderRadius: 20, padding: 32 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Poppins, sans-serif' }}>{selected.events?.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'monospace', margin: 0 }}>{selected.id}</p>
              </div>
              <div style={{ background: `${statusColors[selected.status] || '#555'}18`, border: `1px solid ${statusColors[selected.status] || '#555'}40`, color: statusColors[selected.status] || '#555', padding: '8px 20px', borderRadius: 50, fontSize: 11, fontWeight: 700, letterSpacing: '2px' }}>
                {selected.status.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            {/* Flow Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
              {flowSteps.map((step, i) => {
                const stepIdx   = stepOrder.indexOf(step.key)
                const isDone    = currentIdx > stepIdx
                const isCurrent = currentIdx === stepIdx
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ padding: '5px 12px', borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: '1px', background: isCurrent ? `${statusColors[step.key]}20` : isDone ? 'rgba(39,174,96,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isCurrent ? statusColors[step.key] : isDone ? 'rgba(39,174,96,0.4)' : 'rgba(255,255,255,0.06)'}`, color: isCurrent ? statusColors[step.key] : isDone ? '#27AE60' : 'rgba(255,255,255,0.2)' }}>
                      {isDone ? '✓ ' : ''}{step.label}
                    </div>
                    {i < flowSteps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.1)' }}>→</span>}
                  </div>
                )
              })}
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${summaryCards.length}, 1fr)`, gap: 12, marginBottom: 24 }}>
              {summaryCards.map(card => (
                <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 6px' }}>{card.label}</p>
                  <p style={{ color: card.color, fontSize: 15, fontWeight: 700, margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Main Guest + Ticket + Event */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1.2fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>MAIN GUEST</p>
                <p style={{ color: '#fff', fontSize: 14, margin: '0 0 2px' }}>{mainGuest?.name || displayName}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 2px' }}>{selected.email}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 8px' }}>{selected.phone}</p>
                {selected.instagram
                  ? <a href={selected.instagram} target="_blank" rel="noreferrer" style={{ color: '#e1306c', fontSize: 12, textDecoration: 'none', border: '1px solid rgba(225,48,108,0.3)', borderRadius: 6, padding: '3px 8px' }}>📸 Instagram</a>
                  : <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, margin: 0 }}>No Instagram</p>
                }
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>MAIN GUEST TICKET</p>
                {(() => {
                  const type  = mainGuest?.ticket_type || (standingCount > 0 ? 'standing' : backstageCount > 0 ? 'backstage' : vipCount > 0 ? 'vip' : null)
                  const color = ticketTypeColor[type] || 'rgba(255,255,255,0.4)'
                  const wave  = type === 'backstage' ? selected.backstage_wave_label : type === 'vip' ? selected.vip_wave_label : selected.standing_wave_label
                  return (
                    <>
                      <p style={{ color, fontSize: 16, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                        {type === 'vip' ? '👑 ' : ''}{type ? type.toUpperCase() : 'N/A'}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>Wave: {wave || 'N/A'}</p>
                    </>
                  )
                })()}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>EVENT DATE</p>
                <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>
                  {selected.events?.date ? new Date(selected.events.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Guests Table */}
            {guests.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 14px' }}>ALL GUESTS ({guests.length})</p>
                <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1.4fr 1fr 1fr 1fr', gap: 10, padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
                  <span>#</span><span>NAME</span><span>TICKET</span><span>PHONE</span><span>INSTAGRAM</span>
                </div>
                {guests.map((p: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.4fr 1.4fr 1fr 1fr 1fr', gap: 10, padding: '10px', borderBottom: i < guests.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>{i + 1}</span>
                    <span style={{ color: '#fff' }}>{p.name}</span>
                    <span style={{ color: ticketTypeColor[p.ticket_type] || 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                      {p.ticket_type === 'vip' ? '👑 ' : ''}{p.ticket_type ? p.ticket_type.toUpperCase() : 'UNKNOWN'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.phone}</span>
                    <span>
                      {p.instagram
                        ? <a href={p.instagram} target="_blank" rel="noreferrer" style={{ color: '#e1306c', fontSize: 12, textDecoration: 'none', border: '1px solid rgba(225,48,108,0.3)', borderRadius: 6, padding: '3px 8px' }}>📸 Instagram</a>
                        : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Deadline */}
            {selected.payment_deadline && (
              <div style={{ background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 6px' }}>PAYMENT DEADLINE</p>
                <p style={{ color: '#2E75B6', fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {new Date(selected.payment_deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(selected.payment_deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            {/* Sender Phone */}
            {selected.payment_sender_phone && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 6px' }}>📱 SENT FROM NUMBER</p>
                <p style={{ color: '#2E75B6', fontSize: 22, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', margin: 0 }}>{selected.payment_sender_phone}</p>
              </div>
            )}

            {/* Screenshot */}
            {selected.payment_screenshot_url && (
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ color: '#8b5cf6', fontSize: 10, letterSpacing: '3px', fontWeight: 700, margin: '0 0 12px' }}>💸 PAYMENT SCREENSHOT</p>
                <a href={selected.payment_screenshot_url} target="_blank" rel="noreferrer">
                  <img src={selected.payment_screenshot_url} alt="Payment proof" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, cursor: 'zoom-in' }} />
                </a>
                <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, margin: '8px 0 0', textAlign: 'center' }}>Click to open full size</p>
              </div>
            )}

            {/* Already Confirmed */}
            {alreadySent && (
              <div style={{ background: 'rgba(39,174,96,0.05)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div>
                  <p style={{ color: '#27AE60', fontSize: 11, fontWeight: 700, letterSpacing: '2px', margin: '0 0 2px' }}>TICKETS CONFIRMED</p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>Tickets were already confirmed and sent.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, marginBottom: 14 }}>ACTIONS</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => updateStatus(selected.id, 'reviewing')} style={btnStyle('#fb923c', selected.status === 'reviewing')} disabled={loading}>🔎 REVIEWING</button>
                <button onClick={() => updateStatus(selected.id, 'awaiting_payment')} style={btnStyle('#2E75B6', selected.status === 'awaiting_payment')} disabled={loading}>💳 REQUEST PAYMENT</button>
                <button
                  onClick={() => handleConfirmAndSendTickets(selected)}
                  style={{ ...btnStyle('#27AE60'), opacity: alreadySent ? 0.4 : loading ? 0.5 : 1, cursor: alreadySent || loading ? 'not-allowed' : 'pointer' }}
                  disabled={loading || alreadySent}
                >🎫 CONFIRM + WHATSAPP</button>
                {selected.email && (
                  <button onClick={() => handleSendGmail(selected)} style={{ background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.35)', color: '#ea4335', padding: '9px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', fontFamily: 'Inter, sans-serif' }}>📧 SEND EMAIL</button>
                )}
                <button onClick={() => updateStatus(selected.id, 'rejected')} style={btnStyle('#E74C3C')} disabled={loading}>❌ REJECT</button>
              </div>
              {loading && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 12 }}>Updating...</p>}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: '0', fontFamily: 'Inter, sans-serif' }}>

      {/* TOPBAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Reservations</span>
          </span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>← Dashboard</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>MANAGE</span>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 36, color: '#fff', margin: '8px 0 0', letterSpacing: '-1px' }}>Reservations</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>{reservations.length} total bookings</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {['all', ...allStatuses].map(s => {
            const count    = s === 'all' ? reservations.length : reservations.filter(r => r.status === s).length
            const isActive = filter === s
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                background: isActive ? 'linear-gradient(135deg, #1A3C5E, #2E75B6)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                {s.replace(/_/g, ' ').toUpperCase()} ({count})
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['GUEST', 'EVENT', 'TICKETS', 'TOTAL', 'STATUS'].map(h => (
              <span key={h} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700 }}>{h}</span>
            ))}
          </div>

          {filtered.map((r, i) => (
            <div key={r.id} onClick={() => setSelected(r)}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr', padding: '16px 24px', cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{r.full_name || r.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>{r.email}</p>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, alignSelf: 'center' }}>{r.events?.title}</span>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.num_people || r.quantity}x</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                  {(r.standing_count  > 0) && <span style={{ fontSize: 9, fontWeight: 700, color: '#27AE60', background: 'rgba(39,174,96,0.1)',  border: '1px solid rgba(39,174,96,0.2)',  borderRadius: 4, padding: '1px 5px' }}>STD×{r.standing_count}</span>}
                  {(r.backstage_count > 0) && <span style={{ fontSize: 9, fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 4, padding: '1px 5px' }}>BST×{r.backstage_count}</span>}
                  {(r.vip_count       > 0) && <span style={{ fontSize: 9, fontWeight: 700, color: '#F0A500', background: 'rgba(240,165,0,0.1)',  border: '1px solid rgba(240,165,0,0.2)',  borderRadius: 4, padding: '1px 5px' }}>👑×{r.vip_count}</span>}
                </div>
              </div>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, alignSelf: 'center' }}>{r.total || r.total_price} EGP</span>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ background: `${statusColors[r.status] || '#555'}15`, border: `1px solid ${statusColors[r.status] || '#555'}30`, color: statusColors[r.status] || '#555', padding: '4px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: '1px' }}>
                  {r.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 12, letterSpacing: '3px' }}>NO RESERVATIONS FOUND</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}