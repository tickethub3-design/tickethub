'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/'), 4000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* BG Orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(39,174,96,0.08) 0%, transparent 65%)', top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.08) 0%, transparent 65%)', bottom: '-5%', right: '-5%' }} />
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
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>✅</div>

          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: '#27AE60', margin: '0 0 10px', letterSpacing: '1px' }}>
            Account Created!
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
            Your TicketHub account has been created successfully. You'll be redirected to the home page in a few seconds.
          </p>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 28, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #27AE60, rgba(39,174,96,0.3))',
              animation: 'progress 4s linear forwards',
              width: '0%',
            }} />
          </div>

          <style>{`
            @keyframes progress {
              from { width: 0% }
              to   { width: 100% }
            }
          `}</style>

          <Link href="/" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 50, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', boxShadow: '0 6px 20px rgba(46,117,182,0.3)' }}>
            Go to Home →
          </Link>

          <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.15)', fontSize: 11, letterSpacing: '2px' }}>
            REDIRECTING IN 4 SECONDS...
          </p>
        </div>
      </div>
    </main>
  )
}