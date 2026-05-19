'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useParams } from 'next/navigation'

const typeConfig: Record<string, { color: string; bg: string; border: string; label: string; accent: string }> = {
  single: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'SINGLE', accent: '#3b82f6' },
  standing: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'STANDING', accent: '#22c55e' },
  backstage: { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', label: 'BACKSTAGE', accent: '#a855f7' },
  vip: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'VIP', accent: '#f59e0b' },
}

export default function TicketPage() {
  const params = useParams<{ qr_code: string }>()
  const qr_code = params.qr_code

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!qr_code) return

    const load = async () => {
      const { data } = await supabase
        .from('tickets')
        .select(
          `*, events (title, date, location, image_url), reservations (full_name, name, phone, email, instagram, total, total_price)`
        )
        .eq('qr_code', qr_code)
        .single()

      setTicket(data || null)
      setLoading(false)

      if (data?.qr_code && typeof window !== 'undefined') {
        const ticketUrl = `${window.location.origin}/ticket/${data.qr_code}`
        const url = await QRCode.toDataURL(ticketUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#1e293b', light: '#ffffff' },
        })
        setQrUrl(url)
      }
    }

    load()

    const handleFocus = () => load()
    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [qr_code])

  const handleDownloadPDF = async () => {
    const el = ticketRef.current
    if (!el) return

    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width / 3, canvas.height / 3],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
    pdf.save(`ticket-${ticket?.holder_name?.replace(/\s+/g, '-')}-#${ticket?.ticket_number}.pdf`)
  }

  if (loading)
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ color: '#94a3b8', letterSpacing: '3px', fontSize: 12 }}>LOADING...</p>
      </main>
    )

  if (!ticket)
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>❌</p>
          <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 700, letterSpacing: '2px' }}>TICKET NOT FOUND</p>
          <Link
            href="/profile"
            style={{ display: 'inline-block', marginTop: 20, color: '#64748b', fontSize: 13, textDecoration: 'none' }}
          >
            ← Back to Profile
          </Link>
        </div>
      </main>
    )

  const tc = typeConfig[ticket.ticket_type] || typeConfig.single
  const eventImage = ticket.events?.image_url
  const totalAmount = ticket.reservations?.total || ticket.reservations?.total_price || 0
  const instagram = ticket.holder_instagram || ticket.reservations?.instagram
  const phone = ticket.holder_phone || ticket.reservations?.phone || '—'
  const holderName = ticket.holder_name || ticket.reservations?.full_name || ticket.reservations?.name || '—'
  const eventDate = ticket.events?.date
    ? new Date(ticket.events.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'TBA'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        fontFamily: 'Inter, sans-serif',
        padding: '48px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
          }}
        >
          🎟️
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff' }}>
          Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
        </span>
      </Link>

      <div
        ref={ticketRef}
        style={{
          width: '100%',
          maxWidth: 780,
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 260,
        }}
      >
        <div style={{ width: 240, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {eventImage ? (
            <img src={eventImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)' }} />
          )}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)' }} />

          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: tc.bg,
              border: `1px solid ${tc.border}`,
              color: tc.color,
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '1.5px',
            }}
          >
            {tc.label}
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px 18px' }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, letterSpacing: '3px', fontWeight: 700, margin: '0 0 5px' }}>EVENT</p>
            <h2
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                margin: '0 0 8px',
                lineHeight: 1.25,
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {ticket.events?.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, margin: '0 0 3px', fontWeight: 600 }}>📅 {eventDate}</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, margin: 0, fontWeight: 600 }}>📍 {ticket.events?.location}</p>
          </div>
        </div>

        <div style={{ width: 1, borderLeft: '2px dashed #e2e8f0', position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              top: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            }}
          />
        </div>

        <div style={{ flex: 1, padding: '24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: tc.color, fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 13 }}>
                  #{String(ticket.ticket_number).padStart(2, '0')}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>TICKET NO.</p>
            </div>

            <div
              style={{
                background: ticket.checked_in ? '#f0fdf4' : '#f0f9ff',
                border: `1px solid ${ticket.checked_in ? '#bbf7d0' : '#bae6fd'}`,
                borderRadius: 999,
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: ticket.checked_in ? '#22c55e' : '#38bdf8',
                }}
              />
              <span
                style={{
                  color: ticket.checked_in ? '#15803d' : '#0369a1',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                }}
              >
                {ticket.checked_in ? 'CHECKED IN' : 'VALID'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#94a3b8', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>TICKET HOLDER</p>
            <p
              style={{
                color: '#0f172a',
                fontSize: 19,
                fontWeight: 900,
                fontFamily: 'Poppins, sans-serif',
                margin: 0,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              {holderName}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'PHONE', value: phone },
              { label: 'TYPE', value: tc.label, color: tc.color },
              { label: 'AMOUNT', value: `${totalAmount} EGP` },
              {
                label: 'CHECK-IN',
                value: ticket.checked_in
                  ? new Date(ticket.checked_in_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—',
              },
            ].map(item => (
              <div key={item.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #f1f5f9' }}>
                <p style={{ color: '#94a3b8', fontSize: 8, letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 3px' }}>{item.label}</p>
                <p style={{ color: (item as any).color || '#1e293b', fontSize: 12, fontWeight: 700, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 8,
                border: '1px solid #fbcfe8',
                background: '#fdf2f8',
                color: '#db2777',
                fontSize: 10,
                fontWeight: 700,
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              📸 {instagram.replace('https://www.instagram.com/', '@').replace('https://instagram.com/', '@')}
            </a>
          )}
        </div>

        <div style={{ width: 1, borderLeft: '2px dashed #e2e8f0', position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              top: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -13,
              left: -13,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            }}
          />
        </div>

        <div
          style={{
            width: 170,
            flexShrink: 0,
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 14px',
            gap: 10,
          }}
        >
          <p style={{ color: '#94a3b8', fontSize: 8, letterSpacing: '2.5px', fontWeight: 700, margin: 0, textAlign: 'center' }}>
            SCAN AT ENTRANCE
          </p>

          {qrUrl ? (
            <img src={qrUrl} alt="QR" style={{ width: 124, height: 124, borderRadius: 8, display: 'block' }} />
          ) : (
            <div style={{ width: 124, height: 124, background: '#e2e8f0', borderRadius: 8 }} />
          )}

          <p
            style={{
              color: '#cbd5e1',
              fontSize: 7,
              fontFamily: 'monospace',
              textAlign: 'center',
              margin: 0,
              wordBreak: 'break-all',
              lineHeight: 1.5,
              padding: '0 4px',
            }}
          >
            {qr_code.length > 22 ? qr_code.slice(0, 22) + '…' : qr_code}
          </p>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, width: '100%', textAlign: 'center' }}>
            <p style={{ color: '#cbd5e1', fontSize: 7, letterSpacing: '1px', margin: '0 0 2px' }}>POWERED BY</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 12, color: '#475569', margin: 0 }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
            color: '#fff',
            border: 'none',
            padding: '13px 28px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '1.5px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 6px 20px rgba(46,117,182,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ⬇️ Download PDF
        </button>

        <Link
          href="/profile"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '13px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← My Profile
        </Link>
      </div>
    </main>
  )
}