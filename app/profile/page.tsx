'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/app/components/Footer'
import {
  User,
  LogOut,
  CreditCard,
  Copy,
  Check,
  UploadCloud,
  Ticket,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react'

function Countdown({ deadline }: { deadline: string }) {
  const [time, setTime] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setTime('00:00:00')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }

    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [deadline])

  return (
    <div
      style={{
        textAlign: 'center',
        background: expired ? 'rgba(231,76,60,0.06)' : 'rgba(240,165,0,0.06)',
        border: `1px solid ${expired ? 'rgba(231,76,60,0.22)' : 'rgba(240,165,0,0.22)'}`,
        borderRadius: 18,
        padding: 22,
        marginBottom: 20,
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, letterSpacing: '2px', margin: '0 0 10px', fontWeight: 700 }}>
        {expired ? 'PAYMENT DEADLINE PASSED' : 'TIME REMAINING TO PAY'}
      </p>

      <p
        style={{
          color: expired ? '#E74C3C' : '#F0A500',
          fontSize: 36,
          fontWeight: 900,
          fontFamily: 'monospace',
          margin: '0 0 8px',
          letterSpacing: '3px',
        }}
      >
        {time}
      </p>

      <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
        Deadline:{' '}
        {new Date(deadline).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })}{' '}
        at{' '}
        {new Date(deadline).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}
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

  const copyPhone = async () => {
    await navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!file || !senderPhone) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${reservation.id}-${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage.from('payment-screenshots').upload(path, file)

    if (uploadErr) {
      alert('Upload failed. Please try again.')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(path)

    await supabase
      .from('reservations')
      .update({
        payment_screenshot_url: urlData.publicUrl,
        payment_sender_phone: senderPhone,
        status: 'payment_review',
      })
      .eq('id', reservation.id)

    setUploading(false)
    onDone()
  }

  const totalAmount = reservation.total || reservation.total_price || 0

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(46,117,182,0.22)',
        borderRadius: 22,
        padding: 24,
        marginBottom: 8,
        boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(46,117,182,0.12)',
            border: '1px solid rgba(46,117,182,0.22)',
          }}
        >
          <CreditCard size={18} color="#60a5fa" />
        </div>
        <div>
          <p style={{ color: '#93c5fd', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>
            COMPLETE YOUR PAYMENT
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>
            Follow the steps below to secure your reservation.
          </p>
        </div>
      </div>

      {reservation.payment_deadline && <Countdown deadline={reservation.payment_deadline} />}

      <div style={{ display: 'grid', gap: 14 }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
            STEP 01 — SEND THE AMOUNT
          </p>

          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14, lineHeight: 1.7, margin: '0 0 14px' }}>
            Transfer exactly <strong style={{ color: '#fff' }}>{totalAmount} EGP</strong> via Instapay or Vodafone Cash to the number below.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 16px',
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: 900,
                fontFamily: 'monospace',
                margin: 0,
                flex: 1,
                letterSpacing: '2px',
              }}
            >
              {phone}
            </p>

            <button
              onClick={copyPhone}
              style={{
                background: copied ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${copied ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: copied ? '#27AE60' : 'rgba(255,255,255,0.75)',
                padding: '10px 14px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
            STEP 02 — ENTER YOUR PHONE NUMBER
          </p>

          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14, margin: '0 0 12px', lineHeight: 1.7 }}>
            Enter the phone number you used to send the payment.
          </p>

          <input
            type="tel"
            placeholder="01XXXXXXXXX"
            value={senderPhone}
            onChange={e => setSenderPhone(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 16,
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
              letterSpacing: '2px',
            }}
          />
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
            STEP 03 — UPLOAD PAYMENT PROOF
          </p>

          <label
            style={{
              display: 'block',
              border: `2px dashed ${file ? '#2E75B6' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 14,
              padding: 26,
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 220,
                    borderRadius: 10,
                    objectFit: 'contain',
                    margin: '0 auto 10px',
                  }}
                />
                <p style={{ color: '#93c5fd', fontSize: 12, margin: 0 }}>Tap to change screenshot</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    margin: '0 auto 12px',
                    background: 'rgba(46,117,182,0.12)',
                    border: '1px solid rgba(46,117,182,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UploadCloud size={24} color="#60a5fa" />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>
                  Tap to upload screenshot
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>JPG or PNG</p>
              </>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || !senderPhone || uploading}
        style={{
          width: '100%',
          background:
            file && senderPhone && !uploading
              ? 'linear-gradient(135deg, #1A3C5E, #2E75B6)'
              : 'rgba(255,255,255,0.03)',
          color: file && senderPhone && !uploading ? '#fff' : 'rgba(255,255,255,0.18)',
          border: 'none',
          padding: 16,
          borderRadius: 14,
          fontWeight: 900,
          fontSize: 14,
          letterSpacing: '1.5px',
          cursor: file && senderPhone && !uploading ? 'pointer' : 'not-allowed',
          fontFamily: 'Poppins, sans-serif',
          boxShadow: file && senderPhone && !uploading ? '0 8px 24px rgba(46,117,182,0.28)' : 'none',
          marginTop: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {uploading ? 'Uploading...' : 'Submit Payment Proof'}
        {!uploading && <ArrowRight size={16} />}
      </button>
    </div>
  )
}

const statusConfig: Record<string, { color: string; label: string; icon: string; desc: string }> = {
  pending: {
    color: '#F0A500',
    icon: '⏳',
    label: 'PENDING',
    desc: 'Your booking has been submitted and is waiting to be reviewed.',
  },
  reviewing: {
    color: '#fb923c',
    icon: '🔎',
    label: 'BOOKING UNDER REVIEW',
    desc: "We've received your booking and are currently reviewing it.",
  },
  awaiting_payment: {
    color: '#2E75B6',
    icon: '💳',
    label: 'AWAITING PAYMENT',
    desc: 'Your booking is approved. Complete the payment below to secure your spot.',
  },
  payment_review: {
    color: '#8b5cf6',
    icon: '🔍',
    label: 'PAYMENT UNDER REVIEW',
    desc: "We received your payment proof and are reviewing it. You'll be notified once confirmed.",
  },
  confirmed: {
    color: '#27AE60',
    icon: '✅',
    label: "CONFIRMED — YOU'RE IN!",
    desc: 'Your spot is confirmed. Check your tickets below and show your QR at the door.',
  },
  checked_in: {
    color: '#27AE60',
    icon: '🎟️',
    label: 'CHECKED IN — ENJOY!',
    desc: 'You have already checked in at the venue. Have fun.',
  },
  rejected: {
    color: '#E74C3C',
    icon: '❌',
    label: 'NOT APPROVED',
    desc: 'Your booking was not approved. Contact us on Instagram for more info.',
  },
}

const ticketTypeStyle: Record<string, { color: string; bg: string; border: string }> = {
  standing: { color: '#27AE60', bg: 'rgba(39,174,96,0.1)', border: 'rgba(39,174,96,0.3)' },
  backstage: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  vip: { color: '#F0A500', bg: 'rgba(240,165,0,0.1)', border: 'rgba(240,165,0,0.3)' },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '14px 16px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

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

  useEffect(() => {
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')

    if (newName.trim()) {
      await supabase.auth.updateUser({ data: { full_name: newName.trim() } })
    }

    if (newPassword.trim()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() })
      if (error) {
        setSaveMsg('❌ ' + error.message)
        setSaving(false)
        return
      }
    }

    await load()
    setSaveMsg('✅ Saved successfully!')
    setNewPassword('')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (!user)
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter, sans-serif', letterSpacing: '3px', fontSize: 12 }}>
          LOADING...
        </p>
      </main>
    )

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1e',
        padding: 0,
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      }}
    >
      <style>{`
        .profile-shell {
          max-width: 920px;
          margin: 0 auto;
          padding: 42px 20px 80px;
          position: relative;
          z-index: 1;
        }

        .profile-grid-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .tickets-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ticket-row {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .profile-shell {
            padding: 30px 16px 72px;
          }

          .profile-topbar {
            padding: 0 16px !important;
          }

          .profile-header-row {
            align-items: flex-start !important;
            flex-direction: column !important;
          }

          .profile-grid-stats {
            grid-template-columns: 1fr !important;
          }

          .ticket-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .reservation-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 80% 0%, rgba(46,117,182,0.07) 0%, transparent 50%)',
        }}
      />

      <div
        className="profile-topbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,15,30,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(46,117,182,0.12)',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(46,117,182,0.26)',
            }}
          >
            <Ticket size={16} color="#fff" />
          </div>

          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          </span>
        </Link>

        <button
          onClick={handleSignOut}
          style={{
            background: 'rgba(231,76,60,0.08)',
            border: '1px solid rgba(231,76,60,0.2)',
            color: '#E74C3C',
            padding: '8px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 12,
            letterSpacing: '1px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      <div className="profile-shell">
        <div style={{ marginBottom: 34 }}>
          <div
            className="profile-header-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 12px 28px rgba(46,117,182,0.26)',
                }}
              >
                <User size={26} color="#fff" />
              </div>

              <div>
                <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '2px' }}>MY ACCOUNT</span>
                <h1
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 30,
                    fontWeight: 800,
                    color: '#fff',
                    margin: '4px 0 4px',
                    letterSpacing: '-0.8px',
                  }}
                >
                  {displayName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user.email}</p>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '12px 14px',
                minWidth: 220,
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '2px', margin: '0 0 6px', fontWeight: 700 }}>
                ACCOUNT SUMMARY
              </p>
              <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
                {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 22,
            padding: 24,
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(46,117,182,0.12)',
                border: '1px solid rgba(46,117,182,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="#60a5fa" />
            </div>
            <div>
              <p style={{ color: '#60a5fa', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px' }}>
                EDIT YOUR INFO
              </p>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, margin: 0 }}>
                Update your account details and password.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>
                FULL NAME
              </p>
              <input style={inputStyle} type="text" placeholder="Your name" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>

            <div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 8px' }}>
                NEW PASSWORD
              </p>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle, paddingLeft: 44 }}
                  type="password"
                  placeholder="Leave empty to keep current"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Lock
                  size={16}
                  color="rgba(255,255,255,0.35)"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {saveMsg && (
              <p style={{ color: saveMsg.startsWith('✅') ? '#27AE60' : '#E74C3C', fontSize: 13, margin: 0 }}>
                {saveMsg}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: saving ? 'rgba(255,255,255,0.2)' : '#fff',
                border: 'none',
                padding: '14px 16px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '1.4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: saving ? 'none' : '0 8px 22px rgba(46,117,182,0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
              {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <p style={{ color: '#60a5fa', fontSize: 11, letterSpacing: '2.5px', fontWeight: 700, margin: '0 0 10px' }}>
            MY BOOKINGS
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
            Track reservation status, complete payment when required, and access your tickets.
          </p>
        </div>

        {reservations.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 30px',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: 22,
              background: 'rgba(255,255,255,0.015)',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                margin: '0 auto 14px',
                background: 'rgba(46,117,182,0.12)',
                border: '1px solid rgba(46,117,182,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={28} color="#60a5fa" />
            </div>
            <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No bookings yet</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
              Your reservations will appear here after booking an event.
            </p>
          </div>
        )}

        {reservations.map(r => {
          const cfg = statusConfig[r.status] || statusConfig.pending
          const myTickets = ticketsByReservation[r.id] || []
          const totalAmount = r.total || r.total_price || 0

          return (
            <div key={r.id} style={{ marginBottom: 28 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${cfg.color}22`,
                  borderRadius: 22,
                  padding: 22,
                  marginBottom: 10,
                  boxShadow: '0 16px 34px rgba(0,0,0,0.14)',
                }}
              >
                <div className="reservation-header" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                  {r.events?.image_url && (
                    <img
                      src={r.events.image_url}
                      alt={r.events?.title || ''}
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 14,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#fff',
                        fontSize: 20,
                        fontWeight: 800,
                        margin: '0 0 8px',
                        lineHeight: 1.25,
                      }}
                    >
                      {r.events?.title}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <CalendarDays size={14} color="#60a5fa" />
                        <p style={{ color: 'rgba(255,255,255,0.46)', fontSize: 13, margin: 0 }}>
                          {new Date(r.events?.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <MapPin size={14} color="#60a5fa" />
                        <p style={{ color: 'rgba(255,255,255,0.46)', fontSize: 13, margin: 0 }}>{r.events?.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: `${cfg.color}10`,
                    border: `1px solid ${cfg.color}25`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icon}</span>
                  <div>
                    <p style={{ color: cfg.color, fontSize: 11, fontWeight: 800, letterSpacing: '2px', margin: '0 0 4px' }}>
                      {cfg.label}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.54)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{cfg.desc}</p>
                  </div>
                </div>

                <div className="profile-grid-stats">
                  {[
                    { label: 'TICKETS', value: `${r.num_people || r.quantity}x` },
                    { label: 'TOTAL', value: `${totalAmount} EGP` },
                    {
                      label: 'BOOKED',
                      value: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, margin: '0 0 6px' }}>
                        {item.label}
                      </p>
                      <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {myTickets.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 18 }}>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, letterSpacing: '2px', fontWeight: 700, margin: '0 0 12px' }}>
                      MY TICKETS
                    </p>

                    <div className="tickets-stack">
                      {myTickets.map((ticket: any) => {
                        const ts = ticketTypeStyle[ticket.ticket_type] || ticketTypeStyle.standing

                        return (
                          <div
                            key={ticket.id}
                            className="ticket-row"
                            style={{
                              border: `1px solid ${ticket.checked_in ? 'rgba(39,174,96,0.25)' : 'rgba(255,255,255,0.06)'}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <div
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  borderRadius: 10,
                                  padding: '8px 12px',
                                  minWidth: 42,
                                  textAlign: 'center',
                                }}
                              >
                                <p style={{ color: 'rgba(255,255,255,0.26)', fontSize: 9, letterSpacing: '1px', margin: '0 0 2px' }}>#</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 900, margin: 0 }}>{ticket.ticket_number}</p>
                              </div>

                              <div>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{ticket.holder_name}</p>
                                <span
                                  style={{
                                    background: ts.bg,
                                    border: `1px solid ${ts.border}`,
                                    color: ts.color,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                  }}
                                >
                                  {ticket.ticket_type?.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              {ticket.checked_in ? (
                                <div style={{ textAlign: 'right' }}>
                                  <span
                                    style={{
                                      background: 'rgba(39,174,96,0.1)',
                                      border: '1px solid rgba(39,174,96,0.3)',
                                      color: '#27AE60',
                                      padding: '5px 12px',
                                      borderRadius: 999,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      letterSpacing: '1px',
                                      display: 'block',
                                      marginBottom: 4,
                                    }}
                                  >
                                    CHECKED IN
                                  </span>
                                  {ticket.checked_in_at && (
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: 0, textAlign: 'right' }}>
                                      {new Date(ticket.checked_in_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span
                                  style={{
                                    background: 'rgba(39,174,96,0.08)',
                                    border: '1px solid rgba(39,174,96,0.2)',
                                    color: '#27AE60',
                                    padding: '5px 12px',
                                    borderRadius: 999,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                  }}
                                >
                                  VALID
                                </span>
                              )}

                              <Link
                                href={`/ticket/${ticket.qr_code}`}
                                style={{
                                  background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                                  color: '#fff',
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: '1px',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                VIEW
                                <ArrowRight size={14} />
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

      <Footer />
    </main>
  )
}