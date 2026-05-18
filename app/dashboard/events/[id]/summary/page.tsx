'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type TicketType = 'standing' | 'backstage' | 'vip'

type PeopleDetail = {
  name?: string
  phone?: string
  instagram?: string
  ticket_type?: TicketType
  wave?: number | null
}

type Counter = {
  standing: number
  backstage: number
  vip: number
  standing_wave_1: number
  standing_wave_2: number
  standing_wave_3: number
  backstage_wave_1: number
  backstage_wave_2: number
  backstage_wave_3: number
  vip_wave_1: number
  vip_wave_2: number
  vip_wave_3: number
}

const EMPTY_COUNTS: Counter = {
  standing: 0,
  backstage: 0,
  vip: 0,
  standing_wave_1: 0,
  standing_wave_2: 0,
  standing_wave_3: 0,
  backstage_wave_1: 0,
  backstage_wave_2: 0,
  backstage_wave_3: 0,
  vip_wave_1: 0,
  vip_wave_2: 0,
  vip_wave_3: 0,
}

export default function EventSummaryPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [eventData, setEventData] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!params?.id) return
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }
    load()
  }, [params?.id])

  const load = async () => {
    setLoading(true)

    const { data: ev } = await supabase.from('events').select('*').eq('id', params.id).single()
    const { data: res } = await supabase
      .from('reservations')
      .select('*')
      .eq('event_id', params.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    setEventData(ev || null)
    setReservations(res || [])
    setLoading(false)
  }

  if (loading)
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '3px', fontSize: 12 }}>
          LOADING...
        </p>
      </main>
    )

  if (!eventData)
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ color: '#E74C3C' }}>Event not found.</p>
      </main>
    )

  const ticketsSold = reservations.reduce((s, r) => s + (r.num_people || 0), 0)
  const totalRevenue = reservations.reduce((s, r) => s + (r.total_price || 0), 0)
  const TAX_RATE = 0.08
  const revenueBeforeTax = Math.round(totalRevenue / (1 + TAX_RATE))
  const taxAmount = totalRevenue - revenueBeforeTax

  const counts: Counter = reservations.reduce((acc: Counter, r: any) => {
    const mainTicketType: TicketType | undefined = r.main_ticket_type || r.ticket_type
    const mainWave: number | null = typeof r.main_wave === 'number' ? r.main_wave : r.wave ?? null

    const inc = (type: TicketType | undefined, wave: number | null | undefined) => {
      if (!type) return
      if (type === 'standing') acc.standing += 1
      if (type === 'backstage') acc.backstage += 1
      if (type === 'vip') acc.vip += 1

      if (type === 'standing' && wave === 1) acc.standing_wave_1 += 1
      if (type === 'standing' && wave === 2) acc.standing_wave_2 += 1
      if (type === 'standing' && wave === 3) acc.standing_wave_3 += 1

      if (type === 'backstage' && wave === 1) acc.backstage_wave_1 += 1
      if (type === 'backstage' && wave === 2) acc.backstage_wave_2 += 1
      if (type === 'backstage' && wave === 3) acc.backstage_wave_3 += 1

      if (type === 'vip' && wave === 1) acc.vip_wave_1 += 1
      if (type === 'vip' && wave === 2) acc.vip_wave_2 += 1
      if (type === 'vip' && wave === 3) acc.vip_wave_3 += 1
    }

    inc(mainTicketType, mainWave)

    const extras: PeopleDetail[] = Array.isArray(r.people_details) ? r.people_details : []
    extras.forEach(p => inc(p.ticket_type, p.wave ?? null))

    return acc
  }, { ...EMPTY_COUNTS })

  const handleDownload = () => {
    if (!reservations.length) return

    const maxExtraPeople = Math.max(...reservations.map(r => r.people_details?.length || 0), 0)

    const header = [
      '#',
      'Booking ID',
      'Main Guest Name',
      'Main Guest Phone',
      'Main Guest Instagram',
      'Main Ticket Type',
      'Main Wave',
      'Total People Count',
      'Total Price (EGP)',
      'Entry Code',
      'Payment Sender Phone',
      'Booked At (Date)',
      'Booked At (Time)',
    ]

    for (let i = 2; i <= maxExtraPeople + 1; i++) {
      header.push(
        `Guest ${i} Name`,
        `Guest ${i} Phone`,
        `Guest ${i} Instagram`,
        `Guest ${i} Ticket Type`,
        `Guest ${i} Wave`,
      )
    }

    const rows = reservations.map((r, index) => {
      const bookedDate = new Date(r.created_at)

      const row: any[] = [
        index + 1,
        r.id,
        r.name,
        r.phone,
        r.instagram,
        r.main_ticket_type || r.ticket_type || '',
        typeof r.main_wave === 'number' ? r.main_wave : r.wave ?? '',
        r.num_people,
        r.total_price ?? 0,
        r.entry_code ?? '',
        r.payment_sender_phone ?? '',
        bookedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        bookedDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      ]

      const extras: PeopleDetail[] = Array.isArray(r.people_details) ? r.people_details : []

      for (let i = 0; i < maxExtraPeople; i++) {
        if (extras[i]) {
          row.push(
            extras[i].name || '',
            extras[i].phone || '',
            extras[i].instagram || '',
            extras[i].ticket_type || '',
            extras[i].wave ?? '',
          )
        } else {
          row.push('', '', '', '', '')
        }
      }

      return row
    })

    const csvContent = [header, ...rows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(eventData.title || 'event').replace(/[^a-z0-9]+/gi, '_')}_Confirmed_${new Date()
      .toISOString()
      .split('T')[0]}.csv`

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const safeExtras = (r: any): PeopleDetail[] =>
    Array.isArray(r.people_details) ? r.people_details : []

  const typeColor = (t?: string) =>
    t === 'backstage' ? '#8b5cf6' : t === 'vip' ? '#F0A500' : '#27AE60'

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1e',
        padding: 0,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* TOPBAR */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(10,15,30,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(46,117,182,0.12)',
          padding: '0 32px',
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
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}>
              {' '}
              / {eventData.title} / Summary
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleDownload}
            style={{
              background: 'rgba(39,174,96,0.1)',
              border: '1px solid rgba(39,174,96,0.3)',
              color: '#27AE60',
              padding: '7px 16px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⬇ Download CSV
          </button>

          <button
            onClick={() => router.push('/dashboard/events')}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              padding: '7px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Events
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '88px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>
            EVENT SUMMARY
          </span>

          <h1
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              color: '#fff',
              margin: '8px 0 6px',
              letterSpacing: '-1px',
            }}
          >
            {eventData.title}
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: 0 }}>
            📅{' '}
            {new Date(eventData.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
            })}{' '}
            · 📍 {eventData.location}
          </p>

          {eventData.transfer_number && (
            <p style={{ color: '#F0A500', fontSize: 13, fontWeight: 600, margin: '6px 0 0' }}>
              💳 Transfer Number: {eventData.transfer_number}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: 'CONFIRMED BOOKINGS',
              value: reservations.length,
              color: '#fff',
              border: 'rgba(255,255,255,0.06)',
            },
            {
              label: 'TICKETS SOLD',
              value: ticketsSold,
              color: '#fff',
              border: 'rgba(255,255,255,0.06)',
            },
            {
              label: 'STANDING',
              value: counts.standing,
              color: '#27AE60',
              border: 'rgba(39,174,96,0.25)',
            },
            {
              label: 'BACKSTAGE',
              value: counts.backstage,
              color: '#8b5cf6',
              border: 'rgba(139,92,246,0.25)',
            },
            {
              label: 'VIP',
              value: counts.vip,
              color: '#F0A500',
              border: 'rgba(240,165,0,0.3)',
            },
            {
              label: 'TOTAL REVENUE',
              value: `${totalRevenue.toLocaleString()} EGP`,
              color: '#27AE60',
              border: 'rgba(39,174,96,0.2)',
            },
            {
              label: 'BEFORE TAX',
              value: `${revenueBeforeTax.toLocaleString()} EGP`,
              color: '#2E75B6',
              border: 'rgba(46,117,182,0.25)',
            },
            {
              label: 'VAT (8%)',
              value: `${taxAmount.toLocaleString()} EGP`,
              color: '#E74C3C',
              border: 'rgba(231,76,60,0.25)',
            },
          ].map(c => (
            <div
              key={c.label}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: '18px 20px',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 10,
                  letterSpacing: '2px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  color: c.color,
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Waves Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            {
              label: 'STANDING · WAVES',
              color: '#27AE60',
              w1: counts.standing_wave_1,
              w2: counts.standing_wave_2,
              w3: counts.standing_wave_3,
            },
            {
              label: 'BACKSTAGE · WAVES',
              color: '#8b5cf6',
              w1: counts.backstage_wave_1,
              w2: counts.backstage_wave_2,
              w3: counts.backstage_wave_3,
            },
            {
              label: 'VIP · WAVES',
              color: '#F0A500',
              w1: counts.vip_wave_1,
              w2: counts.vip_wave_2,
              w3: counts.vip_wave_3,
            },
          ].map(row => (
            <div
              key={row.label}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 18,
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 10,
                  letterSpacing: '2px',
                  fontWeight: 700,
                  margin: '0 0 10px',
                }}
              >
                {row.label}
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                {[['W1', row.w1], ['W2', row.w2], ['W3', row.w3]].map(([w, n]) => (
                  <div key={w as string} style={{ textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '1px', margin: '0 0 4px' }}>
                      {w}
                    </p>
                    <p
                      style={{
                        color: row.color,
                        fontSize: 18,
                        fontWeight: 800,
                        margin: 0,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {n as number}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p
              style={{
                color: 'rgba(255,255,255,0.2)',
                fontSize: 11,
                letterSpacing: '2.5px',
                fontWeight: 700,
                margin: 0,
              }}
            >
              CONFIRMED RESERVATIONS ({reservations.length}) — Click to view details
            </p>
          </div>

          {reservations.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.1)',
                fontSize: 12,
                letterSpacing: '2px',
              }}
            >
              NO CONFIRMED RESERVATIONS YET
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['#', 'NAME', 'PHONE', 'INSTAGRAM', 'TYPE', 'WAVE', 'PEOPLE', 'TOTAL', 'DATE'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: 10,
                          letterSpacing: '1.5px',
                          fontWeight: 700,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {reservations.map((r, i) => {
                    const mainTicketType: TicketType | undefined = r.main_ticket_type || r.ticket_type
                    const mainWave: number | null = typeof r.main_wave === 'number' ? r.main_wave : r.wave ?? null

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,117,182,0.05)')}
                        onMouseLeave={e =>
                          (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')
                        }
                      >
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>{r.name}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>{r.phone}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>{r.instagram}</td>
                        <td style={{ padding: '12px 16px', color: typeColor(mainTicketType), fontWeight: 700 }}>
                          {mainTicketType === 'vip' ? '👑 ' : ''}
                          {mainTicketType ? mainTicketType.toUpperCase() : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>
                          {mainWave ? `W${mainWave}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, textAlign: 'center' }}>
                          {r.num_people}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#27AE60', fontWeight: 700 }}>
                          {(r.total_price || 0).toLocaleString()} EGP
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(10,15,30,0.98)',
              border: '1px solid rgba(46,117,182,0.25)',
              borderRadius: 20,
              padding: 32,
              maxWidth: 520,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{ color: '#2E75B6', fontSize: 11, letterSpacing: '2.5px', fontWeight: 700, margin: 0 }}>
                RESERVATION DETAILS
              </p>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ✕ Close
              </button>
            </div>

            {selected.entry_code && (
              <div
                style={{
                  textAlign: 'center',
                  background: 'rgba(39,174,96,0.06)',
                  border: '1px solid rgba(39,174,96,0.2)',
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', margin: '0 0 8px' }}>
                  ENTRY CODE
                </p>
                <p
                  style={{
                    color: '#27AE60',
                    fontSize: 38,
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    letterSpacing: '8px',
                    margin: 0,
                  }}
                >
                  {selected.entry_code}
                </p>
              </div>
            )}

            {[
              { label: 'NAME', value: selected.name },
              { label: 'PHONE', value: selected.phone },
              { label: 'INSTAGRAM', value: selected.instagram },
              {
                label: 'MAIN TICKET',
                value: `${(selected.main_ticket_type || selected.ticket_type || '').toUpperCase() || '—'} ${
                  selected.main_wave || selected.wave ? `· W${selected.main_wave || selected.wave}` : ''
                }`,
              },
              { label: 'PEOPLE', value: `${selected.num_people} person(s)` },
              { label: 'TOTAL PAID', value: `${selected.total_price || 0} EGP` },
              {
                label: 'BOOKED ON',
                value: new Date(selected.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>
                  {item.label}
                </p>
                <p
                  style={{
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                    textAlign: 'right',
                    maxWidth: '60%',
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}

            <div style={{ marginTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
                GUESTS & TICKETS
              </p>

              <div
                style={{
                  background: 'rgba(39,174,96,0.05)',
                  border: '1px solid rgba(39,174,96,0.2)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 8,
                }}
              >
                <p style={{ color: '#27AE60', fontSize: 11, fontWeight: 700, letterSpacing: '1px', margin: '0 0 6px' }}>
                  MAIN GUEST
                </p>
                <p style={{ color: '#fff', fontSize: 13, margin: '0 0 4px' }}>
                  {selected.name} — {selected.phone}
                </p>
                <p
                  style={{
                    color: typeColor(selected.main_ticket_type || selected.ticket_type),
                    fontSize: 12,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {selected.main_ticket_type === 'vip' ? '👑 ' : ''}
                  {(selected.main_ticket_type || selected.ticket_type || '').toUpperCase() || '—'}{' '}
                  {selected.main_wave || selected.wave ? `· W${selected.main_wave || selected.wave}` : ''}
                </p>
              </div>

              {safeExtras(selected).map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 8,
                  }}
                >
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>
                    👤 {p.name} — {p.phone}
                  </p>
                  <p style={{ color: typeColor(p.ticket_type), fontSize: 12, fontWeight: 700, margin: 0 }}>
                    {p.ticket_type === 'vip' ? '👑 ' : ''}
                    {(p.ticket_type || '—').toUpperCase()} {p.wave ? `· W${p.wave}` : ''}
                  </p>
                </div>
              ))}
            </div>

            {selected.payment_screenshot_url && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
                  PAYMENT SCREENSHOT
                </p>
                <img
                  src={selected.payment_screenshot_url}
                  alt="payment"
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}