/**
 * Gmail Dot Alias Generator
 *
 * Gmail ignores dots in the local part of addresses.
 * This generates all 2^(n-1) possible dot-variant combinations
 * for a given Gmail address.
 */

export function isValidGmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed.endsWith('@gmail.com')) return false
  const local = trimmed.slice(0, -10) // remove @gmail.com
  if (local.length < 1) return false
  if (!/^[a-zA-Z0-9.]+$/.test(local)) return false
  if (local.includes('..')) return false
  if (local.startsWith('.') || local.endsWith('.')) return false
  return true
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Alias for backward compat */
export const normalizeGmail = normalizeEmail

export function getLocalPart(email: string): string {
  const normalized = normalizeEmail(email)
  return normalized.split('@')[0].replace(/\./g, '')
}

/**
 * Generate all possible dot-variant aliases for a Gmail address.
 * For N characters in local part, there are N-1 gaps, each can have a dot or not.
 * Total combinations = 2^(N-1)
 */
export function generateAliases(email: string): string[] {
  const normalized = normalizeEmail(email)
  if (!isValidGmail(normalized)) return []

  const rawLocal = getLocalPart(normalized)
  const n = rawLocal.length

  if (n === 0) return []
  if (n === 1) return [rawLocal + '@gmail.com']

  const gapCount = n - 1
  const totalCombinations = Math.pow(2, gapCount)
  const results: string[] = []

  for (let i = 0; i < totalCombinations; i++) {
    let alias = rawLocal[0]
    for (let g = 0; g < gapCount; g++) {
      if ((i >> g) & 1) {
        alias += '.'
      }
      alias += rawLocal[g + 1]
    }
    results.push(alias + '@gmail.com')
  }

  return results
}

export function getAliasCount(email: string): number {
  const base = getLocalPart(email)
  if (base.length < 1) return 0
  return Math.pow(2, base.length - 1)
}

export function formatAliasCount(count: number): string {
  if (count === 0) return '0 aliases'
  if (count === 1) return '1 alias'
  return `${count.toLocaleString()} aliases`
}
