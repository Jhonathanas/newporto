import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Inbox,
  MailOpen,
  Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { adminGetMessages, adminGetPosts, adminGetProjects } from '../../lib/api'
import type { ListResult } from '../../lib/api'
import type { ContactMessage, Post, Project } from '../../types'
import { formatDateTime } from '../../lib/utils'
import { useLocale } from '../../lib/useLocale'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'
import { cn } from '../../lib/utils'

type Stats = {
  projects: Project[]
  posts: ListResult<Post>
  messages: ListResult<ContactMessage>
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  to: string
  tone: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn('grid size-9 place-items-center rounded-lg', tone)}>
          <Icon size={16} />
        </span>
        <ArrowRight
          size={14}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation('admin')
  const { lang } = useLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useAdminPageTitle(t('dashboard.title'))

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [projects, posts, messages] = await Promise.all([
        adminGetProjects(),
        adminGetPosts(1, 50),
        adminGetMessages(1, 50),
      ])
      setStats({ projects, posts, messages })
    } catch {
      setError(t('states.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <AdminLoading />
  if (error || !stats) return <AdminError message={error ?? t('states.loadFailed')} onRetry={() => void load()} />

  const published = stats.posts.data.filter((post) => post.published).length
  const drafts = stats.posts.data.length - published
  const unread = stats.messages.data.filter((message) => !message.isRead).length
  const recent = stats.messages.data.slice(0, 5)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        actions={
          <>
            <Link to="/admin/projects/new" className="btn-secondary">
              <Plus size={14} />
              {t('dashboard.newProject')}
            </Link>
            <Link to="/admin/posts/new" className="btn-primary">
              <Plus size={14} />
              {t('dashboard.newPost')}
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label={t('dashboard.projects')}
          value={stats.projects.length}
          to="/admin/projects"
          tone="bg-accent text-primary"
        />
        <StatCard
          icon={FileText}
          label={t('dashboard.published')}
          value={published}
          to="/admin/posts"
          tone="bg-muted text-foreground"
        />
        <StatCard
          icon={FileText}
          label={t('dashboard.drafts')}
          value={drafts}
          to="/admin/posts"
          tone="bg-muted text-foreground"
        />
        <StatCard
          icon={unread > 0 ? Inbox : MailOpen}
          label={t('dashboard.unread')}
          value={unread}
          to="/admin/messages"
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.recentMessages')}</h2>
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('dashboard.viewAll')}
            <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            {t('dashboard.emptyMessages')}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {recent.map((message) => (
              <Link
                key={message.id}
                to="/admin/messages"
                className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted/50"
              >
                <span
                  className={cn(
                    'mt-1.5 size-1.5 shrink-0 rounded-full',
                    message.isRead ? 'bg-border' : 'bg-primary',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className={cn('truncate text-sm', message.isRead ? 'text-muted-foreground' : 'font-medium text-foreground')}>
                      {message.subject}
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDateTime(message.createdAt, lang)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {message.name} · {message.email}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/admin/profile"
          className="rounded-xl border border-border bg-card px-5 py-4 text-sm transition-colors hover:border-foreground/25"
        >
          <p className="font-medium">{t('dashboard.quickProfile')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.quickProfileNote')}</p>
        </Link>
        <Link
          to="/admin/projects"
          className="rounded-xl border border-border bg-card px-5 py-4 text-sm transition-colors hover:border-foreground/25"
        >
          <p className="font-medium">{t('dashboard.quickProjects')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.quickProjectsNote')}</p>
        </Link>
        <Link
          to="/admin/posts"
          className="rounded-xl border border-border bg-card px-5 py-4 text-sm transition-colors hover:border-foreground/25"
        >
          <p className="font-medium">{t('dashboard.quickPosts')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.quickPostsNote')}</p>
        </Link>
      </section>
    </div>
  )
}
