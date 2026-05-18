'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)   // ← مضاف
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // ✅ الخطوة 1: اجيب الـ session الحالية أولاً بـ getSession (أسرع من getUser)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)   // ← خلاص عارفين الحالة
    })

    // ✅ الخطوة 2: استنى أي تغيير جديد في الـ auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const scrollTo = (id: string) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
    setMenuOpen(false)
  }

  const displayName = user?.user_metadata?.full_name || ''

  const navLinks = [
    { label: 'EVENTS',   id: 'events'   },
    { label: 'DJS',      id: 'djs'      },
    { label: 'PARTNERS', id: 'partners' },
    { label: 'ABOUT',    id: 'about'    },
    { label: 'CONTACT',  id: 'contact'  },
  ]

  const linkBtn: React.CSSProperties = {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: 0,
    textDecoration: 'none',
    transition: 'color 0.15s',
  }

  // ✅ الـ auth section بيتبنى بس لما نعرف الحالة الحقيقية
  const AuthSection = () => {
    if (loading) {
      // ✅ Skeleton بسيط بدل ما يعرض LOGIN غلط
      return (
        <div style={{
          width: 80, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )
    }

    if (user) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(46,117,182,0.12)',
              border: '1px solid rgba(46,117,182,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, transition: 'border-color 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2E75B6')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(46,117,182,0.3)')}>
              👤
            </div>
            {displayName && (
              <span style={{
                color: 'rgba(255,255,255,0.5)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.5px',
                maxWidth: 120, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName}
              </span>
            )}
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            style={{ ...linkBtn, color: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
            LOGOUT
          </button>
        </div>
      )
    }

    return (
      <Link href="/auth/login" style={{
        background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
        color: '#fff', padding: '8px 20px', borderRadius: 10,
        fontWeight: 700, fontSize: 12, textDecoration: 'none',
        letterSpacing: '1px', whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(46,117,182,0.3)',
        fontFamily: 'Poppins, sans-serif',
      }}>
        LOGIN
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .nav-desktop   { display: flex; }
        .nav-hamburger { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 640px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      <nav style={{
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(46,117,182,0.12)',
        padding: '0 24px',
        height: 64,
        position: 'sticky', top: 0, zIndex: 100,
        fontFamily: 'Inter, sans-serif',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, boxShadow: '0 4px 14px rgba(46,117,182,0.3)',
            }}>🎟️</div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 19, color: '#fff', letterSpacing: '-0.3px' }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: 28 }}>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)} style={linkBtn}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                {link.label}
              </button>
            ))}
            {/* ✅ AuthSection هنا */}
            <AuthSection />
          </div>

          {/* Mobile: profile + hamburger */}
          <div className="nav-hamburger" style={{ alignItems: 'center', gap: 10 }}>
            {/* ✅ بيظهر بس لما loading ينتهي */}
            {!loading && user && (
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(46,117,182,0.12)',
                  border: '1px solid rgba(46,117,182,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>👤</div>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9, width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
              {menuOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1"  y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <rect width="18" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
                  <rect y="5"  width="18" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
                  <rect y="10" width="18" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(46,117,182,0.12)',
          padding: '16px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} style={{
              ...linkBtn, textAlign: 'left', padding: '12px 10px',
              borderRadius: 10, fontSize: 12, letterSpacing: '2px', width: '100%',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,117,182,0.08)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
              {link.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />

          {/* ✅ Mobile auth — مستنى الـ loading */}
          {loading ? (
            <div style={{
              height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(46,117,182,0.12)',
                  border: '1px solid rgba(46,117,182,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>👤</div>
                {displayName && (
                  <span style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700,
                    maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{displayName}</span>
                )}
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                  setMenuOpen(false)
                }}
                style={{ ...linkBtn, color: '#E74C3C', fontSize: 11, letterSpacing: '1.5px', fontWeight: 700 }}>
                LOGOUT
              </button>
            </div>
          ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{
              background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: '#fff', padding: '14px 0', borderRadius: 12,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
              letterSpacing: '1px', textAlign: 'center',
              display: 'block', margin: '4px 0 2px',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 14px rgba(46,117,182,0.25)',
            }}>
              LOGIN
            </Link>
          )}
        </div>
      )}
    </>
  )
}