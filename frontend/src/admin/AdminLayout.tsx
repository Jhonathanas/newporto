import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useLocale } from '../lib/useLocale'
import { useTheme } from '../lib/theme'
import { cn } from '../lib/utils'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function AdminLayout() {
  const { t } = useTranslation('admin')
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLanguage } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const navItems: NavItem[] = [
    { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/profile', label: t('nav.profile'), icon: UserRound },
    { to: '/admin/projects', label: t('nav.projects'), icon: FolderKanban },
    { to: '/admin/posts', label: t('nav.posts'), icon: FileText },
    { to: '/admin/messages', label: t('nav.messages'), icon: Inbox },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="grid size-8 place-items-center rounded-md bg-foreground font-mono text-[11px] font-semibold text-background">
            {user?.name.slice(0, 2).toUpperCase() ?? 'AD'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{t('brand')}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {t('nav.dashboard')}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={t('brand')}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {t('nav.viewSite')}
            <ArrowUpRight size={14} />
          </Link>
          <div className="mt-1 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <Link to="/admin" className="flex items-center gap-2 lg:hidden">
              <span className="grid size-7 place-items-center rounded-md bg-foreground font-mono text-[10px] font-semibold text-background">
                {user?.name.slice(0, 2).toUpperCase() ?? 'AD'}
              </span>
              <span className="text-sm font-semibold tracking-tight">{t('brand')}</span>
            </Link>

            <div className="hidden lg:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {t('nav.dashboard')}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/"
                target="_blank"
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label={t('nav.viewSite')}
              >
                <ArrowUpRight size={17} />
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('common.toLight') : t('common.toDark')}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={t('common.switchLanguage')}
                className="grid h-9 min-w-9 place-items-center rounded-full px-2 font-mono text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {lang === 'id' ? 'EN' : 'ID'}
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="ml-1 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label={t('nav.logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden"
            aria-label={t('brand')}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-foreground font-medium text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon size={13} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
