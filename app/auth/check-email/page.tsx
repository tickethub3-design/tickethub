'use client'
import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* BG Orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.1) 0%, transparent 65%)', top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎟️</div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.2)', borderRadius: 24, padding: '40px 32px', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,117,182,0.1)', border: '1px solid rgba(46,117,182,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 20px' }}>
            📧
          </div>

          <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
            Check Your Email
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, margin: '0 0 10px' }}>
            We sent a confirmation link to your email address.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, lineHeight: 1.7, margin: '0 0 28px' }}>
            Open your inbox, click the confirmation link, then come back and sign in to your account.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 24 }} />

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Already confirmed?{' '}
            <Link href="/auth/login" style={{ color: '#2E75B6', fontWeight: 700, textDecoration: 'none' }}>
              Go to Login →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}