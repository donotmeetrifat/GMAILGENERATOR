import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Download, Upload, Trash2, X, Check,
  AlertTriangle, Info, Database, FileJson, Eye, EyeOff,
  Lock, CheckCircle2, ChevronDown, ChevronRight,
} from 'lucide-react'
import { getSettings, saveSettings, exportData, importData, clearAllData, getProjects } from '@/lib/storage'
import { toast } from '@/components/ui/Toast'
import type { AppSettings } from '@/types'

// ── Toggle switch ──────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, description, warn }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; warn?: boolean
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, width: '100%', padding: '14px 18px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        borderRadius: 12, transition: 'background 150ms ease', textAlign: 'left',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--accent))' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: 550, color: warn ? 'hsl(35 90% 42%)' : 'hsl(var(--foreground))' }}>{label}</div>
        {description && <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 999, flexShrink: 0, position: 'relative',
        background: checked ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        transition: 'background 200ms ease',
        boxShadow: checked ? '0 0 0 3px hsl(var(--primary) / 0.12)' : 'none',
      }}>
        <div style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
          background: 'hsl(var(--primary-foreground))',
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </button>
  )
}

// ── Section card ───────────────────────────────────────────────
function Section({ title, icon: Icon, children, danger }: {
  title: string; icon: React.ElementType; children: React.ReactNode; danger?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ overflow: 'hidden', border: danger ? '1px solid hsl(var(--destructive) / 0.25)' : undefined }}
    >
      <div style={{
        padding: '15px 18px 13px',
        borderBottom: `1px solid hsl(var(${danger ? '--destructive' : '--border'}) / ${danger ? 0.15 : 1})`,
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `hsl(var(${danger ? '--destructive' : '--primary'}) / 0.1)`,
          border: `1px solid hsl(var(${danger ? '--destructive' : '--primary'}) / ${danger ? 0.2 : 0.15})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} style={{ color: `hsl(var(${danger ? '--destructive' : '--primary'}))` }} />
        </div>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 650, color: danger ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))' }}>
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </motion.div>
  )
}

// ── Row divider ─────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: 'hsl(var(--border))', margin: '0 18px' }} />
}

// ── Info callout ───────────────────────────────────────────────
function InfoCallout({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'success' | 'warn' }) {
  const colors = {
    primary: { bg: 'hsl(var(--primary) / 0.05)', border: 'hsl(var(--primary) / 0.12)', icon: 'hsl(var(--primary))' },
    success: { bg: 'hsl(142 71% 45% / 0.07)', border: 'hsl(142 71% 45% / 0.2)', icon: 'hsl(142 71% 34%)' },
    warn: { bg: 'hsl(35 90% 55% / 0.07)', border: 'hsl(35 90% 55% / 0.2)', icon: 'hsl(35 90% 38%)' },
  }[variant]
  return (
    <div style={{ padding: '10px 13px', borderRadius: 9, background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', gap: 9 }}>
      <Info size={13} style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

// ── Export modal ───────────────────────────────────────────────
function ExportModal({ onClose }: { onClose: () => void }) {
  const [includePasswords, setIncludePasswords] = useState(false)
  const [done, setDone] = useState(false)
  const projects = getProjects()
  const aliasCount = projects.reduce((n, p) => n + p.aliases.length, 0)
  const withPasswords = projects.reduce((n, p) => n + p.aliases.filter(a => a.password).length, 0)

  function handleExport() {
    const json = exportData(includePasswords)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dotalias-backup-${new Date().toISOString().slice(0, 10)}${includePasswords ? '' : '-no-passwords'}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDone(true)
    setTimeout(() => { setDone(false); onClose() }, 1400)
    toast.success(`Exported ${projects.length} projects, ${aliasCount} aliases`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 14 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="glass-card modal-card"
        style={{ width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={15} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: 650, letterSpacing: '-0.02em' }}>Export Backup</h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                {projects.length} projects · {aliasCount} aliases
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-premium btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
            <X size={14} />
          </button>
        </div>

        {/* Password option */}
        <div style={{ borderRadius: 12, border: '1px solid hsl(var(--border))', overflow: 'hidden', marginBottom: 16 }}>
          <button
            onClick={() => setIncludePasswords(false)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: '13px 15px',
              background: !includePasswords ? 'hsl(var(--primary) / 0.05)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '1px solid hsl(var(--border))',
              transition: 'background 150ms',
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${!includePasswords ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`, background: !includePasswords ? 'hsl(var(--primary))' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {!includePasswords && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(var(--primary-foreground))' }} />}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={12} style={{ color: 'hsl(142 71% 36%)' }} />
                Safe export (recommended)
              </div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                Passwords are stripped. Safe to share or store in cloud.
              </div>
            </div>
          </button>
          <button
            onClick={() => setIncludePasswords(true)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: '13px 15px',
              background: includePasswords ? 'hsl(35 90% 55% / 0.05)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              transition: 'background 150ms',
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${includePasswords ? 'hsl(35 90% 45%)' : 'hsl(var(--border))'}`, background: includePasswords ? 'hsl(35 90% 45%)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {includePasswords && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(0 0% 100%)' }} />}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={12} style={{ color: 'hsl(35 90% 42%)' }} />
                Full export (includes passwords)
              </div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                {withPasswords > 0 ? `${withPasswords} aliases have passwords saved.` : 'No passwords saved yet.'} Keep this file secure.
              </div>
            </div>
          </button>
        </div>

        {includePasswords && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
            <InfoCallout variant="warn">
              <strong style={{ color: 'hsl(35 85% 38%)' }}>Caution:</strong> This file will contain plaintext passwords. Store it securely and never upload it to cloud services unencrypted.
            </InfoCallout>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-premium btn-outline" style={{ flex: 1, height: 38 }}>Cancel</button>
          <motion.button
            onClick={handleExport}
            className="btn-premium btn-primary"
            style={{ flex: 2, height: 38 }}
            animate={done ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          >
            {done ? <><Check size={14} /> Exported!</> : <><Download size={14} /> Download JSON</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Import modal ───────────────────────────────────────────────
function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ projects: number; aliases: number; hasPasswords: boolean } | null>(null)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.version || !Array.isArray(data.projects)) {
          setError('Invalid backup file format.'); setPreview(null); return
        }
        const aliases = data.projects.reduce((n: number, p: any) => n + (p.aliases?.length ?? 0), 0)
        const hasPasswords = data.projects.some((p: any) => p.aliases?.some((a: any) => a.password))
        setPreview({ projects: data.projects.length, aliases, hasPasswords })
      } catch { setError('Could not parse file.'); setPreview(null) }
    }
    reader.readAsText(f)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleImport() {
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = ev => {
      const result = importData(ev.target?.result as string)
      if (result.success) {
        toast.success('Data imported — reloading…')
        setTimeout(() => window.location.reload(), 1400)
      } else {
        setError(`Import failed: ${result.error}`)
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 14 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="glass-card modal-card"
        style={{ width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={15} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: 650, letterSpacing: '-0.02em' }}>Import Backup</h2>
          </div>
          <button onClick={onClose} className="btn-premium btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
            <X size={14} />
          </button>
        </div>

        {/* Drop zone */}
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFileChange} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, width: '100%', padding: '28px 20px', marginBottom: 14,
            border: `2px dashed ${file ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))'}`,
            borderRadius: 14, background: file ? 'hsl(var(--primary) / 0.04)' : 'hsl(var(--secondary) / 0.4)',
            cursor: 'pointer', transition: 'all 180ms ease', fontFamily: 'var(--font-sans)',
          }}
        >
          <Upload size={22} style={{ color: file ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.5)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 550, color: 'hsl(var(--foreground))' }}>
              {file ? file.name : 'Choose a backup file'}
            </div>
            <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>
              {file ? 'Click to choose a different file' : 'dotalias-backup-*.json'}
            </div>
          </div>
        </button>

        {/* Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 14 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'hsl(var(--secondary) / 0.6)', border: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '12px', fontWeight: 650, color: 'hsl(var(--foreground))', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  File Preview
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['Projects', preview.projects], ['Aliases', preview.aliases]].map(([k, v]) => (
                    <div key={k as string}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>{k}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {preview.hasPasswords
                      ? <><Lock size={12} style={{ color: 'hsl(35 90% 42%)' }} /><span style={{ fontSize: '12px', color: 'hsl(35 90% 42%)' }}>Has passwords</span></>
                      : <><Shield size={12} style={{ color: 'hsl(142 71% 36%)' }} /><span style={{ fontSize: '12px', color: 'hsl(142 71% 36%)' }}>No passwords</span></>
                    }
                  </div>
                </div>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>
                This will overwrite your existing data. Export a backup first if needed.
              </p>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 14, padding: '10px 13px', borderRadius: 9, background: 'hsl(var(--destructive) / 0.07)', border: '1px solid hsl(var(--destructive) / 0.2)', fontSize: '12.5px', color: 'hsl(var(--destructive))' }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-premium btn-outline" style={{ flex: 1, height: 38 }}>Cancel</button>
          <button
            onClick={handleImport}
            disabled={!preview || importing}
            className="btn-premium btn-primary"
            style={{ flex: 2, height: 38, opacity: !preview ? 0.45 : 1 }}
          >
            {importing ? 'Importing…' : <><Upload size={14} /> Import Data</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Clear all confirmation modal ────────────────────────────────
function ClearConfirmModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [typed, setTyped] = useState('')
  const CONFIRM_WORD = 'DELETE'
  const ready = typed === CONFIRM_WORD

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 22 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 18 }}
        transition={{ type: 'spring', stiffness: 440, damping: 30 }}
        className="glass-card modal-card"
        style={{ width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid hsl(var(--destructive) / 0.3)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Trash2 size={20} style={{ color: 'hsl(var(--destructive))' }} />
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.03em', color: 'hsl(var(--foreground))' }}>
            Clear all data?
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
            This permanently deletes all projects, aliases, and settings from your browser. <strong style={{ color: 'hsl(var(--foreground))' }}>This cannot be undone.</strong>
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
            Type <span style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.08)', padding: '1px 5px', borderRadius: 4 }}>{CONFIRM_WORD}</span> to confirm
          </label>
          <input
            autoFocus
            value={typed}
            onChange={e => setTyped(e.target.value.toUpperCase())}
            placeholder={CONFIRM_WORD}
            style={{
              width: '100%', height: 40, padding: '0 12px',
              border: `1.5px solid ${ready ? 'hsl(var(--destructive) / 0.6)' : 'hsl(var(--border))'}`,
              borderRadius: 10, fontSize: '14px', fontFamily: 'var(--font-mono)',
              background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
              outline: 'none', letterSpacing: '0.05em', boxSizing: 'border-box',
              transition: 'border-color 150ms',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && ready) { onConfirm(); onClose() } }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-premium btn-outline" style={{ flex: 1, height: 38 }}>Cancel</button>
          <button
            onClick={() => { if (ready) { onConfirm(); onClose() } }}
            disabled={!ready}
            className="btn-premium"
            style={{
              flex: 2, height: 38,
              background: ready ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
              color: ready ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--muted-foreground))',
              transition: 'all 200ms', cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            <Trash2 size={14} /> Clear All Data
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Settings page ─────────────────────────────────────────
export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings())
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  function handleToggle(key: keyof AppSettings, value: boolean) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveSettings(updated)
    toast.success('Settings saved')
  }

  function handleClearAll() {
    clearAllData()
    toast.success('All data cleared')
    setTimeout(() => window.location.reload(), 900)
  }

  const projects = getProjects()
  const aliasCount = projects.reduce((n, p) => n + p.aliases.length, 0)

  return (
    <main className="page-main" style={{ maxWidth: 620, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }} style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 750, letterSpacing: '-0.04em', color: 'hsl(var(--foreground))' }}>
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
          Configure Unlimited Gmail Generator. All data is stored locally in your browser.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="Privacy & Security" icon={Shield}>
            {/* Local-only badge */}
            <div style={{ padding: '12px 18px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 99, background: 'hsl(142 71% 45% / 0.1)', border: '1px solid hsl(142 71% 45% / 0.22)' }}>
                <CheckCircle2 size={12} style={{ color: 'hsl(142 71% 34%)' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 650, color: 'hsl(142 71% 30%)', letterSpacing: '0.02em' }}>
                  100% Local Storage
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                No data ever leaves your browser
              </span>
            </div>

            <ToggleSwitch
              checked={settings.localOnlyMode}
              onChange={v => handleToggle('localOnlyMode', v)}
              label="Local-only mode"
              description="Explicitly disables any network features. All processing stays on-device."
            />

            <Divider />

            <ToggleSwitch
              checked={settings.hideSensitiveFields}
              onChange={v => handleToggle('hideSensitiveFields', v)}
              label="Hide sensitive fields by default"
              description="Passwords and credentials are masked until you click to reveal them."
            />

            <div style={{ padding: '0 18px 14px' }}>
              <InfoCallout>
                Unlimited Gmail Generator stores all data only in <strong style={{ color: 'hsl(var(--foreground))' }}>localStorage</strong> in your browser. No data is sent to any server, ever. Your aliases, passwords, and project data are yours alone.
              </InfoCallout>
            </div>
          </Section>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Data Management" icon={Database}>
            {/* Storage summary */}
            <div style={{ padding: '12px 18px', display: 'flex', gap: 20, borderBottom: '1px solid hsl(var(--border))' }}>
              {[['Projects', projects.length], ['Aliases', aliasCount]].map(([k, v]) => (
                <div key={k as string}>
                  <div style={{ fontSize: '20px', fontWeight: 750, letterSpacing: '-0.03em', color: 'hsl(var(--foreground))', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{k}</div>
                </div>
              ))}
            </div>

            {/* Export */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 18px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 550, color: 'hsl(var(--foreground))' }}>Export Backup</div>
                <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                  Download all projects and aliases as a JSON file.
                </div>
              </div>
              <button onClick={() => setShowExport(true)} className="btn-premium btn-outline" style={{ height: 34, fontSize: '12.5px', flexShrink: 0 }}>
                <Download size={13} /> Export JSON
              </button>
            </div>

            <Divider />

            {/* Import */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 18px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 550, color: 'hsl(var(--foreground))' }}>Import Backup</div>
                <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                  Restore from a previously exported backup file.
                </div>
              </div>
              <button onClick={() => setShowImport(true)} className="btn-premium btn-outline" style={{ height: 34, fontSize: '12.5px', flexShrink: 0 }}>
                <Upload size={13} /> Import JSON
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Danger Zone" icon={AlertTriangle} danger>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 18px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 550, color: 'hsl(var(--foreground))' }}>Clear All Data</div>
                <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                  Permanently delete all projects, aliases, and settings. Cannot be undone.
                </div>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn-premium btn-outline"
                style={{ height: 34, fontSize: '12.5px', color: 'hsl(var(--destructive))', borderColor: 'hsl(var(--destructive) / 0.3)', flexShrink: 0 }}
              >
                <Trash2 size={13} /> Clear All Data
              </button>
            </div>
          </Section>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="About" icon={FileJson}>
            <div style={{ padding: '13px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  ['App', 'Unlimited Gmail Generator'],
                  ['Version', '1.0.0'],
                  ['Storage', 'localStorage (browser-only)'],
                  ['Network', 'None — fully offline'],
                  ['Framework', 'React + Vite + TypeScript'],
                ].map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{key}</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
        {showClearConfirm && <ClearConfirmModal onConfirm={handleClearAll} onClose={() => setShowClearConfirm(false)} />}
      </AnimatePresence>
    </main>
  )
}
