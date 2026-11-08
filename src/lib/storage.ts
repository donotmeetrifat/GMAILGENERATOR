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
      return { success: false, error: 'Invalid format' }
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects))
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings))
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to parse' }
  }
}

export function clearAllData(): void {
  localStorage.removeItem(PROJECTS_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
