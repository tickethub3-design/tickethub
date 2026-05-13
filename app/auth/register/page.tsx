'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const password = form.password.trim()

    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number.')
      return
    }

    if (password !== form.confirmPassword.trim()) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/email-confirmed`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/register-success')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* BG Orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,94,0.4) 0%, transparent 65%)', top: '-10%', right: '-5%' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,117,182,0.15) 0%, transparent 65%)', bottom: '-5%', left: '-5%' }} />
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
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 10 }}>Create your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(46,117,182,0.15)',
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

            {/* Full Name */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>FULL NAME</label>
              <input
                style={inputStyle} type="text" required
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>EMAIL</label>
              <input
                style={inputStyle} type="email" required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>PASSWORD</label>
              <input
                style={inputStyle} type="password" required minLength={8}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              {form.password.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {[
                    { label: '8+ chars', ok: form.password.length >= 8 },
                    { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
                    { label: 'Number',    ok: /\d/.test(form.password) },
                  ].map(r => (
                    <span key={r.label} style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 50,
                      background: r.ok ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${r.ok ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      color: r.ok ? '#27AE60' : 'rgba(255,255,255,0.25)',
                      transition: 'all 0.2s',
                    }}>{r.ok ? '✓' : '·'} {r.label}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: 7 }}>CONFIRM PASSWORD</label>
              <input
                style={{
                  ...inputStyle,
                  borderColor: passwordsMatch
                    ? 'rgba(39,174,96,0.4)'
                    : passwordsMismatch
                    ? 'rgba(231,76,60,0.4)'
                    : 'rgba(255,255,255,0.08)',
                }}
                type="password" required
                placeholder="Retype your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {passwordsMatch && (
                <p style={{ color: '#27AE60', fontSize: 12, marginTop: 6 }}>✓ Passwords match</p>
              )}
              {passwordsMismatch && (
                <p style={{ color: '#E74C3C', fontSize: 12, marginTop: 6 }}>✗ Passwords do not match</p>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8, padding: '14px',
                background: loading ? 'rgba(46,117,182,0.4)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(46,117,182,0.35)',
              }}
            >{loading ? 'Creating account...' : 'Create Account →'}</button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#2E75B6', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  )
}