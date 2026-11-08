import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, X, Monitor, Smartphone, Apple, CheckCircle2,
  WifiOff, Zap, ShieldCheck, Sparkles, ExternalLink
} from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { toast } from '@/components/ui/Toast'

interface InstallAppModalProps {
  isOpen: boolean
  onClose: () => void
}

type PlatformTab = 'desktop' | 'ios' | 'android'

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { canInstall, isInstalled, installApp } = useNetworkStatus()
  const [activeTab, setActiveTab] = useState<PlatformTab>('desktop')
  const [isInstalling, setIsInstalling] = useState(false)

  // Auto-detect user platform on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setActiveTab('ios')
    } else if (/Android/i.test(ua)) {
      setActiveTab('android')
    } else {
      setActiveTab('desktop')
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleDirectInstall() {
    setIsInstalling(true)
    try {
      const accepted = await installApp()
      if (accepted) {
        toast.success('Unlimited Gmail Generator installed successfully!')
        onClose()
      } else {
        toast.info('Installation was dismissed or is pending.')
      }
    } catch {
      toast.error('Could not launch browser install prompt.')
    } finally {
      setIsInstalling(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '20px',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid hsl(var(--border) / 0.7)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, hsl(221 83% 53%), hsl(210 100% 66%))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px hsl(221 83% 53% / 0.35)',
                flexShrink: 0,
              }}>
                <Download size={22} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(var(--foreground))' }}>
                  Download Unlimited Gmail App
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'hsl(var(--muted-foreground))' }}>
                  Install directly on your device to use anywhere, 100% offline.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-premium btn-ghost"
              style={{ width: 32, height: 32, padding: 0, borderRadius: 8, flexShrink: 0 }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Feature Highlights Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'hsl(var(--secondary) / 0.65)',
              border: '1px solid hsl(var(--border) / 0.6)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                <WifiOff size={16} style={{ color: 'hsl(142 71% 40%)' }} />
                <span style={{ fontSize: '11px', fontWeight: 650, color: 'hsl(var(--foreground))' }}>100% Offline</span>
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>No Wi-Fi needed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                <Zap size={16} style={{ color: 'hsl(var(--primary))' }} />
                <span style={{ fontSize: '11px', fontWeight: 650, color: 'hsl(var(--foreground))' }}>Instant Access</span>
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>Opens in 1 click</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                <ShieldCheck size={16} style={{ color: 'hsl(221 83% 53%)' }} />
                <span style={{ fontSize: '11px', fontWeight: 650, color: 'hsl(var(--foreground))' }}>100% Private</span>
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>Device sandbox</span>
              </div>
            </div>

            {/* Direct 1-Click Install Button if supported */}
            {canInstall && !isInstalled && (
              <div style={{
                padding: '14px', borderRadius: 14,
                background: 'hsl(var(--primary) / 0.08)',
                border: '1px solid hsl(var(--primary) / 0.25)',
                display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'hsl(var(--primary))', fontSize: '13px', fontWeight: 600 }}>
                  <Sparkles size={14} />
                  <span>One-Click Install Ready</span>
                </div>
                <button
                  onClick={handleDirectInstall}
                  disabled={isInstalling}
                  className="btn-premium btn-primary"
                  style={{
                    width: '100%', height: 42, fontSize: '14px', fontWeight: 650,
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)',
                  }}
                >
                  <Download size={16} />
                  {isInstalling ? 'Installing...' : 'Install Now to Your Device'}
                </button>
              </div>
            )}

            {isInstalled && (
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'hsl(142 71% 45% / 0.1)',
                border: '1px solid hsl(142 71% 45% / 0.25)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <CheckCircle2 size={18} style={{ color: 'hsl(142 71% 36%)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'hsl(142 71% 30%)', fontWeight: 600 }}>
                  Unlimited Gmail Generator is already installed and ready for offline use on this device!
                </span>
              </div>
            )}

            {/* Device-specific instructions */}
            <div>
              <div style={{
                display: 'flex', gap: 4, padding: 3,
                borderRadius: 10, background: 'hsl(var(--secondary))',
                marginBottom: 12,
              }}>
                {[
                  { key: 'desktop', label: 'Windows / Mac / PC', icon: Monitor },
                  { key: 'ios', label: 'iPhone / iPad', icon: Apple },
                  { key: 'android', label: 'Android', icon: Smartphone },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as PlatformTab)}
                    style={{
                      flex: 1, padding: '7px 8px', borderRadius: 8, border: 'none',
                      fontSize: '11.5px', fontWeight: activeTab === tab.key ? 650 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      background: activeTab === tab.key ? 'hsl(var(--card))' : 'transparent',
                      color: activeTab === tab.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <tab.icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Instructions Tab Content */}
              <div style={{
                background: 'hsl(var(--secondary) / 0.4)',
                border: '1px solid hsl(var(--border) / 0.6)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                {activeTab === 'desktop' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>1</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        In <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>, look at the right side of the address bar at the top of your browser.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>2</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Click the <strong>Install App icon (🖥️ ⬇️)</strong>, or click the browser menu (<strong>⋮</strong> or <strong>⋯</strong>) ➔ select <strong>"Install Unlimited Gmail Generator"</strong>.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>3</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Click <strong>"Install"</strong>. The app will launch in its own window and be pinned to your desktop and taskbar.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>1</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Open this website in <strong>Safari</strong> on your iPhone or iPad.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>2</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Tap the <strong>Share</strong> button (the square with an arrow pointing upward <strong>⬆️</strong>) at the bottom toolbar.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>3</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top-right. It works completely offline!
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>1</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        In <strong>Chrome</strong> for Android, tap the <strong>three dots (⋮)</strong> menu in the upper right.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>2</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'hsl(var(--primary))',
                        color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>3</span>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                        Follow the on-screen prompt to install. The app icon will appear on your device's home screen.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 22px 16px',
            borderTop: '1px solid hsl(var(--border) / 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'hsl(var(--card))',
          }}>
            <span style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>
              Progressive Web App · No App Store needed
            </span>
            <button
              onClick={onClose}
              className="btn-premium btn-outline"
              style={{ height: 32, padding: '0 16px', fontSize: '12.5px' }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

