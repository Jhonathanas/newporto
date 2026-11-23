import type { ReactNode } from 'react'
import { Badge } from './ui/badge'

type SectionHeadingProps = {
  index: string
  label: string
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeading({ index, label, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-[0.12em]">
            {index}
          </Badge>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
