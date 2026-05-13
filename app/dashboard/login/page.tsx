'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password)
      .single()

    if (dbError || !data) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }

    localStorage.setItem('admin_auth', 'true')
    localStorage.setItem('admin_role', data.role)
    localStorage.setItem('admin_username', data.username)
    localStorage.setItem('admin_id', data.id)

    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* BG Orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,94,0.3) 0%, transparent 65%)', top: '-10%', right: '-5%' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.12) 0%, transparent 65%)', bottom: '-5%', left: '-5%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px', position: 'relative', zIndex: 2 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 12px 32px rgba(46,117,182,0.3)' }}>🎟️</div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, marginTop: 12 }}>Admin Access</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleLogin} style={{ 
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(46,117,182,0.15)',
          borderRadius: 20, padding: 36,
          display: 'flex', flexDirection: 'column', gap: 20 
        }}>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)',
              borderRadius: 12, padding: '12px 16px',
              color: '#E74C3C', fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 8 }}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%', borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '14px 16px', color: '#fff', fontSize: 15,
                fontFamily: 'Inter, sans-serif', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 8 }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%', borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '14px 16px', color: '#fff', fontSize: 15,
                fontFamily: 'Inter, sans-serif', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(46,117,182,0.4)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
              border: 'none', borderRadius: 10, padding: '16px',
              fontSize: 15, fontWeight: 700, letterSpacing: '2px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(46,117,182,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Verifying...' : 'Enter Dashboard →'}
          </button>
        </form>
      </div>
    </main>
  )
}