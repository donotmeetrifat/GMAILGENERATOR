export type AliasStatus = 'unused' | 'created' | 'active' | 'disabled'

export interface SavedAlias {
  id: string
  alias: string
  mainEmail: string
  website: string
  loginUrl: string
  username: string
  password: string
  notes: string
  status: AliasStatus
  accountCreated: boolean
  dateAdded: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  domain: string
  description: string
  createdAt: string
  updatedAt: string
  aliases: SavedAlias[]
}

export interface AppSettings {
  localOnlyMode: boolean
  hideSensitiveFields: boolean
  theme: 'light' | 'dark' | 'system'
}

export const DEFAULT_SETTINGS: AppSettings = {
  localOnlyMode: false,
  hideSensitiveFields: true,
  theme: 'system',
}
