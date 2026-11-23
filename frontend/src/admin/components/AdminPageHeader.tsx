import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

type AdminPageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  back?: { to: string; label: string }
}

export function AdminPageHeader({ title, description, actions, back }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        {back && (
          <Link
            to={back.to}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
