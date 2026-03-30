import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft, Search, Plus, Eye, EyeOff, Trash2,
  Globe, Edit3, Check, X, ChevronDown, ChevronRight,
  ShieldAlert, Copy, Mail,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useProjects } from '../hooks/useProjects'
import { StatusBadge } from '../components/StatusBadge'
import { CopyButton } from '../components/CopyButton'
import { AccountDetailsPanel } from '../components/AccountDetailsPanel'
import { toast } from '../components/ui/Toast'
import type { SavedAlias, AliasStatus } from '../types'

const STATUS_OPTIONS: AliasStatus[] = ['unused', 'created', 'active', 'disabled']

// ── Password cell ──────────────────────────────────────────────
function PasswordCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type={show ? 'text' : 'password'} value={draft}
        onChange={e => setDraft(e.target.value)}
        style={{ width: 110, height: 28, padding: '0 8px', border: '1.5px solid hsl(var(--primary) / 0.4)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', outline: 'none' }}
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') { onChange(draft); setEditing(false) } if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      />
      <button className="copy-btn" onClick={() => { onChange(draft); setEditing(false) }}><Check size={12} /></button>
      <button className="copy-btn" onClick={() => { setDraft(value); setEditing(false) }}><X size={12} /></button>
    </div>
  )
  if (!value) return (
    <button className="copy-btn" onClick={() => setEditing(true)} title="Add password" style={{ fontSize: 11, width: 'auto', padding: '0 8px' }}>
      <Plus size={12} />
    </button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: show ? 'normal' : '2px' }}>
        {show ? value : '••••••••'}
      </span>
      <button className="copy-btn" onClick={() => setShow(!show)}>{show ? <EyeOff size={12} /> : <Eye size={12} />}</button>
      {show && <CopyButton text={value} size="sm" />}
      <button className="copy-btn" onClick={() => setEditing(true)}><Edit3 size={12} /></button>
    </div>
  )
}

// ── Editable text cell ─────────────────────────────────────────
function EditableCell({ value, onChange, placeholder = '—' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  if (editing) return (
    <input value={draft} onChange={e => setDraft(e.target.value)}
      style={{ width: 110, height: 26, padding: '0 8px', border: '1.5px solid hsl(var(--primary) / 0.4)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-sans)', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', outline: 'none' }}
      autoFocus
      onBlur={() => {onChange(draft); setEditing(false)}}
      onKeyDown={e => { if (e.key === 'Enter') { onChange(draft); setEditing(false) } if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
    />
  )
  return (
    <span onClick={() => setEditing(true)}
      style={{ fontSize: 12.5, color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, display: 'inline-block' }}
      title="Click to edit">
      {value || placeholder}
    </span>
  )
}

// ── Status selector ────────────────────────────────────────────
function StatusCell({ status, onChange }: { status: AliasStatus; onChange: (s: AliasStatus) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <StatusBadge status={status} />
        <ChevronDown size={10} style={{ color: 'hsl(var(--muted-foreground))' }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 120 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { onChange(s); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 7 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'hsl(var(--accent))'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Expand toggle ──────────────────────────────────────────────
function ExpandToggle({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={expanded ? 'Hide account details' : 'Show account details'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, borderRadius: 6,
        border: '1px solid hsl(var(--border))',
        background: expanded ? 'hsl(var(--primary) / 0.08)' : 'transparent',
        color: expanded ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        cursor: 'pointer', transition: 'all 150ms', flexShrink: 0,
      }}
      onMouseEnter={e => { if (!expanded) { const el = e.currentTarget as HTMLElement; el.style.background = 'hsl(var(--accent))'; el.style.color = 'hsl(var(--foreground))' } }}
      onMouseLeave={e => { if (!expanded) { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'hsl(var(--muted-foreground))' } }}>
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
    </button>
  )
}

// ── Mobile alias card ──────────────────────────────────────────
function AliasCard({ alias, index, isExpanded, onToggleExpand, onUpdate, onDelete, deleteConfirm, setDeleteConfirm }: {
  alias: SavedAlias; index: number; isExpanded: boolean
  onToggleExpand: () => void
  onUpdate: (u: Partial<SavedAlias>) => void
  onDelete: () => void
  deleteConfirm: boolean
  setDeleteConfirm: (v: boolean) => void
}) {
  return (
    <div style={{
      borderRadius: 12, border: '1px solid hsl(var(--border))',
      background: 'hsl(var(--card))', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Card header */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground) / 0.5)', fontFamily: 'var(--font-mono)', paddingTop: 2, flexShrink: 0, minWidth: 18, textAlign: 'right' }}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'hsl(var(--foreground))', wordBreak: 'break-all' }}>{alias.alias}</span>
            <CopyButton text={alias.alias} size="sm" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusCell status={alias.status} onChange={s => onUpdate({ status: s, accountCreated: s !== 'unused' })} />
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginLeft: 'auto' }}>
              {formatDistanceToNow(new Date(alias.dateAdded), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Card footer actions */}
      <div style={{ padding: '8px 14px 10px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid hsl(var(--border) / 0.5)' }}>
        <button onClick={onToggleExpand}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, height: 28,
            padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: `1px solid ${isExpanded ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border))'}`,
            background: isExpanded ? 'hsl(var(--primary) / 0.07)' : 'transparent',
            color: isExpanded ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-sans)',
          }}>
          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          Details
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {deleteConfirm ? (
            <>
              <button className="btn-premium btn-ghost" style={{ height: 28, padding: '0 8px', fontSize: 11 }} onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button style={{ height: 28, padding: '0 8px', fontSize: 11, background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', border: 'none', borderRadius: 7, cursor: 'pointer' }} onClick={onDelete}>Delete</button>
            </>
          ) : (
            <button className="copy-btn" onClick={() => setDeleteConfirm(true)} title="Delete alias" style={{ width: 28, height: 28 }}><Trash2 size={13} /></button>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}>
          <AccountDetailsPanel alias={alias} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export function ProjectDetailPage() {
  const { id } = useParams({ from: '/projects/$id' })
  const navigate = useNavigate()
  const { projects, updateAlias, deleteAlias } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [expandedAliasId, setExpandedAliasId] = useState<string | null>(null)

  const project = projects.find(p => p.id === id)

  if (!project) return (
    <div style={{ padding: '80px 16px', textAlign: 'center' }}>
      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 15 }}>Project not found.</p>
      <button className="btn-premium btn-primary" onClick={() => navigate({ to: '/projects' })} style={{ marginTop: 16 }}>
        <ArrowLeft size={14} /> Back to Projects
      </button>
    </div>
  )

  const filteredAliases = useMemo(() =>
    project.aliases.filter(a =>
      a.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.notes.toLowerCase().includes(searchQuery.toLowerCase())
    ), [project.aliases, searchQuery])

  const handleUpdate = (aliasId: string, updates: Partial<SavedAlias>) => updateAlias(id, aliasId, updates)

  const handleDelete = (aliasId: string) => {
    if (deleteConfirm === aliasId) {
      deleteAlias(id, aliasId)
      toast.success('Alias removed')
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(aliasId)
    }
  }

  const toggleExpand = (aliasId: string) => setExpandedAliasId(prev => prev === aliasId ? null : aliasId)

  return (
    <div className="page-main" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + header */}
      <div style={{ marginBottom: 24 }} className="animate-slide-up">
        <button className="btn-premium btn-ghost" onClick={() => navigate({ to: '/projects' })} style={{ marginBottom: 14, fontSize: 13 }}>
          <ArrowLeft size={14} /> Projects
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 750, letterSpacing: '-0.04em', margin: '0 0 4px', color: 'hsl(var(--foreground))' }}>
              {project.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {project.domain && <><Globe size={13} style={{ color: 'hsl(var(--muted-foreground))' }} /><span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{project.domain}</span><span style={{ color: 'hsl(var(--border))' }}>·</span></>}
              <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{project.aliases.length} aliases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'hsl(221 70% 48% / 0.06)', border: '1px solid hsl(221 70% 48% / 0.15)', marginBottom: 20 }}>
        <ShieldAlert size={14} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: 1.5 }}>
          Passwords are hidden by default. All data is stored locally in your browser.
        </p>
      </div>

      {/* Search */}
      {project.aliases.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }} />
          <input
            style={{ width: '100%', maxWidth: 320, height: 38, paddingLeft: 34, paddingRight: 14, border: '1px solid hsl(var(--border))', borderRadius: 10, background: 'hsl(var(--card))', fontSize: 13, fontFamily: 'var(--font-sans)', color: 'hsl(var(--foreground))', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Search aliases..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Alias list */}
      {project.aliases.length > 0 ? (
        <>
          {/* ── Desktop table (hidden on mobile) ── */}
          <div className="alias-table-wrap glass-card animate-slide-up stagger-1" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    {['', '#', 'Alias', 'Status', 'Username', 'Password', 'Added', ''].map((col, ci) => (
                      <th key={`${col}-${ci}`} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', background: 'hsl(var(--accent) / 0.5)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAliases.map((alias, i) => {
                    const isExpanded = expandedAliasId === alias.id
                    return (
                      <React.Fragment key={alias.id}>
                        <tr
                          style={{ borderBottom: isExpanded ? '1px solid hsl(var(--border) / 0.3)' : '1px solid hsl(var(--border) / 0.6)', transition: 'background 150ms', background: isExpanded ? 'hsl(var(--primary) / 0.025)' : undefined }}
                          onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--accent) / 0.4)' }}
                          onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = '' }}
                        >
                          <td style={{ padding: '12px 8px 12px 14px', width: 36 }}>
                            <ExpandToggle expanded={isExpanded} onClick={() => toggleExpand(alias.id)} />
                          </td>
                          <td style={{ padding: '12px 14px', color: 'hsl(var(--muted-foreground))', fontSize: 11.5, width: 36 }}>{i + 1}</td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'hsl(var(--foreground))' }}>{alias.alias}</span>
                              <CopyButton text={alias.alias} size="sm" />
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <StatusCell status={alias.status} onChange={s => handleUpdate(alias.id, { status: s, accountCreated: s !== 'unused' })} />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <EditableCell value={alias.username} onChange={v => handleUpdate(alias.id, { username: v })} placeholder="Add username" />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <PasswordCell value={alias.password} onChange={v => handleUpdate(alias.id, { password: v })} />
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'hsl(var(--muted-foreground))', fontSize: 11.5 }}>
                            {formatDistanceToNow(new Date(alias.dateAdded), { addSuffix: true })}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {deleteConfirm === alias.id ? (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn-premium btn-ghost" style={{ height: 26, fontSize: 11, padding: '0 8px' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button style={{ height: 26, fontSize: 11, padding: '0 8px', background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', border: 'none', borderRadius: 7, cursor: 'pointer' }} onClick={() => handleDelete(alias.id)}>Delete</button>
                              </div>
                            ) : (
                              <button className="copy-btn" onClick={() => handleDelete(alias.id)} title="Delete alias"><Trash2 size={13} /></button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{ borderBottom: '1px solid hsl(var(--border) / 0.6)' }}>
                            <td colSpan={8} style={{ padding: '8px 0 16px', background: 'hsl(var(--primary) / 0.015)' }}>
                              <AccountDetailsPanel alias={alias} onUpdate={updates => handleUpdate(alias.id, updates)} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile card list (hidden on desktop) ── */}
          <div className="alias-cards-wrap" style={{ flexDirection: 'column', gap: 10 }}>
            {filteredAliases.map((alias, i) => (
              <AliasCard
                key={alias.id}
                alias={alias}
                index={i}
                isExpanded={expandedAliasId === alias.id}
                onToggleExpand={() => toggleExpand(alias.id)}
                onUpdate={updates => handleUpdate(alias.id, updates)}
                onDelete={() => handleDelete(alias.id)}
                deleteConfirm={deleteConfirm === alias.id}
                setDeleteConfirm={v => setDeleteConfirm(v ? alias.id : null)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card animate-scale-in" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'hsl(var(--accent))', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Plus size={28} style={{ color: 'hsl(var(--primary) / 0.4)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 650, margin: '0 0 6px', letterSpacing: '-0.02em' }}>No aliases saved</h3>
          <p style={{ fontSize: 13.5, color: 'hsl(var(--muted-foreground))', margin: '0 0 24px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Go to the Generator, generate aliases, and click the save button to add them here.
          </p>
          <button className="btn-premium btn-primary" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft size={14} /> Go to Generator
          </button>
        </div>
      )}

    </div>
  )
}
