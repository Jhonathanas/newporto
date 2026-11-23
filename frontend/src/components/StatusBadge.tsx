import { useTranslation } from 'react-i18next'
import type { ProjectStatus } from '../types'
import { cn } from '../lib/utils'
import { Badge } from './ui/badge'

const variants: Record<ProjectStatus, 'secondary' | 'default' | 'outline'> = {
  completed: 'secondary',
  in_progress: 'default',
  planned: 'outline',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useTranslation()

  return (
    <Badge
      variant={variants[status]}
      className={cn(
        'gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]',
        status === 'planned' && 'border-dashed text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          status === 'in_progress' ? 'bg-primary-foreground' : 'bg-muted-foreground',
        )}
      />
      {t(`projects.status.${status}`)}
    </Badge>
  )
}
