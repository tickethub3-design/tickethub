'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TicketType {
  color: string
  bg: string
  border: string
  label: string
  accent: string
  glow: string
  icon: string
}

const typeConfig: Record<string, TicketType> = {
  guest:     { color: '#db2777', bg: 'rgba(219,39,119,0.08)',  border: 'rgba(219,39,119,0.2)',  label: 'GUEST LIST', accent: '#ec4899', glow: 'rgba(236,72,153,0.25)',  icon: '★' },
  single:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  label: 'SINGLE',     accent: '#60a5fa', glow: 'rgba(96,165,250,0.25)',  icon: '◆' },
  standing:  { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   label: 'STANDING',   accent: '#4ade80', glow: 'rgba(74,222,128,0.25)',  icon: '▲' },
  backstage: { color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)',  label: 'BACKSTAGE',  accent: '#c084fc', glow: 'rgba(192,132,252,0.25)', icon: '⬟' },
  vip:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'VIP',        accent: '#fbbf24', glow: 'rgba(251,191,36,0.3)',   icon: '♛' },
}

function LoadingScreen() {
  return (
    <div className="tp-root">
      <style>{STYLES}</style>
      <div className="tp-loading">
        <div className="tp-loading-ring" />
        <p className="tp-loading-text">Loading ticket…</p>
      </div>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="tp-root">
      <style>{STYLES}</style>
      <div className="tp-nf">
        <div className="tp-nf-icon">✕</div>
        <h2 className="tp-nf-title">Ticket Not Found</h2>
        <p className="tp-nf-sub">This QR code doesn&apos;t match any ticket in our system.</p>
        <Link href="/profile" className="tp-nf-back">← Back to Profile</Link>
      </div>
    </div>
  )
}

export default function TicketPage() {
  const params  = useParams<{ qr_code: string }>()
  const qr_code = params.qr_code

  const [ticket,    setTicket]    = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [qrUrl,     setQrUrl]     = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [copied,    setCopied]    = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!qr_code) return
    const load = async () => {
      const { data } = await supabase
        .from('tickets')
        .select(`*, events (title, date, location, image_url), reservations (full_name, name, phone, email, instagram, total, total_price)`)
        .eq('qr_code', qr_code)
        .single()

      setTicket(data || null)
      setLoading(false)

      if (data?.qr_code && typeof window !== 'undefined') {
        const url = `${window.location.origin}/ticket/${data.qr_code}`
        setTicketUrl(url)
        const qr = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
        })
        setQrUrl(qr)
      }
    }

    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [qr_code])

  const handleDownloadPDF = async () => {
    const el = ticketRef.current
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const jsPDF       = (await import('jspdf')).default
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#08090f' })
    const img    = canvas.toDataURL('image/png')
    const pdf    = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 3, canvas.height / 3],
    })
    pdf.addImage(img, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
    pdf.save(`ticket-${holderName.replace(/\s+/g, '-')}-${ticketNumber}.pdf`)
  }

  const handleCopy = async () => {
    if (!ticketUrl) return
    try {
      await navigator.clipboard.writeText(ticketUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  if (loading) return <LoadingScreen />
  if (!ticket)  return <NotFoundScreen />

  const tc           = typeConfig[ticket.ticket_type] ?? typeConfig.single
  const isGuest      = ticket.ticket_type === 'guest'
  const isVip        = ticket.ticket_type === 'vip'
  const eventImage   = ticket.events?.image_url ?? null
  const holderName   = ticket.holder_name      || ticket.reservations?.full_name || ticket.reservations?.name || ticket.full_name || '—'
  const phone        = ticket.holder_phone     || ticket.reservations?.phone     || ticket.phone              || '—'
  const email        = ticket.holder_email     || ticket.reservations?.email     || ticket.email              || null
  const instagram    = ticket.holder_instagram || ticket.reservations?.instagram || ticket.instagram          || null
  const totalAmount  = isGuest ? 0 : (ticket.reservations?.total || ticket.reservations?.total_price || ticket.price_paid || 0)
  const ticketNumber = String(ticket.ticket_number || 0).padStart(3, '0')

  const eventDate = ticket.events?.date
    ? new Date(ticket.events.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      })
    : 'TBA'

  const eventDateShort = ticket.events?.date
    ? new Date(ticket.events.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      })
    : 'TBA'

  const checkinTime = ticket.checked_in && ticket.checked_in_at
    ? new Date(ticket.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null

  const igHandle = instagram
    ? instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')
    : null

  const detailCells: { label: string; value: string; color?: string }[] = [
    { label: 'PHONE',                            value: phone },
    { label: 'TYPE',                             value: tc.label,     color: tc.accent },
    { label: isGuest ? 'ACCESS' : 'AMOUNT PAID', value: isGuest ? 'FREE ACCESS' : `${Number(totalAmount).toLocaleString()} EGP` },
    { label: 'CHECK-IN',                         value: checkinTime ?? '—', color: checkinTime ? '#4ade80' : undefined },
  ]

  return (
    <div className="tp-root" ref={ticketRef}>
      <style>{STYLES}</style>

      {/* Hero background */}
      <div className="tp-hero-bg" aria-hidden="true">
        {eventImage
          ? <img src={eventImage} alt="" className="tp-hero-img" />
          : <div className="tp-hero-fallback" style={{ background: `radial-gradient(ellipse at 30% 40%, ${tc.glow} 0%, transparent 60%), linear-gradient(160deg,#0d1117 0%,#1a1f35 100%)` }} />
        }
        <div className="tp-hero-overlay" />
        <div className="tp-hero-blur" />
      </div>

      {/* Header */}
      <header className="tp-header">
        <Link href="/" className="tp-logo">
          <div className="tp-logo-icon">🎟️</div>
          <span className="tp-logo-text">Ticket<em>Hub</em></span>
        </Link>
        <Link href="/profile" className="tp-header-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          My Tickets
        </Link>
      </header>

      <main className="tp-main">

        {/* ══ CARD ══ */}
        <div
          className="tp-card"
          style={{
            '--accent':        tc.accent,
            '--accent-bg':     tc.bg,
            '--accent-border': tc.border,
            '--glow':          tc.glow,
          } as React.CSSProperties}
        >
          {isVip && <div className="tp-vip-strip" />}

          {/* ── Image panel ── */}
          {/*
            KEY FIX:
            Mobile/Tablet → tp-card-image-wrap has aspect-ratio: 16/9, no fixed height.
              The <img> inside is position:absolute inset:0 w:100% h:100% object-fit:cover.
            Desktop (768px+) → tp-card is display:grid 2-col.
              tp-card-image-wrap gets align-self:stretch + height:unset, so it fills the row height.
              The <img> stays absolute inset:0 100%×100% — works perfectly.
          */}
          <div className="tp-card-image-wrap">
            {eventImage
              ? <img src={eventImage} alt={ticket.events?.title ?? 'Event'} className="tp-card-image" />
              : <div className="tp-card-image-fallback" style={{ background: `linear-gradient(160deg, #1a2035 0%, ${tc.accent}22 100%)` }} />
            }
            <div className="tp-card-image-shade" />

            <div className="tp-type-badge" style={{ color: tc.accent, borderColor: tc.border, background: tc.bg }}>
              <span className="tp-type-badge-dot" style={{ background: tc.accent }} />
              {tc.icon} {tc.label}
            </div>

            <div className="tp-card-image-number" style={{ color: tc.accent }}>
              #{ticketNumber}
            </div>
          </div>

          {/* ── Card body ── */}
          <div className="tp-card-body">

            <div className="tp-card-top">
              <div className="tp-ticket-num-row">
                <span className="tp-ticket-num-label">TICKET</span>
                <span className="tp-ticket-num-val" style={{ color: tc.accent }}>#{ticketNumber}</span>
              </div>
              <div
                className="tp-status-pill"
                style={{
                  background: ticket.checked_in ? 'rgba(34,197,94,0.1)'  : 'rgba(56,189,248,0.1)',
                  border:     `1px solid ${ticket.checked_in ? 'rgba(34,197,94,0.3)' : 'rgba(56,189,248,0.3)'}`,
                  color:      ticket.checked_in ? '#4ade80' : '#7dd3fc',
                }}
              >
                <span className="tp-status-dot" style={{ background: ticket.checked_in ? '#22c55e' : '#38bdf8' }} />
                {ticket.checked_in ? 'CHECKED IN' : 'VALID'}
              </div>
            </div>

            <div className="tp-event-block">
              <p className="tp-event-meta-label">EVENT</p>
              <h1 className="tp-event-name">{ticket.events?.title ?? '—'}</h1>
              <div className="tp-event-meta-row">
                <span className="tp-event-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="tp-event-date-full">{eventDate}</span>
                  <span className="tp-event-date-short">{eventDateShort}</span>
                </span>
                {ticket.events?.location && (
                  <span className="tp-event-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {ticket.events.location}
                  </span>
                )}
              </div>
            </div>

            <div className="tp-divider" />

            <div className="tp-holder-block">
              <p className="tp-field-label">{isGuest ? 'GUEST NAME' : 'TICKET HOLDER'}</p>
              <p className="tp-holder-name">{holderName}</p>
            </div>

            <div className="tp-details-grid">
              {detailCells.map(item => (
                <div key={item.label} className="tp-detail-cell">
                  <p className="tp-field-label">{item.label}</p>
                  <p className="tp-field-val" style={{ color: item.color ?? 'rgba(255,255,255,0.85)' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {(email || igHandle) && (
              <div className="tp-contacts">
                {email && (
                  <div className="tp-contact-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 8l10 6 10-6" />
                    </svg>
                    <span>{email}</span>
                  </div>
                )}
                {igHandle && (
                  <a
                    href={instagram?.startsWith('http') ? instagram : `https://instagram.com/${igHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="tp-contact-item tp-ig-link"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                    <span>{igHandle}</span>
                  </a>
                )}
              </div>
            )}

            <div className="tp-divider" />

            {/* QR — centered large */}
            <div className="tp-qr-center-block">
              <p className="tp-qr-eyebrow">SCAN AT ENTRANCE</p>
              <div className="tp-qr-frame">
                {qrUrl
                  ? <img src={qrUrl} alt="Ticket QR Code" className="tp-qr-big-img" />
                  : <div className="tp-qr-placeholder" />
                }
                <div className="tp-qr-corner tl" style={{ borderColor: tc.accent }} />
                <div className="tp-qr-corner tr" style={{ borderColor: tc.accent }} />
                <div className="tp-qr-corner bl" style={{ borderColor: tc.accent }} />
                <div className="tp-qr-corner br" style={{ borderColor: tc.accent }} />
              </div>
              <p className="tp-qr-hint">Present this QR code to event staff</p>
              <p className="tp-qr-code-str">
                {qr_code.length > 32 ? `${qr_code.slice(0, 32)}…` : qr_code}
              </p>
            </div>

          </div>
        </div>

        {/* ══ ACTIONS ══ */}
        <div className="tp-actions">
          {ticketUrl && (
            <div className="tp-share-box">
              <p className="tp-share-label">SHARE TICKET LINK</p>
              <div className="tp-share-row">
                <span className="tp-share-url">{ticketUrl}</span>
                <button onClick={handleCopy} className={`tp-copy-btn${copied ? ' copied' : ''}`}>
                  {copied ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="tp-btn-row">
            <button onClick={handleDownloadPDF} className="tp-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <Link href="/profile" className="tp-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              My Tickets
            </Link>
          </div>
        </div>

        <footer className="tp-footer">
          <span className="tp-footer-logo">Ticket<em>Hub</em></span>
          <span className="tp-footer-sep">·</span>
          <span>Your ticket to every moment</span>
        </footer>

      </main>
    </div>
  )
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tp-root {
    min-height: 100vh;
    position: relative;
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
    background: #08090f;
    overflow-x: hidden;
  }

  /* ── Hero BG ── */
  .tp-hero-bg {
    position: fixed; inset: 0; z-index: 0;
    pointer-events: none; overflow: hidden;
  }
  .tp-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center center;
    display: block;
    filter: saturate(0.55) brightness(0.28);
  }
  .tp-hero-fallback { position: absolute; inset: 0; width: 100%; height: 100%; }
  .tp-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(8,9,15,0.5)  0%,
      rgba(8,9,15,0.25) 25%,
      rgba(8,9,15,0.7)  70%,
      rgba(8,9,15,0.97) 100%
    );
  }
  .tp-hero-blur {
    position: absolute; inset: 0;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  /* ── Header ── */
  .tp-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 16px;
    max-width: 760px; margin: 0 auto; width: 100%;
  }
  .tp-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .tp-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #1a3c5e, #2e75b6);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(46,117,182,0.4);
  }
  .tp-logo-text {
    font-family: 'Poppins', sans-serif;
    font-weight: 800; font-size: 18px;
    color: #f1f5f9; letter-spacing: -0.3px;
  }
  .tp-logo-text em { color: #2e75b6; font-style: normal; }
  .tp-header-back {
    display: flex; align-items: center; gap: 5px;
    color: rgba(255,255,255,0.45); font-size: 12px; font-weight: 600;
    text-decoration: none; padding: 7px 14px;
    border-radius: 999px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    transition: background 0.18s, color 0.18s;
  }
  .tp-header-back:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.75); }

  /* ── Main ── */
  .tp-main {
    position: relative; z-index: 5;
    max-width: 760px; margin: 0 auto;
    padding: 0 16px 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* ══ CARD ══ */
  .tp-card {
    background: rgba(15,18,28,0.78);
    backdrop-filter: blur(28px) saturate(1.5);
    -webkit-backdrop-filter: blur(28px) saturate(1.5);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04),
      0 24px 64px rgba(0,0,0,0.55),
      0 4px 12px rgba(0,0,0,0.3);
    /* flex column by default (mobile/tablet) */
    display: flex;
    flex-direction: column;
  }

  .tp-vip-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 2.5px; z-index: 3;
    background: linear-gradient(90deg, #b45309, #fbbf24, #fde68a, #fbbf24, #b45309);
    background-size: 300% 100%;
    animation: vip-shimmer 3s linear infinite;
  }
  @keyframes vip-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /*
   * ── IMAGE WRAP ──
   * Mobile/Tablet: aspect-ratio drives the height — image always shows full 16:9
   * Desktop: align-self:stretch makes it fill grid row height automatically
   */
  .tp-card-image-wrap {
    position: relative;
    width: 100%;
    /* aspect-ratio gives the container natural height on mobile/tablet */
    aspect-ratio: 16 / 9;
    flex-shrink: 0;
    overflow: hidden;
  }
  /* The actual <img> fills the container absolutely — works for both layouts */
  .tp-card-image {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
  }
  .tp-card-image-fallback {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
  }
  .tp-card-image-shade {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(
      to bottom,
      rgba(15,18,28,0.0)  0%,
      rgba(15,18,28,0.3)  55%,
      rgba(15,18,28,0.85) 100%
    );
  }

  .tp-type-badge {
    position: absolute; top: 14px; left: 14px; z-index: 2;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 999px; border: 1px solid;
    font-size: 9px; font-weight: 800; letter-spacing: 1.8px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .tp-type-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  .tp-card-image-number {
    display: none;
    position: absolute; bottom: 14px; right: 14px; z-index: 2;
    font-family: 'Poppins', sans-serif;
    font-weight: 900; font-size: 20px; letter-spacing: -1px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  }

  /* ── Card body ── */
  .tp-card-body {
    padding: 22px 18px 28px;
    display: flex; flex-direction: column; gap: 18px;
    flex: 1; /* fills remaining height on desktop */
  }

  .tp-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .tp-ticket-num-row { display: flex; align-items: baseline; gap: 6px; }
  .tp-ticket-num-label { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: rgba(255,255,255,0.3); }
  .tp-ticket-num-val { font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }

  .tp-status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 999px;
    font-size: 9px; font-weight: 800; letter-spacing: 1.5px; flex-shrink: 0;
  }
  .tp-status-dot { width: 6px; height: 6px; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

  .tp-event-block { display: flex; flex-direction: column; gap: 8px; }
  .tp-event-meta-label { font-size: 8px; font-weight: 700; letter-spacing: 3px; color: rgba(255,255,255,0.3); }
  .tp-event-name {
    font-family: 'Poppins', sans-serif; font-weight: 900;
    font-size: clamp(20px, 5vw, 26px); line-height: 1.1;
    letter-spacing: -0.5px; color: #f1f5f9;
  }
  .tp-event-meta-row { display: flex; flex-direction: column; gap: 5px; }
  .tp-event-meta-item {
    display: flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;
  }
  .tp-event-meta-item svg { flex-shrink: 0; }
  .tp-event-date-short { display: none; }
  .tp-event-date-full  { display: inline; }

  .tp-divider {
    height: 1px; flex-shrink: 0;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
  }

  .tp-holder-block { display: flex; flex-direction: column; gap: 4px; }
  .tp-field-label { font-size: 8px; font-weight: 700; letter-spacing: 2.5px; color: rgba(255,255,255,0.3); margin-bottom: 2px; }
  .tp-holder-name {
    font-family: 'Poppins', sans-serif; font-weight: 900;
    font-size: clamp(22px, 5.5vw, 30px);
    letter-spacing: -0.5px; color: #fff; line-height: 1.1; word-break: break-word;
  }

  .tp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .tp-detail-cell {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 10px 12px; min-width: 0;
  }
  .tp-field-val { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .tp-contacts { display: flex; flex-direction: column; gap: 6px; }
  .tp-contact-item {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11.5px; font-weight: 500;
    color: rgba(255,255,255,0.45); text-decoration: none;
  }
  .tp-contact-item svg { flex-shrink: 0; opacity: 0.6; }
  .tp-ig-link { color: rgba(236,72,153,0.8); transition: color 0.18s; }
  .tp-ig-link:hover { color: #ec4899; }
  .tp-ig-link svg { opacity: 1; }

  /* ── QR block ── */
  .tp-qr-center-block {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 16px 16px 4px;
  }
  .tp-qr-eyebrow { font-size: 9px; font-weight: 800; letter-spacing: 3px; color: rgba(255,255,255,0.35); text-align: center; }
  .tp-qr-frame { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
  .tp-qr-big-img {
    width: 100%; height: 100%; border-radius: 14px; display: block;
    box-shadow: 0 0 0 6px rgba(255,255,255,0.06);
  }
  .tp-qr-placeholder { width: 100%; height: 100%; background: rgba(255,255,255,0.06); border-radius: 14px; }
  .tp-qr-corner { position: absolute; width: 16px; height: 16px; border-style: solid; border-width: 0; }
  .tp-qr-corner.tl { top:-4px;    left:-4px;   border-top-width:3px;    border-left-width:3px;   border-radius:4px 0 0 0; }
  .tp-qr-corner.tr { top:-4px;    right:-4px;  border-top-width:3px;    border-right-width:3px;  border-radius:0 4px 0 0; }
  .tp-qr-corner.bl { bottom:-4px; left:-4px;   border-bottom-width:3px; border-left-width:3px;   border-radius:0 0 0 4px; }
  .tp-qr-corner.br { bottom:-4px; right:-4px;  border-bottom-width:3px; border-right-width:3px;  border-radius:0 0 4px 0; }
  .tp-qr-hint { font-size: 11.5px; color: rgba(255,255,255,0.3); text-align: center; line-height: 1.5; }
  .tp-qr-code-str {
    font-family: monospace; font-size: 9px; color: rgba(255,255,255,0.18);
    text-align: center; word-break: break-all; line-height: 1.6; letter-spacing: 0.5px; max-width: 280px;
  }

  /* ══ ACTIONS ══ */
  .tp-actions { display: flex; flex-direction: column; gap: 10px; }
  .tp-share-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px 16px; }
  .tp-share-label { font-size: 8px; font-weight: 700; letter-spacing: 2.5px; color: rgba(255,255,255,0.3); margin-bottom: 9px; }
  .tp-share-row { display: flex; gap: 8px; align-items: center; }
  .tp-share-url { flex: 1; min-width: 0; font-size: 11px; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tp-copy-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 8px 16px; border-radius: 10px;
    border: 1px solid rgba(46,117,182,0.35);
    background: rgba(46,117,182,0.2); color: #7dd3fc;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
  }
  .tp-copy-btn:hover { background: rgba(46,117,182,0.3); transform: translateY(-1px); }
  .tp-copy-btn.copied { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); color: #4ade80; }

  .tp-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .tp-btn-primary {
    flex: 1; min-width: 140px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 20px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #1a3c5e, #2e75b6);
    color: #fff; font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer;
    box-shadow: 0 6px 20px rgba(46,117,182,0.35); transition: all 0.2s ease;
  }
  .tp-btn-primary:hover { box-shadow: 0 8px 28px rgba(46,117,182,0.5); transform: translateY(-1px); }
  .tp-btn-primary:active { transform: translateY(0); }
  .tp-btn-ghost {
    flex: 1; min-width: 120px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 13px 20px; border-radius: 14px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 600;
    text-decoration: none; transition: all 0.18s;
  }
  .tp-btn-ghost:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.75); }

  .tp-footer {
    text-align: center; font-size: 11px; color: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 4px;
  }
  .tp-footer-logo { font-family: 'Poppins', sans-serif; font-weight: 800; color: rgba(255,255,255,0.3); }
  .tp-footer-logo em { color: #2e75b6; font-style: normal; }
  .tp-footer-sep { color: rgba(255,255,255,0.15); }

  .tp-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  .tp-loading-ring { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.1); border-top-color: #2e75b6; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .tp-loading-text { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.3); }

  .tp-nf { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 24px; text-align: center; }
  .tp-nf-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #ef4444; margin-bottom: 4px; }
  .tp-nf-title { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 800; color: #f1f5f9; }
  .tp-nf-sub { font-size: 13px; color: rgba(255,255,255,0.35); max-width: 28ch; line-height: 1.6; }
  .tp-nf-back { margin-top: 8px; color: rgba(255,255,255,0.45); font-size: 13px; text-decoration: none; padding: 10px 22px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; transition: all 0.18s; }
  .tp-nf-back:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.75); }

  /* ══ TABLET 600px+ ══ */
  @media (min-width: 600px) {
    .tp-header          { padding: 24px; }
    .tp-card-body       { padding: 26px 24px 30px; gap: 20px; }
    .tp-event-meta-row  { flex-direction: row; gap: 20px; }
    .tp-details-grid    { grid-template-columns: repeat(4, 1fr); }
    .tp-qr-frame        { width: 200px; height: 200px; }
  }

  /* ══ DESKTOP 768px+ ══ */
  @media (min-width: 768px) {
    /*
     * KEY: switch card to grid layout.
     * tp-card-image-wrap gets align-self:stretch so it fills the full row height.
     * aspect-ratio is overridden to unset — height is now driven by the grid row.
     * The <img> (position:absolute inset:0 100%x100%) fills whatever height the wrap has.
     */
    .tp-card {
      display: grid;
      grid-template-columns: 320px 1fr;
      flex-direction: unset; /* override the mobile flex-direction:column */
    }
    .tp-card-image-wrap {
      aspect-ratio: unset;   /* disable the 16:9 ratio — grid controls height now */
      height: unset;
      align-self: stretch;   /* fill the full grid row height */
      min-height: 480px;     /* floor so short content doesn't squish the image */
    }
    .tp-card-image-shade {
      /* horizontal fade into the body on desktop */
      background: linear-gradient(
        to right,
        rgba(15,18,28,0.0)  0%,
        rgba(15,18,28,0.5)  70%,
        rgba(15,18,28,0.95) 100%
      );
    }
    .tp-card-image-number { display: block; }
    .tp-card-body         { padding: 28px 28px 32px 24px; }
    .tp-event-name        { font-size: clamp(20px, 2.5vw, 26px); }
    .tp-holder-name       { font-size: clamp(22px, 2.8vw, 30px); }
    .tp-details-grid      { grid-template-columns: repeat(2, 1fr); }
    .tp-qr-frame          { width: 220px; height: 220px; }
    .tp-btn-row           { flex-wrap: nowrap; }
  }

  /* ══ NARROW MOBILE <400px ══ */
  @media (max-width: 399px) {
    .tp-card-body       { padding: 18px 14px 22px; gap: 15px; }
    .tp-event-date-full  { display: none; }
    .tp-event-date-short { display: inline; }
    .tp-qr-frame        { width: 140px; height: 140px; }
    .tp-btn-row         { flex-direction: column; }
    .tp-btn-primary, .tp-btn-ghost { min-width: unset; width: 100%; }
  }
`