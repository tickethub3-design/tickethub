'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

export default function Footer() {
  const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.32)',
    fontSize: 13,
    transition: 'color 0.2s ease',
  }

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(46,117,182,0.08)',
        padding: '48px 24px 32px',
        textAlign: 'center',
        background: '#070b18',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            🎟️
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 17 }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          {[
            { href: '/events', label: 'Browse Events' },
            { href: '/#about', label: 'About Us' },
            { href: '/#contact', label: 'Contact' },
            { href: '/auth/login', label: 'Sign In' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={linkStyle}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.32)'
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, margin: 0 }}>
          © {new Date().getFullYear()} TicketHub — Egypt's Premier Nightlife Booking Platform. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
