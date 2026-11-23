import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useContent } from './content'
import type { Localized } from '../types'

export function useLocale() {
  const { i18n } = useTranslation()
  const lang: 'id' | 'en' = i18n.language === 'en' ? 'en' : 'id'

  const translate = (value: Localized) => value[lang]

  const toggleLanguage = () => {
    void i18n.changeLanguage(lang === 'id' ? 'en' : 'id')
  }

  return { lang, translate, toggleLanguage }
}

export function usePageTitle(title?: string) {
  const { data } = useContent()
  const profile = data?.profile

  useEffect(() => {
    if (!profile) return
    document.title = title ? `${title} — ${profile.name}` : `${profile.name} — ${profile.role.en}`
  }, [title, profile])
}
