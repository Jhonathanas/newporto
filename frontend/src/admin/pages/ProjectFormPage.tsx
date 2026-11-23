import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, Save } from 'lucide-react'
import { AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { BilingualField } from '../components/BilingualField'
import { ImageField } from '../components/ImageField'
import { TagInput } from '../components/TagInput'
import { useToast } from '../components/Toast'
import {
  adminCreateProject,
  adminGetProjects,
  adminUpdateProject,
} from '../../lib/api'
import type { ProjectInput } from '../../lib/api'
import type { Project, ProjectStatus } from '../../types'
import { fieldErrorsFrom, messageFrom } from '../lib/errors'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'
import { useBeforeUnload } from '../lib/useBeforeUnload'

const statuses: ProjectStatus[] = ['completed', 'in_progress', 'planned']

function toInput(project: Project): ProjectInput {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    tech: project.tech,
    status: project.status,
    year: project.year,
    liveUrl: project.liveUrl ?? null,
    repoUrl: project.repoUrl ?? null,
    coverUrl: project.coverUrl ?? null,
    featured: project.featured,
    sortOrder: project.sortOrder,
  }
}

function emptyProject(): ProjectInput {
  return {
    slug: '',
    title: { id: '', en: '' },
    summary: { id: '', en: '' },
    description: { id: '', en: '' },
    tech: [],
    status: 'completed',
    year: new Date().getFullYear(),
    liveUrl: null,
    repoUrl: null,
    coverUrl: null,
    featured: false,
    sortOrder: 0,
  }
}

export default function ProjectFormPage() {
  const { t } = useTranslation('admin')
  const { t: tCommon } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProjectInput>(emptyProject)
  const [initialJson, setInitialJson] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useAdminPageTitle(isEdit ? t('projects.editTitle') : t('projects.createTitle'))
  const dirty = JSON.stringify(form) !== initialJson
  useBeforeUnload(dirty)

  const load = useCallback(async () => {
    if (!id) {
      const fresh = emptyProject()
      setForm(fresh)
      setInitialJson(JSON.stringify(fresh))
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const projects = await adminGetProjects()
      const found = projects.find((project) => project.id === id)
      if (!found) {
        setLoadError(t('states.notFound'))
        return
      }
      const input = toInput(found)
      setForm(input)
      setInitialJson(JSON.stringify(input))
    } catch {
      setLoadError(t('states.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    void load()
  }, [load])

  const update = <K extends keyof ProjectInput,>(key: K, value: ProjectInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setFormError(null)

    try {
      if (isEdit && id) {
        await adminUpdateProject(id, form)
        notify(t('projects.saved'))
      } else {
        await adminCreateProject(form)
        notify(t('projects.created'))
      }
      navigate('/admin/projects')
    } catch (reason) {
      setFieldErrors(fieldErrorsFrom(reason))
      setFormError(messageFrom(reason, t('states.saveFailed')))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminLoading />
  if (loadError) return <AdminError message={loadError} onRetry={() => void load()} />

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <AdminPageHeader
        title={isEdit ? t('projects.editTitle') : t('projects.createTitle')}
        description={t('projects.formSubtitle')}
        back={{ to: '/admin/projects', label: t('projects.title') }}
      />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-5">
          <BilingualField
            label={t('projects.titleField')}
            field="title"
            value={form.title}
            onChange={(value) => update('title', value)}
            errors={fieldErrors}
            required
          />

          <div>
            <label htmlFor="project-slug" className="field-label">
              {t('projects.slug')}
            </label>
            <input
              id="project-slug"
              value={form.slug}
              onChange={(event) => update('slug', event.target.value)}
              className="field font-mono text-[13px]"
              placeholder="nama-proyek"
              aria-invalid={Boolean(fieldErrors.slug)}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t('projects.slugHint')}</p>
            {fieldErrors.slug && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.slug}</p>
            )}
          </div>

          <BilingualField
            label={t('projects.summary')}
            field="summary"
            value={form.summary}
            onChange={(value) => update('summary', value)}
            errors={fieldErrors}
            multiline
            rows={3}
            required
          />

          <BilingualField
            label={t('projects.description')}
            field="description"
            value={form.description}
            onChange={(value) => update('description', value)}
            errors={fieldErrors}
            multiline
            rows={8}
            required
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight">{t('projects.metadata')}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project-status" className="field-label">
              {t('projects.status')}
            </label>
            <select
              id="project-status"
              value={form.status}
              onChange={(event) => update('status', event.target.value as ProjectStatus)}
              className="field"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {tCommon(`projects.status.${status}`)}
                </option>
              ))}
            </select>
            {fieldErrors.status && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.status}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-year" className="field-label">
                {t('projects.year')}
              </label>
              <input
                id="project-year"
                type="number"
                min={1900}
                max={2200}
                value={form.year}
                onChange={(event) => update('year', Number(event.target.value))}
                className="field"
                aria-invalid={Boolean(fieldErrors.year)}
              />
              {fieldErrors.year && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.year}</p>
              )}
            </div>
            <div>
              <label htmlFor="project-order" className="field-label">
                {t('projects.sortOrder')}
              </label>
              <input
                id="project-order"
                type="number"
                value={form.sortOrder}
                onChange={(event) => update('sortOrder', Number(event.target.value))}
                className="field"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <TagInput
              label={t('projects.tech')}
              field="tech"
              value={form.tech}
              onChange={(value) => update('tech', value)}
              errors={fieldErrors}
              placeholder="Go, React, PostgreSQL…"
            />
          </div>

          <div>
            <label htmlFor="project-live" className="field-label">
              {t('projects.liveUrl')}
            </label>
            <input
              id="project-live"
              type="url"
              value={form.liveUrl ?? ''}
              onChange={(event) =>
                update('liveUrl', event.target.value.trim() === '' ? null : event.target.value)
              }
              placeholder="https://…"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="project-repo" className="field-label">
              {t('projects.repoUrl')}
            </label>
            <input
              id="project-repo"
              type="url"
              value={form.repoUrl ?? ''}
              onChange={(event) =>
                update('repoUrl', event.target.value.trim() === '' ? null : event.target.value)
              }
              placeholder="https://github.com/…"
              className="field"
            />
          </div>

          <div className="sm:col-span-2">
            <ImageField
              label={t('projects.coverUrl')}
              value={form.coverUrl}
              onChange={(value) => update('coverUrl', value)}
              error={fieldErrors.coverUrl}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => update('featured', event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            {t('projects.featured')}
          </label>
        </div>
      </section>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs leading-relaxed text-red-600 dark:text-red-400"
        >
          {formError}
        </p>
      )}

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur">
        <p className="text-xs text-muted-foreground">{dirty ? t('states.unsaved') : t('states.noChanges')}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="btn-secondary"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? t('actions.saving') : t('actions.save')}
          </button>
        </div>
      </div>
    </form>
  )
}
