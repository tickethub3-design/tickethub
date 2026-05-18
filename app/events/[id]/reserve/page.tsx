'use client'

import { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type EventType = {
  id: string
  title: string
  date: string
  location: string
  location_url?: string
  description?: string
  image_url?: string
  is_active: boolean
  is_finished: boolean
  standing_wave_1_price?: number | null
  standing_wave_1_sold_out?: boolean | null
  standing_wave_2_price?: number | null
  standing_wave_2_sold_out?: boolean | null
  standing_wave_3_price?: number | null
  standing_wave_3_sold_out?: boolean | null
  backstage_wave_1_price?: number | null
  backstage_wave_1_sold_out?: boolean | null
  backstage_wave_2_price?: number | null
  backstage_wave_2_sold_out?: boolean | null
  backstage_wave_3_price?: number | null
  backstage_wave_3_sold_out?: boolean | null
  vip_wave_1_price?: number | null
  vip_wave_1_sold_out?: boolean | null
  vip_wave_2_price?: number | null
  vip_wave_2_sold_out?: boolean | null
  vip_wave_3_price?: number | null
  vip_wave_3_sold_out?: boolean | null
}

type TicketType = 'standing' | 'backstage' | 'vip'

type PersonMini = {
  name: string
  phone: string
  instagram: string
  ticket_type: TicketType
}

function getWaveInfo(opts: {
  wave_1_price?: number | null
  wave_1_sold_out?: boolean | null
  wave_2_price?: number | null
  wave_2_sold_out?: boolean | null
  wave_3_price?: number | null
  wave_3_sold_out?: boolean | null
  is_finished: boolean
}) {
  const {
    wave_1_price,
    wave_1_sold_out,
    wave_2_price,
    wave_2_sold_out,
    wave_3_price,
    wave_3_sold_out,
    is_finished,
  } = opts

  let price: number | null = null
  let label = ''
  let key = ''
  let soldOut = false

  if (!wave_1_sold_out && wave_1_price != null) {
    price = wave_1_price
    label = 'WAVE 1 — EARLY BIRD'
    key = 'wave_1'
  } else if (wave_1_sold_out && !wave_2_sold_out && wave_2_price != null) {
    price = wave_2_price
    label = 'WAVE 2 — REGULAR'
    key = 'wave_2'
  } else if (wave_1_sold_out && wave_2_sold_out && !wave_3_sold_out && wave_3_price != null) {
    price = wave_3_price
    label = 'WAVE 3 — LAST WAVE'
    key = 'wave_3'
  } else {
    price = null
    label = 'SOLD OUT'
    key = ''
    soldOut = true
  }

  if (is_finished) soldOut = true
  return { price, label, key, soldOut }
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

const ticketTypeStyle: Record<TicketType, { color: string; label: string }> = {
  standing: { color: '#27AE60', label: 'STANDING' },
  backstage: { color: '#8b5cf6', label: 'BACKSTAGE' },
  vip: { color: '#F0A500', label: 'VIP' },
}

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [event, setEvent] = useState<EventType | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')

  const [standingCount, setStandingCount] = useState(0)
  const [backstageCount, setBackstageCount] = useState(0)
  const [vipCount, setVipCount] = useState(0)
  const [people, setPeople] = useState<PersonMini[]>([])

  const [standingOpen, setStandingOpen] = useState(false)
  const [backstageOpen, setBackstageOpen] = useState(false)
  const [vipOpen, setVipOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('slug', id)
      .single()
      .then(({ data }) => setEvent(data as EventType | null))
  }, [id])

  const standing = useMemo(
    () =>
      getWaveInfo({
        wave_1_price: event?.standing_wave_1_price,
        wave_1_sold_out: event?.standing_wave_1_sold_out,
        wave_2_price: event?.standing_wave_2_price,
        wave_2_sold_out: event?.standing_wave_2_sold_out,
        wave_3_price: event?.standing_wave_3_price,
        wave_3_sold_out: event?.standing_wave_3_sold_out,
        is_finished: event?.is_finished ?? false,
      }),
    [event]
  )

  const backstage = useMemo(
    () =>
      getWaveInfo({
        wave_1_price: event?.backstage_wave_1_price,
        wave_1_sold_out: event?.backstage_wave_1_sold_out,
        wave_2_price: event?.backstage_wave_2_price,
        wave_2_sold_out: event?.backstage_wave_2_sold_out,
        wave_3_price: event?.backstage_wave_3_price,
        wave_3_sold_out: event?.backstage_wave_3_sold_out,
        is_finished: event?.is_finished ?? false,
      }),
    [event]
  )

  const vip = useMemo(
    () =>
      getWaveInfo({
        wave_1_price: event?.vip_wave_1_price,
        wave_1_sold_out: event?.vip_wave_1_sold_out,
        wave_2_price: event?.vip_wave_2_price,
        wave_2_sold_out: event?.vip_wave_2_sold_out,
        wave_3_price: event?.vip_wave_3_price,
        wave_3_sold_out: event?.vip_wave_3_sold_out,
        is_finished: event?.is_finished ?? false,
      }),
    [event]
  )

  const hasStanding =
    event?.standing_wave_1_price != null ||
    event?.standing_wave_2_price != null ||
    event?.standing_wave_3_price != null

  const hasBackstage =
    event?.backstage_wave_1_price != null ||
    event?.backstage_wave_2_price != null ||
    event?.backstage_wave_3_price != null

  const hasVip =
    event?.vip_wave_1_price != null ||
    event?.vip_wave_2_price != null ||
    event?.vip_wave_3_price != null

  const allStandingUnavailable = !hasStanding || standing.price == null || standing.soldOut
  const allBackstageUnavailable = !hasBackstage || backstage.price == null || backstage.soldOut
  const allVipUnavailable = !hasVip || vip.price == null || vip.soldOut

  const totalPeople = standingCount + backstageCount + vipCount

  const mainTicketType: TicketType | null =
    standingCount > 0 ? 'standing' : backstageCount > 0 ? 'backstage' : vipCount > 0 ? 'vip' : null

  const syncPeople = (sc: number, bc: number, vc: number) => {
    const total = sc + bc + vc
    const extrasNeeded = Math.max(0, total - 1)
    const arr: PersonMini[] = []

    for (let i = 0; i < extrasNeeded; i++) {
      const old = people[i]
      let ticket_type: TicketType

      if (i < sc - 1) ticket_type = 'standing'
      else if (i < sc - 1 + bc) ticket_type = 'backstage'
      else ticket_type = 'vip'

      arr.push(old ? { ...old, ticket_type } : { name: '', phone: '', instagram: '', ticket_type })
    }

    setPeople(arr)
  }

  const handleNumChange = (type: TicketType, n: number) => {
    const safe = Math.max(0, Math.min(10, n || 0))
    const sc = type === 'standing' ? safe : standingCount
    const bc = type === 'backstage' ? safe : backstageCount
    const vc = type === 'vip' ? safe : vipCount

    if (type === 'standing') setStandingCount(safe)
    if (type === 'backstage') setBackstageCount(safe)
    if (type === 'vip') setVipCount(safe)

    syncPeople(sc, bc, vc)
  }

  const updatePerson = (i: number, field: keyof PersonMini, value: string) =>
    setPeople(prev => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))

  const getSubtotal = () =>
    (standing.price ?? 0) * standingCount +
    (backstage.price ?? 0) * backstageCount +
    (vip.price ?? 0) * vipCount

  const getTax = () => Math.round(getSubtotal() * 0.08)
  const getTotal = () => getSubtotal() + getTax()

  const allSoldOut =
    (!hasStanding || standing.soldOut || standing.price == null) &&
    (!hasBackstage || backstage.soldOut || backstage.price == null) &&
    (!hasVip || vip.soldOut || vip.price == null)

  const resetForm = () => {
    setStandingCount(0)
    setBackstageCount(0)
    setVipCount(0)
    setPeople([])
    setName('')
    setPhone('')
    setEmail('')
    setInstagram('')
    setStandingOpen(false)
    setBackstageOpen(false)
    setVipOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!event) {
      setError('Event not found.')
      return
    }

    if (event.is_finished) {
      setError('This event has ended.')
      return
    }

    if (!event.is_active) {
      setError('Bookings are not open yet.')
      return
    }

    if (totalPeople === 0) {
      setError('Please select at least one ticket.')
      return
    }

    if (!mainTicketType) {
      setError('Please choose a ticket type first.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?redirect=/events/${id}/reserve`)
      return
    }

    if (!name || !phone || !email || !instagram) {
      setError('Please complete the main guest details.')
      return
    }

    if (!isValidInstagramUrl(instagram)) {
      setError('Please enter a valid Instagram URL for the main guest.')
      return
    }

    for (const p of people) {
      if (!p.name || !p.phone || !p.instagram) {
        setError('Please complete all guest details.')
        return
      }
      if (!isValidInstagramUrl(p.instagram)) {
        setError('Please enter a valid Instagram URL for all guests.')
        return
      }
    }

    setLoading(true)

    const mainPerson: PersonMini = {
      name,
      phone,
      instagram,
      ticket_type: mainTicketType,
    }

    const peopleDetails = [mainPerson, ...people]

    const { error: insertError } = await supabase.from('reservations').insert({
      event_id: event.id,
      user_id: user.id,
      full_name: name,
      phone,
      email,
      quantity: totalPeople,
      subtotal: getSubtotal(),
      fee: getTax(),
      total: getTotal(),
      status: 'pending',
      instagram,
      name,
      num_people: totalPeople,
      people_details: peopleDetails,
      standing_count: standingCount,
      standing_price_per_person: standing.price ?? 0,
      standing_wave_label: standing.key,
      backstage_count: backstageCount,
      backstage_price_per_person: backstage.price ?? 0,
      backstage_wave_label: backstage.key,
      vip_count: vipCount,
      vip_price_per_person: vip.price ?? 0,
      vip_wave_label: vip.key,
      subtotal_price: getSubtotal(),
      tax_amount: getTax(),
      total_price: getTotal(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    resetForm()
    setRedirecting(true)
    setSuccessMsg(
      'Your booking request has been submitted successfully. You will be redirected to your profile to complete the next steps, follow the payment instructions, and receive your QR ticket after confirmation.'
    )

    setTimeout(() => {
      router.push('/profile')
    }, 2500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '15px 16px',
    color: '#fff',
    fontSize: 15,
    lineHeight: 1.4,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: '1.5px',
    fontWeight: 700,
    display: 'block',
    marginBottom: 8,
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
  }

  const TicketDropdown = ({
    value,
    onChange,
    disabled,
    isOpen,
    setIsOpen,
    color = '#2E75B6',
  }: {
    value: number
    onChange: (n: number) => void
    disabled?: boolean
    isOpen: boolean
    setIsOpen: (v: boolean) => void
    color?: string
  }) => (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: disabled ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 14,
          padding: '15px 16px',
          color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
          fontSize: 15,
          fontFamily: 'Inter, sans-serif',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          minHeight: 52,
        }}
      >
        <span>{disabled ? 'Unavailable' : `${value} ticket${value !== 1 ? 's' : ''}`}</span>
        {!disabled && <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{isOpen ? '▲' : '▼'}</span>}
      </button>

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'rgba(13,18,32,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            overflow: 'hidden',
            zIndex: 50,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(i)
                setIsOpen(false)
              }}
              style={{
                padding: '13px 16px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                color: value === i ? '#fff' : 'rgba(255,255,255,0.72)',
                background: value === i ? `${color}22` : 'transparent',
                borderBottom: i < 10 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {i === 0 ? 'No tickets' : `${i} ticket${i !== 1 ? 's' : ''}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const ticketColumns = [hasStanding, hasBackstage, hasVip].filter(Boolean).length

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #09101d 0%, #0a0f1e 35%, #0b1120 100%)',
        padding: '0 0 80px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 0%, rgba(46,117,182,0.09) 0%, transparent 55%)',
        }}
      />

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,15,30,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              boxShadow: '0 10px 24px rgba(46,117,182,0.28)',
            }}
          >
            🎟️
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Ticket<span style={{ color: '#60a5fa' }}>Hub</span>
          </span>
        </Link>

        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '1.8px' }}>
          SECURE BOOKING
        </span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 18px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, letterSpacing: '2px', margin: '0 0 8px' }}>
            RESERVATION
          </p>
          <h1
            style={{
              color: '#fff',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(28px, 6vw, 40px)',
              lineHeight: 1.1,
              margin: '0 0 10px',
              letterSpacing: '-1px',
            }}
          >
            Book your spot clearly and confidently
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.68)',
              fontSize: 15,
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 560,
            }}
          >
            Choose your ticket type, add guest details, review your total, then submit your booking request.
          </p>
        </div>

        {event && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <p
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 800,
                    margin: '0 0 8px',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  {event.title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.66)', fontSize: 14, margin: '0 0 4px', lineHeight: 1.6 }}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.66)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {event.location}
                </p>
              </div>

              <div style={{ minWidth: 180 }}>
                {hasStanding && !standing.soldOut && standing.price != null && (
                  <div style={{ color: '#4ade80', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    Standing · {standing.price} EGP
                  </div>
                )}
                {hasBackstage && !backstage.soldOut && backstage.price != null && (
                  <div style={{ color: '#a78bfa', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    Backstage · {backstage.price} EGP
                  </div>
                )}
                {hasVip && !vip.soldOut && vip.price != null && (
                  <div style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>
                    VIP · {vip.price} EGP
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {event && allSoldOut && (
          <div
            style={{
              background: 'rgba(231,76,60,0.06)',
              border: '1px solid rgba(231,76,60,0.22)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 34, margin: '0 0 10px' }}>❌</p>
            <p style={{ color: '#ff7b72', fontSize: 14, letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 8px' }}>
              {event.is_finished ? 'THIS EVENT HAS ENDED' : 'ALL TICKETS ARE SOLD OUT'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              There are no available tickets for this event right now.
            </p>
          </div>
        )}

        {successMsg ? (
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(39,174,96,0.10), rgba(39,174,96,0.04))',
              border: '1px solid rgba(39,174,96,0.28)',
              borderRadius: 22,
              padding: 28,
              boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'rgba(39,174,96,0.16)',
                border: '1px solid rgba(39,174,96,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              ✅
            </div>

            <h2
              style={{
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                margin: '0 0 10px',
                lineHeight: 1.25,
              }}
            >
              Booking submitted successfully
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.8, margin: '0 0 14px' }}>
              {successMsg}
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '14px 16px',
              }}
            >
              <p style={{ color: '#86efac', fontSize: 13, fontWeight: 700, margin: '0 0 6px', letterSpacing: '1px' }}>
                NEXT STEP
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                You are being redirected to your profile now.
                {redirecting ? ' Please wait a moment...' : ''}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={sectionStyle}>
              <p style={{ color: '#93c5fd', fontSize: 12, letterSpacing: '2px', fontWeight: 700, margin: '0 0 18px' }}>
                STEP 1 · SELECT TICKETS
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: ticketColumns > 1 ? `repeat(${ticketColumns}, 1fr)` : '1fr',
                  gap: 14,
                }}
              >
                {hasStanding && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(39,174,96,0.16)',
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <label style={{ ...labelStyle, color: '#4ade80', marginBottom: 10 }}>
                      STANDING{standing.soldOut ? ' — SOLD OUT' : ` — ${standing.price} EGP`}
                    </label>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                      Standard event access.
                    </p>
                    <TicketDropdown
                      value={standingCount}
                      disabled={allStandingUnavailable}
                      isOpen={standingOpen}
                      color="#27AE60"
                      setIsOpen={v => {
                        setStandingOpen(v)
                        if (v) {
                          setBackstageOpen(false)
                          setVipOpen(false)
                        }
                      }}
                      onChange={n => handleNumChange('standing', n)}
                    />
                  </div>
                )}

                {hasBackstage && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(139,92,246,0.16)',
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <label style={{ ...labelStyle, color: '#a78bfa', marginBottom: 10 }}>
                      BACKSTAGE{backstage.soldOut ? ' — SOLD OUT' : ` — ${backstage.price} EGP`}
                    </label>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                      Extended access and premium area entry.
                    </p>
                    <TicketDropdown
                      value={backstageCount}
                      disabled={allBackstageUnavailable}
                      isOpen={backstageOpen}
                      color="#8b5cf6"
                      setIsOpen={v => {
                        setBackstageOpen(v)
                        if (v) {
                          setStandingOpen(false)
                          setVipOpen(false)
                        }
                      }}
                      onChange={n => handleNumChange('backstage', n)}
                    />
                  </div>
                )}

                {hasVip && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(240,165,0,0.16)',
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <label style={{ ...labelStyle, color: '#fbbf24', marginBottom: 10 }}>
                      VIP{vip.soldOut ? ' — SOLD OUT' : ` — ${vip.price} EGP`}
                    </label>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                      Priority access and premium booking tier.
                    </p>
                    <TicketDropdown
                      value={vipCount}
                      disabled={allVipUnavailable}
                      isOpen={vipOpen}
                      color="#F0A500"
                      setIsOpen={v => {
                        setVipOpen(v)
                        if (v) {
                          setStandingOpen(false)
                          setBackstageOpen(false)
                        }
                      }}
                      onChange={n => handleNumChange('vip', n)}
                    />
                  </div>
                )}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, marginTop: 14, lineHeight: 1.7 }}>
                Select the number of tickets you need. Guest fields will appear automatically after selection.
              </p>
            </div>

            {totalPeople > 0 && (
              <>
                <div style={sectionStyle}>
                  <p style={{ color: '#93c5fd', fontSize: 12, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>
                    STEP 2 · MAIN GUEST
                  </p>

                  <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14, lineHeight: 1.75, margin: '0 0 16px' }}>
                    Enter the primary guest details exactly as they should appear on the booking.
                  </p>

                  {mainTicketType && (
                    <div
                      style={{
                        display: 'inline-block',
                        marginBottom: 18,
                        background: `${ticketTypeStyle[mainTicketType].color}14`,
                        border: `1px solid ${ticketTypeStyle[mainTicketType].color}28`,
                        borderRadius: 999,
                        padding: '6px 14px',
                      }}
                    >
                      <span style={{ color: ticketTypeStyle[mainTicketType].color, fontSize: 12, fontWeight: 700 }}>
                        {ticketTypeStyle[mainTicketType].label}
                      </span>
                    </div>
                  )}

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>FULL NAME</label>
                    <input style={inputStyle} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>PHONE NUMBER</label>
                    <input style={inputStyle} placeholder="01XXXXXXXXX" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>EMAIL ADDRESS</label>
                    <input style={inputStyle} placeholder="your@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <label style={labelStyle}>INSTAGRAM URL</label>
                    <input
                      style={inputStyle}
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                    />
                  </div>
                </div>

                {people.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      ...sectionStyle,
                      border: `1px solid ${ticketTypeStyle[p.ticket_type].color}18`,
                    }}
                  >
                    <p style={{ color: '#93c5fd', fontSize: 12, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>
                      GUEST {i + 2}
                    </p>

                    <div
                      style={{
                        display: 'inline-block',
                        marginBottom: 18,
                        background: `${ticketTypeStyle[p.ticket_type].color}14`,
                        border: `1px solid ${ticketTypeStyle[p.ticket_type].color}28`,
                        borderRadius: 999,
                        padding: '6px 14px',
                      }}
                    >
                      <span style={{ color: ticketTypeStyle[p.ticket_type].color, fontSize: 12, fontWeight: 700 }}>
                        {ticketTypeStyle[p.ticket_type].label}
                      </span>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>FULL NAME</label>
                      <input style={inputStyle} placeholder="Guest full name" value={p.name} onChange={e => updatePerson(i, 'name', e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>PHONE NUMBER</label>
                      <input style={inputStyle} placeholder="01XXXXXXXXX" type="tel" value={p.phone} onChange={e => updatePerson(i, 'phone', e.target.value)} />
                    </div>

                    <div>
                      <label style={labelStyle}>INSTAGRAM URL</label>
                      <input
                        style={inputStyle}
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={p.instagram}
                        onChange={e => updatePerson(i, 'instagram', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!allSoldOut && event && totalPeople > 0 && (
              <div style={sectionStyle}>
                <p style={{ color: '#93c5fd', fontSize: 12, letterSpacing: '2px', fontWeight: 700, margin: '0 0 16px' }}>
                  BOOKING SUMMARY
                </p>

                {standingCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                    <span style={{ color: '#4ade80', fontSize: 14 }}>Standing ({standingCount}x)</span>
                    <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{(standing.price ?? 0) * standingCount} EGP</span>
                  </div>
                )}

                {backstageCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                    <span style={{ color: '#a78bfa', fontSize: 14 }}>Backstage ({backstageCount}x)</span>
                    <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{(backstage.price ?? 0) * backstageCount} EGP</span>
                  </div>
                )}

                {vipCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                    <span style={{ color: '#fbbf24', fontSize: 14 }}>VIP ({vipCount}x)</span>
                    <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{(vip.price ?? 0) * vipCount} EGP</span>
                  </div>
                )}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.56)', fontSize: 14 }}>Subtotal</span>
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{getSubtotal()} EGP</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.56)', fontSize: 14 }}>Tax (8%)</span>
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{getTax()} EGP</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '14px 16px',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 13, letterSpacing: '1.5px', fontWeight: 700 }}>TOTAL</span>
                  <span style={{ color: '#60a5fa', fontSize: 26, fontWeight: 900, fontFamily: 'Poppins, sans-serif' }}>
                    {getTotal()} EGP
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'rgba(231,76,60,0.08)',
                  border: '1px solid rgba(231,76,60,0.22)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  color: '#ff7b72',
                  fontSize: 14,
                  marginBottom: 14,
                  lineHeight: 1.7,
                }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0}
              style={{
                width: '100%',
                background:
                  loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color:
                  loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                    ? 'rgba(255,255,255,0.28)'
                    : '#fff',
                border: 'none',
                padding: '18px',
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: '1.6px',
                cursor:
                  loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                    ? 'not-allowed'
                    : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow:
                  loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                    ? 'none'
                    : '0 12px 30px rgba(46,117,182,0.28)',
              }}
            >
              {loading ? 'Submitting booking...' : allSoldOut || totalPeople === 0 ? 'UNAVAILABLE' : 'Submit Booking →'}
            </button>

            <p
              style={{
                color: 'rgba(255,255,255,0.48)',
                fontSize: 13,
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 1.75,
                padding: '0 8px',
              }}
            >
              After submission, you will be redirected to your profile to continue the booking steps and complete payment.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}