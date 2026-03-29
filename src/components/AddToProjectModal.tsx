import { useState } from 'react'
import { X, FolderPlus, Folder, Plus, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface AddToProjectModalProps {
  alias: string
  mainEmail: string
  projects: Project[]
  onClose: () => void
  onAdd: (projectId: string, data: { alias: string; mainEmail: string; username?: string; password?: string; notes?: string }) => void
  onCreateProject: (name: string, domain: string) => Project
}

export function AddToProjectModal({
  alias,
  mainEmail,
  projects,
  onClose,
  onAdd,
  onCreateProject,
}: AddToProjectModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')
  const [isCreating, setIsCreating] = useState(projects.length === 0)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDomain, setNewProjectDomain] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let projectId = selectedProjectId

    if (isCreating) {
      if (!newProjectName.trim()) return
      const created = onCreateProject(newProjectName.trim(), newProjectDomain.trim() || newProjectName.trim())
      projectId = created.id
    }

    if (!projectId) return
    onAdd(projectId, { alias, mainEmail, username, password, notes })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Folder size={15} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Save to Project</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{alias}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {/* Project selection */}
            {projects.length > 0 && !isCreating ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                        selectedProjectId === p.id
                          ? 'bg-primary/10 border border-primary/20 text-primary'
                          : 'bg-muted/50 hover:bg-muted text-foreground border border-transparent'
                      )}
                    >
                      <Globe size={13} className="shrink-0" />
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="text-muted-foreground text-xs ml-auto truncate">{p.domain}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-primary hover:bg-primary/5 transition-all border border-dashed border-primary/25"
                >
                  <Plus size={12} />
                  Create new project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {projects.length === 0 ? 'New Project' : 'Create Project'}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Project name (e.g. Netflix)"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    className="input-premium w-full px-3.5 py-3 rounded-xl border border-border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Domain (e.g. netflix.com)"
                    value={newProjectDomain}
                    onChange={e => setNewProjectDomain(e.target.value)}
                    className="input-premium w-full px-3.5 py-3 rounded-xl border border-border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>
                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to projects
                  </button>
                )}
              </div>
            )}

            {/* Optional fields */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optional Details</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-premium w-full px-3.5 py-3 rounded-xl border border-border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
              <input
                type="password"
                placeholder="Password (stored locally)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-premium w-full px-3.5 py-3 rounded-xl border border-border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
              <textarea
                placeholder="Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="input-premium w-full px-3.5 py-3 rounded-xl border border-border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 btn-premium flex items-center justify-center gap-1.5"
              >
                <FolderPlus size={13} />
                Save Alias
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
