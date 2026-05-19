'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, User } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)
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

  const scrollTo = (id: string) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
    setMenuOpen(false)
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')?.[0] ||
    'My Profile'

  const navLinks = [
    { label: 'Events', id: 'events' },
    { label: 'DJs', id: 'djs' },
    { label: 'Partners', id: 'partners' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ]

  const navLinkStyle: CSSProperties = {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: 0,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const ProfileBadge = ({ mobile = false }: { mobile?: boolean }) => (
    <Link
      href="/profile"
      onClick={() => setMenuOpen(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: mobile ? 12 : 10,
        textDecoration: 'none',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.opacity = '0.8'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = '1'
      }}
    >
      <div
        style={{
          width: mobile ? 36 : 36,
          height: mobile ? 36 : 36,
          borderRadius: '50%',
          background: 'rgba(46,117,182,0.15)',
          border: '1.5px solid rgba(46,117,182,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <User size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
      </div>

      <span
        style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: mobile ? 13 : 13,
          fontWeight: 600,
          letterSpacing: '0.3px',
          maxWidth: mobile ? 160 : 140,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {mobile ? displayName : 'Profile'}
      </span>
    </Link>
  )

  const AuthSection = () => {
    if (loading) {
      return (
        <div
          style={{
            width: 80,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )
    }

    if (user) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProfileBadge />
          <button
            onClick={handleLogout}
            style={{
              ...navLinkStyle,
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'rgba(231,76,60,0.9)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            Sign Out
          </button>
        </div>
      )
    }

    return (
      <Link
        href="/auth/login?redirect=/profile"
        style={{
          background: 'linear-gradient(135deg, #2E75B6, #1E5A96)',
          color: '#fff',
          padding: '9px 24px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 13,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(46,117,182,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(46,117,182,0.35)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(46,117,182,0.25)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Sign In
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
          50% { opacity: 0.5; }
        }

        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }

        .mobile-menu {
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <nav
        style={{
          background: 'rgba(10,15,30,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(46,117,182,0.1)',
          padding: '0 24px',
          height: 68,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2E75B6, #1E5A96)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(46,117,182,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" color="#fff">
                <path d="M7 10c0-1.657 1.343-3 3-3h4c1.657 0 3 1.343 3 3v6c0 1.657-1.343 3-3 3h-4c-1.657 0-3-1.343-3-3v-6z" />
                <path d="M14 7v10M10 7v10M8 5h8" />
              </svg>
            </div>

            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </Link>

          <div className="nav-desktop" style={{ alignItems: 'center', gap: 36, marginLeft: 'auto' }}>
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                style={navLinkStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="nav-desktop" style={{ marginLeft: 'auto' }}>
            <AuthSection />
          </div>

          <div className="nav-hamburger" style={{ alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            {!loading && user && <ProfileBadge mobile />}

            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'rgba(46,117,182,0.1)',
                border: '1px solid rgba(46,117,182,0.25)',
                borderRadius: 8,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(46,117,182,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(46,117,182,0.1)'
              }}
            >
              {menuOpen ? (
                <X size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              ) : (
                <Menu size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: 68,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'rgba(10,15,30,0.96)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(46,117,182,0.1)',
            padding: '20px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                ...navLinkStyle,
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                width: '100%',
                background: 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(46,117,182,0.1)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(46,117,182,0.1)', margin: '12px 0' }} />

          {loading ? (
            <div
              style={{
                height: 48,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          ) : user ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '8px 0',
              }}
            >
              <ProfileBadge mobile />
              <button
                onClick={handleLogout}
                style={{
                  ...navLinkStyle,
                  color: 'rgba(231,76,60,0.8)',
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(231,76,60,0.08)'
                  e.currentTarget.style.color = 'rgba(231,76,60,1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(231,76,60,0.8)'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login?redirect=/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'linear-gradient(135deg, #2E75B6, #1E5A96)',
                color: '#fff',
                padding: '14px 16px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block',
                margin: '8px 0 0',
                boxShadow: '0 2px 8px rgba(46,117,182,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(46,117,182,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(46,117,182,0.2)'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </>
  )
}