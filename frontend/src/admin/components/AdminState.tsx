import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'

export function AdminLoading({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? 'grid min-h-dvh place-items-center bg-background' : 'grid place-items-center py-24'}>
      <Loader2 size={22} className="animate-spin text-primary" />
    </div>
  )
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-8 text-center">
      <AlertTriangle size={20} className="mx-auto text-red-500" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Coba lagi
        </button>
      )}
    </div>
  )
}

export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-14 text-center">
      <Inbox size={22} className="mx-auto text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
