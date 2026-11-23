import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, Save } from 'lucide-react'
import { AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { BilingualField } from '../components/BilingualField'
import { ImageField } from '../components/ImageField'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { TagInput } from '../components/TagInput'
import { useToast } from '../components/Toast'
import {
  adminCreatePost,
  adminGetPost,
  adminUpdatePost,
} from '../../lib/api'
import type { PostInput } from '../../lib/api'
import type { Post } from '../../types'
import { fieldErrorsFrom, messageFrom } from '../lib/errors'
import { fromDateTimeLocal, toDateTimeLocal } from '../lib/format'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'
import { useBeforeUnload } from '../lib/useBeforeUnload'

function toInput(post: Post): PostInput {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    readingMinutes: post.readingMinutes,
    coverUrl: post.coverUrl ?? null,
    published: post.published,
    publishedAt: post.publishedAt ?? null,
  }
}

function emptyPost(): PostInput {
  return {
    slug: '',
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    content: { id: '', en: '' },
    tags: [],
    readingMinutes: 0,
    coverUrl: null,
    published: false,
    publishedAt: null,
  }
}

export default function PostFormPage() {
  const { t } = useTranslation('admin')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<PostInput>(emptyPost)
  const [initialJson, setInitialJson] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useAdminPageTitle(isEdit ? t('posts.editTitle') : t('posts.createTitle'))
  const dirty = JSON.stringify(form) !== initialJson
  useBeforeUnload(dirty)

  const load = useCallback(async () => {
    if (!id) {
      const fresh = emptyPost()
      setForm(fresh)
      setInitialJson(JSON.stringify(fresh))
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const input = toInput(await adminGetPost(id))
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

  const update = <K extends keyof PostInput,>(key: K, value: PostInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setFormError(null)

    try {
      if (isEdit && id) {
        await adminUpdatePost(id, form)
        notify(t('posts.saved'))
      } else {
        await adminCreatePost(form)
        notify(t('posts.created'))
      }
      navigate('/admin/posts')
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
        title={isEdit ? t('posts.editTitle') : t('posts.createTitle')}
        description={t('posts.formSubtitle')}
        back={{ to: '/admin/posts', label: t('posts.title') }}
      />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-5">
          <BilingualField
            label={t('posts.titleField')}
            field="title"
            value={form.title}
            onChange={(value) => update('title', value)}
            errors={fieldErrors}
            required
          />

          <div>
            <label htmlFor="post-slug" className="field-label">
              {t('posts.slug')}
            </label>
            <input
              id="post-slug"
              value={form.slug}
              onChange={(event) => update('slug', event.target.value)}
              className="field font-mono text-[13px]"
              placeholder="judul-tulisan"
              aria-invalid={Boolean(fieldErrors.slug)}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t('posts.slugHint')}</p>
            {fieldErrors.slug && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.slug}</p>
            )}
          </div>

          <BilingualField
            label={t('posts.excerpt')}
            field="excerpt"
            value={form.excerpt}
            onChange={(value) => update('excerpt', value)}
            errors={fieldErrors}
            multiline
            rows={3}
            required
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <MarkdownEditor
          label={t('posts.content')}
          field="content"
          value={form.content}
          onChange={(value) => update('content', value)}
          errors={fieldErrors}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight">{t('posts.metadata')}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TagInput
              label={t('posts.tags')}
              field="tags"
              value={form.tags}
              onChange={(value) => update('tags', value)}
              errors={fieldErrors}
              placeholder="backend, go, react…"
              max={20}
            />
          </div>

          <div>
            <label htmlFor="post-reading" className="field-label">
              {t('posts.readingMinutes')}
            </label>
            <input
              id="post-reading"
              type="number"
              min={0}
              max={180}
              value={form.readingMinutes}
              onChange={(event) => update('readingMinutes', Number(event.target.value))}
              className="field"
              aria-invalid={Boolean(fieldErrors.readingMinutes)}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t('posts.readingHint')}</p>
            {fieldErrors.readingMinutes && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                {fieldErrors.readingMinutes}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <ImageField
              label={t('posts.coverUrl')}
              value={form.coverUrl}
              onChange={(value) => update('coverUrl', value)}
              error={fieldErrors.coverUrl}
            />
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4 sm:col-span-2">
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update('published', event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              {t('posts.publishing')}
            </label>

            {form.published && (
              <div>
                <label htmlFor="post-published-at" className="field-label">
                  {t('posts.publishedAt')}
                </label>
                <input
                  id="post-published-at"
                  type="datetime-local"
                  value={toDateTimeLocal(form.publishedAt)}
                  onChange={(event) =>
                    update('publishedAt', fromDateTimeLocal(event.target.value))
                  }
                  className="field max-w-xs"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">{t('posts.publishedAtHint')}</p>
              </div>
            )}
          </div>
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
          <button type="button" onClick={() => navigate('/admin/posts')} className="btn-secondary">
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
