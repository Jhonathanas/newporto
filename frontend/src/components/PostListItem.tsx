import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Post } from '../types'
import { formatDate } from '../lib/utils'
import { useLocale } from '../lib/useLocale'
import { Badge } from './ui/badge'

export function PostListItem({ post }: { post: Post }) {
  const { t } = useTranslation()
  const { lang, translate } = useLocale()

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group grid gap-2 border-b border-border py-6 transition-colors first:pt-0 last:border-b-0 hover:bg-accent/40 sm:grid-cols-[9.5rem_1fr] sm:gap-6"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:pt-1">
        {formatDate(post.publishedAt ?? post.createdAt, lang)}
      </div>

      <div>
        <h3 className="flex items-start justify-between gap-3 text-base font-medium tracking-tight">
          {translate(post.title)}
          <ArrowUpRight
            size={15}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          />
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{translate(post.excerpt)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {post.readingMinutes} {t('common.minRead')}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
