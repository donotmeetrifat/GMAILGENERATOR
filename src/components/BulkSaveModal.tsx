import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  X, FolderPlus, ChevronDown, Check, Search,
  SquareCheck, Square, Minus,
} from 'lucide-react'
import type { Project } from '@/types'

interface BulkSaveModalProps {
  aliases: string[]
  mainEmail: string
  projects: Project[]
  onSave: (projectId: string, selectedAliases: string[]) => void
  onCreateAndSave: (name: string, domain: string, selectedAliases: string[]) => void
  onClose: () => void
}

export function BulkSaveModal({
  aliases,
  mainEmail,
  projects,
  onSave,
  onCreateAndSave,
  onClose,
}: BulkSaveModalProps) {
  const [mode, setMode] = useState<'pick' | 'create'>(projects.length > 0 ? 'pick' : 'create')
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '')
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [aliasFilter, setAliasFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(aliases))

  // Which aliases already exist in the selected project
  const existingAliases = useMemo<Set<string>>(() => {
    if (mode !== 'pick') return new Set()
    const project = projects.find(p => p.id === selectedProjectId)
    if (!project) return new Set()
    return new Set(project.aliases.map(a => a.alias.toLowerCase()))
  }, [mode, selectedProjectId, projects])

  const filteredAliases = useMemo(() =>
    aliases.filter(a => a.toLowerCase().includes(aliasFilter.toLowerCase())),
    [aliases, aliasFilter]
  )

  const newCount = [...selected].filter(a => !existingAliases.has(a.toLowerCase())).length

  const allFilteredSelected = filteredAliases.length > 0 &&
    filteredAliases.every(a => selected.has(a))
  const someFilteredSelected = filteredAliases.some(a => selected.has(a)) && !allFilteredSelected

  function toggleAlias(alias: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(alias)) next.delete(alias)
      else next.add(alias)
      return next
    })
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filteredAliases.forEach(a => next.delete(a))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filteredAliases.forEach(a => next.add(a))
        return next
      })
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const toSave = [...selected]
    if (toSave.length === 0) return
    if (mode === 'pick') {
      if (!selectedProjectId) return
      onSave(selectedProjectId, toSave)
    } else {
      if (!newName.trim()) return
      onCreateAndSave(newName.trim(), newDomain.trim(), toSave)
    }
  }

  const SelectIcon = allFilteredSelected ? SquareCheck : someFilteredSelected ? Minus : Square

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(4px)', padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="glass-card"
        style={{
          width: '100%', maxWidth: '480px',
          padding: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 650, letterSpacing: '-0.02em', color: 'hsl(var(--foreground))' }}>
              Save to Project
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              {mainEmail} · {aliases.length} aliases
            </p>
          </div>
          <button onClick={onClose} className="btn-premium btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
            <X size={15} />
          </button>
        </div>

        {/* Project mode tabs */}
        <div style={{ display: 'flex', gap: '2px', padding: '3px', background: 'hsl(var(--secondary))', borderRadius: 10, marginBottom: '16px', flexShrink: 0 }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>
          {/* Project picker or creator */}
          {mode === 'pick' ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <input className="input-premium" placeholder="Project name (e.g. Social Media)" value={newName} onChange={e => setNewName(e.target.value)} style={{ paddingLeft: 14, paddingRight: 14 }} autoFocus />
              <input className="input-premium" placeholder="Domain (optional, e.g. twitter.com)" value={newDomain} onChange={e => setNewDomain(e.target.value)} style={{ paddingLeft: 14, paddingRight: 14 }} />
            </div>
          )}

          {/* Alias selection panel */}
          <div style={{
            border: '1px solid hsl(var(--border))', borderRadius: 12,
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            flex: 1, minHeight: 0,
          }}>
            {/* Panel header: search + select-all */}
            <div style={{
              padding: '8px 10px',
              background: 'hsl(var(--accent) / 0.5)',
              borderBottom: '1px solid hsl(var(--border))',
              display: 'flex', alignItems: 'center', gap: 8,
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={toggleAll}
                title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: allFilteredSelected || someFilteredSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              >
                <SelectIcon size={15} />
              </button>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground) / 0.6)', pointerEvents: 'none' }} />
                <input
                  value={aliasFilter}
                  onChange={e => setAliasFilter(e.target.value)}
                  placeholder="Filter aliases…"
                  style={{
                    width: '100%', height: 28, paddingLeft: 26, paddingRight: 8,
                    border: '1px solid hsl(var(--border))', borderRadius: 7,
                    background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                    fontSize: '12px', fontFamily: 'var(--font-sans)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {selected.size}/{aliases.length}
              </span>
            </div>

            {/* Alias list */}
            <div style={{ overflowY: 'auto', maxHeight: 220 }}>
              {filteredAliases.map(alias => {
                const isSelected = selected.has(alias)
                const alreadyExists = existingAliases.has(alias.toLowerCase())
                return (
                  <div
                    key={alias}
                    onClick={() => toggleAlias(alias)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      background: isSelected ? 'hsl(var(--primary) / 0.04)' : 'transparent',
                      borderBottom: '1px solid hsl(var(--border) / 0.5)',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--accent) / 0.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? 'hsl(var(--primary) / 0.04)' : 'transparent' }}
                  >
                    <div style={{ color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.5)', flexShrink: 0 }}>
                      {isSelected ? <Check size={13} /> : <Square size={13} />}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: alreadyExists ? 'hsl(var(--muted-foreground) / 0.45)' : 'hsl(var(--foreground))',
                      flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {alias}
                    </span>
                    {alreadyExists && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                        background: 'hsl(var(--muted) / 0.6)', color: 'hsl(var(--muted-foreground))',
                        flexShrink: 0,
                      }}>
                        saved
                      </span>
                    )}
                  </div>
                )
              })}
              {filteredAliases.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '12.5px' }}>
                  No aliases match "{aliasFilter}"
                </div>
              )}
            </div>
          </div>

          {/* New count info */}
          {mode === 'pick' && existingAliases.size > 0 && (
            <p style={{ margin: 0, fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>
              <strong style={{ color: 'hsl(var(--foreground))' }}>{newCount}</strong> new ·{' '}
              <strong style={{ color: 'hsl(var(--muted-foreground))' }}>{selected.size - newCount}</strong> already saved (will be skipped)
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button type="button" onClick={onClose} className="btn-premium btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-premium btn-primary"
              style={{ flex: 2 }}
              disabled={selected.size === 0 || (mode === 'create' && !newName.trim())}
            >
              <FolderPlus size={14} />
              Save {selected.size > 0 ? `${mode === 'pick' ? newCount || selected.size : selected.size} Alias${(mode === 'pick' ? newCount || selected.size : selected.size) !== 1 ? 'es' : ''}` : 'Selected'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
