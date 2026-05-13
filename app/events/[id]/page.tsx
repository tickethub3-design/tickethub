'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type EventType = {
  id: string
  title: string
  slug: string
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

  vip_wave_1_price?: number | null
  vip_wave_1_sold_out?: boolean | null
  vip_wave_2_price?: number | null
  vip_wave_2_sold_out?: boolean | null
  vip_wave_3_price?: number | null
  vip_wave_3_sold_out?: boolean | null

  backstage_wave_1_price?: number | null
  backstage_wave_1_sold_out?: boolean | null
  backstage_wave_2_price?: number | null
  backstage_wave_2_sold_out?: boolean | null
  backstage_wave_3_price?: number | null
  backstage_wave_3_sold_out?: boolean | null
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
  const { wave_1_price, wave_1_sold_out, wave_2_price, wave_2_sold_out, wave_3_price, wave_3_sold_out, is_finished } = opts

  const wave1Available = !wave_1_sold_out && wave_1_price != null
  const wave2Available = !!wave_1_sold_out && !wave_2_sold_out && wave_2_price != null
  const wave3Available = !!wave_1_sold_out && !!wave_2_sold_out && !wave_3_sold_out && wave_3_price != null

  let currentPrice: number | null = null
  let currentWaveLabel = ''
  let soldOut = false

  if (wave1Available)      { currentPrice = wave_1_price as number; currentWaveLabel = 'WAVE 1' }
  else if (wave2Available) { currentPrice = wave_2_price as number; currentWaveLabel = 'WAVE 2' }
  else if (wave3Available) { currentPrice = wave_3_price as number; currentWaveLabel = 'WAVE 3' }
  else                     { soldOut = true }

  if (is_finished) soldOut = true

  return { currentPrice, currentWaveLabel, soldOut }
}

function WaveBadge({ waveLabel }: { waveLabel: string }) {
  if (!waveLabel) return null
  const configs: Record<string, { bg: string; border: string; color: string; label: string }> = {
    'WAVE 1': { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.4)',  color: '#22c55e', label: 'EARLY BIRD'    },
    'WAVE 2': { bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.4)',  color: '#eab308', label: 'REGULAR PRICE' },
    'WAVE 3': { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.4)', color: '#3b82f6', label: 'LAST WAVE'     },
  }
  const c = configs[waveLabel]
  if (!c) return null
  return (
    <div style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: '6px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: c.color, display: 'inline-block' }}>
      {waveLabel} — {c.label}
    </div>
  )
}

function TicketCard({ label, icon, info }: { label: string; icon: string; info: ReturnType<typeof getWaveInfo> }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.12)', borderRadius: 18, padding: '22px 20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '3px', fontWeight: 700, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{icon}</span> {label}
      </p>
      {info.currentPrice != null && !info.soldOut ? (
        <>
          <p style={{ color: '#2E75B6', fontSize: 28, fontWeight: 900, margin: '0 0 10px', fontFamily: 'Poppins, sans-serif' }}>
            {info.currentPrice} <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: 400 }}>EGP / person</span>
          </p>
          <WaveBadge waveLabel={info.currentWaveLabel} />
        </>
      ) : (
        <p style={{ color: '#ef4444', fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: '1px' }}>SOLD OUT</p>
      )}
    </div>
  )
}

// ── helper: يعرض التاريخ والوقت بدون timezone offset ──
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long',  timeZone: 'UTC' })
  const month   = d.toLocaleDateString('en-US', { month:   'long',  timeZone: 'UTC' })
  const day     = d.toLocaleDateString('en-US', { day:     'numeric', timeZone: 'UTC' })
  const year    = d.toLocaleDateString('en-US', { year:    'numeric', timeZone: 'UTC' })
  const time    = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })
  return { full: `${weekday}, ${month} ${day}, ${year}`, time }
}

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent]     = useState<EventType | null>(null)
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: eventData }    = await supabase.from('events').select('*').eq('slug', id).single()
      const { data: { user } }     = await supabase.auth.getUser()
      setEvent(eventData as EventType | null)
      setUser(user)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif', letterSpacing: '3px', fontSize: 12 }}>LOADING...</p>
    </main>
  )

  if (!event) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif', letterSpacing: '3px', fontSize: 12 }}>EVENT NOT FOUND</p>
    </main>
  )

  const standing  = getWaveInfo({ wave_1_price: event.standing_wave_1_price,  wave_1_sold_out: event.standing_wave_1_sold_out,  wave_2_price: event.standing_wave_2_price,  wave_2_sold_out: event.standing_wave_2_sold_out,  wave_3_price: event.standing_wave_3_price,  wave_3_sold_out: event.standing_wave_3_sold_out,  is_finished: event.is_finished })
  const vip       = getWaveInfo({ wave_1_price: event.vip_wave_1_price,       wave_1_sold_out: event.vip_wave_1_sold_out,       wave_2_price: event.vip_wave_2_price,       wave_2_sold_out: event.vip_wave_2_sold_out,       wave_3_price: event.vip_wave_3_price,       wave_3_sold_out: event.vip_wave_3_sold_out,       is_finished: event.is_finished })
  const backstage = getWaveInfo({ wave_1_price: event.backstage_wave_1_price, wave_1_sold_out: event.backstage_wave_1_sold_out, wave_2_price: event.backstage_wave_2_price, wave_2_sold_out: event.backstage_wave_2_sold_out, wave_3_price: event.backstage_wave_3_price, wave_3_sold_out: event.backstage_wave_3_sold_out, is_finished: event.is_finished })

  const noStanding  = !event.standing_wave_1_price  && !event.standing_wave_2_price  && !event.standing_wave_3_price
  const noVip       = !event.vip_wave_1_price       && !event.vip_wave_2_price       && !event.vip_wave_3_price
  const noBackstage = !event.backstage_wave_1_price && !event.backstage_wave_2_price && !event.backstage_wave_3_price

  const allSoldOut = (noStanding || standing.soldOut) && (noVip || vip.soldOut) && (noBackstage || backstage.soldOut)

  const { full: fullDate, time: eventTime } = formatDate(event.date)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        /* ── Responsive ── */
        .event-hero-img {
          width: 100%;
          height: auto;           /* ← الصورة كاملة بدون قطع */
          display: block;
          filter: brightness(0.38);
        }
        .event-hero-wrap {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #0d1528, #1A3C5E);
          overflow: hidden;
        }
        .event-content {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px 100px;
          position: relative;
          z-index: 2;
        }

        /* desktop: content يطلع فوق الصورة شوية */
        @media (min-width: 769px) {
          .event-content { margin-top: -100px; }
        }
        /* mobile/tablet: بدون overlap */
        @media (max-width: 768px) {
          .event-content        { margin-top: 0; padding: 0 16px 80px; }
          .event-title          { font-size: clamp(26px, 7vw, 40px) !important; letter-spacing: -1px !important; }
          .ticket-grid          { grid-template-columns: 1fr !important; }
          .nav-desktop          { display: none !important; }
          .meta-row             { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .ticket-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 19, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/events"        style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8 }}>Events</Link>
          <Link href="/#about"        style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>About</Link>
          <Link href="/#contact"      style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>Contact</Link>
          <Link href="/auth/login"    style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', marginLeft: 12 }}>Login</Link>
          <Link href="/auth/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', marginLeft: 4 }}>Sign Up</Link>
        </div>
      </nav>

      {/* ── HERO IMAGE — height:auto = الصورة كاملة بدون قطع ── */}
      <div style={{ paddingTop: 64 }}>
        {event.image_url ? (
          <div className="event-hero-wrap">
            <img
              src={event.image_url}
              alt={event.title}
              className="event-hero-img"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,30,0.15) 0%, #0a0f1e 100%)', pointerEvents: 'none' }} />
          </div>
        ) : (
          <div style={{ width: '100%', height: 180, background: 'linear-gradient(135deg, #0d1528, #1A3C5E)' }} />
        )}
      </div>

      <div className="event-content">

        {/* BACK */}
        <Link href="/events" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28, marginTop: 24, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          ← BACK TO EVENTS
        </Link>

        {/* STATUS BADGES */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {event.is_finished && (
            <span style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', padding: '5px 16px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '2px' }}>🏁 EVENT ENDED</span>
          )}
          {allSoldOut && !event.is_finished && (
            <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '5px 16px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '2px' }}>SOLD OUT</span>
          )}
        </div>

        {/* TITLE */}
        <h1 className="event-title" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', margin: '0 0 24px', letterSpacing: '-2px', lineHeight: 1.08 }}>
          {event.title}
        </h1>

        {/* META — ✅ timeZone: 'UTC' يعرض نفس القيمة اللي اتحفظت */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          <div className="meta-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
              {fullDate} · {eventTime}
            </p>
          </div>
          <div className="meta-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>{event.location}</p>
            {event.location_url && (
              <a href={event.location_url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,117,182,0.1)', border: '1px solid rgba(46,117,182,0.3)', color: '#60a5fa', textDecoration: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px' }}>
                GET DIRECTIONS →
              </a>
            )}
          </div>
        </div>

        {/* TICKET TYPES */}
        <div className="ticket-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          {!noStanding  && <TicketCard label="STANDING"  icon="🧍" info={standing}  />}
          {!noVip       && <TicketCard label="VIP"       icon="⭐" info={vip}       />}
          {!noBackstage && <TicketCard label="BACKSTAGE" icon="🎭" info={backstage} />}
        </div>

        {/* DESCRIPTION */}
        {event.description && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.1)', borderRadius: 18, padding: 26, marginBottom: 32 }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '3px', fontWeight: 700, margin: '0 0 14px' }}>ABOUT THIS EVENT</p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>
        )}

        {/* CTA */}
        {event.is_finished ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 36, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🏁</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>THIS EVENT HAS ENDED</p>
          </div>
        ) : !event.is_active ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 36, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, letterSpacing: '2px', margin: 0 }}>BOOKINGS NOT OPEN YET</p>
          </div>
        ) : allSoldOut ? (
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 18, padding: 36, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>❌</p>
            <p style={{ color: '#ef4444', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>ALL TICKETS ARE SOLD OUT</p>
          </div>
        ) : !user ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.12)', borderRadius: 18, padding: 36, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: '0 0 22px' }}>You need to be logged in to book a ticket.</p>
            <Link href={`/auth/login?redirect=/events/${event.slug}/reserve`}
              style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 14, letterSpacing: '2px', boxShadow: '0 8px 24px rgba(46,117,182,0.35)' }}>
              LOGIN TO BOOK →
            </Link>
          </div>
        ) : (
          <Link href={`/events/${event.slug}/reserve`}
            style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', textDecoration: 'none', padding: 22, borderRadius: 18, fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 16, letterSpacing: '3px', boxShadow: '0 10px 32px rgba(46,117,182,0.4)' }}>
            🎫 BOOK MY SPOT →
          </Link>
        )}

      </div>
    </main>
  )
}