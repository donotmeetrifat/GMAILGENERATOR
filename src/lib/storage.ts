// Unified storage layer for Unlimited Gmail Generator
import type { Project, SavedAlias, AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const PROJECTS_KEY = 'dotalias_projects'
const SETTINGS_KEY = 'dotalias_settings'

// ── Helpers ─────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Projects ────────────────────────────────────────────────

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

// ── Project mutations ────────────────────────────────────────

export function createProject(name: string, domain: string, description = ''): Project {
  const now = new Date().toISOString()
  const project: Project = {
    id: generateId(),
    name,
    domain: domain.toLowerCase().replace(/^https?:\/\//, ''),
    description,
    createdAt: now,
    updatedAt: now,
    aliases: [],
  }
  saveProjects([...getProjects(), project])
  return project
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'aliases' | 'createdAt'>>
): void {
  const all = getProjects().map(p =>
    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
  )
  saveProjects(all)
}

export function deleteProject(id: string): void {
  saveProjects(getProjects().filter(p => p.id !== id))
}

// ── Alias mutations ──────────────────────────────────────────

export function addAliasToProject(
  projectId: string,
  data: { alias: string; mainEmail: string; username?: string; password?: string; notes?: string }
): SavedAlias | null {
  const all = getProjects()
  const idx = all.findIndex(p => p.id === projectId)
  if (idx === -1) return null
  // Duplicate guard — same alias already exists in this project
  const isDuplicate = all[idx].aliases.some(
    a => a.alias.toLowerCase() === data.alias.toLowerCase()
  )
  if (isDuplicate) return null
  const now = new Date().toISOString()
  const saved: SavedAlias = {
    id: generateId(),
    alias: data.alias,
    mainEmail: data.mainEmail,
    website: all[idx].domain,
    loginUrl: '',
    username: data.username ?? '',
    password: data.password ?? '',
    notes: data.notes ?? '',
    status: 'unused',
    accountCreated: false,
    dateAdded: now,
    updatedAt: now,
  }
  all[idx] = { ...all[idx], aliases: [...all[idx].aliases, saved], updatedAt: now }
  saveProjects(all)
  return saved
}

export function updateAlias(
  projectId: string,
  aliasId: string,
  updates: Partial<SavedAlias>
): void {
  const all = getProjects()
  const pidx = all.findIndex(p => p.id === projectId)
  if (pidx === -1) return
  all[pidx] = {
    ...all[pidx],
    aliases: all[pidx].aliases.map(a =>
      a.id === aliasId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ),
    updatedAt: new Date().toISOString(),
  }
  saveProjects(all)
}

export function deleteAlias(projectId: string, aliasId: string): void {
  const all = getProjects()
  const pidx = all.findIndex(p => p.id === projectId)
  if (pidx === -1) return
  all[pidx] = {
    ...all[pidx],
    aliases: all[pidx].aliases.filter(a => a.id !== aliasId),
    updatedAt: new Date().toISOString(),
  }
  saveProjects(all)
}

// ── Settings ─────────────────────────────────────────────────

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings()
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }))
}

// ── Export / Import / Clear ──────────────────────────────────

export function exportData(includeSensitive = true): string {
  const projects = getProjects()
  const sanitized = includeSensitive
    ? projects
    : projects.map(p => ({
        ...p,
        aliases: p.aliases.map(a => ({ ...a, password: '' })),
      }))
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      includedPasswords: includeSensitive,
      projects: sanitized,
      settings: getSettings(),
    },
    null,
    2
  )
}

export function importData(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json)
    if (!data.version || !Array.isArray(data.projects)) {
      return { success: false, error: 'Invalid backup format' }
    }

    // Defense-in-depth: Validate project object structures to prevent state corruption
    const validProjects: Project[] = []
    for (const p of data.projects) {
      if (!p || typeof p !== 'object' || typeof p.name !== 'string') continue
      const validAliases: SavedAlias[] = []
      if (Array.isArray(p.aliases)) {
        for (const a of p.aliases) {
          if (!a || typeof a !== 'object' || typeof a.alias !== 'string') continue
          validAliases.push({
            id: typeof a.id === 'string' ? a.id : generateId(),
            alias: String(a.alias),
            mainEmail: typeof a.mainEmail === 'string' ? a.mainEmail : '',
            website: typeof a.website === 'string' ? a.website : '',
            loginUrl: typeof a.loginUrl === 'string' ? a.loginUrl : '',
            username: typeof a.username === 'string' ? a.username : '',
            password: typeof a.password === 'string' ? a.password : '',
            notes: typeof a.notes === 'string' ? a.notes : '',
            status: ['unused', 'created', 'active', 'disabled'].includes(a.status) ? a.status : 'unused',
            accountCreated: Boolean(a.accountCreated),
            dateAdded: typeof a.dateAdded === 'string' ? a.dateAdded : new Date().toISOString(),
            updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date().toISOString(),
          })
        }
      }
      validProjects.push({
        id: typeof p.id === 'string' ? p.id : generateId(),
        name: p.name.trim() || 'Untitled Project',
        domain: typeof p.domain === 'string' ? p.domain.toLowerCase().replace(/^https?:\/\//, '') : '',
        description: typeof p.description === 'string' ? p.description : '',
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
        updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
        aliases: validAliases,
      })
    }

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(validProjects))

    // Sanitize settings import
    if (data.settings && typeof data.settings === 'object') {
      const current = getSettings()
      const sanitizedSettings: AppSettings = {
        localOnlyMode: typeof data.settings.localOnlyMode === 'boolean' ? data.settings.localOnlyMode : current.localOnlyMode,
        hideSensitiveFields: typeof data.settings.hideSensitiveFields === 'boolean' ? data.settings.hideSensitiveFields : current.hideSensitiveFields,
        theme: ['light', 'dark', 'system'].includes(data.settings.theme) ? data.settings.theme : current.theme,
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizedSettings))
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to parse JSON backup file' }
  }
}

export function clearAllData(): void {
  localStorage.removeItem(PROJECTS_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
