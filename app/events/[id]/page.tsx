'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShieldCheck, BadgeCheck, QrCode, ScanLine, MessageCircle, CalendarDays, MapPin, ArrowRight, ChevronDown } from 'lucide-react'
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
  const wave2Available = !!wave_1_sold_out && !wave_2_sold_out && wave_2_price != null
  const wave3Available = !!wave_1_sold_out && !!wave_2_sold_out && !wave_3_sold_out && wave_3_price != null

  let currentPrice: number | null = null
  let currentWaveLabel = ''
  let soldOut = false

  if (wave1Available) {
    currentPrice = wave_1_price as number
    currentWaveLabel = 'WAVE 1'
  } else if (wave2Available) {
    currentPrice = wave_2_price as number
    currentWaveLabel = 'WAVE 2'
  } else if (wave3Available) {
    currentPrice = wave_3_price as number
    currentWaveLabel = 'WAVE 3'
  } else {
    soldOut = true
  }

  if (is_finished) soldOut = true

  return { currentPrice, currentWaveLabel, soldOut }
}

function WaveBadge({ waveLabel }: { waveLabel: string }) {
  if (!waveLabel) return null

  const configs: Record<string, { bg: string; border: string; color: string; label: string }> = {
    'WAVE 1': { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.4)', color: '#22c55e', label: 'EARLY BIRD' },
    'WAVE 2': { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.4)', color: '#eab308', label: 'REGULAR PRICE' },
    'WAVE 3': { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.4)', color: '#3b82f6', label: 'LAST WAVE' },
  }

  const c = configs[waveLabel]
  if (!c) return null

  return (
    <div
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 999,
        padding: '6px 16px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '1.8px',
        color: c.color,
        display: 'inline-block',
      }}
    >
      {waveLabel} — {c.label}
    </div>
  )
}

function TicketCard({
  label,
  info,
  onClick,
  accent,
  helper,
}: {
  label: string
  info: ReturnType<typeof getWaveInfo>
  onClick: () => void
  accent: string
  helper: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!info.soldOut) onClick()
      }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${info.soldOut ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 22,
        padding: '22px 20px',
        width: '100%',
        textAlign: 'left',
        cursor: info.soldOut ? 'not-allowed' : 'pointer',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
        opacity: info.soldOut ? 0.78 : 1,
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={e => {
        if (info.soldOut) return
        e.currentTarget.style.borderColor = `${accent}66`
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 18px 34px rgba(0,0,0,0.28)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.045)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.18)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
    >
      <p
        style={{
          color: accent,
          fontSize: 11,
          letterSpacing: '2px',
          fontWeight: 700,
          margin: '0 0 12px',
        }}
      >
        {label}
      </p>

      {info.currentPrice != null && !info.soldOut ? (
        <>
          <p
            style={{
              color: '#fff',
              fontSize: 30,
              fontWeight: 900,
              margin: '0 0 10px',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: 1.1,
            }}
          >
            {info.currentPrice}{' '}
            <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, fontWeight: 500 }}>
              EGP / person
            </span>
          </p>

          <div style={{ marginBottom: 14 }}>
            <WaveBadge waveLabel={info.currentWaveLabel} />
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {helper}
          </p>
        </>
      ) : (
        <>
          <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 800, margin: '0 0 8px', letterSpacing: '1px' }}>
            SOLD OUT
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
            This ticket tier is not available right now.
          </p>
        </>
      )}
    </button>
  )
}

function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: 'Secure Booking',
      subtitle: 'Your reservation details are safely handled.',
    },
    {
      icon: BadgeCheck,
      title: 'Official Tickets',
      subtitle: 'All bookings are verified through the platform.',
    },
    {
      icon: QrCode,
      title: 'QR Ticket Access',
      subtitle: 'Your entry QR appears after confirmation.',
    },
    {
      icon: ScanLine,
      title: 'Fast Entry',
      subtitle: 'Quick scan at the gate for smooth check-in.',
    },
    {
      icon: MessageCircle,
      title: 'Instagram Support',
      subtitle: 'Need help? Support is handled via Instagram.',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}
    >
      {badges.map(({ icon: Icon, title, subtitle }) => (
        <div
          key={title}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '18px 16px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(46,117,182,0.12)',
              border: '1px solid rgba(46,117,182,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Icon size={18} color="#60a5fa" strokeWidth={2} />
          </div>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{title}</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{subtitle}</p>
        </div>
      ))}
    </div>
  )
}

function InfoCard({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'rgba(46,117,182,0.12)',
            border: '1px solid rgba(46,117,182,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronDown size={16} color="#60a5fa" />
        </div>
        <h3
          style={{
            color: '#fff',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 18,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map(item => (
          <div
            key={item}
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 14,
              lineHeight: 1.75,
              padding: '10px 12px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
  const day = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
  const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })
  return { full: `${weekday}, ${month} ${day}, ${year}`, time }
}

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<EventType | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: eventData } = await supabase.from('events').select('*').eq('slug', id).single()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setEvent(eventData as EventType | null)
      setUser(user)
      setLoading(false)
    }

    load()
  }, [id])

  const scrollToBooking = () => {
    document.getElementById('book-now-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
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
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.26)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '3px',
            fontSize: 12,
          }}
        >
          LOADING...
        </p>
      </main>
    )

  if (!event)
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.26)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '3px',
            fontSize: 12,
          }}
        >
          EVENT NOT FOUND
        </p>
      </main>
    )

  const standing = getWaveInfo({
    wave_1_price: event.standing_wave_1_price,
    wave_1_sold_out: event.standing_wave_1_sold_out,
    wave_2_price: event.standing_wave_2_price,
    wave_2_sold_out: event.standing_wave_2_sold_out,
    wave_3_price: event.standing_wave_3_price,
    wave_3_sold_out: event.standing_wave_3_sold_out,
    is_finished: event.is_finished,
  })

  const vip = getWaveInfo({
    wave_1_price: event.vip_wave_1_price,
    wave_1_sold_out: event.vip_wave_1_sold_out,
    wave_2_price: event.vip_wave_2_price,
    wave_2_sold_out: event.vip_wave_2_sold_out,
    wave_3_price: event.vip_wave_3_price,
    wave_3_sold_out: event.vip_wave_3_sold_out,
    is_finished: event.is_finished,
  })

  const backstage = getWaveInfo({
    wave_1_price: event.backstage_wave_1_price,
    wave_1_sold_out: event.backstage_wave_1_sold_out,
    wave_2_price: event.backstage_wave_2_price,
    wave_2_sold_out: event.backstage_wave_2_sold_out,
    wave_3_price: event.backstage_wave_3_price,
    wave_3_sold_out: event.backstage_wave_3_sold_out,
    is_finished: event.is_finished,
  })

  const noStanding = !event.standing_wave_1_price && !event.standing_wave_2_price && !event.standing_wave_3_price
  const noVip = !event.vip_wave_1_price && !event.vip_wave_2_price && !event.vip_wave_3_price
  const noBackstage = !event.backstage_wave_1_price && !event.backstage_wave_2_price && !event.backstage_wave_3_price

  const allSoldOut = (noStanding || standing.soldOut) && (noVip || vip.soldOut) && (noBackstage || backstage.soldOut)

  const { full: fullDate, time: eventTime } = formatDate(event.date)

  const bookingHref = user ? `/events/${event.slug}/reserve` : `/auth/login?redirect=/events/${event.slug}/reserve`

  const ctaLabel = event.is_finished
    ? 'EVENT ENDED'
    : !event.is_active
    ? 'BOOKINGS NOT OPEN'
    : allSoldOut
    ? 'SOLD OUT'
    : user
    ? 'BOOK NOW'
    : 'LOGIN TO BOOK'

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #08101d 0%, #0a0f1e 34%, #0c1323 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{`
        .event-hero-img {
          width: 100%;
          height: auto;
          display: block;
          filter: brightness(0.34);
        }

        .event-hero-wrap {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #0d1528, #1A3C5E);
          overflow: hidden;
        }

        .event-content {
          max-width: 980px;
          margin: 0 auto;
          padding: 0 24px 140px;
          position: relative;
          z-index: 2;
        }

        .floating-booking-bar {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 18px;
          width: min(760px, calc(100% - 24px));
          z-index: 120;
          background: rgba(10,15,30,0.88);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.28);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px;
        }

        .floating-booking-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .floating-booking-title {
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .floating-booking-sub {
          color: rgba(255,255,255,0.52);
          font-size: 12px;
          margin: 0;
        }

        .floating-booking-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          background: linear-gradient(135deg, #1A3C5E, #2E75B6);
          color: #fff;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          min-width: 160px;
        }

        @media (min-width: 769px) {
          .event-content { margin-top: -110px; }
        }

        @media (max-width: 768px) {
          .event-content {
            margin-top: 0;
            padding: 0 16px 150px;
          }

          .event-title {
            font-size: clamp(28px, 7vw, 40px) !important;
            letter-spacing: -1px !important;
          }

          .ticket-grid {
            grid-template-columns: 1fr !important;
          }

          .nav-desktop {
            display: none !important;
          }

          .meta-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .rules-grid {
            grid-template-columns: 1fr !important;
          }

          .floating-booking-bar {
            width: calc(100% - 20px);
            padding: 10px;
            gap: 10px;
          }

          .floating-booking-btn {
            min-width: 136px;
            padding: 13px 14px;
            font-size: 12px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .ticket-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px',
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
              boxShadow: '0 10px 24px rgba(46,117,182,0.28)',
            }}
          >
            <QrCode size={16} color="#fff" />
          </div>

          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 19, color: '#fff' }}>
            Ticket<span style={{ color: '#60a5fa' }}>Hub</span>
          </span>
        </Link>

        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/events" style={{ color: 'rgba(255,255,255,0.64)', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8 }}>
            Events
          </Link>
          <Link href="/#about" style={{ color: 'rgba(255,255,255,0.64)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>
            About
          </Link>
          <Link href="/#contact" style={{ color: 'rgba(255,255,255,0.64)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>
            Contact
          </Link>
          <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.78)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', marginLeft: 12 }}>
            Login
          </Link>
          <Link href="/auth/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', marginLeft: 4 }}>
            Sign Up
          </Link>
        </div>
      </nav>

      <div style={{ paddingTop: 64 }}>
        {event.image_url ? (
          <div className="event-hero-wrap">
            <img src={event.image_url} alt={event.title} className="event-hero-img" />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,15,30,0.12) 0%, #0a0f1e 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: 220, background: 'linear-gradient(135deg, #0d1528, #1A3C5E)' }} />
        )}
      </div>

      <div className="event-content">
        <Link
          href="/events"
          style={{
            color: 'rgba(255,255,255,0.42)',
            fontSize: 12,
            letterSpacing: '2px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            marginTop: 24,
            padding: '9px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.025)',
          }}
        >
          ← BACK TO EVENTS
        </Link>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {event.is_finished && (
            <span
              style={{
                background: 'rgba(100,100,100,0.15)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.42)',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              EVENT ENDED
            </span>
          )}

          {allSoldOut && !event.is_finished && (
            <span
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#ef4444',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              SOLD OUT
            </span>
          )}

          {!event.is_finished && event.is_active && !allSoldOut && (
            <span
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              BOOKING OPEN
            </span>
          )}
        </div>

        <h1
          className="event-title"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(34px, 5vw, 58px)',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 18px',
            letterSpacing: '-2px',
            lineHeight: 1.04,
            maxWidth: 800,
          }}
        >
          {event.title}
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.68)',
            fontSize: 16,
            lineHeight: 1.85,
            margin: '0 0 26px',
            maxWidth: 760,
          }}
        >
          Secure your place, review ticket options clearly, and complete your reservation through a simple and trusted flow.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 28,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 22,
            padding: 20,
            boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div className="meta-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarDays size={17} color="#60a5fa" />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0, lineHeight: 1.7 }}>
              {fullDate} · {eventTime}
            </p>
          </div>

          <div className="meta-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <MapPin size={17} color="#60a5fa" />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0, lineHeight: 1.7 }}>{event.location}</p>

            {event.location_url && (
              <a
                href={event.location_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(46,117,182,0.1)',
                  border: '1px solid rgba(46,117,182,0.28)',
                  color: '#93c5fd',
                  textDecoration: 'none',
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                }}
              >
                GET DIRECTIONS <ArrowRight size={12} />
              </a>
            )}
          </div>
        </div>

        <TrustBadges />

        <div
          className="ticket-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {!noStanding && (
            <TicketCard
              label="STANDING"
              info={standing}
              onClick={scrollToBooking}
              accent="#4ade80"
              helper="Standard event access with the currently active wave price."
            />
          )}

          {!noVip && (
            <TicketCard
              label="VIP"
              info={vip}
              onClick={scrollToBooking}
              accent="#fbbf24"
              helper="Priority tier with the currently active VIP wave."
            />
          )}

          {!noBackstage && (
            <TicketCard
              label="BACKSTAGE"
              info={backstage}
              onClick={scrollToBooking}
              accent="#a78bfa"
              helper="Premium backstage access based on current availability."
            />
          )}
        </div>

        {event.description && (
          <div
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(46,117,182,0.1)',
              borderRadius: 22,
              padding: 26,
              marginBottom: 26,
            }}
          >
            <p
              style={{
                color: '#93c5fd',
                fontSize: 11,
                letterSpacing: '2px',
                fontWeight: 700,
                margin: '0 0 14px',
              }}
            >
              ABOUT THIS EVENT
            </p>

            <p
              style={{
                color: 'rgba(255,255,255,0.68)',
                fontSize: 15,
                lineHeight: 1.95,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {event.description}
            </p>
          </div>
        )}

        <div
          className="rules-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <InfoCard
            title="House Rules"
            items={[
              'Age policy and entry conditions may apply according to the event setup.',
              'A valid ticket and a valid ID may be required at the gate.',
              'Respect venue staff, security instructions, and entry organization.',
              'Management reserves the right to refuse entry when necessary.',
              'Outside prohibited items may not be allowed inside the venue.',
            ]}
          />

          <InfoCard
            title="Reservation Rules"
            items={[
              'Your booking is only confirmed after payment review and approval.',
              'Pending reservations must be completed within the allowed payment window.',
              'If payment is not completed in time, the reservation may be canceled automatically.',
              'QR access appears in your profile after confirmation.',
              'Support and booking follow-up are handled through your profile and Instagram support.',
            ]}
          />
        </div>

        <div id="book-now-section">
          {event.is_finished ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 22,
                padding: 36,
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🏁</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: '0 0 10px' }}>
                THIS EVENT HAS ENDED
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                Booking is no longer available for this event.
              </p>
            </div>
          ) : !event.is_active ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 22,
                padding: 36,
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: '0 0 10px' }}>
                BOOKINGS NOT OPEN YET
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                This event is not accepting reservations at the moment.
              </p>
            </div>
          ) : allSoldOut ? (
            <div
              style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.22)',
                borderRadius: 22,
                padding: 36,
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>❌</p>
              <p style={{ color: '#ef4444', fontSize: 13, letterSpacing: '2px', fontWeight: 700, margin: '0 0 10px' }}>
                ALL TICKETS ARE SOLD OUT
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                No available tickets remain for this event.
              </p>
            </div>
          ) : !user ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(46,117,182,0.12)',
                borderRadius: 22,
                padding: 36,
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, margin: '0 0 12px', fontWeight: 700 }}>
                Login required to continue booking
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '0 0 22px', lineHeight: 1.75 }}>
                Sign in first, then continue to your reservation details and payment steps.
              </p>

              <Link
                href={bookingHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '15px 30px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: '1.6px',
                  boxShadow: '0 10px 28px rgba(46,117,182,0.3)',
                }}
              >
                LOGIN TO BOOK <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(46,117,182,0.16)',
                borderRadius: 22,
                padding: 26,
                boxShadow: '0 18px 36px rgba(0,0,0,0.18)',
              }}
            >
              <p style={{ color: '#93c5fd', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 10px' }}>
                READY TO BOOK
              </p>
              <h2
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 26,
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}
              >
                Continue to your booking form
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15, margin: '0 0 18px', lineHeight: 1.8 }}>
                Your reservation will be created as pending first, then you can follow payment instructions from your profile.
              </p>

              <Link
                href={bookingHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '16px 28px',
                  borderRadius: 16,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: '1.8px',
                  boxShadow: '0 12px 30px rgba(46,117,182,0.32)',
                }}
              >
                BOOK MY SPOT <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {!event.is_finished && event.is_active && !allSoldOut && (
        <div className="floating-booking-bar">
          <div className="floating-booking-left">
            <p className="floating-booking-title">{event.title}</p>
            <p className="floating-booking-sub">
              {user ? 'Continue to booking form' : 'Login first to reserve your ticket'}
            </p>
          </div>

          <Link href={bookingHref} className="floating-booking-btn">
            {ctaLabel} <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </main>
  )
}