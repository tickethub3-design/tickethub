'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

interface TopBarProps {
  title: string
  subtitle?: string
  role?: string
  roleBadgeColor?: { color: string; bg: string }
  username?: string
  onLogout?: () => void
}

export default function TopBar({ title, subtitle, role, roleBadgeColor, username, onLogout }: TopBarProps) {
  const logoutBtnStyle: CSSProperties = {
    background: 'rgba(231,76,60,0.08)',
    border: '1px solid rgba(231,76,60,0.2)',
    color: '#E74C3C',
    padding: '7px 16px',
    borderRadius: 8,
    cursor: onLogout ? 'pointer' : 'default',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    marginLeft: 12,
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(46,117,182,0.12)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #1A3C5E, #2E75B6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}
        >
          🎟️
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
          Ticket<span style={{ color: '#2E75B6' }}>Hub</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13 }}> / {title}</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {username && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>👋 {username}</span>}

        {role && roleBadgeColor && (
          <span
            style={{
              background: roleBadgeColor.bg,
              border: `1px solid ${roleBadgeColor.color}40`,
              color: roleBadgeColor.color,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.5px',
              padding: '3px 10px',
              borderRadius: 50,
            }}
          >
            {role.toUpperCase()}
          </span>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            style={logoutBtnStyle}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(231,76,60,0.12)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(231,76,60,0.08)'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  )
}
