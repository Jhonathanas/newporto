import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { useToast } from '../components/Toast'
import { adminDeletePost, adminGetPosts } from '../../lib/api'
import type { ListResult } from '../../lib/api'
import type { Post } from '../../types'
import { formatDate } from '../../lib/utils'
import { useLocale } from '../../lib/useLocale'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'
import { cn } from '../../lib/utils'

const pageSize = 10

export default function PostsPage() {
  const { t } = useTranslation('admin')
  const { lang, translate } = useLocale()
  const { notify } = useToast()
  const [result, setResult] = useState<ListResult<Post> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  useAdminPageTitle(t('posts.title'))

  const load = useCallback(
    async (target: number) => {
      setLoading(true)
      setError(null)
      try {
        setResult(await adminGetPosts(target, pageSize))
      } catch {
        setError(t('states.loadFailed'))
      } finally {
        setLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    void load(page)
  }, [load, page])

  const confirmDelete = async () => {
    if (!pending) return
    setDeleting(true)
    try {
      await adminDeletePost(pending.id)
      notify(t('posts.deleted'))
      setPending(null)
      if (result && result.data.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        void load(page)
      }
    } catch {
      notify(t('states.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('posts.title')}
        description={t('posts.subtitle')}
        actions={
          <Link to="/admin/posts/new" className="btn-primary">
            <Plus size={14} />
            {t('posts.new')}
          </Link>
        }
      />

      {loading && <AdminLoading />}
      {!loading && error && (
        <AdminError message={error} onRetry={() => void load(page)} />
      )}

      {!loading && !error && result && result.data.length === 0 && (
        <AdminEmpty
          title={t('posts.empty')}
          description={t('posts.emptyNote')}
          action={
            <Link to="/admin/posts/new" className="btn-primary">
              <Plus size={14} />
              {t('posts.new')}
            </Link>
          }
        />
      )}

      {!loading && !error && result && result.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-normal">{t('posts.table.post')}</th>
                  <th className="px-4 py-3 font-normal">{t('posts.table.status')}</th>
                  <th className="px-4 py-3 font-normal">{t('posts.table.publishedAt')}</th>
                  <th className="px-4 py-3 font-normal">{t('posts.table.reading')}</th>
                  <th className="px-4 py-3 text-right font-normal">{t('posts.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{translate(post.title)}</span>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]',
                          post.published
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-border bg-card text-muted-foreground',
                        )}
                      >
                        {post.published ? t('posts.published') : t('posts.draft')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                      {post.publishedAt ? formatDate(post.publishedAt, lang) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <Clock size={11} />
                        {post.readingMinutes}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/posts/${post.id}`}
                          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={t('actions.edit')}
                          title={t('actions.edit')}
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPending(post)}
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

          <Pagination
            page={result.meta.page}
            limit={result.meta.limit}
            total={result.meta.total}
            onChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={t('posts.deleteTitle')}
        description={pending ? t('posts.deleteNote', { name: translate(pending.title) }) : undefined}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
