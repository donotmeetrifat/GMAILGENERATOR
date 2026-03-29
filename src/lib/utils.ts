// ─── Class Name Utility ───────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Clipboard ────────────────────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch {
    return false
  }
}

// ─── Random ID ────────────────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Format Date ─────────────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ─── Alias Address Builder ────────────────────────────────────────────────────
export function buildAliasAddress(
  localPart: string,
  domain: string,
): string {
  const clean = localPart.toLowerCase().replace(/[^a-z0-9._+\-]/g, '')
  return `${clean}@${domain}`
}

// ─── Random Word Pool ─────────────────────────────────────────────────────────
const WORDS = [
  'coral', 'maple', 'drift', 'lunar', 'ember', 'swift', 'cedar', 'north',
  'prism', 'bloom', 'crest', 'flint', 'grove', 'haven', 'ivory', 'frost',
  'oxide', 'pixel', 'quill', 'raven', 'slate', 'thorn', 'ultra', 'vivid',
  'woven', 'xenon', 'yield', 'zircon', 'amber', 'basin', 'crane', 'dunes',
]

export function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

export function randomDigits(n = 3): string {
  return Math.floor(Math.random() * Math.pow(10, n))
    .toString()
    .padStart(n, '0')
}
