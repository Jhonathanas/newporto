import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { useContentData } from '../lib/content'
import { useTheme } from '../lib/theme'
import { useLocale } from '../lib/useLocale'
import { cn } from '../lib/utils'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button, buttonVariants } from './ui/button'
import { Separator } from './ui/separator'

export function Navbar() {
  const { t } = useTranslation()
  const { profile } = useContentData()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLanguage } = useLocale()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/projects', label: t('nav.projects') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/#about', label: t('nav.about') },
    { to: '/#contact', label: t('nav.contact') },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }), 'text-sm')

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label={profile.name}>
          <Avatar className="rounded-md">
            <AvatarFallback className="rounded-md bg-foreground font-mono text-[11px] font-semibold text-background">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold tracking-tight">{profile.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {navItems.map((item) =>
            item.to.includes('#') ? (
              <Link key={item.to} to={item.to} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                {item.label}
              </Link>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            aria-label={t('language.switchTo')}
            className="min-w-9 px-2 font-mono text-[11px] font-medium"
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </Button>
          <Button asChild variant="outline" size="sm" className="ml-1 hidden sm:inline-flex">
            <a href="/cv.pdf" download>
              <Download size={13} />
              {t('common.downloadCv')}
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
            className="md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-2" aria-label="Navigasi mobile">
            {navItems.map((item, index) => (
              <div key={item.to}>
                {index > 0 && <Separator className="opacity-60" />}
                {item.to.includes('#') ? (
                  <Link
                    to={item.to}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start py-3')}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <NavLink to={item.to} end={item.end} className={linkClass}>
                    {({ isActive }) => (
                      <span
                        className={cn(
                          'flex w-full items-center py-3',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
            <Separator className="opacity-60" />
            <Button asChild variant="ghost" size="sm" className="w-full justify-start py-3">
              <a href="/cv.pdf" download>
                <Download size={14} />
                {t('common.downloadCv')}
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
