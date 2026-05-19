'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type TicketType = 'single' | 'standing' | 'backstage' | 'vip'

type PeopleDetail = {
  name?: string
  phone?: string
  instagram?: string
  ticket_type?: TicketType
  wave?: number | string | null
}

type ReservationRow = {
  id: string
  event_id: string
  created_at?: string | null
  status?: string | null

  name?: string | null
  full_name?: string | null
  phone?: string | null
  email?: string | null
  instagram?: string | null

  num_people?: number | null
  quantity?: number | null

  total_price?: number | null
  subtotal_price?: number | null
  tax_amount?: number | null

  total?: number | null
  subtotal?: number | null
  fee?: number | null

  entry_code?: string | null
  payment_sender_phone?: string | null
  payment_screenshot_url?: string | null

  people_details?: PeopleDetail[] | null

  single_count?: number | null
  single_price_per_person?: number | null
  single_wave_label?: string | null

  standing_count?: number | null
  standing_price_per_person?: number | null
  standing_wave_label?: string | null

  backstage_count?: number | null
  backstage_price_per_person?: number | null
  backstage_wave_label?: string | null

  vip_count?: number | null
  vip_price_per_person?: number | null
  vip_wave_label?: string | null
}

type GuestTicket = {
  id: string
  event_id: string
  created_at?: string | null
  full_name?: string | null
  phone?: string | null
  instagram?: string | null
  ticket_type?: string | null
  price_paid?: number | null
  payment_status?: string | null
  status?: string | null
  qr_code?: string | null
  is_guest_list?: boolean | null
  checked_in_at?: string | null
}

type EventRow = {
  id: string
  title: string
  date: string
  location: string
  transfer_number?: string | null
}

type CountMap = {
  single: number
  standing: number
  backstage: number
  vip: number
  guest: number

  single_wave_1: number
  single_wave_2: number
  single_wave_3: number

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

const EMPTY_COUNTS: CountMap = {
  single: 0,
  standing: 0,
  backstage: 0,
  vip: 0,
  guest: 0,

  single_wave_1: 0,
  single_wave_2: 0,
  single_wave_3: 0,

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

const getWaveNumberFromLabel = (label?: string | null): number | null => {
  if (!label) return null
  if (label.includes('wave_1')) return 1
  if (label.includes('wave_2')) return 2
  if (label.includes('wave_3')) return 3
  return null
}

const normalizeMainName = (r: ReservationRow) => r.name || r.full_name || '-'
const normalizePeopleCount = (r: ReservationRow) => r.num_people || r.quantity || 0
const normalizeTotal = (r: ReservationRow) => r.total_price ?? r.total ?? 0
const normalizeSubtotal = (r: ReservationRow) => r.subtotal_price ?? r.subtotal ?? 0
const normalizeTax = (r: ReservationRow) => r.tax_amount ?? r.fee ?? 0
const safeExtras = (r: ReservationRow): PeopleDetail[] => (Array.isArray(r.people_details) ? r.people_details : [])

export default function EventSummaryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const eventId = typeof params?.id === 'string' ? params.id : ''

  const [loading, setLoading] = useState(true)
  const [eventData, setEventData] = useState<EventRow | null>(null)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [guestTickets, setGuestTickets] = useState<GuestTicket[]>([])
  const [selectedReservation, setSelectedReservation] = useState<ReservationRow | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return

    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }

    load()
  }, [eventId, router])

  const load = async () => {
    if (!eventId) return

    setLoading(true)
    setError('')

    const [
      { data: ev, error: evError },
      { data: res, error: resError },
      { data: guests, error: guestsError },
    ] = await Promise.all([
      supabase.from('events').select('id,title,date,location,transfer_number').eq('id', eventId).single(),
      supabase
        .from('reservations')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false }),
      supabase
        .from('tickets')
        .select(
          'id,event_id,created_at,full_name,phone,instagram,ticket_type,price_paid,payment_status,status,qr_code,is_guest_list,checked_in_at'
        )
        .eq('event_id', eventId)
        .eq('ticket_type', 'guest')
        .order('created_at', { ascending: false }),
    ])

    if (evError) {
      setError(`Event load error: ${evError.message}`)
    } else {
      setEventData((ev as EventRow) || null)
    }

    if (resError) {
      setError(prev => (prev ? `${prev} | Reservations load error: ${resError.message}` : `Reservations load error: ${resError.message}`))
    } else {
      setReservations((res as ReservationRow[]) || [])
    }

    if (guestsError) {
      setError(prev => (prev ? `${prev} | Guest tickets load error: ${guestsError.message}` : `Guest tickets load error: ${guestsError.message}`))
    } else {
      setGuestTickets((guests as GuestTicket[]) || [])
    }

    setLoading(false)
  }

  const ticketsSoldFromReservations = useMemo(
    () => reservations.reduce((sum, r) => sum + normalizePeopleCount(r), 0),
    [reservations]
  )

  const guestCount = useMemo(() => guestTickets.length, [guestTickets])
  const allTicketsCount = ticketsSoldFromReservations + guestCount

  const totalRevenue = useMemo(
    () => reservations.reduce((sum, r) => sum + normalizeTotal(r), 0),
    [reservations]
  )

  const subtotalRevenue = useMemo(() => {
    const rawSubtotal = reservations.reduce((sum, r) => sum + normalizeSubtotal(r), 0)
    if (rawSubtotal > 0) return rawSubtotal
    return totalRevenue
  }, [reservations, totalRevenue])

  const totalTax = useMemo(() => {
    const rawTax = reservations.reduce((sum, r) => sum + normalizeTax(r), 0)
    return rawTax > 0 ? rawTax : 0
  }, [reservations])

  const counts = useMemo(() => {
    const result: CountMap = { ...EMPTY_COUNTS }

    reservations.forEach(r => {
      const singleCount = r.single_count || 0
      const standingCount = r.standing_count || 0
      const backstageCount = r.backstage_count || 0
      const vipCount = r.vip_count || 0

      const singleWave = getWaveNumberFromLabel(r.single_wave_label)
      const standingWave = getWaveNumberFromLabel(r.standing_wave_label)
      const backstageWave = getWaveNumberFromLabel(r.backstage_wave_label)
      const vipWave = getWaveNumberFromLabel(r.vip_wave_label)

      result.single += singleCount
      result.standing += standingCount
      result.backstage += backstageCount
      result.vip += vipCount

      if (singleWave === 1) result.single_wave_1 += singleCount
      if (singleWave === 2) result.single_wave_2 += singleCount
      if (singleWave === 3) result.single_wave_3 += singleCount

      if (standingWave === 1) result.standing_wave_1 += standingCount
      if (standingWave === 2) result.standing_wave_2 += standingCount
      if (standingWave === 3) result.standing_wave_3 += standingCount

      if (backstageWave === 1) result.backstage_wave_1 += backstageCount
      if (backstageWave === 2) result.backstage_wave_2 += backstageCount
      if (backstageWave === 3) result.backstage_wave_3 += backstageCount

      if (vipWave === 1) result.vip_wave_1 += vipCount
      if (vipWave === 2) result.vip_wave_2 += vipCount
      if (vipWave === 3) result.vip_wave_3 += vipCount
    })

    result.guest = guestTickets.length

    return result
  }, [reservations, guestTickets])

  const handleDownload = () => {
    const reservationRows = reservations
    const guestRows = guestTickets

    const maxExtraPeople = Math.max(...reservationRows.map(r => safeExtras(r).length), 0)

    const header = [
      'Row Type',
      '#',
      'Record ID',
      'Main / Guest Name',
      'Phone',
      'Email',
      'Instagram',
      'Primary Ticket Type',
      'Primary Wave',
      'Single Count',
      'Single Wave',
      'Standing Count',
      'Standing Wave',
      'Backstage Count',
      'Backstage Wave',
      'VIP Count',
      'VIP Wave',
      'Guests Count / Total People',
      'Subtotal (EGP)',
      'Tax (EGP)',
      'Total (EGP)',
      'Payment Status',
      'Reservation Status',
      'Entry Code',
      'QR Code',
      'Payment Sender Phone',
      'Created Date',
      'Created Time',
    ]

    for (let i = 2; i <= maxExtraPeople + 1; i++) {
      header.push(`Guest ${i} Name`)
      header.push(`Guest ${i} Phone`)
      header.push(`Guest ${i} Instagram`)
      header.push(`Guest ${i} Ticket Type`)
      header.push(`Guest ${i} Wave`)
    }

    const reservationDataRows = reservationRows.map((r, index) => {
      const bookedDate = r.created_at ? new Date(r.created_at) : null
      const dateStr = bookedDate
        ? bookedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : ''
      const timeStr = bookedDate
        ? bookedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : ''

      const singleWave = getWaveNumberFromLabel(r.single_wave_label)
      const standingWave = getWaveNumberFromLabel(r.standing_wave_label)
      const backstageWave = getWaveNumberFromLabel(r.backstage_wave_label)
      const vipWave = getWaveNumberFromLabel(r.vip_wave_label)

      const mainTicketType =
        (r.single_count || 0) > 0
          ? 'single'
          : (r.standing_count || 0) > 0
          ? 'standing'
          : (r.backstage_count || 0) > 0
          ? 'backstage'
          : (r.vip_count || 0) > 0
          ? 'vip'
          : ''

      const mainWave =
        mainTicketType === 'single'
          ? singleWave
          : mainTicketType === 'standing'
          ? standingWave
          : mainTicketType === 'backstage'
          ? backstageWave
          : mainTicketType === 'vip'
          ? vipWave
          : null

      const row: (string | number)[] = [
        'reservation',
        index + 1,
        r.id,
        normalizeMainName(r),
        r.phone || '',
        r.email || '',
        r.instagram || '',
        mainTicketType,
        mainWave ?? '',
        r.single_count || 0,
        singleWave ?? '',
        r.standing_count || 0,
        standingWave ?? '',
        r.backstage_count || 0,
        backstageWave ?? '',
        r.vip_count || 0,
        vipWave ?? '',
        normalizePeopleCount(r),
        normalizeSubtotal(r),
        normalizeTax(r),
        normalizeTotal(r),
        'paid',
        r.status || '',
        r.entry_code || '',
        '',
        r.payment_sender_phone || '',
        dateStr,
        timeStr,
      ]

      const extraPeople = safeExtras(r)
      for (let i = 0; i < maxExtraPeople; i++) {
        if (extraPeople[i]) {
          row.push(extraPeople[i].name || '')
          row.push(extraPeople[i].phone || '')
          row.push(extraPeople[i].instagram || '')
          row.push(extraPeople[i].ticket_type || '')
          row.push(extraPeople[i].wave ?? '')
        } else {
          row.push('')
          row.push('')
          row.push('')
          row.push('')
          row.push('')
        }
      }

      return row
    })

    const guestDataRows = guestRows.map((g, index) => {
      const created = g.created_at ? new Date(g.created_at) : null
      const dateStr = created
        ? created.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : ''
      const timeStr = created
        ? created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : ''

      const row: (string | number)[] = [
        'guest',
        index + 1,
        g.id,
        g.full_name || '',
        g.phone || '',
        '',
        g.instagram || '',
        'guest',
        '',
        0,
        '',
        0,
        '',
        0,
        '',
        0,
        '',
        1,
        g.price_paid ?? 0,
        0,
        g.price_paid ?? 0,
        g.payment_status || 'free',
        g.status || 'active',
        '',
        g.qr_code || '',
        '',
        dateStr,
        timeStr,
      ]

      for (let i = 0; i < maxExtraPeople; i++) {
        row.push('')
        row.push('')
        row.push('')
        row.push('')
        row.push('')
      }

      return row
    })

    const csvContent = [header, ...reservationDataRows, ...guestDataRows]
      .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    const safeTitle = (eventData?.title || 'event').toString().replace(/[^a-z0-9]+/gi, '_')
    a.download = `${safeTitle}_summary_${new Date().toISOString().split('T')[0]}.csv`

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#09101d',
          padding: '60px 24px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ color: '#6b7280', letterSpacing: '3px', fontSize: '12px' }}>LOADING...</p>
      </main>
    )
  }

  if (!eventData) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#09101d',
          padding: '60px 24px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ color: '#ef4444' }}>Event not found.</p>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #09101d 0%, #0a0f1e 35%, #0b1120 100%)',
        padding: '60px 24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <p
              style={{
                color: '#60a5fa',
                fontSize: '11px',
                letterSpacing: '4px',
                fontWeight: 700,
                margin: '0 0 8px',
              }}
            >
              EVENT SUMMARY
            </p>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 6px',
                letterSpacing: '-0.5px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {eventData.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
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
              <p style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, margin: '6px 0 0' }}>
                💳 Transfer Number: {eventData.transfer_number}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push(`/dashboard/events/${eventId}/guest-list`)}
              style={{
                backgroundColor: 'rgba(96,165,250,0.08)',
                border: '1px solid rgba(96,165,250,0.25)',
                color: '#60a5fa',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Guest List
            </button>

            <button
              onClick={handleDownload}
              style={{
                backgroundColor: '#16a34a',
                border: '1px solid #16a34a',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ⬇ DOWNLOAD CSV
            </button>

            <button
              onClick={() => router.push('/dashboard/events')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ← BACK
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(231,76,60,0.08)',
              border: '1px solid rgba(231,76,60,0.22)',
              borderRadius: 14,
              padding: '14px 18px',
              color: '#ff7b72',
              fontSize: 14,
              marginBottom: 20,
              lineHeight: 1.7,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'CONFIRMED BOOKINGS', value: reservations.length, color: '#fff', border: '#1a1a1a' },
            { label: 'GUEST TICKETS', value: counts.guest, color: '#60a5fa', border: 'rgba(96,165,250,0.35)' },
            { label: 'SINGLE', value: counts.single, color: '#60a5fa', border: 'rgba(96,165,250,0.35)' },
            { label: 'STANDING', value: counts.standing, color: '#22c55e', border: 'rgba(34,197,94,0.35)' },
            { label: 'BACKSTAGE', value: counts.backstage, color: '#a855f7', border: 'rgba(168,85,247,0.35)' },
            { label: 'VIP', value: counts.vip, color: '#fbbf24', border: 'rgba(251,191,36,0.35)' },
            { label: 'TOTAL REVENUE', value: `${totalRevenue.toLocaleString()} EGP`, color: '#10b981', border: 'rgba(16,185,129,0.35)' },
            { label: 'SUBTOTAL', value: `${subtotalRevenue.toLocaleString()} EGP`, color: '#93c5fd', border: 'rgba(147,197,253,0.35)' },
            { label: 'TAX', value: `${totalTax.toLocaleString()} EGP`, color: '#f87171', border: 'rgba(248,113,113,0.35)' },
          ].map(card => (
            <div
              key={card.label}
              style={{
                backgroundColor: '#0d1528',
                border: `1px solid ${card.border}`,
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.42)',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  color: card.color,
                  fontSize: '22px',
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

    

        <div
          style={{
            backgroundColor: '#0d1528',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '11px',
                letterSpacing: '3px',
                fontWeight: 700,
                margin: 0,
              }}
            >
              CONFIRMED RESERVATIONS
            </p>
          </div>

          {reservations.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.28)',
                fontSize: '12px',
                letterSpacing: '2px',
              }}
            >
              NO CONFIRMED RESERVATIONS YET
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['#', 'NAME', 'PHONE', 'INSTAGRAM', 'TYPES', 'PEOPLE', 'TOTAL', 'DATE'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '10px',
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
                    const typeSummary = [
                      (r.single_count || 0) > 0 ? `Single ${r.single_count}` : null,
                      (r.standing_count || 0) > 0 ? `Standing ${r.standing_count}` : null,
                      (r.backstage_count || 0) > 0 ? `Backstage ${r.backstage_count}` : null,
                      (r.vip_count || 0) > 0 ? `VIP ${r.vip_count}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReservation(r)}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>{normalizeMainName(r)}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.75)' }}>{r.phone || '-'}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{r.instagram || '-'}</td>
                        <td style={{ padding: '12px 16px', color: '#93c5fd', fontWeight: 700 }}>{typeSummary || '-'}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, textAlign: 'center' }}>{normalizePeopleCount(r)}</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>{normalizeTotal(r).toLocaleString()} EGP</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'UTC',
                              })
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: '#0d1528',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '11px',
                letterSpacing: '3px',
                fontWeight: 700,
                margin: 0,
              }}
            >
              GUEST TICKETS
            </p>
          </div>

          {guestTickets.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.28)',
                fontSize: '12px',
                letterSpacing: '2px',
              }}
            >
              NO GUEST TICKETS YET
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['#', 'NAME', 'PHONE', 'INSTAGRAM', 'PRICE', 'QR', 'STATUS'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '10px',
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
                  {guestTickets.map((g, i) => (
                    <tr
                      key={g.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>{g.full_name || '-'}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.75)' }}>{g.phone || '-'}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{g.instagram || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#86efac', fontWeight: 700 }}>{(g.price_paid ?? 0).toLocaleString()} EGP</td>
                      <td style={{ padding: '12px 16px', color: '#60a5fa', fontWeight: 700, wordBreak: 'break-all' }}>{g.qr_code || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#fbbf24', fontWeight: 700 }}>{g.status || 'active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedReservation && (
          <div
            onClick={() => setSelectedReservation(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.82)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#0d1528',
                border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '620px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                }}
              >
                <p
                  style={{
                    color: '#60a5fa',
                    fontSize: '11px',
                    letterSpacing: '3px',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  RESERVATION DETAILS
                </p>
                <button
                  onClick={() => setSelectedReservation(null)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  ✕ CLOSE
                </button>
              </div>

              {selectedReservation.entry_code && (
                <div
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#111a30',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '10px',
                      letterSpacing: '2px',
                      margin: '0 0 8px',
                    }}
                  >
                    ENTRY CODE
                  </p>
                  <p
                    style={{
                      color: '#10b981',
                      fontSize: '40px',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: '8px',
                      margin: 0,
                    }}
                  >
                    {selectedReservation.entry_code}
                  </p>
                </div>
              )}

              {[
                { label: 'NAME', value: normalizeMainName(selectedReservation) },
                { label: 'PHONE', value: selectedReservation.phone || '-' },
                { label: 'EMAIL', value: selectedReservation.email || '-' },
                { label: 'INSTAGRAM', value: selectedReservation.instagram || '-' },
                { label: 'TOTAL PEOPLE', value: `${normalizePeopleCount(selectedReservation)} person(s)` },
                { label: 'SUBTOTAL', value: `${normalizeSubtotal(selectedReservation)} EGP` },
                { label: 'TAX', value: `${normalizeTax(selectedReservation)} EGP` },
                { label: 'TOTAL PAID', value: `${normalizeTotal(selectedReservation)} EGP` },
                {
                  label: 'BOOKED ON',
                  value: selectedReservation.created_at
                    ? new Date(selectedReservation.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '-',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '10px',
                      letterSpacing: '2px',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      margin: 0,
                      textAlign: 'right',
                      maxWidth: '60%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}

              <div style={{ marginTop: '20px' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    margin: '0 0 10px',
                  }}
                >
                  TICKET BREAKDOWN
                </p>

                {[
                  {
                    label: 'SINGLE',
                    count: selectedReservation.single_count || 0,
                    wave: getWaveNumberFromLabel(selectedReservation.single_wave_label),
                    color: '#60a5fa',
                  },
                  {
                    label: 'STANDING',
                    count: selectedReservation.standing_count || 0,
                    wave: getWaveNumberFromLabel(selectedReservation.standing_wave_label),
                    color: '#22c55e',
                  },
                  {
                    label: 'BACKSTAGE',
                    count: selectedReservation.backstage_count || 0,
                    wave: getWaveNumberFromLabel(selectedReservation.backstage_wave_label),
                    color: '#a855f7',
                  },
                  {
                    label: 'VIP',
                    count: selectedReservation.vip_count || 0,
                    wave: getWaveNumberFromLabel(selectedReservation.vip_wave_label),
                    color: '#fbbf24',
                  },
                ]
                  .filter(item => item.count > 0)
                  .map(item => (
                    <div
                      key={item.label}
                      style={{
                        backgroundColor: '#111a30',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '8px',
                      }}
                    >
                      <p style={{ color: item.color, fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
                        {item.label} · {item.count}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0 }}>
                        {item.wave ? `Wave ${item.wave}` : 'No wave'}
                      </p>
                    </div>
                  ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    margin: '0 0 10px',
                  }}
                >
                  GUESTS & TICKETS
                </p>

                <div
                  style={{
                    backgroundColor: '#111a30',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                  }}
                >
                  <p style={{ color: '#10b981', fontSize: '11px', margin: '0 0 4px', fontWeight: 700, letterSpacing: '1px' }}>
                    MAIN GUEST
                  </p>
                  <p style={{ color: '#fff', fontSize: '13px', margin: '0 0 4px', wordBreak: 'break-word' }}>
                    {normalizeMainName(selectedReservation)} — {selectedReservation.phone || '-'} — {selectedReservation.instagram || '-'}
                  </p>
                </div>

                {safeExtras(selectedReservation).length > 0 &&
                  safeExtras(selectedReservation).map((p, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#111a30',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '8px',
                      }}
                    >
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: '0 0 4px', wordBreak: 'break-word' }}>
                        👤 {p.name || '-'} — {p.phone || '-'} — {p.instagram || '-'}
                      </p>
                      <p
                        style={{
                          color:
                            p.ticket_type === 'backstage'
                              ? '#a855f7'
                              : p.ticket_type === 'vip'
                              ? '#fbbf24'
                              : p.ticket_type === 'single'
                              ? '#60a5fa'
                              : '#22c55e',
                          fontSize: '11px',
                          margin: 0,
                          fontWeight: 700,
                        }}
                      >
                        {(p.ticket_type || '-').toUpperCase()} {p.wave ? `· W${p.wave}` : ''}
                      </p>
                    </div>
                  ))}
              </div>

              {selectedReservation.payment_screenshot_url && (
                <div style={{ marginTop: '20px' }}>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '10px',
                      letterSpacing: '2px',
                      fontWeight: 700,
                      margin: '0 0 12px',
                    }}
                  >
                    PAYMENT SCREENSHOT
                  </p>
                  <img
                    src={selectedReservation.payment_screenshot_url}
                    alt="payment"
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}