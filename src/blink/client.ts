import { createClient } from '@blinkdotnew/sdk'
import { getSettings } from '@/lib/storage'

const rawBlink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID,
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
})

export const blink = {
  ...rawBlink,
  analytics: {
    log: (event: string, data?: Record<string, unknown>) => {
      // Privacy & Security: Suppress telemetry when Local-only mode is active
      if (typeof window !== 'undefined' && getSettings().localOnlyMode) {
        return
      }
      try {
        rawBlink.analytics.log(event, data)
      } catch {
        // Ignore network or telemetry dispatch errors
      }
    },
  },
}
