'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Countdown({ deadline }: { deadline: string }) {
  const [time, setTime] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); setTime('00:00:00'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [deadline])

  return (
    <div style={{ textAlign: 'center', background: expired ? 'rgba(231,76,60,0.05)' : 'rgba(240,165,0,0.05)', border: `1px solid ${expired ? 'rgba(231,76,60,0.25)' : 'rgba(240,165,0,0.2)'}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '3px', margin: '0 0 8px' }}>
        {expired ? 'PAYMENT DEADLINE PASSED' : 'TIME REMAINING TO PAY'}
      </p>
      <p style={{ color: expired ? '#E74C3C' : '#F0A500', fontSize: 40, fontWeight: 900, fontFamily: 'monospace', margin: '0 0 6px', letterSpacing: '4px' }}>{time}</p>
      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, margin: 0 }}>
        Deadline: {new Date(deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} at {new Date(deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}

function PaymentSection({ reservation, onDone }: { reservation: any; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [senderPhone, setSenderPhone] = useState('')
  const phone = reservation.events?.transfer_number || '01000000000'

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!file || !senderPhone) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${reservation.id}-${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('payment-screenshots').upload(path, file)
    if (uploadErr) { alert('Upload failed. Please try again.'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(path)
    await supabase.from('reservations').update({
      payment_screenshot_url: urlData.publicUrl,
      payment_sender_phone: senderPhone,   // ← column اتضاف
      status: 'payment_review'
    }).eq('id', reservation.id)
    setUploading(false)
    onDone()
  }

  const totalAmount = reservation.total || reservation.total_price || 0  // ← fallback

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.25)', borderRadius: 20, padding: 28, marginBottom: 8 }}>
      <p style={{ color: '#2E75B6', fontSize: 11, letterSpacing: '3px', fontWeight: 700, margin: '0 0 20px' }}>💳 COMPLETE YOUR PAYMENT</p>
      {reservation.payment_deadline && <Countdown deadline={reservation.payment_deadline} />}

      {/* Step 1 */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>STEP 01 — SEND THE AMOUNT</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.7, margin: '0 0 14px' }}>
          Transfer exactly <strong style={{ color: '#fff', fontSize: 15 }}>{totalAmount} EGP</strong> via Instapay or Vodafone Cash to:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px' }}>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace', margin: 0, flex: 1, letterSpacing: '2px' }}>{phone}</p>
          <button onClick={copyPhone} style={{ background: 'none', border: `1px solid ${copied ? '#27AE60' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#27AE60' : 'rgba(255,255,255,0.3)', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '1px', fontWeight: 700 }}>
            {copied ? 'COPIED ✓' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>STEP 02 — ENTER YOUR PHONE NUMBER</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '0 0 14px' }}>The number you sent from:</p>
        <input type="tel" placeholder="01XXXXXXXXX" value={senderPhone} onChange={e => setSenderPhone(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 16, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
      </div>

      {/* Step 3 */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>STEP 03 — UPLOAD PAYMENT PROOF</p>
        <label style={{ display: 'block', border: `2px dashed ${file ? '#2E75B6' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain', marginBottom: 8 }} />
              <p style={{ color: '#2E75B6', fontSize: 12, margin: 0 }}>Tap to change</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 36, margin: '0 0 10px' }}>📸</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: '0 0 4px' }}>Tap to upload screenshot</p>
              <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11, margin: 0 }}>JPG or PNG</p>
            </>
          )}
        </label>
      </div>

      <button onClick={handleSubmit} disabled={!file || !senderPhone || uploading}
        style={{ width: '100%', background: file && senderPhone && !uploading ? 'linear-gradient(135deg, #1A3C5E, #2E75B6)' : 'rgba(255,255,255,0.03)', color: file && senderPhone && !uploading ? '#fff' : 'rgba(255,255,255,0.15)', border: 'none', padding: 16, borderRadius: 12, fontWeight: 900, fontSize: 14, letterSpacing: '2px', cursor: file && senderPhone && !uploading ? 'pointer' : 'not-allowed', fontFamily: 'Poppins, sans-serif', boxShadow: file && senderPhone && !uploading ? '0 6px 20px rgba(46,117,182,0.3)' : 'none' }}>
        {uploading ? 'Uploading...' : '📤 Submit Payment Proof →'}
      </button>
    </div>
  )
}

const statusConfig: Record<string, { color: string; label: string; icon: string; desc: string }> = {
  pending:          { color: '#F0A500', icon: '⏳', label: 'PENDING',                desc: 'Your booking has been submitted and is waiting to be reviewed.' },
  reviewing:        { color: '#fb923c', icon: '🔎', label: 'BOOKING UNDER REVIEW',   desc: "We've received your booking and are currently reviewing it." },
  awaiting_payment: { color: '#2E75B6', icon: '💳', label: 'AWAITING PAYMENT',       desc: 'Your booking is approved! Please complete the payment below to secure your spot.' },
  payment_review:   { color: '#8b5cf6', icon: '🔍', label: 'PAYMENT UNDER REVIEW',   desc: "We received your payment proof and are reviewing it. You'll be notified once confirmed." },
  confirmed:        { color: '#27AE60', icon: '✅', label: "CONFIRMED — YOU'RE IN!", desc: 'Your spot is confirmed. Check your tickets below and show your QR at the door! 🎉' },
  checked_in:       { color: '#27AE60', icon: '🎟️', label: 'CHECKED IN — ENJOY!',    desc: 'You have already checked in at the venue. Have fun!' },
  rejected:         { color: '#E74C3C', icon: '❌', label: 'NOT APPROVED',            desc: 'Your booking was not approved. Contact us on Instagram for more info.' },
}

const ticketTypeStyle: Record<string, { color: string; bg: string; border: string }> = {
  standing:  { color: '#27AE60', bg: 'rgba(39,174,96,0.1)',   border: 'rgba(39,174,96,0.3)'   },
  backstage: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  vip:       { color: '#F0A500', bg: 'rgba(240,165,0,0.1)',   border: 'rgba(240,165,0,0.3)'   },
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '13px 16px', color: '#fff', fontSize: 14,
  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [ticketsByReservation, setTicketsByReservation] = useState<Record<string, any[]>>({})
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    setNewName(user.user_metadata?.full_name || '')

    const { data: resData } = await supabase
      .from('reservations')
      .select('*, events(title, date, location, image_url, price, transfer_number)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setReservations(resData || [])

    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('ticket_number', { ascending: true })

    const grouped: Record<string, any[]> = {}
    for (const ticket of ticketsData || []) {
      if (!grouped[ticket.reservation_id]) grouped[ticket.reservation_id] = []
      grouped[ticket.reservation_id].push(ticket)
    }
    setTicketsByReservation(grouped)
  }

  useEffect(() => { load() }, [])

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/') }

  const handleSave = async () => {
    setSaving(true); setSaveMsg('')
    if (newName.trim()) await supabase.auth.updateUser({ data: { full_name: newName.trim() } })
    if (newPassword.trim()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() })
      if (error) { setSaveMsg('❌ ' + error.message); setSaving(false); return }
    }
    await load()
    setSaveMsg('✅ Saved successfully!')
    setNewPassword('')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (!user) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'Inter, sans-serif', letterSpacing: '3px', fontSize: 12 }}>LOADING...</p>
    </main>
  )

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: 0, fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 80% 0%, rgba(46,117,182,0.07) 0%, transparent 50%)' }} />

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>
        <button onClick={handleSignOut} style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#E74C3C', padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 12, letterSpacing: '1px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👤</div>
            <div>
              <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2px' }}>MY ACCOUNT</span>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', margin: '4px 0 2px', letterSpacing: '-0.5px' }}>{displayName}</h1>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Edit Info */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, marginBottom: 40 }}>
          <p style={{ color: '#2E75B6', fontSize: 11, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 24px' }}>⚙️ EDIT YOUR INFO</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>FULL NAME</p>
              <input style={inputStyle} type="text" placeholder="Your name" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>NEW PASSWORD</p>
              <input style={inputStyle} type="password" placeholder="Leave empty to keep current" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            {saveMsg && <p style={{ color: saveMsg.startsWith('✅') ? '#27AE60' : '#E74C3C', fontSize: 13, margin: 0 }}>{saveMsg}</p>}
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: saving ? 'rgba(255,255,255,0.2)' : '#fff', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 13, letterSpacing: '1.5px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: saving ? 'none' : '0 4px 14px rgba(46,117,182,0.25)' }}>
              {saving ? 'Saving...' : 'Save Changes →'}
            </button>
          </div>
        </div>

        {/* Bookings */}
        <p style={{ color: '#2E75B6', fontSize: 11, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 24px' }}>MY BOOKINGS</p>

        {reservations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <p style={{ fontSize: 40, margin: '0 0 16px' }}>🎟️</p>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, letterSpacing: '3px', margin: 0 }}>NO BOOKINGS YET</p>
          </div>
        )}

        {reservations.map(r => {
          const cfg = statusConfig[r.status] || statusConfig.pending
          const myTickets = ticketsByReservation[r.id] || []
          const totalAmount = r.total || r.total_price || 0   // ← fallback

          return (
            <div key={r.id} style={{ marginBottom: 28 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${cfg.color}20`, borderRadius: 20, padding: 24, marginBottom: 10 }}>

                {/* Event Header */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
                  {r.events?.image_url && (
                    <img src={r.events.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>{r.events?.title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>
                      📅 {new Date(r.events?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })} · 📍 {r.events?.location}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icon}</span>
                  <div>
                    <p style={{ color: cfg.color, fontSize: 11, fontWeight: 800, letterSpacing: '2px', margin: '0 0 4px' }}>{cfg.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{cfg.desc}</p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: myTickets.length > 0 ? 20 : 0 }}>
                  {[
                    { label: 'TICKETS', value: `${r.num_people || r.quantity}x` },
                    { label: 'TOTAL',   value: `${totalAmount} EGP` },             // ← fallback
                    { label: 'BOOKED',  value: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>{item.label}</p>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tickets */}
                {myTickets.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 12px' }}>🎫 MY TICKETS</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myTickets.map((ticket: any) => {
                        const ts = ticketTypeStyle[ticket.ticket_type] || ticketTypeStyle.standing
                        return (
                          <div key={ticket.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${ticket.checked_in ? 'rgba(39,174,96,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 10px', minWidth: 36, textAlign: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '1px', margin: '0 0 2px' }}>#</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 900, margin: 0 }}>{ticket.ticket_number}</p>
                              </div>
                              <div>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 5px' }}>{ticket.holder_name}</p>
                                <span style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color, padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '1px' }}>
                                  {ticket.ticket_type === 'vip' ? '👑 ' : ''}{ticket.ticket_type?.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {ticket.checked_in ? (
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27AE60', padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: 3 }}>☑️ CHECKED IN</span>
                                  {ticket.checked_in_at && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: 0, textAlign: 'right' }}>{new Date(ticket.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>}
                                </div>
                              ) : (
                                <span style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', color: '#27AE60', padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '1px' }}>✅ VALID</span>
                              )}
                              <Link href={`/ticket/${ticket.qr_code}`} style={{ background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '1px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                VIEW →
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {r.status === 'awaiting_payment' && <PaymentSection reservation={r} onDone={load} />}
            </div>
          )
        })}
      </div>
    </main>
  )
}