import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import { StatusBadge } from '../../components/StatusBadge'
import { adminDeleteProject, adminGetProjects } from '../../lib/api'
import type { Project } from '../../types'
import { formatDate } from '../../lib/utils'
import { useLocale } from '../../lib/useLocale'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'

export default function ProjectsPage() {
  const { t } = useTranslation('admin')
  const { lang, translate } = useLocale()
  const { notify } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  useAdminPageTitle(t('projects.title'))

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProjects(await adminGetProjects())
    } catch {
      setError(t('states.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const confirmDelete = async () => {
    if (!pending) return
    setDeleting(true)
    try {
      await adminDeleteProject(pending.id)
      setProjects((current) => current.filter((project) => project.id !== pending.id))
      notify(t('projects.deleted'))
      setPending(null)
    } catch {
      notify(t('states.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('projects.title')}
        description={t('projects.subtitle')}
        actions={
          <Link to="/admin/projects/new" className="btn-primary">
            <Plus size={14} />
            {t('projects.new')}
          </Link>
        }
      />

      {loading && <AdminLoading />}
      {!loading && error && <AdminError message={error} onRetry={() => void load()} />}

      {!loading && !error && projects.length === 0 && (
        <AdminEmpty
          title={t('projects.empty')}
          description={t('projects.emptyNote')}
          action={
            <Link to="/admin/projects/new" className="btn-primary">
              <Plus size={14} />
              {t('projects.new')}
            </Link>
          }
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3 font-normal">{t('projects.table.project')}</th>
                <th className="px-4 py-3 font-normal">{t('projects.table.status')}</th>
                <th className="px-4 py-3 font-normal">{t('projects.table.year')}</th>
                <th className="px-4 py-3 font-normal">{t('projects.table.updated')}</th>
                <th className="px-4 py-3 text-right font-normal">{t('projects.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{translate(project.title)}</span>
                      {project.featured && (
                        <Star
                          size={12}
                          className="fill-amber-400 text-amber-400"
                          aria-label={t('projects.featuredYes')}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">/{project.slug}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">{project.year}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                    {formatDate(project.updatedAt, lang)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={t('actions.edit')}
                        title={t('actions.edit')}
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPending(project)}
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                        aria-label={t('actions.delete')}
                        title={t('actions.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={t('projects.deleteTitle')}
        description={
          pending ? t('projects.deleteNote', { name: translate(pending.title) }) : undefined
        }
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
