import { useTranslation } from 'react-i18next'
import { PostListItem } from '../components/PostListItem'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { useContentData } from '../lib/content'
import { usePageTitle } from '../lib/useLocale'

export default function Blog() {
  const { t } = useTranslation()
  const { posts } = useContentData()
  usePageTitle(t('blog.pageTitle'))

  return (
    <>
      <section className="border-b border-border">
        <div className="container-page py-16 sm:py-20">
          <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {t('sections.posts.label')}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('blog.pageTitle')}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('blog.pageSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          {posts.length === 0 ? (
            <Alert>
              <AlertDescription>{t('blog.empty')}</AlertDescription>
            </Alert>
          ) : (
            posts.map((post) => <PostListItem key={post.slug} post={post} />)
          )}
        </div>
      </section>
    </>
  )
}
