import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface ToastMessage { id: string; type: ToastType; message: string }

let toastQueue: ToastMessage[] = []
let listeners: ((toasts: ToastMessage[]) => void)[] = []

function notify(l: ((t: ToastMessage[]) => void)[], t: ToastMessage[]) { l.forEach(fn => fn([...t])) }

export const toast = {
  success: (message: string) => {
    const item: ToastMessage = { id: Math.random().toString(36).slice(2), type: 'success', message }
    toastQueue = [...toastQueue, item]; notify(listeners, toastQueue)
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== item.id); notify(listeners, toastQueue) }, 3000)
  },
  error: (message: string) => {
    const item: ToastMessage = { id: Math.random().toString(36).slice(2), type: 'error', message }
    toastQueue = [...toastQueue, item]; notify(listeners, toastQueue)
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== item.id); notify(listeners, toastQueue) }, 4000)
  },
  info: (message: string) => {
    const item: ToastMessage = { id: Math.random().toString(36).slice(2), type: 'info', message }
    toastQueue = [...toastQueue, item]; notify(listeners, toastQueue)
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== item.id); notify(listeners, toastQueue) }, 3000)
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  useEffect(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter(l => l !== setToasts) }
  }, [])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={15} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={15} className="text-red-500 shrink-0" />,
    info: <Info size={15} className="text-blue-500 shrink-0" />,
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn('pointer-events-auto flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-medium border animate-slide-up min-w-[240px] max-w-[340px]')} style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.07)', color: 'hsl(222 28% 12%)' }}>
          {icons[t.type]}
          <span className="flex-1 leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
