'use client'
import { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type EventType = {
  id: string; title: string; date: string; location: string
  location_url?: string; description?: string; image_url?: string
  is_active: boolean; is_finished: boolean
  standing_wave_1_price?: number | null;  standing_wave_1_sold_out?: boolean | null
  standing_wave_2_price?: number | null;  standing_wave_2_sold_out?: boolean | null
  standing_wave_3_price?: number | null;  standing_wave_3_sold_out?: boolean | null
  backstage_wave_1_price?: number | null; backstage_wave_1_sold_out?: boolean | null
  backstage_wave_2_price?: number | null; backstage_wave_2_sold_out?: boolean | null
  backstage_wave_3_price?: number | null; backstage_wave_3_sold_out?: boolean | null
  vip_wave_1_price?: number | null;       vip_wave_1_sold_out?: boolean | null
  vip_wave_2_price?: number | null;       vip_wave_2_sold_out?: boolean | null
  vip_wave_3_price?: number | null;       vip_wave_3_sold_out?: boolean | null
}

type TicketType = 'standing' | 'backstage' | 'vip'

type PersonMini = {
  name: string; phone: string; instagram: string; ticket_type: TicketType
}

function getWaveInfo(opts: {
  wave_1_price?: number | null; wave_1_sold_out?: boolean | null
  wave_2_price?: number | null; wave_2_sold_out?: boolean | null
  wave_3_price?: number | null; wave_3_sold_out?: boolean | null
  is_finished: boolean
}) {
  const { wave_1_price, wave_1_sold_out, wave_2_price, wave_2_sold_out, wave_3_price, wave_3_sold_out, is_finished } = opts
  let price: number | null = null, label = '', key = '', soldOut = false

  if (!wave_1_sold_out && wave_1_price != null) {
    price = wave_1_price; label = 'WAVE 1 — EARLY BIRD'; key = 'wave_1'
  } else if (wave_1_sold_out && !wave_2_sold_out && wave_2_price != null) {
    price = wave_2_price; label = 'WAVE 2 — REGULAR'; key = 'wave_2'
  } else if (wave_1_sold_out && wave_2_sold_out && !wave_3_sold_out && wave_3_price != null) {
    price = wave_3_price; label = 'WAVE 3 — LAST WAVE'; key = 'wave_3'
  } else {
    price = null; label = 'SOLD OUT'; key = ''; soldOut = true
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
  } catch { return false }
}

const ticketTypeStyle: Record<TicketType, { color: string; label: string }> = {
  standing:  { color: '#27AE60', label: 'STANDING'  },
  backstage: { color: '#8b5cf6', label: 'BACKSTAGE' },
  vip:       { color: '#F0A500', label: 'VIP'    },
}

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [event, setEvent] = useState<EventType | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')

  const [standingCount,  setStandingCount]  = useState(0)
  const [backstageCount, setBackstageCount] = useState(0)
  const [vipCount,       setVipCount]       = useState(0)
  const [people, setPeople] = useState<PersonMini[]>([])

  const [standingOpen,  setStandingOpen]  = useState(false)
  const [backstageOpen, setBackstageOpen] = useState(false)
  const [vipOpen,       setVipOpen]       = useState(false)

  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    supabase.from('events').select('*').eq('slug', id).single()
      .then(({ data }) => setEvent(data as EventType | null))
  }, [id])

  const standing = useMemo(() => getWaveInfo({
    wave_1_price: event?.standing_wave_1_price, wave_1_sold_out: event?.standing_wave_1_sold_out,
    wave_2_price: event?.standing_wave_2_price, wave_2_sold_out: event?.standing_wave_2_sold_out,
    wave_3_price: event?.standing_wave_3_price, wave_3_sold_out: event?.standing_wave_3_sold_out,
    is_finished: event?.is_finished ?? false,
  }), [event])

  const backstage = useMemo(() => getWaveInfo({
    wave_1_price: event?.backstage_wave_1_price, wave_1_sold_out: event?.backstage_wave_1_sold_out,
    wave_2_price: event?.backstage_wave_2_price, wave_2_sold_out: event?.backstage_wave_2_sold_out,
    wave_3_price: event?.backstage_wave_3_price, wave_3_sold_out: event?.backstage_wave_3_sold_out,
    is_finished: event?.is_finished ?? false,
  }), [event])

  const vip = useMemo(() => getWaveInfo({
    wave_1_price: event?.vip_wave_1_price, wave_1_sold_out: event?.vip_wave_1_sold_out,
    wave_2_price: event?.vip_wave_2_price, wave_2_sold_out: event?.vip_wave_2_sold_out,
    wave_3_price: event?.vip_wave_3_price, wave_3_sold_out: event?.vip_wave_3_sold_out,
    is_finished: event?.is_finished ?? false,
  }), [event])

  const allStandingUnavailable  = standing.price  == null || standing.soldOut
  const allBackstageUnavailable = backstage.price == null || backstage.soldOut
  const allVipUnavailable       = vip.price       == null || vip.soldOut

  const hasVip = event?.vip_wave_1_price != null || event?.vip_wave_2_price != null || event?.vip_wave_3_price != null

  const totalPeople = standingCount + backstageCount + vipCount

  const mainTicketType: TicketType | null =
    standingCount  > 0 ? 'standing'  :
    backstageCount > 0 ? 'backstage' :
    vipCount       > 0 ? 'vip'       : null

  const syncPeople = (sc: number, bc: number, vc: number) => {
    const total = sc + bc + vc
    const extrasNeeded = Math.max(0, total - 1)
    const arr: PersonMini[] = []
    for (let i = 0; i < extrasNeeded; i++) {
      const old = people[i]
      let ticket_type: TicketType
      if (i < sc - 1)           ticket_type = 'standing'
      else if (i < sc - 1 + bc) ticket_type = 'backstage'
      else                       ticket_type = 'vip'
      arr.push(old ? { ...old, ticket_type } : { name: '', phone: '', instagram: '', ticket_type })
    }
    setPeople(arr)
  }

  const handleNumChange = (type: TicketType, n: number) => {
    const safe = Math.max(0, Math.min(10, n || 0))
    const sc = type === 'standing'  ? safe : standingCount
    const bc = type === 'backstage' ? safe : backstageCount
    const vc = type === 'vip'       ? safe : vipCount
    if (type === 'standing')  setStandingCount(safe)
    if (type === 'backstage') setBackstageCount(safe)
    if (type === 'vip')       setVipCount(safe)
    syncPeople(sc, bc, vc)
  }

  const updatePerson = (i: number, field: keyof PersonMini, value: string) =>
    setPeople(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))

  const getSubtotal = () =>
    (standing.price ?? 0) * standingCount +
    (backstage.price ?? 0) * backstageCount +
    (vip.price ?? 0) * vipCount

  const getTax   = () => Math.round(getSubtotal() * 0.08)  // ← 8%
  const getTotal = () => getSubtotal() + getTax()

  const allSoldOut =
    (standing.soldOut  || standing.price  == null) &&
    (backstage.soldOut || backstage.price == null) &&
    (!hasVip || vip.soldOut || vip.price == null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccessMsg('')
    if (!event)              { setError('Event not found.'); return }
    if (event.is_finished)   { setError('This event has ended.'); return }
    if (totalPeople === 0)   { setError('Select at least one ticket.'); return }
    if (!mainTicketType)     { setError('Please select ticket type first.'); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/auth/login?redirect=/events/${id}/reserve`); return }

    if (!name || !phone || !email || !instagram) { setError('Please fill main guest details.'); return }
    if (!isValidInstagramUrl(instagram)) { setError('Please enter a valid Instagram URL for main guest.'); return }
    for (const p of people) {
      if (!p.name || !p.phone || !p.instagram) { setError('Please fill all details for each guest.'); return }
      if (!isValidInstagramUrl(p.instagram))   { setError('Please enter a valid Instagram URL for all guests.'); return }
    }

    setLoading(true)
    const mainPerson: PersonMini = { name, phone, instagram, ticket_type: mainTicketType }
    const peopleDetails = [mainPerson, ...people]

const { error: insertError } = await supabase.from('reservations').insert({
  event_id: event.id,
  user_id: (await supabase.auth.getUser()).data.user!.id,
  // NOT NULL columns
  full_name: name,
  phone,
  email,
  quantity: totalPeople,
  subtotal: getSubtotal(),
  fee: getTax(),
  total: getTotal(),
  status: 'pending',
  // optional columns
  instagram,
  name,
  num_people: totalPeople,
  people_details: peopleDetails,
  standing_count:  standingCount,  standing_price_per_person:  standing.price  ?? 0, standing_wave_label:  standing.key,
  backstage_count: backstageCount, backstage_price_per_person: backstage.price ?? 0, backstage_wave_label: backstage.key,
  vip_count:       vipCount,       vip_price_per_person:       vip.price       ?? 0, vip_wave_label:       vip.key,
  subtotal_price: getSubtotal(),
  tax_amount: getTax(),
  total_price: getTotal(),
})

if (insertError) { setError(insertError.message); setLoading(false); return }

    setLoading(false)
    setSuccessMsg('Reservation created! Check your profile to follow booking steps, complete payment, and get your entry QR code.')
    setStandingCount(0); setBackstageCount(0); setVipCount(0)
    setPeople([]); setName(''); setPhone(''); setEmail(''); setInstagram('')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    padding: '13px 16px', color: '#fff', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '2px',
    fontWeight: 700, display: 'block', marginBottom: 8,
  }

  const TicketDropdown = ({ value, onChange, disabled, isOpen, setIsOpen, color = '#2E75B6' }: {
    value: number; onChange: (n: number) => void
    disabled?: boolean; isOpen: boolean; setIsOpen: (v: boolean) => void; color?: string
  }) => (
    <div style={{ position: 'relative' }}>
      <button type="button" disabled={disabled} onClick={() => !disabled && setIsOpen(!isOpen)} style={{
        width: '100%', background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 10, padding: '13px 16px',
        color: disabled ? 'rgba(255,255,255,0.15)' : '#fff', fontSize: 14,
        fontFamily: 'Inter, sans-serif', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box',
      }}>
        <span>{disabled ? 'SOLD OUT' : `${value} ticket${value !== 1 ? 's' : ''}`}</span>
        {!disabled && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{isOpen ? '▲' : '▼'}</span>}
      </button>

      {isOpen && !disabled && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', zIndex: 50, backdropFilter: 'blur(10px)' }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} onClick={() => { onChange(i); setIsOpen(false) }} style={{
              padding: '12px 16px', fontSize: 14, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              color: value === i ? '#fff' : 'rgba(255,255,255,0.4)',
              background: value === i ? `${color}25` : 'transparent',
              borderBottom: i < 10 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderLeft: value === i ? `2px solid ${color}` : '2px solid transparent',
            }}
              onMouseEnter={e => { if (value !== i) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (value !== i) e.currentTarget.style.background = 'transparent' }}>
              {i === 0 ? 'No tickets' : `${i} ticket${i !== 1 ? 's' : ''}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: '0 0 80px', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(46,117,182,0.08) 0%, transparent 55%)' }} />

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '2px' }}>BOOK YOUR SPOT</span>
      </div>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Event Info */}
        {event && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Poppins, sans-serif' }}>{event.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
                  📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} · 📍 {event.location}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                {!standing.soldOut  && standing.price  != null && <div style={{ color: '#27AE60',  marginBottom: 2 }}>Standing: {standing.price} EGP</div>}
                {!backstage.soldOut && backstage.price != null && <div style={{ color: '#8b5cf6',  marginBottom: 2 }}>Backstage: {backstage.price} EGP</div>}
                {hasVip && !vip.soldOut && vip.price   != null && <div style={{ color: '#F0A500' }}>VIP: {vip.price} EGP</div>}
              </div>
            </div>
          </div>
        )}

        {/* All Sold Out */}
        {event && allSoldOut && (
          <div style={{ background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 16, padding: 28, marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 36, margin: '0 0 10px' }}>❌</p>
            <p style={{ color: '#E74C3C', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>
              {event.is_finished ? 'THIS EVENT HAS ENDED' : 'ALL TICKETS ARE SOLD OUT'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* STEP 1 */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 14 }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 18px' }}>STEP 1 · SELECT TICKETS</p>
            <div style={{ display: 'grid', gridTemplateColumns: hasVip ? '1fr 1fr 1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ ...labelStyle, color: '#27AE60' }}>STANDING{standing.soldOut ? ' — SOLD OUT' : ` — ${standing.price} EGP`}</label>
                <TicketDropdown value={standingCount} disabled={allStandingUnavailable} isOpen={standingOpen} color="#27AE60"
                  setIsOpen={v => { setStandingOpen(v); if (v) { setBackstageOpen(false); setVipOpen(false) } }}
                  onChange={n => handleNumChange('standing', n)} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#8b5cf6' }}>BACKSTAGE{backstage.soldOut ? ' — SOLD OUT' : ` — ${backstage.price} EGP`}</label>
                <TicketDropdown value={backstageCount} disabled={allBackstageUnavailable} isOpen={backstageOpen} color="#8b5cf6"
                  setIsOpen={v => { setBackstageOpen(v); if (v) { setStandingOpen(false); setVipOpen(false) } }}
                  onChange={n => handleNumChange('backstage', n)} />
              </div>
              {hasVip && (
                <div>
                  <label style={{ ...labelStyle, color: '#F0A500' }}>VIP{vip.soldOut ? ' — SOLD OUT' : ` — ${vip.price} EGP`}</label>
                  <TicketDropdown value={vipCount} disabled={allVipUnavailable} isOpen={vipOpen} color="#F0A500"
                    setIsOpen={v => { setVipOpen(v); if (v) { setStandingOpen(false); setBackstageOpen(false) } }}
                    onChange={n => handleNumChange('vip', n)} />
                </div>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 12 }}>
              Choose how many tickets you need. Guest details will appear in the next step.
            </p>
          </div>

          {/* STEP 2 */}
          {totalPeople > 0 && (
            <>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 14 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 6px' }}>STEP 2 · MAIN GUEST</p>
                {mainTicketType && (
                  <div style={{ display: 'inline-block', marginBottom: 16, background: `${ticketTypeStyle[mainTicketType].color}15`, border: `1px solid ${ticketTypeStyle[mainTicketType].color}30`, borderRadius: 50, padding: '4px 14px' }}>
                    <span style={{ color: ticketTypeStyle[mainTicketType].color, fontSize: 11, fontWeight: 700 }}>{ticketTypeStyle[mainTicketType].label}</span>
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
                  <label style={labelStyle}>EMAIL</label>
                  <input style={inputStyle} placeholder="your@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>INSTAGRAM URL</label>
                  <input style={inputStyle} type="url" placeholder="https://instagram.com/username" value={instagram} onChange={e => setInstagram(e.target.value)} />
                </div>
              </div>

              {people.map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${ticketTypeStyle[p.ticket_type]?.color}20`, borderRadius: 16, padding: 24, marginBottom: 14 }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 6px' }}>GUEST {i + 2}</p>
                  <div style={{ display: 'inline-block', marginBottom: 16, background: `${ticketTypeStyle[p.ticket_type]?.color}15`, border: `1px solid ${ticketTypeStyle[p.ticket_type]?.color}30`, borderRadius: 50, padding: '4px 14px' }}>
                    <span style={{ color: ticketTypeStyle[p.ticket_type]?.color, fontSize: 11, fontWeight: 700 }}>{ticketTypeStyle[p.ticket_type]?.label}</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>FULL NAME</label>
                    <input style={inputStyle} placeholder="Full name" value={p.name} onChange={e => updatePerson(i, 'name', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>PHONE NUMBER</label>
                    <input style={inputStyle} placeholder="01XXXXXXXXX" type="tel" value={p.phone} onChange={e => updatePerson(i, 'phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>INSTAGRAM URL</label>
                    <input style={inputStyle} type="url" placeholder="https://instagram.com/username" value={p.instagram} onChange={e => updatePerson(i, 'instagram', e.target.value)} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TOTAL */}
          {!allSoldOut && event && totalPeople > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px', marginBottom: 18 }}>
              {standingCount  > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#27AE60', fontSize: 12 }}>Standing ({standingCount}x)</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{(standing.price ?? 0) * standingCount} EGP</span>
              </div>}
              {backstageCount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#8b5cf6', fontSize: 12 }}>Backstage ({backstageCount}x)</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{(backstage.price ?? 0) * backstageCount} EGP</span>
              </div>}
              {vipCount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#F0A500', fontSize: 12 }}>VIP ({vipCount}x)</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{(vip.price ?? 0) * vipCount} EGP</span>
              </div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>SUBTOTAL</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{getSubtotal()} EGP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>TAX (8%)</span>  {/* ← 14% → 8% */}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{getTax()} EGP</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 13, letterSpacing: '2px', fontWeight: 700 }}>TOTAL</span>
                <span style={{ color: '#2E75B6', fontSize: 24, fontWeight: 900, fontFamily: 'Poppins, sans-serif' }}>{getTotal()} EGP</span>
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 10, padding: '12px 16px', color: '#E74C3C', fontSize: 13, marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 10, padding: '12px 16px', color: '#27AE60', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Submit */}
          <button type="submit"
            disabled={loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0}
            style={{
              width: '100%',
              background: loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                ? 'rgba(255,255,255,0.04)'
                : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0
                ? 'rgba(255,255,255,0.2)' : '#fff',
              border: 'none', padding: '17px', borderRadius: 12,
              fontWeight: 800, fontSize: 15, letterSpacing: '2px',
              cursor: loading || allSoldOut || getSubtotal() <= 0 || totalPeople === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: loading || allSoldOut ? 'none' : '0 8px 24px rgba(46,117,182,0.3)',
            }}>
            {loading ? 'Submitting...' : allSoldOut || totalPeople === 0 ? 'UNAVAILABLE' : 'Submit Booking →'}
          </button>

          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
            After submitting, go to your profile to follow booking steps, complete payment, and get your entry QR code.
          </p>
        </form>
      </div>
    </main>
  )
}