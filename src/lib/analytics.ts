// Google Analytics GA4 helper
// Measurement ID: G-L768TDSKBG
import { getSettings } from './storage'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const GA_ID = 'G-L768TDSKBG'

/** Send a page_view hit to GA4 */
export function gaPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && getSettings().localOnlyMode) return
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    send_to: GA_ID,
  })
}

/** Send a custom event to GA4 */
export function gaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && getSettings().localOnlyMode) return
  window.gtag?.('event', eventName, { send_to: GA_ID, ...params })
}
