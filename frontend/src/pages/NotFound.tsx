import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { usePageTitle } from '../lib/useLocale'

export default function NotFound() {
  const { t } = useTranslation()
  usePageTitle(t('notFound.title'))

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Badge variant="outline" className="font-mono text-sm tracking-[0.2em]">
        404
      </Badge>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild className="mt-8">
        <Link to="/">
          <ArrowLeft size={14} />
          {t('notFound.cta')}
        </Link>
      </Button>
    </section>
  )
}
