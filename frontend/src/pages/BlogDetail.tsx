import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Markdown } from '../components/Markdown'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { useContentData } from '../lib/content'
import { formatDate } from '../lib/utils'
import { useLocale, usePageTitle } from '../lib/useLocale'
import NotFound from './NotFound'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const { lang, translate } = useLocale()
  const { posts, profile } = useContentData()
  const post = posts.find((item) => item.slug === slug)

  usePageTitle(post ? translate(post.title) : t('notFound.title'))

  if (!post) return <NotFound />

  return (
    <article>
      <header className="border-b border-border">
        <div className="container-page max-w-3xl py-12 sm:py-16">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link to="/blog">
              <ArrowLeft size={14} />
              {t('common.backToBlog')}
            </Link>
          </Button>

          <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <Badge variant="outline" className="gap-1.5 font-mono text-[11px] font-normal">
              <Calendar size={12} />
              {formatDate(post.publishedAt ?? post.createdAt, lang)}
            </Badge>
            <Badge variant="outline" className="gap-1.5 font-mono text-[11px] font-normal">
              <Clock size={12} />
              {post.readingMinutes} {t('common.minRead')}
            </Badge>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {translate(post.title)}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{translate(post.excerpt)}</p>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t('blog.writtenBy')} {profile.name}
          </p>
        </div>
      </header>

      <div className="container-page max-w-3xl py-12 sm:py-16">
        <Card>
          <CardContent className="py-6">
            <Markdown content={translate(post.content)} />
          </CardContent>
        </Card>

        <Separator className="mt-14" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link to="/blog">
              <ArrowLeft size={14} />
              {t('common.backToBlog')}
            </Link>
          </Button>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
