'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const roleAccess: Record<string, string[]> = {
  admin: ['events', 'reservations', 'verify', 'users'],
  staff: ['reservations', 'verify'],
  gate:  ['verify'],
}

const roleBadge: Record<string, { color: string; bg: string }> = {
  admin: { color: '#2E75B6', bg: 'rgba(46,117,182,0.12)' },
  staff: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  gate:  { color: '#27AE60', bg: 'rgba(39,174,96,0.12)'  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0,
    rejected: 0, awaiting: 0, review: 0,
    tickets: 0, revenue: 0, tax: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/dashboard/login')
      return
    }
    setRole(localStorage.getItem('admin_role') || 'gate')
    setUsername(localStorage.getItem('admin_username') || 'Admin')
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data } = await supabase.from('reservations').select('*, events(price)')
    if (!data) return
    const confirmed = data.filter(r => r.status === 'confirmed')
    const totalRevenue = confirmed.reduce((sum, r) => sum + (r.total_price || 0), 0)
    const TAX_RATE = 0.14
    const revenueBeforeTax = Math.round(totalRevenue / (1 + TAX_RATE))
    setStats({
      total:     data.length,
      pending:   data.filter(r => r.status === 'pending').length,
      confirmed: confirmed.length,
      rejected:  data.filter(r => r.status === 'rejected').length,
      awaiting:  data.filter(r => r.status === 'awaiting_payment').length,
      review:    data.filter(r => r.status === 'payment_review').length,
      tickets:   confirmed.reduce((sum, r) => sum + (r.num_people || 0), 0),
      revenue:   revenueBeforeTax,
      tax:       totalRevenue - revenueBeforeTax,
    })
  }

  const logout = () => {
    ;['admin_auth', 'admin_role', 'admin_username', 'admin_id'].forEach(k =>
      localStorage.removeItem(k),
    )
    router.push('/dashboard/login')
  }

  const can   = (page: string) => (roleAccess[role] || []).includes(page)
  const badge = roleBadge[role] || { color: '#888', bg: 'rgba(136,136,136,0.1)' }

  const navCards = [
    { key: 'events',       href: '/dashboard/events',       icon: '🎉', title: 'Manage Events',   sub: 'Add, edit & delete events'      },
    { key: 'reservations', href: '/dashboard/reservations', icon: '📋', title: 'Reservations',     sub: 'View & manage all bookings'     },
    { key: 'verify',       href: '/dashboard/verify',       icon: '🔍', title: 'Verify Entry',     sub: 'Scan QR codes at the gate'      },
    { key: 'users',        href: '/dashboard/users',        icon: '👥', title: 'Manage Users',     sub: 'Add & control admin access'     },
  ].filter(c => can(c.key))

  const statCards = [
    { label: 'Total Bookings',   value: stats.total,     color: '#fff'     },
    { label: 'Pending',          value: stats.pending,   color: '#F0A500'  },
    { label: 'Confirmed',        value: stats.confirmed, color: '#27AE60'  },
    { label: 'Awaiting Payment', value: stats.awaiting,  color: '#2E75B6'  },
    { label: 'Payment Review',   value: stats.review,    color: '#8b5cf6'  },
    { label: 'Rejected',         value: stats.rejected,  color: '#E74C3C'  },
  ]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: 0, fontFamily: 'Inter, sans-serif' }}>

      {/* TOPBAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Dashboard</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>👋 {username}</span>
          {role && (
            <span style={{ background: badge.bg, border: `1px solid ${badge.color}40`, color: badge.color, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', padding: '3px 10px', borderRadius: 50 }}>
              {role.toUpperCase()}
            </span>
          )}
          <button onClick={logout} style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#E74C3C', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>OVERVIEW</span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 36, color: '#fff', margin: '8px 0 0', letterSpacing: '-1px' }}>Dashboard</h1>
        </div>

        {/* STATS — admin + staff */}
        {(role === 'admin' || role === 'staff') && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
              {statCards.map(c => (
                <div key={c.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px 20px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 10px' }}>{c.label.toUpperCase()}</p>
                  <p style={{ color: c.color, fontSize: 34, fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* REVENUE — admin only */}
            {role === 'admin' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.12)', borderRadius: 18, padding: '28px', marginBottom: 40 }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '2px', margin: '0 0 20px' }}>
                  REVENUE SUMMARY — CONFIRMED BOOKINGS ONLY
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  {[
                    { icon: '🎟️', label: 'Tickets Sold',        value: stats.tickets.toString(),              color: '#fff'    },
                    { icon: '💰', label: 'Revenue (before tax)', value: `${stats.revenue.toLocaleString()} EGP`, color: '#27AE60' },
                    { icon: '🏛️', label: 'VAT Collected (14%)', value: `${stats.tax.toLocaleString()} EGP`,    color: '#E74C3C' },
                  ].map(r => (
                    <div key={r.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', margin: '0 0 8px' }}>{r.icon} {r.label.toUpperCase()}</p>
                      <p style={{ color: r.color, fontSize: 26, fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* NAV CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: navCards.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {navCards.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(46,117,182,0.1)', borderRadius: 18, padding: '32px 28px', transition: 'all 0.25s', cursor: 'pointer' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(46,117,182,0.4)'
                  el.style.transform = 'translateY(-4px)'
                  el.style.background = 'rgba(46,117,182,0.06)'
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(46,117,182,0.1)'
                  el.style.transform = 'translateY(0)'
                  el.style.background = 'rgba(255,255,255,0.025)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}