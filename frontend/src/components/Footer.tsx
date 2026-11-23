import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUp } from 'lucide-react'
import { useContentData } from '../lib/content'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const { t } = useTranslation()
  const { profile } = useContentData()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-sm font-semibold tracking-tight hover:text-primary">
            {profile.name}
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            © {year} {profile.name}. {t('footer.rights')}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
            {t('footer.builtWith')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <SocialLinks />
          <Separator className="sm:hidden" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="justify-start text-muted-foreground hover:text-foreground sm:justify-end"
          >
            <ArrowUp size={13} />
            {t('footer.backToTop')}
          </Button>
        </div>
      </div>
    </footer>
  )
}
