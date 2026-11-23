import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  notify: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  info: 'border-border bg-card text-foreground',
}

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

let nextToastID = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<number[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = ++nextToastID
      setItems((current) => [...current, { id, message, variant }])
      const timer = window.setTimeout(() => dismiss(id), 4500)
      timers.current.push(timer)
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {items.map((item) => {
          const Icon = variantIcons[item.variant]
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg shadow-black/5 backdrop-blur-sm',
                variantStyles[item.variant],
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 leading-snug">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                aria-label="Tutup"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return context
}
