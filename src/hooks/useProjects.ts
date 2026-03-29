import { useState, useCallback } from 'react'
import type { Project, SavedAlias } from '../types'
import {
  getProjects,
  createProject as storageCreateProject,
  updateProject as storageUpdateProject,
  deleteProject as storageDeleteProject,
  addAliasToProject as storageAddAlias,
  updateAlias as storageUpdateAlias,
  deleteAlias as storageDeleteAlias,
} from '../lib/storage'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => getProjects())

  const refresh = useCallback(() => {
    setProjects(getProjects())
  }, [])

  const createProject = useCallback((name: string, domain: string, description = '') => {
    const p = storageCreateProject(name, domain, description)
    setProjects(getProjects())
    return p
  }, [])

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, 'id' | 'aliases' | 'createdAt'>>) => {
      storageUpdateProject(id, updates)
      setProjects(getProjects())
    },
    []
  )

  const deleteProject = useCallback((id: string) => {
    storageDeleteProject(id)
    setProjects(getProjects())
  }, [])

  const addAliasToProject = useCallback(
    (
      projectId: string,
      data: {
        alias: string
        mainEmail: string
        username?: string
        password?: string
        notes?: string
      }
    ): SavedAlias | null => {
      const saved = storageAddAlias(projectId, data)
      setProjects(getProjects())
      return saved
    },
    []
  )

  const updateAlias = useCallback(
    (projectId: string, aliasId: string, updates: Partial<SavedAlias>) => {
      storageUpdateAlias(projectId, aliasId, updates)
      setProjects(getProjects())
    },
    []
  )

  const deleteAlias = useCallback((projectId: string, aliasId: string) => {
    storageDeleteAlias(projectId, aliasId)
    setProjects(getProjects())
  }, [])

  return {
    projects,
    refresh,
    createProject,
    updateProject,
    deleteProject,
    addAliasToProject,
    updateAlias,
    deleteAlias,
  }
}
