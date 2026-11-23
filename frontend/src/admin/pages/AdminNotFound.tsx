import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'

export default function AdminNotFound() {
  const { t } = useTranslation('admin')
  useAdminPageTitle(t('states.notFoundTitle'))

  return (
    <div className="grid place-items-center py-24 text-center">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t('states.notFoundTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('states.notFoundNote')}</p>
        <Link to="/admin" className="btn-primary mt-6">
          <ArrowLeft size={14} />
          {t('nav.dashboard')}
        </Link>
      </div>
    </div>
  )
}
