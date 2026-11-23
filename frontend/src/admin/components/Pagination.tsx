import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type PaginationProps = {
  page: number
  limit: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, limit, total, onChange }: PaginationProps) {
  const { t } = useTranslation('admin')
  const pages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {t('pagination.showing', { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={13} />
          {t('pagination.prev')}
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">
          {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('pagination.next')}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
