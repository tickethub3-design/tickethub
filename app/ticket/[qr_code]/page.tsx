'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useParams } from 'next/navigation'

// ─── Type Config ─────────────────────────────────────────────────────────────
const typeConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string; accent: string; gradient: string; icon: string }
> = {
  guest: {
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    label: 'GUEST LIST', accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #be185d, #ec4899)',
    icon: '★',
  },
  single: {
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    label: 'SINGLE', accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    icon: '◆',
  },
  standing: {
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    label: 'STANDING', accent: '#22c55e',
    gradient: 'linear-gradient(135deg, #15803d, #22c55e)',
    icon: '▲',
  },
  backstage: {
    color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff',
    label: 'BACKSTAGE', accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #6d28d9, #a855f7)',
    icon: '⬟',
  },
  vip: {
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    label: 'VIP', accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    icon: '♛',
  },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <main className="ticket-page-bg">
      <div className="ticket-logo-bar">
        <div className="logo-icon skeleton-block" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div className="skeleton-block" style={{ width: 120, height: 22, borderRadius: 6 }} />
      </div>
      <div className="ticket-shell">
        <div className="skeleton-block" style={{ width: '100%', height: 280, borderRadius: 20 }} />
      </div>
    </main>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <main className="ticket-page-bg">
      <div className="not-found-card">
        <div className="not-found-icon">✕</div>
        <h2 className="not-found-title">Ticket Not Found</h2>
        <p className="not-found-sub">This QR code doesn&apos;t match any ticket in our system.</p>
        <Link href="/profile" className="btn-ghost-link">← Back to Profile</Link>
      </div>
    </main>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TicketPage() {
  const params = useParams<{ qr_code: string }>()
  const qr_code = params.qr_code

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [copied, setCopied] = useState(false)
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
        const urlToTicket = `${window.location.origin}/ticket/${data.qr_code}`
        setTicketUrl(urlToTicket)
        const url = await QRCode.toDataURL(urlToTicket, {
          width: 220,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
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
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width / 3, canvas.height / 3],
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
    pdf.save(`ticket-${ticket?.holder_name?.replace(/\s+/g, '-') || 'guest'}-#${ticket?.ticket_number || '00'}.pdf`)
  }

  const handleCopyLink = async () => {
    if (!ticketUrl) return
    try {
      await navigator.clipboard.writeText(ticketUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  if (loading) return <Skeleton />
  if (!ticket) return <NotFound />

  const tc = typeConfig[ticket.ticket_type] || typeConfig.single
  const isGuestTicket = ticket.ticket_type === 'guest'
  const isVip = ticket.ticket_type === 'vip'
  const eventImage = ticket.events?.image_url
  const totalAmount = isGuestTicket
    ? 0
    : ticket.reservations?.total || ticket.reservations?.total_price || ticket.price_paid || 0
  const instagram = ticket.holder_instagram || ticket.reservations?.instagram || ticket.instagram
  const phone = ticket.holder_phone || ticket.reservations?.phone || ticket.phone || '—'
  const email = ticket.holder_email || ticket.reservations?.email || ticket.email || null
  const holderName =
    ticket.holder_name || ticket.reservations?.full_name || ticket.reservations?.name || ticket.full_name || '—'
  const ticketNumber = String(ticket.ticket_number || 0).padStart(3, '0')
  const eventDate = ticket.events?.date
    ? new Date(ticket.events.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'TBA'
  const checkinTime =
    ticket.checked_in && ticket.checked_in_at
      ? new Date(ticket.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ticket-page-bg {
          min-height: 100vh;
          background: #080c14;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(30,27,75,0.9) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(15,30,60,0.8) 0%, transparent 55%);
          font-family: 'Inter', sans-serif;
          padding: 40px 16px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ticket-logo-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          text-decoration: none;
        }
        .logo-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #1a3c5e, #2e75b6);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(46,117,182,0.35);
        }
        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 800; font-size: 21px;
          color: #f1f5f9; letter-spacing: -0.5px;
        }
        .logo-text span { color: #2e75b6; }

        .ticket-shell { width: 100%; max-width: 820px; }

        .ticket-card {
          width: 100%;
          background: #ffffff;
          border-radius: 22px;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.06),
            0 16px 48px rgba(0,0,0,0.45),
            0 40px 80px rgba(0,0,0,0.3);
          display: flex;
          overflow: hidden;
          position: relative;
          min-height: 260px;
        }

        .ticket-image-panel {
          width: 220px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .ticket-image-panel img,
        .ticket-image-fallback {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .ticket-image-fallback {
          background: linear-gradient(160deg, #1a3c5e 0%, #2e75b6 100%);
        }
        .ticket-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.65) 0%,
            rgba(0,0,0,0.15) 70%,
            transparent 100%
          );
        }

        .type-badge {
          position: absolute;
          top: 14px; left: 14px;
          padding: 5px 13px;
          border-radius: 999px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 1.8px;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.15);
          color: #fff;
          display: flex; align-items: center; gap: 5px;
        }
        .type-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
        }

        .event-info-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 48px 16px 18px;
          background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%);
        }
        .event-label {
          color: rgba(255,255,255,0.45);
          font-size: 8px; letter-spacing: 3px;
          font-weight: 700; margin: 0 0 6px;
        }
        .event-title {
          font-family: 'Poppins', sans-serif;
          color: #fff;
          font-size: 14px; font-weight: 900;
          margin: 0 0 9px;
          line-height: 1.25;
          text-shadow: 0 2px 8px rgba(0,0,0,0.7);
        }
        .event-meta { display: flex; flex-direction: column; gap: 3px; }
        .event-meta-row {
          display: flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.72);
          font-size: 9.5px; font-weight: 600;
        }
        .event-meta-icon { width: 13px; height: 13px; flex-shrink: 0; opacity: 0.85; }

        .perforated {
          width: 1px;
          position: relative;
          flex-shrink: 0;
          border-left: 2px dashed #e2e8f0;
        }
        .perforated-notch {
          position: absolute;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #080c14;
          left: -13px;
        }
        .perforated-notch.top { top: -12px; }
        .perforated-notch.bottom { bottom: -12px; }

        .ticket-body {
          flex: 1;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        .ticket-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .ticket-number-badge { display: flex; align-items: center; gap: 8px; }
        .ticket-number-box {
          width: 42px; height: 42px;
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Poppins', sans-serif;
          font-weight: 900; font-size: 13px;
        }
        .ticket-number-label {
          color: #94a3b8;
          font-size: 8px; letter-spacing: 2px; font-weight: 700;
        }

        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 1.5px;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .holder-label {
          color: #94a3b8;
          font-size: 8px; letter-spacing: 2.5px; font-weight: 700; margin-bottom: 4px;
        }
        .holder-name {
          font-family: 'Poppins', sans-serif;
          color: #0f172a;
          font-size: clamp(17px, 3vw, 22px);
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1.15;
          word-break: break-word;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }
        .detail-cell {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 9px;
          padding: 8px 10px;
        }
        .detail-cell-label {
          color: #94a3b8;
          font-size: 7.5px; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 3px;
        }
        .detail-cell-value {
          color: #1e293b;
          font-size: 11.5px; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .email-row {
          display: flex; align-items: center; gap: 6px;
        }
        .email-text {
          color: #64748b; font-size: 11px; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .instagram-link {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid #fbcfe8;
          background: #fdf2f8;
          color: #db2777;
          font-size: 9.5px; font-weight: 700;
          text-decoration: none;
          width: fit-content;
          max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          transition: background 0.18s, border-color 0.18s;
        }
        .instagram-link:hover { background: #fce7f3; border-color: #f9a8d4; }

        .ticket-qr-panel {
          width: 160px;
          flex-shrink: 0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 18px 12px;
          gap: 9px;
        }
        .qr-scan-label {
          color: #94a3b8;
          font-size: 7.5px; letter-spacing: 2.5px; font-weight: 700; text-align: center;
        }
        .qr-image-wrap {
          position: relative; width: 120px; height: 120px;
        }
        .qr-image-wrap img {
          width: 100%; height: 100%; border-radius: 10px; display: block;
        }
        .qr-corner {
          position: absolute;
          width: 12px; height: 12px;
          border-color: #0f172a; border-style: solid; border-width: 0;
        }
        .qr-corner.tl { top: -2px; left: -2px; border-top-width: 2.5px; border-left-width: 2.5px; border-radius: 3px 0 0 0; }
        .qr-corner.tr { top: -2px; right: -2px; border-top-width: 2.5px; border-right-width: 2.5px; border-radius: 0 3px 0 0; }
        .qr-corner.bl { bottom: -2px; left: -2px; border-bottom-width: 2.5px; border-left-width: 2.5px; border-radius: 0 0 0 3px; }
        .qr-corner.br { bottom: -2px; right: -2px; border-bottom-width: 2.5px; border-right-width: 2.5px; border-radius: 0 0 3px 0; }
        .qr-code-text {
          color: #cbd5e1; font-size: 6.5px; font-family: monospace;
          text-align: center; word-break: break-all; line-height: 1.5; padding: 0 2px;
        }
        .qr-divider {
          width: 100%; border-top: 1px solid #e2e8f0;
          padding-top: 9px; text-align: center;
        }
        .powered-by { color: #cbd5e1; font-size: 6.5px; letter-spacing: 1px; margin-bottom: 3px; }
        .powered-logo {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 12px; color: #475569;
        }
        .powered-logo span { color: #2e75b6; }

        .vip-strip {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #b45309, #f59e0b, #fde68a, #f59e0b, #b45309);
          background-size: 200% 100%;
          animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ticket-actions-section {
          width: 100%; max-width: 820px;
          margin-top: 20px;
          display: flex; flex-direction: column; gap: 12px;
        }

        .share-link-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 14px 16px;
        }
        .share-link-label {
          color: rgba(255,255,255,0.4);
          font-size: 9px; font-weight: 700; letter-spacing: 2.5px; margin-bottom: 9px;
        }
        .share-link-row { display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }
        .share-link-url {
          flex: 1; min-width: 200px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 10px 13px;
          color: rgba(255,255,255,0.7); font-size: 11.5px;
          word-break: break-all; line-height: 1.4;
        }
        .btn-copy {
          padding: 11px 18px; border-radius: 10px;
          font-weight: 700; font-size: 12px; letter-spacing: 0.5px;
          cursor: pointer; border: none;
          font-family: 'Poppins', sans-serif;
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .btn-copy.idle {
          background: linear-gradient(135deg, #1a3c5e, #2e75b6);
          color: #fff; box-shadow: 0 4px 14px rgba(46,117,182,0.3);
        }
        .btn-copy.idle:hover {
          box-shadow: 0 6px 20px rgba(46,117,182,0.45); transform: translateY(-1px);
        }
        .btn-copy.copied {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3); color: #4ade80;
        }

        .action-buttons-row {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
        }
        .btn-download {
          background: linear-gradient(135deg, #1a3c5e, #2e75b6);
          color: #fff; border: none;
          padding: 13px 28px; border-radius: 13px;
          font-weight: 700; font-size: 13px; letter-spacing: 1px;
          cursor: pointer; font-family: 'Poppins', sans-serif;
          box-shadow: 0 6px 20px rgba(46,117,182,0.35);
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s ease;
        }
        .btn-download:hover {
          box-shadow: 0 8px 28px rgba(46,117,182,0.5); transform: translateY(-1px);
        }
        .btn-download:active { transform: translateY(0); }
        .btn-back {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 13px 24px; border-radius: 13px;
          font-weight: 600; font-size: 13px;
          text-decoration: none;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.18s, color 0.18s;
        }
        .btn-back:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }

        .skeleton-block {
          background: linear-gradient(90deg, #1e2535 25%, #2a3348 50%, #1e2535 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .not-found-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 56px 40px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          max-width: 380px; width: 100%;
        }
        .not-found-icon {
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #ef4444; font-weight: 900;
        }
        .not-found-title {
          font-family: 'Poppins', sans-serif;
          color: #f1f5f9; font-size: 18px; font-weight: 800; letter-spacing: -0.3px;
        }
        .not-found-sub { color: rgba(255,255,255,0.4); font-size: 13px; max-width: 28ch; line-height: 1.5; }
        .btn-ghost-link {
          margin-top: 8px; color: rgba(255,255,255,0.45); font-size: 13px;
          text-decoration: none; padding: 9px 20px;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          transition: background 0.18s, color 0.18s;
        }
        .btn-ghost-link:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.75); }

        /* ══ RESPONSIVE ══════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .ticket-card { flex-direction: column; min-height: unset; }
          .ticket-image-panel { width: 100%; height: 180px; flex-shrink: unset; }
          .perforated {
            width: 100%; height: 1px;
            border-left: none; border-top: 2px dashed #e2e8f0;
          }
          .perforated-notch { top: unset; bottom: unset; left: unset; right: unset; }
          .perforated-notch.top { left: -12px; top: -12px; }
          .perforated-notch.bottom { right: -12px; top: -12px; }
          .ticket-qr-panel {
            width: 100%; flex-direction: row; flex-wrap: wrap;
            justify-content: center; padding: 16px; gap: 16px;
          }
          .qr-divider { display: none; }
          .qr-scan-label { width: 100%; text-align: center; }
        }

        @media (max-width: 480px) {
          .ticket-page-bg { padding: 28px 12px 64px; }
          .ticket-logo-bar { margin-bottom: 24px; }
          .ticket-image-panel { height: 160px; }
          .ticket-body { padding: 16px 14px 14px; }
          .holder-name { font-size: 19px; }
          .details-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
          .ticket-qr-panel { padding: 14px 12px; }
          .qr-image-wrap { width: 100px; height: 100px; }
          .action-buttons-row { flex-direction: column; align-items: stretch; }
          .btn-download, .btn-back { justify-content: center; width: 100%; }
          .share-link-row { flex-direction: column; }
          .btn-copy { width: 100%; text-align: center; }
        }
      `}</style>

      <main className="ticket-page-bg">
        {/* ── Logo ── */}
        <Link href="/" className="ticket-logo-bar" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">🎟️</div>
          <span className="logo-text">Ticket<span>Hub</span></span>
        </Link>

        <div className="ticket-shell">
          {/* ══ TICKET CARD ══ */}
          <div ref={ticketRef} className="ticket-card">
            {isVip && <div className="vip-strip" />}

            {/* ── Image Panel ── */}
            <div className="ticket-image-panel">
              {eventImage
                ? <img src={eventImage} alt={ticket.events?.title || 'Event'} loading="lazy" />
                : <div className="ticket-image-fallback" />
              }
              <div className="ticket-image-overlay" />

              <div className="type-badge" style={{ color: tc.accent }}>
                <span className="type-badge-dot" style={{ background: tc.accent }} />
                {tc.icon} {tc.label}
              </div>

              <div className="event-info-overlay">
                <p className="event-label">EVENT</p>
                <h2 className="event-title">{ticket.events?.title}</h2>
                <div className="event-meta">
                  <span className="event-meta-row">
                    <svg className="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {eventDate}
                  </span>
                  {ticket.events?.location && (
                    <span className="event-meta-row">
                      <svg className="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {ticket.events.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Perforated divider (left) ── */}
            <div className="perforated">
              <div className="perforated-notch top" />
              <div className="perforated-notch bottom" />
            </div>

            {/* ── Body ── */}
            <div className="ticket-body">
              <div className="ticket-top-row">
                <div className="ticket-number-badge">
                  <div
                    className="ticket-number-box"
                    style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}
                  >
                    #{ticketNumber}
                  </div>
                  <span className="ticket-number-label">TICKET NO.</span>
                </div>
                <div
                  className="status-pill"
                  style={{
                    background: ticket.checked_in ? '#f0fdf4' : '#f0f9ff',
                    border: `1px solid ${ticket.checked_in ? '#bbf7d0' : '#bae6fd'}`,
                    color: ticket.checked_in ? '#15803d' : '#0369a1',
                  }}
                >
                  <span className="status-dot" style={{ background: ticket.checked_in ? '#22c55e' : '#38bdf8' }} />
                  {ticket.checked_in ? 'CHECKED IN' : 'VALID'}
                </div>
              </div>

              <div>
                <p className="holder-label">{isGuestTicket ? 'GUEST NAME' : 'TICKET HOLDER'}</p>
                <p className="holder-name">{holderName}</p>
              </div>

              <div className="details-grid">
                {[
                  { label: 'PHONE', value: phone },
                  { label: 'TYPE', value: tc.label, color: tc.color },
                  {
                    label: isGuestTicket ? 'ACCESS' : 'AMOUNT PAID',
                    value: isGuestTicket ? 'FREE ACCESS' : `${Number(totalAmount).toLocaleString()} EGP`,
                  },
                  {
                    label: 'CHECK-IN TIME',
                    value: checkinTime || '—',
                    color: checkinTime ? '#16a34a' : undefined,
                  },
                ].map(item => (
                  <div key={item.label} className="detail-cell">
                    <p className="detail-cell-label">{item.label}</p>
                    <p className="detail-cell-value" style={{ color: (item as any).color || '#1e293b' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {email && (
                <div className="email-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8l10 6 10-6" />
                  </svg>
                  <span className="email-text">{email}</span>
                </div>
              )}

              {instagram && (
                <a
                  href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="instagram-link"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                  {instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                </a>
              )}
            </div>

            {/* ── Perforated divider (right) ── */}
            <div className="perforated">
              <div className="perforated-notch top" />
              <div className="perforated-notch bottom" />
            </div>

            {/* ── QR Panel ── */}
            <div className="ticket-qr-panel">
              <p className="qr-scan-label">SCAN AT ENTRANCE</p>
              <div className="qr-image-wrap">
                {qrUrl ? (
                  <>
                    <img src={qrUrl} alt="Ticket QR Code" />
                    <div className="qr-corner tl" />
                    <div className="qr-corner tr" />
                    <div className="qr-corner bl" />
                    <div className="qr-corner br" />
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#e2e8f0', borderRadius: 10 }} />
                )}
              </div>
              <p className="qr-code-text">
                {qr_code.length > 20 ? qr_code.slice(0, 20) + '…' : qr_code}
              </p>
              <div className="qr-divider">
                <p className="powered-by">POWERED BY</p>
                <p className="powered-logo">Ticket<span>Hub</span></p>
              </div>
            </div>
          </div>

          {/* ══ ACTIONS ══ */}
          <div className="ticket-actions-section">
            {ticketUrl && (
              <div className="share-link-box">
                <p className="share-link-label">SHARE TICKET LINK</p>
                <div className="share-link-row">
                  <div className="share-link-url">{ticketUrl}</div>
                  <button
                    onClick={handleCopyLink}
                    className={`btn-copy ${copied ? 'copied' : 'idle'}`}
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}

            <div className="action-buttons-row">
              <button onClick={handleDownloadPDF} className="btn-download">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
              <Link href="/profile" className="btn-back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                My Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}