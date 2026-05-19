'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'

type Event = {
  id: string
  title: string
  slug: string
  location: string
  image_url?: string
  date: string
  is_featured: boolean
  is_finished?: boolean
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Event[]>([])
  const [upcoming, setUpcoming] = useState<Event[]>([])
  const [past, setPast] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('is_active', true).eq('is_featured', true).eq('is_finished', false).order('date').limit(3),
      supabase.from('events').select('*').eq('is_active', true).eq('is_finished', false).order('date').limit(6),
      supabase.from('events').select('*').eq('is_active', true).eq('is_finished', true).order('date', { ascending: false }).limit(4),
    ]).then(([f, u, p]) => {
      setFeatured((f.data as Event[]) || [])
      setUpcoming((u.data as Event[]) || [])
      setPast((p.data as Event[]) || [])
      setLoading(false)
    })
  }, [])

  return (
    <main style={{ backgroundColor: '#0a0f1e', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes pulseSoft {
          0% { opacity: .45; }
          50% { opacity: .7; }
          100% { opacity: .45; }
        }

        .section-pad {
          padding-left: 24px;
          padding-right: 24px;
        }

        .hero-title {
          font-size: clamp(38px, 6.4vw, 76px);
          letter-spacing: -2px;
        }

        .hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
        }

        .grid-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .value-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .footer-links {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .event-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: linear-gradient(135deg, #0d1528, #1A3C5E);
          flex-shrink: 0;
          overflow: hidden;
        }

        .event-img-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: clamp(32px, 9vw, 54px) !important;
            letter-spacing: -1px !important;
          }

          .hero-btns {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-btns a {
            justify-content: center;
          }

          .grid-3,
          .grid-steps,
          .value-grid,
          .contact-grid {
            grid-template-columns: 1fr !important;
          }

          .trust-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .section-pad {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .footer-links {
            gap: 16px !important;
          }
        }

        @media (max-width: 520px) {
          .trust-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '100px 24px 80px',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(26,60,94,0.45) 0%, transparent 65%)',
              top: '-15%',
              left: '-10%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(46,117,182,0.18) 0%, transparent 65%)',
              bottom: '0%',
              right: '-5%',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(46,117,182,0.1)',
              border: '1px solid rgba(46,117,182,0.25)',
              borderRadius: 50,
              padding: '7px 18px',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#2E75B6',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, letterSpacing: '1.5px' }}>
              EGYPT&apos;S NIGHTLIFE BOOKING PLATFORM
            </span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              lineHeight: 1.08,
              color: '#fff',
              margin: '0 0 20px',
            }}
          >
            Your Gateway to
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #2E75B6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Live Experiences
            </span>
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.52)',
              fontSize: 'clamp(14px, 2vw, 17px)',
              lineHeight: 1.9,
              maxWidth: 620,
              margin: '0 auto 40px',
            }}
          >
            Discover upcoming concerts, VIP parties, and nightlife events in Egypt with a faster, clearer, and more trusted booking experience.
          </p>

          <div className="hero-btns" style={{ justifyContent: 'center' }}>
            <Link
              href="/events"
              style={{
                textDecoration: 'none',
                padding: '14px 34px',
                borderRadius: 11,
                background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 8px 28px rgba(46,117,182,0.32)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🎫 Browse Events
            </Link>

            <Link
              href="/auth/register"
              style={{
                textDecoration: 'none',
                padding: '14px 34px',
                borderRadius: 11,
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.82)',
                fontWeight: 600,
                fontSize: 15,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              Create Account →
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '-10px auto 0' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 18px 44px rgba(0,0,0,0.18)',
          }}
        >
          <div className="trust-grid" style={{ marginBottom: 24 }}>
            {[
              { title: 'Secure Booking', sub: 'Clear and trusted reservation flow' },
              { title: 'Official Tickets', sub: 'Verified event access experience' },
              { title: 'QR Gate Entry', sub: 'Fast event check-in readiness' },
              { title: 'Live Support', sub: 'Easy support contact when needed' },
              { title: 'Trusted Platform', sub: 'Built for premium nightlife booking' },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 18,
                  padding: '22px 18px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    margin: '0 auto 14px',
                    background: 'linear-gradient(135deg, rgba(46,117,182,0.15), rgba(96,165,250,0.08))',
                    border: '1.5px solid rgba(46,117,182,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 12.5, lineHeight: 1.6 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: 20,
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: 13,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Vodafone Cash</div>
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>InstaPay</div>
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Visa / MasterCard Soon</div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>FEATURED</span>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>
                Hot Right Now
              </h2>
            </div>
            <Link
              href="/events"
              style={{
                color: '#2E75B6',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid rgba(46,117,182,0.25)',
                padding: '8px 18px',
                borderRadius: 8,
              }}
            >
              View All →
            </Link>
          </div>

          <div className="grid-3">
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>UPCOMING</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>
              Don&apos;t Miss Out
            </h2>
          </div>

          <div className="grid-3">
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* PLATFORM VALUE */}
      <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: '28px 24px',
          }}
        >
          <div style={{ marginBottom: 26 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>WHY TICKETHUB</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 10px' }}>
              A clearer experience from browse to booking
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.46)', fontSize: 14, lineHeight: 1.8, maxWidth: 640, margin: 0 }}>
              TicketHub is being shaped to make every part of the experience clearer, faster, and more professional for nightlife and premium live events.
            </p>
          </div>

          <div className="value-grid">
            {[
              {
                title: 'Cleaner Navigation',
                desc: 'Users should understand where to go next without confusion.',
              },
              {
                title: 'Stronger Trust',
                desc: 'Clear structure and better visual signals reduce hesitation.',
              },
              {
                title: 'Better Mobile UX',
                desc: 'The platform should feel smooth on phone, tablet, and desktop.',
              },
              {
                title: 'Real Event History',
                desc: 'Past events help visitors trust the platform before booking.',
              },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 18,
                  padding: '22px 18px',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    marginBottom: 14,
                    background: 'rgba(46,117,182,0.12)',
                    border: '1px solid rgba(46,117,182,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  +
                </div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.44)', fontSize: 13.5, lineHeight: 1.75 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAST EVENTS */}
      {past.length > 0 && (
        <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>EXPERIENCE HISTORY</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>
              Previously On TicketHub
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 15, margin: '12px 0 0', lineHeight: 1.8, maxWidth: 620 }}>
              Explore recent events that already happened on the platform and understand the type of nights and experiences TicketHub is built around.
            </p>
          </div>

          <div className="grid-3">
            {past.map(e => <EventCard key={e.id} event={e} isPast />)}
          </div>
        </section>
      )}

      {/* EMPTY */}
      {!loading && featured.length === 0 && upcoming.length === 0 && past.length === 0 && (
        <section style={{ padding: '120px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎭</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 26 }}>Events Coming Soon</h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>Stay tuned — big nights are being planned.</p>
        </section>
      )}

      {/* LOADING */}
      {loading && (
        <section style={{ padding: '0 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  animation: 'pulseSoft 1.6s ease-in-out infinite',
                }}
              >
                <div style={{ height: 220, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 18, width: '72%', borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
                  <div style={{ height: 12, width: '45%', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 18 }} />
                  <div style={{ height: 36, width: 120, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section
        className="section-pad"
        style={{
          paddingTop: 90,
          paddingBottom: 90,
          borderTop: '1px solid rgba(46,117,182,0.08)',
          background: 'linear-gradient(180deg, #0a0f1e 0%, #0c1220 100%)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>
              Book in 3 Simple Steps
            </h2>
          </div>

          <div className="grid-steps">
            {[
              { n: '01', icon: '🎫', title: 'Pick Your Event', desc: 'Browse upcoming concerts, parties, and VIP nights.' },
              { n: '02', icon: '💳', title: 'Reserve & Pay', desc: 'Choose your ticket, fill details, and complete the payment steps clearly.' },
              { n: '03', icon: '📱', title: 'Get Ready for Entry', desc: 'Follow the next steps smoothly after reservation and event confirmation.' },
            ].map(item => (
              <div
                key={item.n}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(46,117,182,0.1)',
                  borderRadius: 18,
                  padding: '32px 26px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 800,
                    fontSize: 52,
                    color: 'rgba(46,117,182,0.08)',
                    position: 'absolute',
                    top: 12,
                    right: 18,
                    lineHeight: 1,
                  }}
                >
                  {item.n}
                </div>
                <div style={{ fontSize: 34, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-pad" style={{ paddingTop: 90, paddingBottom: 90, borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>ABOUT US</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 24px' }}>
            Who We Are
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: 1.95, marginBottom: 14 }}>
            TicketHub is Egypt&apos;s ticket booking platform for live events, concerts, VIP parties, and nightlife experiences.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.34)', fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.9, margin: 0 }}>
            We handle bookings, payments, and event follow-up so the whole experience feels smoother from discovery to entry.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-pad" style={{ paddingTop: 90, paddingBottom: 90, borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>GET IN TOUCH</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 18px' }}>
            Contact TicketHub
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 36px' }}>
            Reach out through our official channels for support, updates, and booking-related questions.
          </p>

          <div className="contact-grid">
            {[
              {
                href: 'https://instagram.com/_tickethub',
                icon: '📸',
                label: 'INSTAGRAM',
                value: '@_tickethub',
                hoverColor: '#E1306C',
              },
              {
                href: 'https://wa.me/201093379437',
                icon: '💬',
                label: 'WHATSAPP',
                value: '+20 109 337 9437',
                hoverColor: '#25D366',
              },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(46,117,182,0.1)',
                    borderRadius: 16,
                    padding: '30px 20px',
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = c.hoverColor
                    el.style.transform = 'translateY(-4px)'
                    el.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = 'rgba(46,117,182,0.1)'
                    el.style.transform = 'translateY(0)'
                    el.style.background = 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
                    {c.label}
                  </div>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(46,117,182,0.08)',
          padding: '44px 24px',
          textAlign: 'center',
          background: '#070b18',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
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
                boxShadow: '0 6px 16px rgba(46,117,182,0.25)',
              }}
            >
              🎟️
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 18 }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13.5, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 22px' }}>
            Egypt&apos;s platform for premium nightlife events, smoother booking, and clearer experiences from event discovery to entry.
          </p>

          <div className="footer-links">
            {[
              { href: '/events', label: 'Events' },
              { href: '#about', label: 'About' },
              { href: '#contact', label: 'Contact' },
              { href: '/auth/login', label: 'Login' },
              { href: '/auth/register', label: 'Sign Up' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.26)', fontSize: 13 }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <a
              href="https://instagram.com/_tickethub"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'rgba(255,255,255,0.48)',
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              Instagram
            </a>
            <a
              href="https://wa.me/201093379437"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'rgba(255,255,255,0.48)',
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              WhatsApp
            </a>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} TicketHub. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  const date = new Date(event.date)
  const day = date.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' })
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })

  return (
    <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: isPast ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.025)',
          borderRadius: 18,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          opacity: isPast ? 0.72 : 1,
          minHeight: '100%',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-5px)'
          el.style.borderColor = isPast ? 'rgba(255,255,255,0.12)' : 'rgba(46,117,182,0.35)'
          el.style.boxShadow = isPast ? '0 12px 28px rgba(0,0,0,0.22)' : '0 20px 50px rgba(0,0,0,0.45)'
          el.style.opacity = '1'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0)'
          el.style.borderColor = 'rgba(255,255,255,0.06)'
          el.style.boxShadow = 'none'
          el.style.opacity = isPast ? '0.72' : '1'
        }}
      >
        <div className="event-img-wrap">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              style={{ filter: isPast ? 'grayscale(65%) brightness(0.72)' : 'none' }}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
              🎵
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(10,15,30,0.72) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 2,
              background: 'rgba(10,15,30,0.82)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 9,
              padding: '5px 9px',
              textAlign: 'center',
              minWidth: 40,
            }}
          >
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 8, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.5px', marginTop: 2 }}>{month}</div>
          </div>

          {isPast ? (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              ENDED
            </div>
          ) : event.is_featured ? (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                background: 'rgba(255,71,87,0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: 6,
                padding: '3px 9px',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              HOT
            </div>
          ) : null}
        </div>

        <div style={{ padding: '16px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 8px', lineHeight: 1.35 }}>
              {event.title}
            </h3>

            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>📍</span> {event.location}
            </div>

            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🕐</span> {time}
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 9,
              background: isPast ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: isPast ? 'rgba(255,255,255,0.38)' : '#fff',
              fontSize: 13,
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            {isPast ? 'View Details' : '🎫 Book Now'}
          </div>
        </div>
      </div>
    </Link>
  )
}