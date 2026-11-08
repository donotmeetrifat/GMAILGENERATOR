import React, { useState, useEffect, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Clipboard, X, Copy, Check, FolderPlus,
  ChevronDown, Search, Info, Star, Layers,
  WifiOff, Download,
} from 'lucide-react'
import { generateAliases, isValidGmail, normalizeGmail, formatAliasCount, getAliasCount } from '@/lib/gmail'
import { useProjects } from '@/hooks/useProjects'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { copyToClipboard } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { blink } from '@/blink/client'
import type { Project } from '@/types'
import { BulkSaveModal } from '@/components/BulkSaveModal'

// ── Syntax-highlighted alias display ──────────────────────────
function AliasDisplay({ alias, isOriginal = false }: { alias: string; isOriginal?: boolean }) {
  const parts = alias.split(/(\.|@)/)
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '-0.01em' }}>
      {parts.map((part, i) => {
        if (part === '.') {
          return (
            <span key={i} style={{
              color: isOriginal ? 'hsl(var(--muted-foreground) / 0.45)' : 'hsl(var(--primary))',
              fontWeight: 700, fontSize: '15px',
            }}>·</span>
          )
        }
        if (part === '@') return <span key={i} style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>@</span>
        if (part === 'gmail.com') return <span key={i} style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>{part}</span>
        return <span key={i} style={{ color: isOriginal ? 'hsl(var(--foreground) / 0.7)' : 'hsl(var(--foreground))' }}>{part}</span>
      })}
    </span>
  )
}

// ── Add to project modal ───────────────────────────────────────
interface AddToProjectModalProps {
  alias: string
  mainEmail: string
  projects: Project[]
  onSave: (projectId: string) => void
  onCreateAndSave: (name: string, domain: string) => void
  onClose: () => void
}

function AddToProjectModal({ alias, mainEmail, projects, onSave, onCreateAndSave, onClose }: AddToProjectModalProps) {
  const [mode, setMode] = useState<'pick' | 'create'>(projects.length > 0 ? 'pick' : 'create')
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'pick') { if (!selectedId) return; onSave(selectedId) }
    else { if (!newName.trim()) return; onCreateAndSave(newName.trim(), newDomain.trim()) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 650, letterSpacing: '-0.02em', color: 'hsl(var(--foreground))' }}>
              Save to Project
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}>
              {alias}
            </p>
          </div>
          <button onClick={onClose} className="btn-premium btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2px', padding: '3px', background: 'hsl(var(--secondary))', borderRadius: 10, marginBottom: '20px' }}>
          {[
            { key: 'pick', label: 'Existing Project', disabled: projects.length === 0 },
            { key: 'create', label: 'New Project', disabled: false },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setMode(tab.key as 'pick' | 'create')}
              disabled={tab.disabled}
              style={{
                flex: 1, padding: '6px 12px', borderRadius: 8, border: 'none',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: mode === tab.key ? 600 : 450,
                fontFamily: 'var(--font-sans)',
                background: mode === tab.key ? 'hsl(var(--card))' : 'transparent',
                color: tab.disabled ? 'hsl(var(--muted-foreground) / 0.4)' : mode === tab.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: mode === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 180ms ease',
              }}
            >{tab.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'pick' ? (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedId} onChange={e => setSelectedId(e.target.value)}
                style={{
                  width: '100%', height: 44, padding: '0 36px 0 14px',
                  border: '1.5px solid hsl(var(--border))', borderRadius: 10,
                  background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                  fontSize: '14px', fontFamily: 'var(--font-sans)',
                  appearance: 'none', cursor: 'pointer', outline: 'none',
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.domain ? ` (${p.domain})` : ''}</option>
                ))}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }} />
            </div>
          ) : (
            <>
              <input className="input-premium" placeholder="Project name (e.g. Social Media)" value={newName} onChange={e => setNewName(e.target.value)} style={{ paddingLeft: 14, paddingRight: 14 }} autoFocus />
              <input className="input-premium" placeholder="Domain (optional, e.g. twitter.com)" value={newDomain} onChange={e => setNewDomain(e.target.value)} style={{ paddingLeft: 14, paddingRight: 14 }} />
            </>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-premium btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-premium btn-primary" style={{ flex: 1 }} disabled={mode === 'pick' ? !selectedId : !newName.trim()}>
              <FolderPlus size={14} />
              Save Alias
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Single alias row ───────────────────────────────────────────
interface AliasRowProps {
  alias: string
  rowNumber: number        // 1-based display number
  isOriginal?: boolean
  animIndex: number        // for stagger delay
  onSaveToProject: (alias: string) => void
}

function AliasRow({ alias, rowNumber, isOriginal = false, animIndex, onSaveToProject }: AliasRowProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    const ok = await copyToClipboard(alias)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: Math.min(animIndex * 0.018, 0.32), duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={`alias-row${isOriginal ? ' alias-row-original' : ''}`}
    >
      {/* Serial number */}
      <span className="alias-row-num">{isOriginal ? '—' : rowNumber}</span>

      {/* Email display */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <AliasDisplay alias={alias} isOriginal={isOriginal} />
      </div>

      {/* Original badge */}
      {isOriginal && (
        <span className="alias-original-badge">
          <Star size={9} />
          original
        </span>
      )}

      {/* Action buttons */}
      <div className="row-actions" style={{ flexShrink: 0, display: 'flex', gap: 3 }}>
        {!isOriginal && (
          <button
            onClick={() => onSaveToProject(alias)}
            className="copy-btn"
            title="Save to project"
            style={{ width: 27, height: 27 }}
          >
            <FolderPlus size={12} />
          </button>
        )}
        <motion.button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          title={copied ? 'Copied!' : 'Copy'}
          style={{ width: 27, height: 27 }}
          animate={copied ? { scale: [1, 1.3, 0.88, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.38, ease: 'easeInOut' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export function GeneratorPage() {
  const search = useSearch({ strict: false }) as { email?: string }
  const navigate = useNavigate()
  const { projects, addAliasToProject, createProject } = useProjects()
  const { isOnline } = useNetworkStatus()

  const [email, setEmail] = useState(search.email ?? '')
  const [aliases, setAliases] = useState<string[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [filter, setFilter] = useState('')
  const [saveTarget, setSaveTarget] = useState<string | null>(null)
  const [showBulkSave, setShowBulkSave] = useState(false)
  const [copyAllDone, setCopyAllDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const val = email.trim()
    if (!val) { setAliases([]); setIsValid(null); setFilter(''); return }
    if (isValidGmail(val)) {
      const generated = generateAliases(val)
      setIsValid(true)
      setAliases(generated)
      blink.analytics.log('aliases_generated', {
        alias_count: generated.length,
        email_domain: 'gmail.com',
      })
    } else { setIsValid(false); setAliases([]) }
  }, [email])

  useEffect(() => {
    const val = email.trim()
    navigate({ to: '/', search: val ? { email: val } : {}, replace: true } as never)
  }, [email, navigate])

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setEmail(text.trim())
    } catch { inputRef.current?.focus() }
  }

  async function handleCopyAll() {
    if (!aliases.length) return
    const ok = await copyToClipboard(aliases.join('\n'))
    if (ok) {
      setCopyAllDone(true)
      setTimeout(() => setCopyAllDone(false), 2000)
      toast.success(`Copied ${aliases.length} aliases`)
      blink.analytics.log('copy_all_aliases', { alias_count: aliases.length })
    }
  }

  function handleDownloadTxt() {
    const list = filteredAliases.length > 0 ? filteredAliases : aliases
    if (!list.length) return
    const content = list.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const username = email.split('@')[0] || 'gmail'
    a.href = url
    a.download = `${username}-aliases.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${list.length} aliases as .TXT`)
  }

  function handleDownloadCsv() {
    const list = filteredAliases.length > 0 ? filteredAliases : aliases
    if (!list.length) return
    const now = new Date().toISOString().slice(0, 10)
    const normalized = normalizeGmail(email)
    const header = 'Alias,Main Email,Date Generated\r\n'
    const rows = list.map(a => `"${a}","${normalized}","${now}"`).join('\r\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const username = email.split('@')[0] || 'gmail'
    a.href = url
    a.download = `${username}-aliases.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${list.length} aliases as .CSV`)
  }

  function handleModalSave(projectId: string) {
    if (!saveTarget) return
    const saved = addAliasToProject(projectId, { alias: saveTarget, mainEmail: normalizeGmail(email) })
    if (saved) {
      toast.success('Alias saved to project!')
      blink.analytics.log('alias_saved_to_project', { action: 'existing_project' })
    } else {
      toast.error('This alias is already saved in that project.')
    }
    setSaveTarget(null)
  }

  function handleCreateAndSave(name: string, domain: string) {
    if (!saveTarget) return
    const project = createProject(name, domain)
    addAliasToProject(project.id, { alias: saveTarget, mainEmail: normalizeGmail(email) })
    toast.success(`Alias saved to "${name}"`)
    blink.analytics.log('alias_saved_to_project', { action: 'new_project' })
    setSaveTarget(null)
  }

  function handleBulkSave(projectId: string, selectedAliases: string[]) {
    let saved = 0, skipped = 0
    selectedAliases.forEach(alias => {
      const result = addAliasToProject(projectId, { alias, mainEmail: normalizeGmail(email) })
      result ? saved++ : skipped++
    })
    const project = projects.find(p => p.id === projectId)
    const name = project?.name ?? 'project'
    if (saved > 0 && skipped === 0) toast.success(`${saved} alias${saved !== 1 ? 'es' : ''} saved to "${name}"`)
    else if (saved > 0) toast.success(`${saved} saved, ${skipped} already existed in "${name}"`)
    else toast.error(`All selected aliases already exist in "${name}"`)
    blink.analytics.log('bulk_aliases_saved', { saved, skipped })
    setShowBulkSave(false)
  }

  function handleBulkCreateAndSave(name: string, domain: string, selectedAliases: string[]) {
    const project = createProject(name, domain)
    let saved = 0
    selectedAliases.forEach(alias => {
      const result = addAliasToProject(project.id, { alias, mainEmail: normalizeGmail(email) })
      if (result) saved++
    })
    toast.success(`${saved} alias${saved !== 1 ? 'es' : ''} saved to "${name}"`)
    blink.analytics.log('bulk_aliases_saved', { saved, skipped: 0 })
    setShowBulkSave(false)
  }

  const normalizedEmail = email.trim() && isValidGmail(email.trim()) ? normalizeGmail(email.trim()) : null
  const lowerFilter = filter.toLowerCase()
  const filteredAliases = lowerFilter
    ? aliases.filter(a => a.includes(lowerFilter))
    : aliases

  // Build the display list: original first (row 0), then aliases
  const showOriginal = !!normalizedEmail
  const aliasCount = email && isValidGmail(email) ? getAliasCount(email) : 0

  return (
    <main className="page-main" style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ textAlign: 'center', marginBottom: 44 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 999,
            background: 'hsl(var(--primary) / 0.07)', border: '1px solid hsl(var(--primary) / 0.15)',
          }}>
            <img src="/logo.png" alt="Unlimited Gmail Logo" style={{ width: 14, height: 14, objectFit: 'contain' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'hsl(var(--primary))' }}>
              Unlimited Gmail Generator
            </span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 13px', borderRadius: 999,
            background: isOnline ? 'hsl(142 71% 45% / 0.08)' : 'hsl(35 90% 55% / 0.14)',
            border: `1px solid ${isOnline ? 'hsl(142 71% 45% / 0.22)' : 'hsl(35 90% 55% / 0.35)'}`,
          }}>
            {isOnline ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'hsl(142 71% 32%)' }}>
                  100% Offline Ready
                </span>
              </>
            ) : (
              <>
                <WifiOff size={11} style={{ color: 'hsl(35 90% 42%)' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'hsl(35 90% 38%)' }}>
                  Offline Mode Active
                </span>
              </>
            )}
          </div>
        </div>

        <h1 style={{
          margin: 0, fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 750, letterSpacing: '-0.04em', lineHeight: 1.1,
          color: 'hsl(var(--foreground))',
        }}>
          One Gmail,{' '}
          <span style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(221 80% 65%))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            infinite aliases
          </span>
        </h1>

        <p style={{
          margin: '14px auto 0', fontSize: '15.5px', lineHeight: 1.7,
          color: 'hsl(var(--muted-foreground))', maxWidth: 460,
        }}>
          Free Gmail dot trick generator. Turn one Gmail into hundreds of unique email variations — 100% free, offline, no signup.
        </p>
      </motion.div>

      {/* ── Offline Active Alert Banner ──────────────── */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px', borderRadius: 12,
              background: 'hsl(35 90% 55% / 0.1)', border: '1px solid hsl(35 90% 55% / 0.28)',
              color: 'hsl(35 90% 36%)', marginBottom: 18, fontSize: '13px', fontWeight: 550,
              lineHeight: 1.5,
            }}
          >
            <WifiOff size={16} style={{ flexShrink: 0, color: 'hsl(35 90% 42%)' }} />
            <span>
              <strong>Offline Mode Active:</strong> You are currently disconnected from the internet. All generator algorithms and project vaults continue to work completely offline.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generator card ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card generator-card"
        style={{ marginBottom: 20 }}
      >
        {/* Email Input */}
        <div className="input-wrapper" style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isValid === true ? 'hsl(var(--primary))' : isValid === false ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
            pointerEvents: 'none', transition: 'color 200ms ease', zIndex: 1,
          }}>
            <Mail size={16} />
          </div>

          <input
            ref={inputRef}
            className={`input-premium${isValid === false ? ' error' : ''}`}
            style={{ paddingLeft: '44px', paddingRight: '88px', fontSize: '15px', height: '50px' }}
            type="email"
            placeholder="yourname@gmail.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setFilter('') }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />

          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            paddingRight: '10px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {email && (
              <button onClick={() => { setEmail(''); setFilter('') }} className="copy-btn" title="Clear" style={{ width: 28, height: 28, borderRadius: 8 }}>
                <X size={13} />
              </button>
            )}
            <button onClick={handlePaste} className="copy-btn" title="Paste from clipboard" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <Clipboard size={13} />
            </button>
          </div>
        </div>

        {/* Validation messages */}
        <AnimatePresence mode="wait">
          {isValid === false && email.trim() && (
            <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 500, color: 'hsl(var(--destructive))', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Info size={11} />
              Please enter a valid Gmail address (e.g. name@gmail.com)
            </motion.p>
          )}
        </AnimatePresence>

        {/* Results header: count + search + copy-all */}
        <AnimatePresence>
          {isValid === true && aliases.length > 0 && (
            <motion.div
              key="results-header"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: 10 }}
            >
              {/* Stats row */}
              <div className="alias-stats-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))' }}>
                  <strong style={{ color: 'hsl(var(--primary))' }}>{formatAliasCount(aliasCount)}</strong>
                  {' '}aliases — all reach the same inbox
                  {filter && filteredAliases.length !== aliases.length && (
                    <span style={{ marginLeft: 8, color: 'hsl(var(--muted-foreground) / 0.7)' }}>
                      ({filteredAliases.length} shown)
                    </span>
                  )}
                </span>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <motion.button
                    onClick={handleCopyAll}
                    className={`btn-premium btn-outline copy-all-btn${copyAllDone ? ' copy-all-done' : ''}`}
                    style={{ height: 32, padding: '0 12px', fontSize: '12.5px', gap: 5 }}
                    animate={copyAllDone ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {copyAllDone ? <Check size={12} /> : <Copy size={12} />}
                    {copyAllDone ? 'Copied!' : 'Copy All'}
                  </motion.button>
                  <button
                    onClick={handleDownloadTxt}
                    className="btn-premium btn-outline"
                    style={{ height: 32, padding: '0 10px', fontSize: '12px', gap: 4, display: 'flex', alignItems: 'center' }}
                    title="Download all aliases as a text file"
                  >
                    <Download size={12} />
                    .TXT
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="btn-premium btn-outline"
                    style={{ height: 32, padding: '0 10px', fontSize: '12px', gap: 4, display: 'flex', alignItems: 'center' }}
                    title="Export all aliases as a CSV spreadsheet"
                  >
                    <Download size={12} />
                    .CSV
                  </button>
                  {projects.length > 0 && (
                    <button
                      onClick={() => setShowBulkSave(true)}
                      className="btn-premium btn-outline"
                      style={{ height: 32, padding: '0 12px', fontSize: '12.5px', gap: 5, display: 'flex', alignItems: 'center' }}
                      title="Save all aliases to a project"
                    >
                      <Layers size={12} />
                      Save All
                    </button>
                  )}
                </div>
              </div>

              {/* Search box — always visible when aliases exist */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{
                  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                  color: 'hsl(var(--muted-foreground) / 0.65)', pointerEvents: 'none',
                }} />
                <input
                  ref={filterRef}
                  className="alias-search-input"
                  style={{
                    width: '100%', height: 34, paddingLeft: 32, paddingRight: filter ? 32 : 12,
                    boxSizing: 'border-box',
                  }}
                  placeholder={`Search ${aliases.length} aliases…`}
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
                {filter && (
                  <button
                    onClick={() => setFilter('')}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'hsl(var(--muted-foreground))', display: 'flex', padding: 2,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alias list */}
        <AnimatePresence>
          {(showOriginal && aliases.length > 0) && (
            <motion.div
              key="alias-list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="alias-list-container scrollbar-thin"
            >
              {/* Original email — always row 1 */}
              {(!filter || normalizedEmail?.includes(lowerFilter)) && (
                <AliasRow
                  alias={normalizedEmail!}
                  rowNumber={0}
                  isOriginal
                  animIndex={0}
                  onSaveToProject={setSaveTarget}
                />
              )}

              {/* Divider between original and aliases */}
              {(!filter || normalizedEmail?.includes(lowerFilter)) && filteredAliases.length > 0 && (
                <div className="alias-list-divider" />
              )}

              {/* Generated aliases */}
              {filteredAliases.map((alias, i) => (
                <AliasRow
                  key={alias}
                  alias={alias}
                  rowNumber={i + 1}
                  animIndex={i + 1}
                  onSaveToProject={setSaveTarget}
                />
              ))}

              {/* Empty filter state */}
              {filter && filteredAliases.length === 0 && !(normalizedEmail?.includes(lowerFilter)) && (
                <div style={{ textAlign: 'center', padding: '28px 20px', color: 'hsl(var(--muted-foreground))' }}>
                  <Search size={20} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No aliases match "{filter}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!email.trim() && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '36px 20px 24px', color: 'hsl(var(--muted-foreground))' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'hsl(var(--primary) / 0.08)', border: '1px solid hsl(var(--primary) / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <img src="/logo.png" alt="Unlimited Gmail Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            </div>
            <p style={{ margin: '0 auto', fontSize: '13.5px', maxWidth: 300, lineHeight: 1.6 }}>
              Enter a Gmail address above to instantly generate all dot alias variations
            </p>
          </motion.div>
        )}

        {!email.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{
              marginTop: 14, padding: '13px 16px',
              background: 'hsl(var(--primary) / 0.04)', border: '1px solid hsl(var(--primary) / 0.10)',
              borderRadius: 10, display: 'flex', gap: 10,
            }}
          >
            <Info size={13} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
              <strong style={{ color: 'hsl(var(--foreground))' }}>How it works:</strong>{' '}
              Gmail treats dots as invisible — so{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>j.ohn@gmail.com</span> and{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>john@gmail.com</span> are the same inbox.
              Use different aliases per site to track sign-ups and spot spam.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Single alias save modal */}
      <AnimatePresence>
        {saveTarget && (
          <AddToProjectModal
            alias={saveTarget}
            mainEmail={normalizeGmail(email)}
            projects={projects}
            onSave={handleModalSave}
            onCreateAndSave={handleCreateAndSave}
            onClose={() => setSaveTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Bulk save modal */}
      <AnimatePresence>
        {showBulkSave && (
          <BulkSaveModal
            aliases={filteredAliases}
            mainEmail={normalizeGmail(email)}
            projects={projects}
            onSave={handleBulkSave}
            onCreateAndSave={handleBulkCreateAndSave}
            onClose={() => setShowBulkSave(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
