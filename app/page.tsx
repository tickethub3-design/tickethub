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
          50% { opacity: .75; }
          100% { opacity: .45; }
        }

        .section-pad {
          padding-left: 24px;
          padding-right: 24px;
        }

        .hero-shell {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 110px 24px 90px;
          overflow: hidden;
        }

        .hero-grid {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 28px;
          align-items: center;
        }

        .hero-copy {
          max-width: 680px;
        }

        .hero-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.22);
          backdrop-filter: blur(12px);
        }

        .hero-badges {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .hero-title {
          font-size: clamp(38px, 6.5vw, 76px);
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
          background: linear-gradient(135deg, #0d1528, #1A3C5E);
          flex-shrink: 0;
        }

        .event-img-wrap img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: uset;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .hero-copy {
            max-width: 100%;
            text-align: center;
            margin: 0 auto;
          }

          .hero-btns {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .hero-shell {
            padding: 100px 20px 70px;
            min-height: auto;
          }

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
          .contact-grid,
          .value-grid {
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
            gap: 14px !important;
          }

          .event-img-wrap img {
            height: 210px;
          }
        }

        @media (max-width: 520px) {
          .trust-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-badges {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section className="hero-shell">
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              width: 760,
              height: 760,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(26,60,94,0.45) 0%, transparent 65%)',
              top: '-15%',
              left: '-10%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 540,
              height: 540,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(46,117,182,0.18) 0%, transparent 65%)',
              bottom: '-5%',
              right: '-6%',
            }}
          />
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(46,117,182,0.1)',
                border: '1px solid rgba(46,117,182,0.25)',
                borderRadius: 50,
                padding: '7px 18px',
                marginBottom: 24,
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
                lineHeight: 1.06,
                color: '#fff',
                margin: '0 0 18px',
              }}
            >
              Discover, reserve, and enjoy
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #2E75B6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                unforgettable nights
              </span>
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.56)',
                fontSize: 'clamp(14px, 2vw, 17px)',
                lineHeight: 1.9,
                maxWidth: 590,
                margin: '0 0 34px',
              }}
            >
              TicketHub helps people find upcoming concerts, VIP parties, and nightlife events in Egypt with a clearer booking flow, stronger trust, and a smoother path from discovery to entry.
            </p>

            <div className="hero-btns">
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
                Browse Events →
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, fontWeight: 700, letterSpacing: '2px', marginBottom: 8 }}>
                  WHY TICKETHUB
                </div>
                <h3 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, margin: 0 }}>
                  Clearer booking. Better trust.
                </h3>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'rgba(46,117,182,0.12)',
                  border: '1px solid rgba(46,117,182,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, margin: '0 0 18px' }}>
              Built for premium events, nightlife experiences, and modern reservations with a more guided experience for both new and returning users.
            </p>

            <div className="hero-badges">
              {[
                { title: 'Fast discovery', sub: 'Browse upcoming events quickly' },
                { title: 'Trusted flow', sub: 'Clear steps from booking to payment' },
                { title: 'Real history', sub: 'Past events build confidence' },
                { title: 'Mobile ready', sub: 'Optimized for phone, tablet, and desktop' },
              ].map(item => (
                <div
                  key={item.title}
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    padding: '16px 14px',
                  }}
                >
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12.5, lineHeight: 1.6 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="section-pad" style={{ paddingBottom: 88, maxWidth: 1200, margin: '-6px auto 0' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 18px 44px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>TRUST & CLARITY</span>
            <h2
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 28px)',
                color: '#fff',
                margin: '10px 0 10px',
              }}
            >
              A smoother and more trusted booking experience
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.46)', fontSize: 14, lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
              TicketHub is designed to make event discovery, reservation, and follow-up clearer for users who want speed, confidence, and fewer confusing steps.
            </p>
          </div>

          <div className="trust-grid" style={{ marginBottom: 24 }}>
            {[
              { title: 'Secure Booking', sub: 'Protected reservation experience' },
              { title: 'Official Tickets', sub: 'Verified event access flow' },
              { title: 'QR Gate Entry', sub: 'Fast check-in readiness' },
              { title: 'Live Support', sub: 'Clear support channels' },
              { title: 'Trusted Platform', sub: 'Built for real nightlife demand' },
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
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(46,117,182,0.04)'
                  el.style.borderColor = 'rgba(46,117,182,0.2)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(255,255,255,0.02)'
                  el.style.borderColor = 'rgba(255,255,255,0.05)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)' }}>
              <span>Secure reservations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)' }}>
              <span>Clear payment follow-up</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)' }}>
              <span>Designed for premium live experiences</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
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
            {featured.map(e => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <section className="section-pad" style={{ paddingBottom: 90, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>UPCOMING</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 10px' }}>
              Don&apos;t Miss Out
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.8, maxWidth: 600, margin: 0 }}>
              Browse upcoming nights and discover the next event worth planning for.
            </p>
          </div>

          <div className="grid-3">
            {upcoming.map(e => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* VALUE SECTION */}
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
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>WHY THIS PLATFORM</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 10px' }}>
              Built to make nightlife booking clearer
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.8, maxWidth: 640, margin: 0 }}>
              Instead of leaving users confused after booking, TicketHub is moving toward a clearer experience with stronger guidance, cleaner visuals, and a more consistent flow across the whole platform.
            </p>
          </div>

          <div className="value-grid">
            {[
              {
                title: 'Clear Booking Journey',
                desc: 'From selecting the event to understanding reservation status, every step should feel easier to follow.',
              },
              {
                title: 'Better Trust Signals',
                desc: 'Stronger trust badges, clearer wording, and better structure reduce hesitation during booking.',
              },
              {
                title: 'Smoother Navigation',
                desc: 'Users should always know where to go next, whether they are browsing events or checking details.',
              },
              {
                title: 'Responsive Everywhere',
                desc: 'The platform is being shaped to feel smooth on phone, tablet, and desktop without awkward gaps.',
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
          <div style={{ marginBottom: 40 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>EXPERIENCE HISTORY</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 0' }}>
              Previously on TicketHub
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 15, margin: '12px 0 0', lineHeight: 1.8, maxWidth: 620 }}>
              A look at recent experiences hosted through TicketHub, helping new visitors understand the kind of nights, quality, and atmosphere the platform is built for.
            </p>
          </div>

          <div className="grid-3">
            {past.map(e => (
              <EventCard key={e.id} event={e} isPast />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY */}
      {!loading && featured.length === 0 && upcoming.length === 0 && past.length === 0 && (
        <section style={{ padding: '120px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              margin: '0 auto 18px',
              background: 'rgba(46,117,182,0.12)',
              border: '1px solid rgba(46,117,182,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            +
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 26, marginBottom: 10 }}>Events Coming Soon</h2>
          <p style={{ color: 'rgba(255,255,255,0.34)', marginTop: 0, fontSize: 15, lineHeight: 1.8 }}>
            New nights are being prepared. Check back soon for upcoming events and reservations.
          </p>
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
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '10px 0 10px' }}>
              Book in 3 Simple Steps
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.8, maxWidth: 580, margin: '0 auto' }}>
              A simple path from finding the event to getting ready for the night.
            </p>
          </div>

          <div className="grid-steps">
            {[
              { n: '01', title: 'Pick Your Event', desc: 'Browse upcoming concerts, parties, and premium nightlife experiences.' },
              { n: '02', title: 'Reserve & Follow Payment Steps', desc: 'Choose your ticket and complete the reservation details with clear next steps.' },
              { n: '03', title: 'Get Ready for Entry', desc: 'Receive your reservation outcome and prepare for gate access with a smoother flow.' },
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

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'rgba(46,117,182,0.12)',
                    border: '1px solid rgba(46,117,182,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  {item.n}
                </div>

                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff', margin: '0 0 10px' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-pad" style={{ paddingTop: 90, paddingBottom: 90, borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>ABOUT US</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 18px' }}>
            Built for better event discovery
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: 1.95, marginBottom: 14 }}>
            TicketHub is Egypt&apos;s platform for live events, concerts, VIP parties, and nightlife experiences, with a stronger focus on clarity, smoother booking, and a better user journey.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.34)', fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.9, margin: 0 }}>
            The goal is to make every step easier to understand, from browsing and reservation to follow-up and event readiness.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-pad" style={{ paddingTop: 90, paddingBottom: 90, borderTop: '1px solid rgba(46,117,182,0.08)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>GET IN TOUCH</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: '12px 0 18px' }}>
            Need help or have a question?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 36px' }}>
            Reach out through the official TicketHub channels for updates, support, and reservation guidance.
          </p>

          <div className="contact-grid">
            {[
              { href: 'https://instagram.com/_tickethub', label: 'INSTAGRAM', value: '@_tickethub', hoverColor: '#E1306C' },
              { href: 'https://wa.me/201093379437', label: 'WHATSAPP', value: '+20 109 337 9437', hoverColor: '#25D366' },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(46,117,182,0.1)',
                    borderRadius: 16,
                    padding: '28px 20px',
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
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      margin: '0 auto 14px',
                      background: 'rgba(46,117,182,0.12)',
                      border: '1px solid rgba(46,117,182,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60a5fa',
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    ↗
                  </div>
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
      <footer style={{ borderTop: '1px solid rgba(46,117,182,0.08)', padding: '44px 24px', textAlign: 'center', background: '#070b18' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            T
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 17 }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </div>

        <div className="footer-links">
          {[
            { href: '/events', label: 'Events' },
            { href: '#about', label: 'About' },
            { href: '#contact', label: 'Contact' },
            { href: '/auth/login', label: 'Login' },
            { href: '/auth/register', label: 'Sign Up' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.24)', fontSize: 13 }}>
              {l.label}
            </Link>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12, margin: 0 }}>
          © {new Date().getFullYear()} TicketHub. All rights reserved.
        </p>
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
            <div
              style={{
                height: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              EVENT
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
              minWidth: 44,
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

        <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 8px', lineHeight: 1.35 }}>
              {event.title}
            </h3>

            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Location</span>
              <span style={{ color: 'rgba(255,255,255,0.26)' }}>•</span>
              <span>{event.location}</span>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Time</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span>{time}</span>
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
            {isPast ? 'View Details' : 'Book Now'}
          </div>
        </div>
      </div>
    </Link>
  )
}