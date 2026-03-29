import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '../lib/utils'
import { toast } from './ui/Toast'
import { cn } from '../lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md'
  showToast?: boolean
  toastMessage?: string
}

export function CopyButton({ text, className, size = 'sm', showToast = false, toastMessage }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      if (showToast) toast.success(toastMessage ?? 'Copied to clipboard')
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const iconSize = size === 'sm' ? 13 : 15

  return (
    <motion.button
      onClick={handleCopy}
      className={cn('copy-btn', copied && 'copied', className)}
      title={copied ? 'Copied!' : 'Copy'}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      animate={copied ? { scale: [1, 1.28, 0.9, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {copied
        ? <Check size={iconSize} />
        : <Copy size={iconSize} />
      }
    </motion.button>
  )
}
