import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useAdminPageTitle(title?: string) {
  const { t, i18n } = useTranslation('admin')

  useEffect(() => {
    document.title = title ? `${title} — ${t('brand')}` : t('brand')
  }, [title, t, i18n.language])
}
