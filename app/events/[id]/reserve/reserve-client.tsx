'use client'

import { useState, useEffect, useMemo } from 'react'
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

  single_wave_1_price?: number | null
  single_wave_1_sold_out?: boolean | null
  single_wave_2_price?: number | null
  single_wave_2_sold_out?: boolean | null
  single_wave_3_price?: number | null
  single_wave_3_sold_out?: boolean | null

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
}

type TicketType = 'single' | 'standing' | 'backstage'

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

  const wave1Available = !wave_1_sold_out && wave_1_price != null
  const wave2Available =
    wave_1_sold_out && !wave_2_sold_out && wave_2_price != null
  const wave3Available =
    wave_1_sold_out &&
    !!wave_2_sold_out &&
    !wave_3_sold_out &&
    wave_3_price != null

  let price: number | null = null
  let label = ''
  let key = ''
  let soldOut = false

  if (wave1Available) {
    price = wave_1_price as number
    label = 'WAVE 1 — EARLY BIRD'
    key = 'wave_1'
  } else if (wave2Available) {
    price = wave_2_price as number
    label = 'WAVE 2 — REGULAR PRICE'
    key = 'wave_2'
  } else if (wave3Available) {
    price = wave_3_price as number
    label = 'WAVE 3 — LAST WAVE'
    key = 'wave_3'
  } else {
    price = null
    label = 'SOLD OUT'
    key = ''
    soldOut = true
  }

  if (is_finished) {
    soldOut = true
  }

  return { price, label, key, soldOut }
}

const isValidInstagram = (value: string) => {
  if (!value.trim()) return false
  return value.startsWith('@') || value.includes('instagram.com/')
}

export default function ReserveClient({ id }: { id: string }) {
  const router = useRouter()

  const [event, setEvent] = useState<EventType | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')

  const [singleCount, setSingleCount] = useState(0)
  const [standingCount, setStandingCount] = useState(0)
  const [backstageCount, setBackstageCount] = useState(0)
  const [people, setPeople] = useState<PersonMini[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setEvent(data as EventType | null))
  }, [id])

  const single = useMemo(
    () =>
      getWaveInfo({
        wave_1_price: event?.single_wave_1_price,
        wave_1_sold_out: event?.single_wave_1_sold_out,
        wave_2_price: event?.single_wave_2_price,
        wave_2_sold_out: event?.single_wave_2_sold_out,
        wave_3_price: event?.single_wave_3_price,
        wave_3_sold_out: event?.single_wave_3_sold_out,
        is_finished: event?.is_finished ?? false,
      }),
    [event],
  )

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
    [event],
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
    [event],
  )

  const allSingleUnavailable = single.price == null || single.soldOut
  const allStandingUnavailable = standing.price == null || standing.soldOut
  const allBackstageUnavailable = backstage.price == null || backstage.soldOut

  const totalPeople = singleCount + standingCount + backstageCount

  const mainTicketType: TicketType | null =
    singleCount > 0
      ? 'single'
      : standingCount > 0
      ? 'standing'
      : backstageCount > 0
      ? 'backstage'
      : null

  const syncPeople = (
    nextSingleCount: number,
    nextStandingCount: number,
    nextBackstageCount: number,
  ) => {
    const total = nextSingleCount + nextStandingCount + nextBackstageCount
    const safeTotal = Math.max(1, Math.min(10, total || 0))
    const extrasNeeded = Math.max(0, safeTotal - 1)

    const arr = Array.from({ length: extrasNeeded }, (_, i) => {
      const existing = people[i]

      let ticket_type: TicketType
      if (i < nextSingleCount - 1) {
        ticket_type = 'single'
      } else if (i < nextSingleCount - 1 + nextStandingCount) {
        ticket_type = 'standing'
      } else {
        ticket_type = 'backstage'
      }

      return existing
        ? { ...existing, ticket_type }
        : { name: '', phone: '', instagram: '', ticket_type }
    })

    setPeople(arr)
  }

  const handleNumChange = (type: TicketType, n: number) => {
    const safe = Math.max(0, Math.min(10, n || 0))

    const nextSingleCount = type === 'single' ? safe : singleCount
    const nextStandingCount = type === 'standing' ? safe : standingCount
    const nextBackstageCount = type === 'backstage' ? safe : backstageCount

    if (type === 'single') setSingleCount(safe)
    if (type === 'standing') setStandingCount(safe)
    if (type === 'backstage') setBackstageCount(safe)

    syncPeople(nextSingleCount, nextStandingCount, nextBackstageCount)
  }

  const updatePerson = (i: number, field: keyof PersonMini, value: string) => {
    setPeople(prev =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    )
  }

  const getSubtotal = () => {
    const singleSubtotal = (single.price ?? 0) * singleCount
    const standingSubtotal = (standing.price ?? 0) * standingCount
    const backstageSubtotal = (backstage.price ?? 0) * backstageCount
    return singleSubtotal + standingSubtotal + backstageSubtotal
  }

  const getTax = () => Math.ceil(getSubtotal() * 0.08)
  const getTotal = () => getSubtotal() + getTax()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!event) {
      setError('Event not found.')
      setLoading(false)
      return
    }

    if (event.is_finished) {
      setError('This event has ended.')
      setLoading(false)
      return
    }

    if (!event.is_active) {
      setError('Bookings are not open yet.')
      setLoading(false)
      return
    }

    if (singleCount === 0 && standingCount === 0 && backstageCount === 0) {
      setError('اختر على الأقل تذكرة واحدة (Single أو Standing أو Backstage).')
      setLoading(false)
      return
    }

    if (
      (singleCount > 0 && allSingleUnavailable) ||
      (standingCount > 0 && allStandingUnavailable) ||
      (backstageCount > 0 && allBackstageUnavailable)
    ) {
      setError('الـ wave الحالي مقفول، راجع الداشبورد.')
      setLoading(false)
      return
    }

    if (!name.trim() || !phone.trim() || !email.trim() || !instagram.trim()) {
      setError('من فضلك املأ بياناتك كاملة.')
      setLoading(false)
      return
    }

    if (!isValidInstagram(instagram)) {
      setError('اكتب Instagram صحيح، مثل @username أو رابط الحساب.')
      setLoading(false)
      return
    }

    for (const person of people) {
      if (!person.name.trim() || !person.phone.trim() || !person.instagram.trim()) {
        setError('من فضلك أكمل بيانات كل الأشخاص.')
        setLoading(false)
        return
      }

      if (!isValidInstagram(person.instagram)) {
        setError('تأكد إن كل حسابات Instagram مكتوبة بشكل صحيح.')
        setLoading(false)
        return
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      router.push('/login')
      return
    }

    const subtotal = getSubtotal()
    const tax = getTax()
    const total = getTotal()

    const mainPerson =
      mainTicketType != null
        ? {
            name,
            phone,
            instagram,
            ticket_type: mainTicketType,
          }
        : null

    const peopleDetails = mainPerson ? [mainPerson, ...people] : people

    const { error: insertError } = await supabase.from('reservations').insert({
      event_id: id,
      user_id: user.id,
      name,
      phone,
      email,
      instagram,
      num_people: totalPeople,
      people_details: peopleDetails,

      single_count: singleCount,
      single_price_per_person: single.price ?? 0,
      single_wave_label: single.key,

      standing_count: standingCount,
      standing_price_per_person: standing.price ?? 0,
      standing_wave_label: standing.key,

      backstage_count: backstageCount,
      backstage_price_per_person: backstage.price ?? 0,
      backstage_wave_label: backstage.key,

      subtotal_price: subtotal,
      tax_amount: tax,
      total_price: total,
      status: 'pending',
    })

    if (insertError) {
      console.error(insertError)
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/reservation-success')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: '#444',
    fontSize: '10px',
    letterSpacing: '2px',
    fontWeight: 700,
    display: 'block',
    marginBottom: '8px',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #151515',
    borderRadius: '18px',
    padding: '20px',
  }

  const waveBadgeBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '2px',
  }

  const renderWaveBadge = (key: string, label: string) => {
    if (!key || !label || label === 'SOLD OUT') return null

    const bg =
      key === 'wave_1'
        ? 'rgba(34,197,94,0.1)'
        : key === 'wave_2'
        ? 'rgba(234,179,8,0.1)'
        : 'rgba(59,130,246,0.1)'

    const border =
      key === 'wave_1'
        ? 'rgba(34,197,94,0.4)'
        : key === 'wave_2'
        ? 'rgba(234,179,8,0.4)'
        : 'rgba(59,130,246,0.4)'

    const color =
      key === 'wave_1'
        ? '#22c55e'
        : key === 'wave_2'
        ? '#eab308'
        : '#3b82f6'

    return (
      <span
        style={{
          ...waveBadgeBase,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color,
        }}
      >
        {label}
      </span>
    )
  }

  const allSoldOut =
    (allSingleUnavailable && allStandingUnavailable && allBackstageUnavailable) ||
    !!event?.is_finished

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        padding: '60px 24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '1px',
            }}
          >
            TicketHub
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'transparent',
              color: '#888',
              border: '1px solid #222',
              padding: '10px 14px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            رجوع
          </button>
        </div>

        {!event ? (
          <div
            style={{
              ...cardStyle,
              textAlign: 'center',
              color: '#888',
              padding: '40px 20px',
            }}
          >
            جاري تحميل بيانات الإيفنت...
          </div>
        ) : (
          <>
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <h1
                    style={{
                      color: '#fff',
                      margin: '0 0 10px',
                      fontSize: '30px',
                      fontWeight: 800,
                    }}
                  >
                    {event.title}
                  </h1>

                  <p style={{ color: '#888', margin: '0 0 6px', fontSize: '14px' }}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>

                  <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                    {event.location}
                  </p>
                </div>

                <div
                  style={{
                    minWidth: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ color: '#e5e5e5', fontSize: '14px' }}>
                    Single:{' '}
                    {single.price != null && !single.soldOut ? `${single.price} EGP` : 'SOLD OUT'}
                  </div>
                  <div style={{ color: '#e5e5e5', fontSize: '14px' }}>
                    Standing:{' '}
                    {standing.price != null && !standing.soldOut ? `${standing.price} EGP` : 'SOLD OUT'}
                  </div>
                  <div style={{ color: '#e5e5e5', fontSize: '14px' }}>
                    Backstage:{' '}
                    {backstage.price != null && !backstage.soldOut ? `${backstage.price} EGP` : 'SOLD OUT'}
                  </div>
                </div>
              </div>
            </div>

            {allSoldOut && (
              <div
                style={{
                  ...cardStyle,
                  marginBottom: '20px',
                  border: '1px solid rgba(239,68,68,0.3)',
                  backgroundColor: 'rgba(127,29,29,0.15)',
                  color: '#fca5a5',
                  textAlign: 'center',
                }}
              >
                {event.is_finished
                  ? 'الإيفنت ده انتهى بالفعل.'
                  : 'كل التذاكر المتاحة حاليًا خلصت.'}
              </div>
            )}

            {!allSoldOut && (
              <form onSubmit={handleSubmit}>
                <div style={{ ...cardStyle, marginBottom: '20px' }}>
                  <h2
                    style={{
                      color: '#fff',
                      margin: '0 0 18px',
                      fontSize: '20px',
                      fontWeight: 800,
                    }}
                  >
                    اختر التذاكر
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid #1c1c1c',
                        borderRadius: '14px',
                        padding: '16px',
                        backgroundColor: '#080808',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ color: '#60a5fa', fontWeight: 700 }}>Single</span>
                        {renderWaveBadge(single.key, single.label)}
                      </div>
                      <p style={{ color: '#777', fontSize: '13px', margin: '0 0 12px' }}>
                        {single.price != null && !single.soldOut
                          ? `${single.price} EGP`
                          : 'غير متاح حاليًا'}
                      </p>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={singleCount}
                        disabled={allSingleUnavailable}
                        onChange={e =>
                          handleNumChange('single', parseInt(e.target.value) || 0)
                        }
                        style={{
                          ...inputStyle,
                          opacity: allSingleUnavailable ? 0.5 : 1,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        border: '1px solid #1c1c1c',
                        borderRadius: '14px',
                        padding: '16px',
                        backgroundColor: '#080808',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ color: '#22c55e', fontWeight: 700 }}>Standing</span>
                        {renderWaveBadge(standing.key, standing.label)}
                      </div>
                      <p style={{ color: '#777', fontSize: '13px', margin: '0 0 12px' }}>
                        {standing.price != null && !standing.soldOut
                          ? `${standing.price} EGP`
                          : 'غير متاح حاليًا'}
                      </p>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={standingCount}
                        disabled={allStandingUnavailable}
                        onChange={e =>
                          handleNumChange('standing', parseInt(e.target.value) || 0)
                        }
                        style={{
                          ...inputStyle,
                          opacity: allStandingUnavailable ? 0.5 : 1,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        border: '1px solid #1c1c1c',
                        borderRadius: '14px',
                        padding: '16px',
                        backgroundColor: '#080808',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ color: '#a855f7', fontWeight: 700 }}>Backstage</span>
                        {renderWaveBadge(backstage.key, backstage.label)}
                      </div>
                      <p style={{ color: '#777', fontSize: '13px', margin: '0 0 12px' }}>
                        {backstage.price != null && !backstage.soldOut
                          ? `${backstage.price} EGP`
                          : 'غير متاح حاليًا'}
                      </p>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={backstageCount}
                        disabled={allBackstageUnavailable}
                        onChange={e =>
                          handleNumChange('backstage', parseInt(e.target.value) || 0)
                        }
                        style={{
                          ...inputStyle,
                          opacity: allBackstageUnavailable ? 0.5 : 1,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {totalPeople > 0 && (
                  <>
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                      <h2
                        style={{
                          color: '#fff',
                          margin: '0 0 18px',
                          fontSize: '20px',
                          fontWeight: 800,
                        }}
                      >
                        بياناتك
                      </h2>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '16px',
                        }}
                      >
                        <div>
                          <label style={labelStyle}>FULL NAME</label>
                          <input
                            style={inputStyle}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="اسمك الكامل"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>PHONE</label>
                          <input
                            style={inputStyle}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="رقم الموبايل"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>EMAIL</label>
                          <input
                            type="email"
                            style={inputStyle}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="البريد الإلكتروني"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>INSTAGRAM</label>
                          <input
                            style={inputStyle}
                            value={instagram}
                            onChange={e => setInstagram(e.target.value)}
                            placeholder="@username أو رابط الحساب"
                          />
                        </div>
                      </div>
                    </div>

                    {people.map((person, i) => (
                      <div key={i} style={{ ...cardStyle, marginBottom: '20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <h3
                            style={{
                              color: '#fff',
                              margin: 0,
                              fontSize: '18px',
                              fontWeight: 700,
                            }}
                          >
                            الشخص {i + 2}
                          </h3>

                          <span
                            style={{
                              ...waveBadgeBase,
                              color:
                                person.ticket_type === 'single'
                                  ? '#60a5fa'
                                  : person.ticket_type === 'standing'
                                  ? '#22c55e'
                                  : '#a855f7',
                              border:
                                person.ticket_type === 'single'
                                  ? '1px solid rgba(96,165,250,0.35)'
                                  : person.ticket_type === 'standing'
                                  ? '1px solid rgba(34,197,94,0.35)'
                                  : '1px solid rgba(168,85,247,0.35)',
                              backgroundColor:
                                person.ticket_type === 'single'
                                  ? 'rgba(96,165,250,0.1)'
                                  : person.ticket_type === 'standing'
                                  ? 'rgba(34,197,94,0.1)'
                                  : 'rgba(168,85,247,0.1)',
                            }}
                          >
                            {person.ticket_type.toUpperCase()}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                          }}
                        >
                          <div>
                            <label style={labelStyle}>FULL NAME</label>
                            <input
                              style={inputStyle}
                              value={person.name}
                              onChange={e => updatePerson(i, 'name', e.target.value)}
                              placeholder="الاسم الكامل"
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>PHONE</label>
                            <input
                              style={inputStyle}
                              value={person.phone}
                              onChange={e => updatePerson(i, 'phone', e.target.value)}
                              placeholder="رقم الموبايل"
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>INSTAGRAM</label>
                            <input
                              style={inputStyle}
                              value={person.instagram}
                              onChange={e =>
                                updatePerson(i, 'instagram', e.target.value)
                              }
                              placeholder="@username أو رابط الحساب"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                      <h2
                        style={{
                          color: '#fff',
                          margin: '0 0 18px',
                          fontSize: '20px',
                          fontWeight: 800,
                        }}
                      >
                        ملخص الحجز
                      </h2>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {singleCount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#ddd' }}>
                            <span>Single ({singleCount} × {single.price ?? 0})</span>
                            <span>{(single.price ?? 0) * singleCount} EGP</span>
                          </div>
                        )}

                        {standingCount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#ddd' }}>
                            <span>Standing ({standingCount} × {standing.price ?? 0})</span>
                            <span>{(standing.price ?? 0) * standingCount} EGP</span>
                          </div>
                        )}

                        {backstageCount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#ddd' }}>
                            <span>Backstage ({backstageCount} × {backstage.price ?? 0})</span>
                            <span>{(backstage.price ?? 0) * backstageCount} EGP</span>
                          </div>
                        )}

                        <div
                          style={{
                            height: '1px',
                            backgroundColor: '#1f1f1f',
                            margin: '8px 0',
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                          <span>Subtotal</span>
                          <span>{getSubtotal()} EGP</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                          <span>Tax (8%)</span>
                          <span>{getTax()} EGP</span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#fff',
                            fontSize: '20px',
                            fontWeight: 800,
                            marginTop: '6px',
                          }}
                        >
                          <span>Total</span>
                          <span>{getTotal()} EGP</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div
                    style={{
                      marginBottom: '18px',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(127,29,29,0.2)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#fca5a5',
                      fontSize: '14px',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totalPeople <= 0 || getSubtotal() <= 0}
                  style={{
                    width: '100%',
                    backgroundColor:
                      loading || totalPeople <= 0 || getSubtotal() <= 0
                        ? '#111'
                        : '#fff',
                    color:
                      loading || totalPeople <= 0 || getSubtotal() <= 0
                        ? '#666'
                        : '#000',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor:
                      loading || totalPeople <= 0 || getSubtotal() <= 0
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {loading ? 'جاري إرسال الحجز...' : 'تأكيد الحجز'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}