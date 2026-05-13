'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Status = 'idle' | 'found' | 'notfound' | 'already'

const ticketTypeStyle: Record<string, { color: string; bg: string; border: string; label: string }> = {
  standing:  { color: '#27AE60', bg: 'rgba(39,174,96,0.1)',   border: 'rgba(39,174,96,0.3)',   label: 'STANDING' },
  backstage: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', label: 'BACKSTAGE' },
  vip:       { color: '#F0A500', bg: 'rgba(240,165,0,0.1)',   border: 'rgba(240,165,0,0.35)',  label: 'VIP' },
}

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scannerInstanceRef = useRef<any>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
    }
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const qr = params.get('qr_code')
    if (qr) { setCode(qr); verifyByQR(qr) }
  }, [])

  useEffect(() => {
    if (!scannerOpen) return
    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      scannerInstanceRef.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            console.log('RAW SCAN:', JSON.stringify(decodedText))

            let qrCode = decodedText.trim()

            if (qrCode.includes('/')) {
              const parts = qrCode.split('/')
              qrCode = parts[parts.length - 1]
            }

            qrCode = decodeURIComponent(qrCode).trim()

            console.log('EXTRACTED:', JSON.stringify(qrCode))

            if (!qrCode) return

            await scanner.stop().catch(() => {})
            setScannerOpen(false)

            if (typeof window !== 'undefined') {
              window.location.href = `/dashboard/verify?qr_code=${encodeURIComponent(qrCode)}`
            }
          },
          () => {},
        )
      } catch (err) {
        console.error('Camera error:', err)
        setScannerOpen(false)
      }
    }
    startScanner()
    return () => { scannerInstanceRef.current?.stop().catch(() => {}) }
  }, [scannerOpen])

  const verifyByQR = async (qrCode: string) => {
    const decoded = decodeURIComponent(qrCode).trim()
    console.log('SEARCHING FOR:', JSON.stringify(decoded))

    setLoading(true)
    setResult(null)
    setStatus('idle')

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id, reservation_id, event_id, user_id,
        holder_name, holder_phone, holder_instagram,
        ticket_type, ticket_number, qr_code,
        checked_in, checked_in_at, created_at,
        events (title, date, location),
        reservations (name, phone)
      `)
      .eq('qr_code', decoded)
      .single()

    console.log('DB RESULT:', data, 'ERROR:', error)

    if (error || !data) { setStatus('notfound'); setLoading(false); return }
    if (data.checked_in) { setResult(data); setStatus('already'); setLoading(false); return }
    setResult(data)
    setStatus('found')
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!code.trim()) return
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/verify?qr_code=${encodeURIComponent(code.trim())}`
    }
  }

  // ✅ handleCheckIn المُصلح
  const handleCheckIn = async () => {
    if (!result) return
    setLoading(true)

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('tickets')
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', result.id)

    if (error) {
      console.error('checkin error', error)
      setLoading(false)
      return
    }

    // ✅ حدّث الـ state مباشرة بدون ما نجيب البيانات تاني
    setResult({ ...result, checked_in: true, checked_in_at: now })
    setStatus('already')
    setLoading(false)

    // ✅ حدّث الـ Next.js cache عشان صفحة التذكرة والبروفايل يتحدثوا
    router.refresh()
  }

  const handleReset = () => {
    if (typeof window !== 'undefined') window.location.href = '/dashboard/verify'
  }

  const typeStyle = result ? (ticketTypeStyle[result.ticket_type] || ticketTypeStyle.standing) : null

  return (
    <main style={{ backgroundColor: '#0a0f1e', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: 0 }}>

      {/* BG Glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 30% 20%, rgba(46,117,182,0.12) 0, transparent 55%)' }} />

      {/* TOPBAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Verify Entry</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 50, padding: '5px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#27AE60', boxShadow: '0 0 8px rgba(39,174,96,0.8)', display: 'inline-block' }} />
            <span style={{ color: '#27AE60', fontSize: 10, fontWeight: 700, letterSpacing: '2px' }}>GATE LIVE</span>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>← Dashboard</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '80px 16px 40px' : '88px 24px 60px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>

        {/* ── LEFT: Controls ─────────────────────────────────────── */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>GATE CONTROL</span>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: isMobile ? 28 : 36, color: '#fff', margin: '8px 0 0', letterSpacing: '-1px' }}>Verify Entry</h1>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 8, lineHeight: 1.7, maxWidth: 380 }}>
              Scan ticket QR or enter code to validate entry in real time at the gate.
            </p>
          </div>

          {/* Scan Button Card */}
          <div style={{ borderRadius: 20, border: '1px solid rgba(46,117,182,0.2)', background: 'rgba(255,255,255,0.02)', padding: 20 }}>
            <button
              onClick={() => setScannerOpen(true)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: '#fff', padding: isMobile ? '16px' : '14px',
                borderRadius: 12, fontWeight: 700, fontSize: 13,
                border: 'none', letterSpacing: '2px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(46,117,182,0.3)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <span style={{ fontSize: 18 }}>📷</span> SCAN QR CODE
            </button>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 10 }}>
              Point camera at the ticket QR code to verify instantly
            </p>
          </div>

          {/* Manual Entry Card */}
          <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '2px' }}>MANUAL ENTRY</span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11 }}>TH-XXXX-XXXX</span>
            </div>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="TH-2K26-0001"
              style={{
                width: '100%', borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: isMobile ? '13px 16px' : '11px 14px',
                color: '#fff', fontSize: isMobile ? 16 : 14,
                outline: 'none', marginBottom: 10, boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif', letterSpacing: '1px',
              }}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              style={{
                width: '100%', borderRadius: 12,
                background: loading || !code.trim() ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
                color: loading || !code.trim() ? 'rgba(255,255,255,0.2)' : '#0a0f1e',
                padding: isMobile ? '13px' : '11px',
                fontSize: 12, fontWeight: 700, letterSpacing: '2px',
                border: `1px solid ${loading || !code.trim() ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >{loading ? 'CHECKING...' : 'VERIFY →'}</button>
          </div>
        </section>

        {/* ── RIGHT: Result ──────────────────────────────────────── */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Idle */}
          {status === 'idle' && (
            <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 36, margin: '0 0 12px' }}>🔍</p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Ready to scan — use camera or enter code manually</p>
              </div>
            </div>
          )}

          {/* Not Found */}
          {status === 'notfound' && (
            <div style={{ borderRadius: 20, border: '1px solid rgba(231,76,60,0.3)', background: 'rgba(231,76,60,0.05)', padding: 28 }}>
              <p style={{ fontSize: 32, margin: '0 0 12px' }}>❌</p>
              <p style={{ color: '#E74C3C', fontSize: 13, fontWeight: 700, letterSpacing: '2px', margin: '0 0 6px' }}>INVALID TICKET</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>QR code is not registered in the system.</p>
              <button onClick={handleReset} style={{ marginTop: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '2px', fontFamily: 'Inter, sans-serif' }}>RESET</button>
            </div>
          )}

          {/* Found / Already */}
          {status !== 'idle' && result && typeStyle && (
            <div style={{ borderRadius: 20, border: `1px solid ${status === 'found' ? 'rgba(39,174,96,0.3)' : status === 'already' ? 'rgba(240,165,0,0.3)' : 'rgba(255,255,255,0.06)'}`, background: `${status === 'found' ? 'rgba(39,174,96,0.04)' : status === 'already' ? 'rgba(240,165,0,0.04)' : 'rgba(255,255,255,0.02)'}`, padding: 24 }}>

              {/* Status Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{status === 'found' ? '✅' : status === 'already' ? '⚠️' : '❌'}</span>
                  <div>
                    <p style={{ color: status === 'found' ? '#27AE60' : status === 'already' ? '#F0A500' : '#E74C3C', fontSize: 14, fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif', letterSpacing: '1px' }}>
                      {status === 'found' ? 'VALID TICKET' : 'ALREADY CHECKED IN'}
                    </p>
                    {status === 'already' && result.checked_in_at && (
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '3px 0 0' }}>
                        Entered at {new Date(result.checked_in_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticket Type Badge */}
                <span style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.color, fontSize: 12, fontWeight: 800, padding: '6px 16px', borderRadius: 50, letterSpacing: '1.5px', fontFamily: 'Poppins, sans-serif' }}>
                  {typeStyle.label}
                </span>
              </div>

              {/* Event Info */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 6px' }}>EVENT</p>
                <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Poppins, sans-serif' }}>{result.events?.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 2px' }}>
                  {result.events?.date ? new Date(result.events.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>📍 {result.events?.location}</p>
              </div>

              {/* Holder + Ticket */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>

                {/* Holder */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>HOLDER</p>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{result.holder_name || result.reservations?.name || '—'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 8px' }}>📞 {result.holder_phone || result.reservations?.phone || '—'}</p>
                  {result.holder_instagram
                    ? <a href={result.holder_instagram} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(225,48,108,0.35)', background: 'rgba(225,48,108,0.08)', color: '#e1306c', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>📸 Instagram</a>
                    : <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, margin: 0 }}>No Instagram</p>
                  }
                </div>

                {/* Ticket */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${typeStyle.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>TICKET</p>
                  <p style={{ color: typeStyle.color, fontSize: 16, fontWeight: 800, margin: '0 0 4px', fontFamily: 'Poppins, sans-serif' }}>
                    #{String(result.ticket_number).padStart(2, '0')} · {typeStyle.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '0 0 4px', wordBreak: 'break-all', fontFamily: 'monospace' }}>{result.qr_code}</p>
                  <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, margin: 0 }}>
                    Issued: {result.created_at ? new Date(result.created_at).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {status === 'found' && (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  style={{
                    width: '100%', background: 'linear-gradient(135deg, #1a5c2e, #27AE60)',
                    color: '#fff', padding: isMobile ? '15px' : '13px',
                    borderRadius: 12, fontSize: 13, fontWeight: 700,
                    letterSpacing: '2px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10,
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 6px 20px rgba(39,174,96,0.3)',
                  }}
                >{loading ? 'CHECKING IN...' : '✅ CONFIRM ENTRY'}</button>
              )}

              <button
                onClick={handleReset}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', padding: isMobile ? '13px' : '11px', borderRadius: 12, fontSize: 12, fontWeight: 600, letterSpacing: '2px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >SCAN NEXT TICKET</button>
            </div>
          )}
        </section>
      </div>

      {/* Scanner Overlay */}
      {scannerOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, zIndex: 200 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '3px', margin: 0 }}>SCANNING...</p>
          </div>
          <div style={{ borderRadius: 24, border: '1px solid rgba(46,117,182,0.5)', background: 'rgba(10,15,30,0.9)', padding: 16, boxShadow: '0 20px 60px rgba(46,117,182,0.2)' }}>
            <div
              id="qr-reader"
              style={{
                width: isMobile ? Math.min(window.innerWidth - 80, 280) : 260,
                height: isMobile ? Math.min(window.innerWidth - 80, 280) : 260,
                borderRadius: 16, overflow: 'hidden',
                border: '2px solid rgba(46,117,182,0.4)',
                backgroundColor: '#000',
              }}
            />
          </div>
          <button
            onClick={() => { scannerInstanceRef.current?.stop().catch(() => {}); setScannerOpen(false) }}
            style={{ padding: '10px 32px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >CLOSE</button>
        </div>
      )}
    </main>
  )
}