'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type NavLink =
  | { label: string; type: 'route'; href: string }
  | { label: string; type: 'section'; id: string }

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
      setMenuOpen(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const goToSection = (id: string) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
    setMenuOpen(false)
  }

  const handleNavClick = (link: NavLink) => {
    if (link.type === 'route') {
      router.push(link.href)
      setMenuOpen(false)
      return
    }

    goToSection(link.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')?.[0] ||
    'My Profile'

  const navLinks: NavLink[] = [
    { label: 'EVENTS', type: 'route', href: '/events' },
    { label: 'ABOUT', type: 'section', id: 'about' },
    { label: 'CONTACT', type: 'section', id: 'contact' },
  ]

  const linkBtn: CSSProperties = {
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
    transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
  }

  const ProfileBadge = ({ mobile = false }: { mobile?: boolean }) => (
    <Link
      href="/profile"
      onClick={() => setMenuOpen(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: mobile ? 10 : 8,
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: mobile ? 32 : 34,
          height: mobile ? 32 : 34,
          borderRadius: '50%',
          background: 'rgba(46,117,182,0.12)',
          border: '1px solid rgba(46,117,182,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: mobile ? 14 : 15,
          transition: 'border-color 0.2s ease',
          flexShrink: 0,
          color: '#fff',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#2E75B6'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(46,117,182,0.3)'
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>

      <span
        style={{
          color: 'rgba(255,255,255,0.68)',
          fontSize: mobile ? 13 : 12,
          fontWeight: 700,
          letterSpacing: '0.4px',
          maxWidth: mobile ? 140 : 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {mobile ? displayName : 'My Profile'}
      </span>
    </Link>
  )

  const AuthSection = () => {
    if (loading) {
      return (
        <div
          style={{
            width: 96,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )
    }

    if (user) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfileBadge />
          <button
            onClick={handleLogout}
            style={{
              ...linkBtn,
              color: 'rgba(255,255,255,0.24)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#E74C3C'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.24)'
            }}
          >
            LOGOUT
          </button>
        </div>
      )
    }

    return (
      <Link
        href="/auth/login?redirect=/profile"
        style={{
          background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
          color: '#fff',
          padding: '9px 20px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 12,
          textDecoration: 'none',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(46,117,182,0.3)',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        LOGIN
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-hamburger { display: none; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .45; }
        }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      <nav
        style={{
          background: 'rgba(10,15,30,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(46,117,182,0.12)',
          padding: '0 24px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              flexShrink: 0,
            }}
          >
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
                boxShadow: '0 4px 14px rgba(46,117,182,0.3)',
              }}
            >
              🎟️
            </div>

            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: 19,
                color: '#fff',
                letterSpacing: '-0.3px',
              }}
            >
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </Link>

          <div className="nav-desktop" style={{ alignItems: 'center', gap: 28 }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                style={linkBtn}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                }}
              >
                {link.label}
              </button>
            ))}

            <AuthSection />
          </div>

          <div className="nav-hamburger" style={{ alignItems: 'center', gap: 10 }}>
            {!loading && user && <ProfileBadge />}

            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <rect width="18" height="2" rx="1" fill="rgba(255,255,255,0.75)" />
                  <rect y="5" width="18" height="2" rx="1" fill="rgba(255,255,255,0.75)" />
                  <rect y="10" width="18" height="2" rx="1" fill="rgba(255,255,255,0.75)" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'rgba(10,15,30,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(46,117,182,0.12)',
            padding: '16px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              style={{
                ...linkBtn,
                textAlign: 'left',
                padding: '12px 10px',
                borderRadius: 10,
                fontSize: 12,
                letterSpacing: '2px',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(46,117,182,0.08)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />

          {loading ? (
            <div
              style={{
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
              }}
            >
              <ProfileBadge mobile />
              <button
                onClick={handleLogout}
                style={{
                  ...linkBtn,
                  color: '#E74C3C',
                  fontSize: 11,
                  letterSpacing: '1.5px',
                  fontWeight: 700,
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login?redirect=/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: '#fff',
                padding: '14px 0',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                letterSpacing: '1px',
                textAlign: 'center',
                display: 'block',
                margin: '4px 0 2px',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 4px 14px rgba(46,117,182,0.25)',
              }}
            >
              LOGIN
            </Link>
          )}
        </div>
      )}
    </>
  )
}