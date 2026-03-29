import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, Plus, Trash2, ChevronRight, Globe,
  Clock, Hash, X, Check,
} from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export function ProjectsPage() {
  const { projects, createProject, deleteProject } = useProjects()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    createProject(newName.trim(), newDomain.trim(), newDesc.trim())
    toast.success(`Project "${newName.trim()}" created`)
    setNewName(''); setNewDomain(''); setNewDesc(''); setShowCreate(false)
  }

  function handleDelete(id: string) {
    const project = projects.find(p => p.id === id)
    deleteProject(id)
    toast.success(`Project "${project?.name}" deleted`)
    setConfirmDeleteId(null)
  }

  return (
    <main className="page-main" style={{ maxWidth: 760, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 750, letterSpacing: '-0.04em', color: 'hsl(var(--foreground))' }}>
            Projects
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '14.5px', color: 'hsl(var(--muted-foreground))' }}>
            {projects.length === 0
              ? 'Organize your aliases by website or purpose'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''} · ${projects.reduce((s, p) => s + p.aliases.length, 0)} aliases total`
            }
          </p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className={cn('btn-premium', showCreate ? 'btn-outline' : 'btn-primary')}
        >
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? 'Cancel' : 'New Project'}
        </button>
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <form onSubmit={handleCreate} className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 650, color: 'hsl(var(--foreground))' }}>
                Create New Project
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                    Project Name *
                  </label>
                  <input
                    className="input-premium"
                    style={{ height: 40, paddingLeft: 12, paddingRight: 12 }}
                    placeholder="e.g. Social Media"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                    Domain
                  </label>
                  <input
                    className="input-premium"
                    style={{ height: 40, paddingLeft: 12, paddingRight: 12 }}
                    placeholder="e.g. twitter.com"
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                  Description (optional)
                </label>
                <input
                  className="input-premium"
                  style={{ height: 40, paddingLeft: 12, paddingRight: 12 }}
                  placeholder="What's this project for?"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-premium btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-premium btn-primary" disabled={!newName.trim()}>
                  <Check size={14} /> Create Project
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
          }}>
            <FolderOpen size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 650, color: 'hsl(var(--foreground))' }}>
            No projects yet
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'hsl(var(--muted-foreground))', maxWidth: 280 }}>
            Create a project to organize your Gmail aliases by website or purpose.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-premium btn-primary" style={{ marginTop: 8 }}>
            <Plus size={14} /> Create First Project
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card"
              style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow 200ms ease, transform 200ms ease' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'var(--shadow-glass)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{
                  width: 4, flexShrink: 0,
                  background: `hsl(${(i * 47 + 221) % 360} 70% 55%)`,
                }} />
                <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: `hsl(${(i * 47 + 221) % 360} 70% 55% / 0.1)`,
                      border: `1px solid hsl(${(i * 47 + 221) % 360} 70% 55% / 0.2)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FolderOpen size={17} style={{ color: `hsl(${(i * 47 + 221) % 360} 70% 52%)` }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 650, letterSpacing: '-0.02em', color: 'hsl(var(--foreground))' }}>
                          {project.name}
                        </h3>
                        {project.domain && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 999, fontSize: '11.5px',
                            fontWeight: 500, fontFamily: 'var(--font-mono)',
                            background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))',
                            border: '1px solid hsl(var(--border))',
                          }}>
                            <Globe size={10} />{project.domain}
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12.5px', color: 'hsl(var(--muted-foreground))' }}>
                          <Hash size={11} />
                          <strong style={{ color: 'hsl(var(--foreground))', fontWeight: 650 }}>{project.aliases.length}</strong>
                          {' '}alias{project.aliases.length !== 1 ? 'es' : ''}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>
                          <Clock size={10} />{formatDate(project.createdAt)}
                        </span>
                      </div>
                      <AnimatePresence mode="wait">
                        {confirmDeleteId === project.id ? (
                          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => setConfirmDeleteId(null)} className="btn-premium btn-ghost" style={{ height: 32, padding: '0 10px', fontSize: '12px' }}>
                              <X size={12} /> Cancel
                            </button>
                            <button onClick={() => handleDelete(project.id)} className="btn-premium" style={{ height: 32, padding: '0 10px', fontSize: '12px', background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => setConfirmDeleteId(project.id)} className="copy-btn" title="Delete project" style={{ width: 32, height: 32 }}>
                              <Trash2 size={13} />
                            </button>
                            {/* @ts-ignore */}
                            <Link to="/projects/$id" params={{ id: project.id } as never} style={{ textDecoration: 'none' }}>
                              <button className="btn-premium btn-primary" style={{ height: 32, padding: '0 12px', fontSize: '12.5px' }}>
                                View <ChevronRight size={13} />
                              </button>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}
