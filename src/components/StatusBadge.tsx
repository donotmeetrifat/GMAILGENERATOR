import React from 'react'
import type { AliasStatus } from '../types'
import { cn } from '../lib/utils'

interface StatusBadgeProps {
  status: AliasStatus
  className?: string
}

const statusConfig: Record<AliasStatus, { label: string; cls: string; dot: string }> = {
  unused:   { label: 'Unused',   cls: 'badge-unused',   dot: '#9ca3af' },
  created:  { label: 'Created',  cls: 'badge-created',  dot: '#3b82f6' },
  active:   { label: 'Active',   cls: 'badge-active',   dot: '#22c55e' },
  disabled: { label: 'Disabled', cls: 'badge-disabled', dot: '#ef4444' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.unused
  return (
    <span className={cn('badge-base', cfg.cls, className)}>
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cfg.dot, display: 'inline-block', flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}
