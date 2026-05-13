'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  slug: string
  location: string
  image_url?: string
  date: string
  is_active: boolean
  is_finished: boolean
  is_featured: boolean
}

export default function EventsPage() {
  const [upcoming, setUpcoming] = useState<Event[]>([])
  const [past, setPast]         = useState<Event[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('is_active', true).eq('is_finished', false).order('date'),
      supabase.from('events').select('*').eq('is_active', true).eq('is_finished', true).order('date', { ascending: false }).limit(6),
    ]).then(([u, p]) => {
      setUpcoming((u.data as Event[]) || [])
      setPast((p.data as Event[]) || [])
      setLoading(false)
    })
  }, [])

  return (
    <main style={{ backgroundColor: '#0a0f1e', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .event-img-wrap {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #0d1528, #1A3C5E);
          flex-shrink: 0;
        }
        .event-img-wrap img {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 19, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/events"        style={{ color: '#fff', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8, background: 'rgba(46,117,182,0.15)', fontWeight: 600 }}>Events</Link>
          <Link href="/#about"        style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>About</Link>
          <Link href="/#contact"      style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px' }}>Contact</Link>
          <Link href="/auth/login"    style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', marginLeft: 12 }}>Login</Link>
          <Link href="/auth/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', marginLeft: 4 }}>Sign Up</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ paddingTop: 130, paddingBottom: 60, paddingLeft: 24, paddingRight: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,94,0.4) 0%, transparent 65%)', top: '-20%', left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>ALL EVENTS</span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', color: '#fff', margin: '12px 0 16px', letterSpacing: '-1.5px' }}>
            Find Your Next Experience
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, margin: 0 }}>
            Browse all upcoming events and book your tickets
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* UPCOMING */}
        {upcoming.length > 0 && (
          <section style={{ marginBottom: 72 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 3, height: 24, background: 'linear-gradient(to bottom, #2E75B6, #1A3C5E)', borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: '#fff', margin: 0 }}>Upcoming Events</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
              {upcoming.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* PAST */}
        {past.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 3, height: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Past Events</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
              {past.map(e => <EventCard key={e.id} event={e} isPast />)}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {!loading && upcoming.length === 0 && past.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎭</div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 24, marginBottom: 10 }}>No Events Yet</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Check back soon for upcoming events!</p>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── EVENT CARD ─────────────────────────────────────────────────────────────
function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  // ✅ timeZone: 'UTC' — يعرض نفس القيمة اللي اتحفظت في Supabase بدون offset
  const date  = new Date(event.date)
  const day   = date.toLocaleDateString('en-US',  { day: '2-digit',                             timeZone: 'UTC' })
  const month = date.toLocaleDateString('en-US',  { month: 'short',                             timeZone: 'UTC' }).toUpperCase()
  const time  = date.toLocaleTimeString('en-US',  { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })

  return (
    <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: isPast ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)',
          borderRadius: 18,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.06)',
          opacity: isPast ? 0.6 : 1,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-5px)'; el.style.borderColor = isPast ? 'rgba(255,255,255,0.1)' : 'rgba(46,117,182,0.4)'; el.style.boxShadow = isPast ? 'none' : '0 20px 50px rgba(0,0,0,0.45)'; el.style.opacity = '1' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.boxShadow = 'none'; el.style.opacity = isPast ? '0.6' : '1' }}
      >

        {/* IMAGE */}
        <div className="event-img-wrap">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              style={{ filter: isPast ? 'grayscale(60%) brightness(0.7)' : 'none' }}
            />
          ) : (
            <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🎵</div>
          )}

          {/* gradient */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(10,15,30,0.85) 0%, transparent 100%)', pointerEvents: 'none' }} />

          {/* Date badge */}
          <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '6px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff', lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.5px', marginTop: 2 }}>{month}</div>
          </div>

          {isPast ? (
            <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>ENDED</div>
          ) : event.is_featured && (
            <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,71,87,0.9)', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#fff' }}>🔥 HOT</div>
          )}
        </div>

        {/* CARD BODY */}
        <div style={{ padding: '18px 20px 22px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 10px', lineHeight: 1.35 }}>
            {event.title}
          </h3>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📍</span> {event.location}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🕐</span> {time}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: isPast ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: isPast ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 13, fontWeight: 600 }}>
            {isPast ? 'View Details' : '🎫 Book Now'}
          </div>
        </div>

      </div>
    </Link>
  )
}