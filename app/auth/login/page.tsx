'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type React from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const params = new URLSearchParams(window.location.search)
    router.push(params.get('redirect') || '/profile')
  }

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,94,0.4) 0%, transparent 65%)', top: '-10%', left: '-5%' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.15) 0%, transparent 65%)', bottom: '-5%', right: '-5%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎟️</div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>
              Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            </span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 10 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(46,117,182,0.15)',
          borderRadius: 20, padding: 36,
        }}>
          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)',
              borderRadius: 10, padding: '12px 16px',
              color: '#E74C3C', fontSize: 13, marginBottom: 20,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>EMAIL</label>
              <input
                type="email" required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  padding: '13px 16px', color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>PASSWORD</label>
              <input
                type="password" required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%', backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  padding: '13px 16px', color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8, padding: '14px',
                background: loading ? 'rgba(46,117,182,0.5)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(46,117,182,0.35)',
              }}
            >{loading ? 'Signing in...' : 'Sign In →'}</button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: '#2E75B6', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}