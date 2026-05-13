'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const roles = ['admin', 'staff', 'gate']

const roleColors: Record<string, string> = {
  admin: '#2E75B6',
  staff: '#8b5cf6',
  gate:  '#27AE60',
}

const roleDesc: Record<string, string> = {
  admin: 'Full access — all pages + users + revenue',
  staff: 'Reservations + verify entry',
  gate:  'Verify entry only',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: '10px 14px',
  color: '#fff', fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'staff' })
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('admin_auth') !== 'true') { router.push('/dashboard/login'); return }
      if (localStorage.getItem('admin_role') !== 'admin') { router.push('/dashboard'); return }
      setCurrentUser(localStorage.getItem('admin_username') || '')
    }
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('admin_users')
      .select('id, username, role, created_at')
      .order('created_at')
    setUsers(data || [])
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: insertError } = await supabase.from('admin_users').insert({
      username: form.username.trim().toLowerCase(),
      password: form.password,
      role: form.role,
    })
    if (insertError) {
      setError(insertError.message.includes('unique') ? 'Username already exists.' : insertError.message)
      setLoading(false)
      return
    }
    setForm({ username: '', password: '', role: 'staff' })
    setShowForm(false)
    await load()
    setLoading(false)
  }

  const handleDelete = async (id: string, uname: string) => {
    if (uname === currentUser) { alert("You can't delete your own account."); return }
    if (!confirm(`Delete user "${uname}"?`)) return
    await supabase.from('admin_users').delete().eq('id', id)
    await load()
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    await supabase.from('admin_users').update({ role: newRole }).eq('id', id)
    await load()
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', padding: 0, fontFamily: 'Inter, sans-serif' }}>

      {/* TOPBAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(46,117,182,0.12)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
            Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / Users</span>
          </span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ color: '#2E75B6', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px' }}>ADMIN</span>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 34, color: '#fff', margin: '8px 0 0', letterSpacing: '-1px' }}>Manage Users</h1>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: '6px 0 0' }}>{users.length} admin account{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            style={{
              background: showForm ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: showForm ? 'rgba(255,255,255,0.5)' : '#fff',
              border: showForm ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: 10, padding: '12px 24px', fontSize: 12, fontWeight: 700,
              letterSpacing: '1.5px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              boxShadow: showForm ? 'none' : '0 6px 20px rgba(46,117,182,0.3)',
            }}>
            {showForm ? '✕ Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Role Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {roles.map(r => (
            <div key={r} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${roleColors[r]}20`, borderRadius: 12, padding: '14px 16px' }}>
              <span style={{ background: `${roleColors[r]}15`, border: `1px solid ${roleColors[r]}35`, color: roleColors[r], fontSize: 9, fontWeight: 700, letterSpacing: '2px', padding: '3px 10px', borderRadius: 50, display: 'inline-block', marginBottom: 8 }}>
                {r.toUpperCase()}
              </span>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0, lineHeight: 1.6 }}>{roleDesc[r]}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(46,117,182,0.2)', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: '#2E75B6', fontSize: 10, letterSpacing: '2.5px', fontWeight: 700, margin: 0 }}>NEW USER</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, display: 'block', marginBottom: 6 }}>USERNAME</label>
                <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. ahmed" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, display: 'block', marginBottom: 6 }}>PASSWORD</label>
                <input type="text" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set a password" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '2px', fontWeight: 700, display: 'block', marginBottom: 6 }}>ROLE</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {roles.map(r => <option key={r} value={r} style={{ backgroundColor: '#0a0f1e' }}>{r}</option>)}
                </select>
              </div>
            </div>

            {error && <p style={{ color: '#E74C3C', fontSize: 12, margin: 0 }}>⚠ {error}</p>}

            <button type="submit" disabled={loading} style={{
              background: loading ? 'rgba(46,117,182,0.3)' : 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
              border: 'none', borderRadius: 8, padding: '11px 24px',
              fontSize: 12, fontWeight: 700, letterSpacing: '1.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', alignSelf: 'flex-start',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(46,117,182,0.3)',
            }}>
              {loading ? 'Saving...' : 'Create User →'}
            </button>
          </form>
        )}

        {/* Users Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
            {['USERNAME', 'ROLE', 'CREATED', ''].map(h => (
              <span key={h} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '2px', fontWeight: 700 }}>{h}</span>
            ))}
          </div>

          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 12, letterSpacing: '3px' }}>NO USERS FOUND</p>
            </div>
          )}

          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '16px 20px', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems: 'center', gap: 12 }}>

              {/* Username */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${roleColors[u.role] || '#555'}15`, border: `1px solid ${roleColors[u.role] || '#555'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {u.role === 'admin' ? '👑' : u.role === 'staff' ? '🛡️' : '🚪'}
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{u.username}</p>
                  {u.username === currentUser && (
                    <span style={{ background: 'rgba(46,117,182,0.12)', border: '1px solid rgba(46,117,182,0.3)', color: '#2E75B6', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '1px 7px', borderRadius: 50 }}>YOU</span>
                  )}
                </div>
              </div>

              {/* Role Select */}
              <select
                value={u.role}
                onChange={e => handleRoleChange(u.id, e.target.value)}
                disabled={u.username === currentUser}
                style={{
                  background: `${roleColors[u.role] || '#555'}12`,
                  border: `1px solid ${roleColors[u.role] || '#555'}35`,
                  color: roleColors[u.role] || '#555',
                  borderRadius: 8, padding: '7px 10px',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                  cursor: u.username === currentUser ? 'not-allowed' : 'pointer',
                  opacity: u.username === currentUser ? 0.5 : 1,
                }}>
                {roles.map(r => (
                  <option key={r} value={r} style={{ backgroundColor: '#0a0f1e', color: '#fff' }}>{r}</option>
                ))}
              </select>

              {/* Created */}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
                {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDelete(u.id, u.username)}
                disabled={u.username === currentUser}
                style={{
                  background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
                  color: '#E74C3C', borderRadius: 8, padding: '7px 14px',
                  fontSize: 11, fontWeight: 700, letterSpacing: '1px',
                  cursor: u.username === currentUser ? 'not-allowed' : 'pointer',
                  opacity: u.username === currentUser ? 0.25 : 1,
                  fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}