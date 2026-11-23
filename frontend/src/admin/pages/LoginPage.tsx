import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useAuth } from '../AuthProvider'
import { AdminLoading } from '../components/AdminState'
import { ApiError } from '../../lib/api'
import { useTheme } from '../../lib/theme'
import { useLocale } from '../../lib/useLocale'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'

export default function LoginPage() {
  const { t } = useTranslation('admin')
  const { user, loading, login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLanguage } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useAdminPageTitle(t('login.title'))

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (loading) return <AdminLoading full />
  if (user) return <Navigate to={from} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 401) setError(t('login.invalid'))
        else if (reason.status === 429) setError(t('login.rateLimited'))
        else if (reason.status === 0) setError(t('login.network'))
        else setError(t('login.generic'))
      } else {
        setError(t('login.generic'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-foreground font-mono text-[11px] font-semibold text-background">
            JA
          </span>
          <span className="text-sm font-semibold tracking-tight">{t('brand')}</span>
        </div>

        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('login.kicker')}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t('login.heroTitle')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('login.heroNote')}</p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[t('login.featureOne'), t('login.featureTwo'), t('login.featureThree')].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">{t('login.footer')}</p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2 lg:invisible">
            <span className="grid size-8 place-items-center rounded-md bg-foreground font-mono text-[10px] font-semibold text-background">
              JA
            </span>
            <span className="text-sm font-semibold tracking-tight">{t('brand')}</span>
          </div>
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold tracking-tight">{t('login.title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('login.subtitle')}</p>

            <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-4">
              <div>
                <label htmlFor="admin-email" className="field-label">
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('login.emailPlaceholder')}
                    className="field pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="field-label">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={15}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    className="field pr-10 pl-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-xs leading-relaxed text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim() || !password}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? t('login.submitting') : t('login.submit')}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">{t('login.sessionNote')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
