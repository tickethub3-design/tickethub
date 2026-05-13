'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  title: string
  slug: string
  location: string
  image_url?: string
  date: string
  is_featured: boolean
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Event[]>([])
  const [upcoming, setUpcoming] = useState<Event[]>([])
  const [loading,  setLoading]  = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('is_active', true).eq('is_featured', true).order('date').limit(3),
      supabase.from('events').select('*').eq('is_active', true).eq('is_finished', false).order('date').limit(6),
    ]).then(([f, u]) => {
      setFeatured((f.data as Event[]) || [])
      setUpcoming((u.data as Event[]) || [])
      setLoading(false)
    })
  }, [])

  return (
    <main style={{ backgroundColor: '#0a0f1e', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-links     { display: flex; align-items: center; gap: 4px; }
        .nav-hamburger { display: none !important; }
        .mobile-menu   { display: none; }

        @media (max-width: 768px) {
          .nav-links        { display: none !important; }
          .nav-hamburger    { display: flex !important; }
          .mobile-menu.open { display: flex !important; }
          .hero-title       { font-size: clamp(32px, 9vw, 56px) !important; letter-spacing: -1px !important; }
          .hero-btns        { flex-direction: column; align-items: center; }
          .grid-3           { grid-template-columns: 1fr !important; }
          .grid-steps       { grid-template-columns: 1fr !important; }
          .contact-grid     { grid-template-columns: 1fr !important; }
          .section-pad      { padding: 60px 20px !important; }
          .footer-links     { gap: 16px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid-3     { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-steps { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-title { font-size: clamp(34px, 5.5vw, 60px) !important; }
        }

        /* ── صورة الكارد — height:auto = الصورة كاملة بدون قطع ── */
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
          object-fit: unset;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 19, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>
        <div className="nav-links">
          <Link href="/events"        style={navLink}>Events</Link>
          <a    href="#about"         style={navLink}>About</a>
          <a    href="#contact"       style={navLink}>Contact</a>
          <Link href="/auth/login"    style={{ ...navLink, border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: 8, marginLeft: 12, color: 'rgba(255,255,255,0.75)' }}>Login</Link>
          <Link href="/auth/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', boxShadow: '0 4px 14px rgba(46,117,182,0.35)', marginLeft: 4 }}>Sign Up</Link>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center' }}>
          {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 24, height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />)}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}
        style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', flexDirection: 'column', padding: '20px 28px 24px', gap: 4 }}>
        {[{ href: '/events', label: 'Events' }, { href: '#about', label: 'About' }, { href: '#contact', label: 'Contact' }, { href: '/auth/login', label: 'Login' }, { href: '/auth/register', label: 'Sign Up' }].map(l => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
            style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 15, fontWeight: 500, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,94,0.45) 0%, transparent 65%)', top: '-15%', left: '-10%' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.18) 0%, transparent 65%)', bottom: '0%', right: '-5%' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 760 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,117,182,0.1)', border: '1px solid rgba(46,117,182,0.25)', borderRadius: 50, padding: '7px 18px', marginBottom: 36 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2E75B6', display: 'inline-block' }} />
            <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, letterSpacing: '1.5px' }}>EGYPT&apos;S #1 NIGHTLIFE PLATFORM</span>
          </div>
          <h1 className="hero-title" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(38px, 6.5vw, 76px)', lineHeight: 1.08, color: '#fff', margin: '0 0 24px', letterSpacing: '-2px' }}>
            Your Gateway to<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #2E75B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Live Experiences</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(14px, 2vw, 17px)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 44px' }}>
            Book tickets for the hottest concerts, VIP parties, and exclusive nightlife events in Egypt.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/events" style={{ textDecoration: 'none', padding: '14px 34px', borderRadius: 11, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 28px rgba(46,117,182,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>🎫 Browse Events</Link>
            <Link href="/auth/register" style={{ textDecoration: 'none', padding: '14px 34px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: 15, background: 'rgba(255,255,255,0.03)' }}>Create Account →</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      {featured.length > 0 && (
        <section className="section-pad" style={{ padding: '90px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>FEATURED</span>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>Hot Right Now 🔥</h2>
            </div>
            <Link href="/events" style={{ color: '#2E75B6', textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid rgba(46,117,182,0.25)', padding: '8px 18px', borderRadius: 8 }}>View All →</Link>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* ── UPCOMING ── */}
      {upcoming.length > 0 && (
        <section className="section-pad" style={{ padding: '0 24px 90px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>UPCOMING</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>Don&apos;t Miss Out 📅</h2>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* ── EMPTY ── */}
      {!loading && featured.length === 0 && upcoming.length === 0 && (
        <section style={{ padding: '120px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎭</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 26 }}>Events Coming Soon</h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>Stay tuned — big nights are being planned.</p>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ padding: '90px 24px', borderTop: '1px solid rgba(46,117,182,0.08)', background: 'linear-gradient(180deg, #0a0f1e 0%, #0c1220 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>Book in 3 Simple Steps</h2>
          </div>
          <div className="grid-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { n: '01', icon: '🎫', title: 'Pick Your Event',    desc: 'Browse upcoming concerts, parties, and VIP nights.' },
              { n: '02', icon: '💳', title: 'Reserve & Pay',      desc: 'Choose your ticket, fill details, and pay via Vodafone Cash or InstaPay.' },
              { n: '03', icon: '📱', title: 'Get Your QR Ticket', desc: 'Receive a digital QR ticket and scan it at the gate.' },
            ].map(item => (
              <div key={item.n} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.1)', borderRadius: 18, padding: '32px 26px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 52, color: 'rgba(46,117,182,0.08)', position: 'absolute', top: 12, right: 18, lineHeight: 1 }}>{item.n}</div>
                <div style={{ fontSize: 34, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section-pad" style={{ padding: '90px 24px', borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>ABOUT US</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 24px' }}>Who We Are</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: 1.9, marginBottom: 14 }}>
            TicketHub is Egypt&apos;s premier ticket booking platform for live events, concerts, VIP parties, and nightlife experiences.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.9, margin: 0 }}>
            We handle bookings, payments, and gate entry — so you can focus on the experience.
          </p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section-pad" style={{ padding: '90px 24px', borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>GET IN TOUCH</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 44px' }}>Contact Us</h2>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { href: 'https://instagram.com/_tickethub', icon: '📸', label: 'INSTAGRAM', value: '@_tickethub',       hoverColor: '#E1306C' },
              { href: 'https://wa.me/201093379437',       icon: '💬', label: 'WHATSAPP',  value: '+20 109 337 9437', hoverColor: '#25D366' },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.1)', borderRadius: 16, padding: '30px 20px', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = c.hoverColor; el.style.transform = 'translateY(-4px)'; el.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(46,117,182,0.1)'; el.style.transform = 'translateY(0)'; el.style.background = 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>{c.label}</div>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(46,117,182,0.08)', padding: '44px 24px', textAlign: 'center', background: '#070b18' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 17 }}>Ticket<span style={{ color: '#2E75B6' }}>Hub</span></span>
        </div>
        <div className="footer-links" style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          {[{ href: '/events', label: 'Events' }, { href: '#about', label: 'About' }, { href: '#contact', label: 'Contact' }, { href: '/auth/login', label: 'Login' }, { href: '/auth/register', label: 'Sign Up' }].map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.22)', fontSize: 13 }}>{l.label}</Link>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} TicketHub. All rights reserved.</p>
      </footer>

    </main>
  )
}

const navLink: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, padding: '8px 14px', borderRadius: 8,
}

// ─── EVENT CARD ────────────────────────────────────────────────────────────
function EventCard({ event }: { event: Event }) {
  const date  = new Date(event.date)
  const day   = date.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' })
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()

  return (
    <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderRadius: 18,
          overflow: 'hidden',        /* ← لازم يفضل عشان الـ border-radius يشتغل */
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-5px)'; el.style.borderColor = 'rgba(46,117,182,0.35)'; el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.45)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.boxShadow = 'none' }}
      >

        {/* ── IMAGE — height:auto = الصورة كاملة بدون قطع ولا مط ── */}
        <div className="event-img-wrap">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🎵</div>
          )}

          {/* gradient خفيف فوق الصورة */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(10,15,30,0.5) 0%, transparent 100%)', pointerEvents: 'none' }} />

          {/* Date badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, background: 'rgba(10,15,30,0.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '5px 9px', textAlign: 'center', minWidth: 40 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 8, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.5px', marginTop: 2 }}>{month}</div>
          </div>

          {/* HOT badge */}
          {event.is_featured && (
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: 'rgba(255,71,87,0.92)', backdropFilter: 'blur(8px)', borderRadius: 6, padding: '3px 9px', fontSize: 9, fontWeight: 700, color: '#fff' }}>
              🔥 HOT
            </div>
          )}
        </div>

        {/* ── CARD BODY ── */}
        <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 7px', lineHeight: 1.3 }}>{event.title}</h3>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11 }}>📍</span> {event.location}
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', fontSize: 12, fontWeight: 600, width: 'fit-content' }}>
            🎫 Book Now
          </div>
        </div>

      </div>
    </Link>
  )
}