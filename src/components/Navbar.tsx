import React, { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Mail, FolderOpen, Settings, ShieldCheck, Menu, X, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSettings } from '@/lib/storage'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

const NAV_ITEMS = [
  { to: '/', label: 'Generator', icon: Mail, exact: true },
  { to: '/projects', label: 'Projects', icon: FolderOpen, exact: false },
  { to: '/settings', label: 'Settings', icon: Settings, exact: false },
]

export function Navbar() {
  const location = useLocation()
  const { isOnline } = useNetworkStatus()
  const settings = getSettings()
  const localOnly = settings.localOnlyMode
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(to: string, exact: boolean) {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  const offlineBadge = !isOnline && (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 99,
      background: 'hsl(35 90% 55% / 0.12)',
      border: '1px solid hsl(35 90% 55% / 0.28)',
    }}>
      <WifiOff size={11} style={{ color: 'hsl(35 90% 40%)' }} />
      <span style={{ fontSize: '11px', fontWeight: 650, color: 'hsl(35 90% 36%)', letterSpacing: '0.02em' }}>
        Offline
      </span>
    </div>
  )

  const privacyBadge = (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 99,
      background: localOnly ? 'hsl(142 71% 45% / 0.1)' : 'hsl(var(--primary) / 0.07)',
      border: `1px solid ${localOnly ? 'hsl(142 71% 45% / 0.22)' : 'hsl(var(--primary) / 0.14)'}`,
    }}>
      <ShieldCheck size={11} style={{ color: localOnly ? 'hsl(142 71% 32%)' : 'hsl(var(--primary))' }} />
      <span style={{ fontSize: '11px', fontWeight: 650, color: localOnly ? 'hsl(142 71% 28%)' : 'hsl(var(--primary))', letterSpacing: '0.02em' }}>
        {localOnly ? 'Local-only' : 'Private'}
      </span>
    </div>
  )

  return (
    <>
      <header
        className="glass-nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '56px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
          onClick={() => setMobileOpen(false)}>
          <img
            src="/logo.png"
            alt="Unlimited Gmail Generator Logo"
            style={{
              width: 32, height: 32, borderRadius: 8, objectFit: 'contain', flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '15.5px', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(var(--foreground))' }}>
            Unlimited <span style={{ color: 'hsl(var(--primary))' }}>Gmail Generator</span>
          </span>
        </Link>

        {/* Desktop center nav — hidden on small screens */}
        <nav className="desktop-nav" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '2px',
          background: 'hsl(var(--secondary) / 0.9)', border: '1px solid hsl(var(--border))',
          borderRadius: '999px', padding: '3px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '13px', fontWeight: active ? 600 : 450,
                letterSpacing: '-0.01em', textDecoration: 'none',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                background: active ? 'hsl(var(--primary))' : 'transparent',
                color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: active ? '0 2px 8px hsl(var(--primary) / 0.28)' : 'none',
              }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = 'hsl(var(--foreground))'; el.style.background = 'hsl(var(--accent))' } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = 'hsl(var(--muted-foreground))'; el.style.background = 'transparent' } }}
              >
                <Icon size={12} />{label}
              </Link>
            )
          })}
        </nav>

        {/* Right: privacy badge + offline badge (desktop) + hamburger (mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {offlineBadge}
            {privacyBadge}
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid hsl(var(--border))',
              background: mobileOpen ? 'hsl(var(--accent))' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.2)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{
            position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 99,
            background: 'hsl(var(--card))',
            borderBottom: '1px solid hsl(var(--border))',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            padding: '8px 12px 12px',
          }}>
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
              const active = isActive(to, exact)
              return (
                <Link key={to} to={to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 10, marginBottom: 3,
                    textDecoration: 'none', fontSize: '14px', fontWeight: active ? 650 : 450,
                    background: active ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                    color: active ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                    transition: 'background 150ms',
                  }}
                >
                  <Icon size={16} style={{ color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }} />
                  {label}
                </Link>
              )
            })}
            <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {offlineBadge}
              {privacyBadge}
            </div>
          </div>
        </>
      )}
    </>
  )
}
