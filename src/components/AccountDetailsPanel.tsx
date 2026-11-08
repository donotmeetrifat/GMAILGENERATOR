import React, { useState, useRef, useEffect } from 'react'
import {
  Globe, Link2, User, FileText, Eye, EyeOff, Check, X,
  ExternalLink, Edit3, Plus, Sparkles, Lock,
} from 'lucide-react'
import { CopyButton } from './CopyButton'
import { getSettings } from '../lib/storage'
import type { SavedAlias } from '../types'

interface AccountDetailsPanelProps {
  alias: SavedAlias
  onUpdate: (updates: Partial<SavedAlias>) => void
}

// ── Shared tokens ───────────────────────────────────────────────
const FIELD_ICON_WRAP: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '10.5px', fontWeight: 650,
  color: 'hsl(var(--muted-foreground))',
  letterSpacing: '0.07em', textTransform: 'uppercase', userSelect: 'none',
}

// ── Helpers ───────────────────────────────────────────────────
function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  try {
    const parsed = (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }
  } catch {
    return undefined
  }
  return undefined
}

// ── Plain text editable field ───────────────────────────────────
interface DetailFieldProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: 'text' | 'url'
  monospace?: boolean
  linkHref?: string
  isLast?: boolean
  sensitive?: boolean
  hideSensitive?: boolean
}

function DetailField({
  icon, iconBg, iconColor, label, value, onChange,
  placeholder, type = 'text', monospace = false, linkHref, isLast,
  sensitive = false, hideSensitive = false,
}: DetailFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [revealed, setRevealed] = useState(!hideSensitive)
  const inputRef = useRef<HTMLInputElement>(null)

  // sync revealed when hideSensitive changes
  useEffect(() => { if (hideSensitive) setRevealed(false) }, [hideSensitive])

  const commit = () => { onChange(draft.trim()); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }
  const startEdit = () => { setDraft(value); setEditing(true) }

  const isMasked = sensitive && hideSensitive && !revealed

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(90px, 120px) 1fr',
      alignItems: 'center', gap: '10px', padding: '10px 0',
      borderBottom: isLast ? 'none' : '1px solid hsl(var(--border) / 0.4)',
      transition: 'background 150ms',
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ ...FIELD_ICON_WRAP, background: iconBg, color: iconColor }}>{icon}</span>
        <span style={LABEL_STYLE}>{label}</span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        {editing ? (
          <>
            <input
              ref={inputRef}
              type={sensitive ? 'text' : 'text'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
              style={{
                flex: 1, height: '34px', padding: '0 12px',
                border: '1.5px solid hsl(var(--primary) / 0.5)', borderRadius: '9px',
                fontSize: '13px',
                fontFamily: monospace ? 'var(--font-mono)' : 'var(--font-sans)',
                background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                outline: 'none',
                boxShadow: '0 0 0 3px hsl(var(--primary) / 0.1), 0 1px 4px rgba(0,0,0,0.06)',
                minWidth: 0, transition: 'all 150ms',
              }}
            />
            <button className="copy-btn" onClick={commit} title="Save (Enter)">
              <Check size={13} style={{ color: 'hsl(142 71% 36%)' }} />
            </button>
            <button className="copy-btn" onClick={cancel} title="Cancel (Esc)">
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            {value ? (
              <span
                onClick={isMasked ? undefined : startEdit}
                title={isMasked ? 'Click eye to reveal' : 'Click to edit'}
                style={{
                  fontSize: '13px',
                  fontFamily: monospace ? 'var(--font-mono)' : 'var(--font-sans)',
                  color: isMasked ? 'hsl(var(--muted-foreground) / 0.5)' : 'hsl(var(--foreground))',
                  cursor: isMasked ? 'default' : 'pointer',
                  flex: 1, minWidth: 0, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  padding: '5px 8px', borderRadius: '7px', transition: 'background 150ms',
                  letterSpacing: monospace ? (isMasked ? '0.2em' : '0.01em') : undefined,
                  filter: isMasked ? 'blur(4px)' : 'none',
                  userSelect: isMasked ? 'none' : undefined,
                }}
                onMouseEnter={e => { if (!isMasked) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--accent))' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {value}
              </span>
            ) : (
              <button
                onClick={startEdit}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '8px',
                  border: '1px dashed hsl(var(--border) / 0.8)',
                  background: 'transparent', color: 'hsl(var(--muted-foreground) / 0.5)',
                  fontSize: '12px', cursor: 'pointer', transition: 'all 150ms',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'hsl(var(--primary) / 0.4)'
                  el.style.color = 'hsl(var(--primary))'
                  el.style.background = 'hsl(var(--primary) / 0.04)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'hsl(var(--border) / 0.8)'
                  el.style.color = 'hsl(var(--muted-foreground) / 0.5)'
                  el.style.background = 'transparent'
                }}
              >
                <Plus size={11} /><span>{placeholder}</span>
              </button>
            )}

            {value && (
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                {/* Reveal/hide toggle for sensitive fields */}
                {sensitive && (
                  <button
                    className="copy-btn"
                    onClick={() => setRevealed(r => !r)}
                    title={revealed ? 'Hide' : 'Reveal'}
                  >
                    {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                )}
                {!isMasked && <CopyButton text={value} size="sm" />}
                {type === 'url' && sanitizeUrl(linkHref) && !isMasked && (
                  <a href={sanitizeUrl(linkHref)} target="_blank" rel="noopener noreferrer" className="copy-btn" title="Open in new tab">
                    <ExternalLink size={12} />
                  </a>
                )}
                <button className="copy-btn" onClick={startEdit} title="Edit">
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Notes field ─────────────────────────────────────────────────
function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const commit = () => { onChange(draft); setEditing(false) }

  return (
    <div style={{ paddingTop: '11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ ...FIELD_ICON_WRAP, background: 'hsl(265 75% 55% / 0.10)', color: 'hsl(265 75% 55%)' }}>
          <FileText size={13} />
        </span>
        <span style={LABEL_STYLE}>Notes</span>
        {value && !editing && (
          <button className="copy-btn" onClick={() => { setDraft(value); setEditing(true) }} title="Edit notes"
            style={{ marginLeft: 'auto', width: '26px', height: '26px' }}>
            <Edit3 size={12} />
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add notes, credentials hints, plan tier, or any context about this account..."
            autoFocus rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid hsl(var(--primary) / 0.45)', borderRadius: '12px',
              fontSize: '13px', fontFamily: 'var(--font-sans)',
              background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
              outline: 'none', resize: 'vertical',
              boxShadow: '0 0 0 3px hsl(var(--primary) / 0.09), 0 1px 4px rgba(0,0,0,0.06)',
              lineHeight: 1.6, boxSizing: 'border-box', minHeight: '90px', transition: 'all 150ms',
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
              if (e.key === 'Enter' && e.metaKey) commit()
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground) / 0.55)' }}>⌘ + Enter to save · Esc to cancel</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-premium btn-ghost" style={{ height: '30px', fontSize: '12px', padding: '0 12px' }} onClick={() => { setDraft(value); setEditing(false) }}>Cancel</button>
              <button className="btn-premium btn-primary" style={{ height: '30px', fontSize: '12px', padding: '0 12px' }} onClick={commit}><Check size={12} /> Save</button>
            </div>
          </div>
        </div>
      ) : value ? (
        <div
          onClick={() => { setDraft(value); setEditing(true) }}
          style={{
            position: 'relative', fontSize: '13px', color: 'hsl(var(--foreground))',
            lineHeight: 1.65, padding: '12px 14px', borderRadius: '12px',
            background: 'hsl(var(--accent) / 0.55)', border: '1px solid hsl(var(--border) / 0.55)',
            cursor: 'pointer', whiteSpace: 'pre-wrap', wordBreak: 'break-word', transition: 'all 150ms',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'hsl(var(--accent))'; el.style.borderColor = 'hsl(var(--border) / 0.8)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'hsl(var(--accent) / 0.55)'; el.style.borderColor = 'hsl(var(--border) / 0.55)' }}
          title="Click to edit"
        >
          {value}
          <span style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0, transition: 'opacity 150ms' }} className="notes-edit-icon">
            <Edit3 size={11} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </span>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(''); setEditing(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '13px 16px', borderRadius: '12px',
            border: '1px dashed hsl(var(--border) / 0.8)', background: 'transparent',
            color: 'hsl(var(--muted-foreground) / 0.45)', fontSize: '12.5px',
            cursor: 'pointer', transition: 'all 150ms', textAlign: 'left',
            fontFamily: 'var(--font-sans)', lineHeight: 1.5,
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'hsl(var(--primary) / 0.35)'; el.style.color = 'hsl(var(--primary))'; el.style.background = 'hsl(var(--primary) / 0.04)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'hsl(var(--border) / 0.8)'; el.style.color = 'hsl(var(--muted-foreground) / 0.45)'; el.style.background = 'transparent' }}
        >
          <Plus size={13} style={{ flexShrink: 0 }} />
          Add notes — plan tier, hints, or any context about this account...
        </button>
      )}
    </div>
  )
}

// ── Main panel ──────────────────────────────────────────────────
export function AccountDetailsPanel({ alias, onUpdate }: AccountDetailsPanelProps) {
  const settings = getSettings()
  const hideSensitive = settings.hideSensitiveFields
  const hasAnyData = alias.website || alias.loginUrl || alias.username || alias.notes

  return (
    <div style={{
      margin: '0 8px 2px 8px', borderRadius: '14px',
      background: 'var(--glass-bg)', border: '1px solid hsl(var(--border) / 0.6)',
      backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(255,255,255,0.4) inset',
      overflow: 'hidden', animation: 'slideDown 0.2s cubic-bezier(0.4,0,0.2,1) both',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '11px 18px 10px', borderBottom: '1px solid hsl(var(--border) / 0.4)',
        background: 'hsl(var(--primary) / 0.025)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '6px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', flexShrink: 0 }}>
          <Sparkles size={11} />
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--primary) / 0.75)' }}>
          Account Details
        </span>
        <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground) / 0.45)', marginLeft: '1px' }}>
          · {hasAnyData ? 'click any field to edit' : 'no data yet — add details below'}
        </span>
        {hideSensitive && (
          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: 'hsl(var(--primary) / 0.07)', border: '1px solid hsl(var(--primary) / 0.15)' }}>
            <Lock size={9} style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ fontSize: '10px', fontWeight: 650, color: 'hsl(var(--primary))', letterSpacing: '0.04em' }}>masked</span>
          </div>
        )}
      </div>

      {/* Fields */}
      <div style={{ padding: '6px 18px 16px' }}>
        <DetailField
          icon={<Globe size={13} />}
          iconBg="hsl(221 70% 48% / 0.10)" iconColor="hsl(221 70% 48%)"
          label="Website" value={alias.website}
          onChange={v => onUpdate({ website: v })}
          placeholder="e.g. twitter.com"
        />
        <DetailField
          icon={<Link2 size={13} />}
          iconBg="hsl(177 70% 41% / 0.10)" iconColor="hsl(177 70% 38%)"
          label="Login URL" value={alias.loginUrl ?? ''}
          onChange={v => onUpdate({ loginUrl: v })}
          placeholder="https://..." type="url"
          linkHref={alias.loginUrl || undefined}
        />
        <DetailField
          icon={<User size={13} />}
          iconBg="hsl(35 90% 55% / 0.10)" iconColor="hsl(35 90% 42%)"
          label="Username" value={alias.username}
          onChange={v => onUpdate({ username: v })}
          placeholder="Add username" monospace
        />
        <DetailField
          icon={<Lock size={13} />}
          iconBg="hsl(340 80% 55% / 0.10)" iconColor="hsl(340 80% 46%)"
          label="Password" value={alias.password ?? ''}
          onChange={v => onUpdate({ password: v })}
          placeholder="Add password" monospace
          sensitive hideSensitive={hideSensitive}
          isLast
        />

        <div style={{ margin: '4px 0 0', height: '1px', background: 'hsl(var(--border) / 0.4)' }} />

        <NotesField value={alias.notes} onChange={v => onUpdate({ notes: v })} />
      </div>
    </div>
  )
}
