import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { useToast } from '../components/Toast'
import {
  adminDeleteMessage,
  adminGetMessages,
  adminSetMessageRead,
} from '../../lib/api'
import type { ListResult } from '../../lib/api'
import type { ContactMessage } from '../../types'
import { cn, formatDateTime } from '../../lib/utils'
import { useLocale } from '../../lib/useLocale'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'

const pageSize = 10

export default function MessagesPage() {
  const { t } = useTranslation('admin')
  const { lang } = useLocale()
  const { notify } = useToast()
  const [result, setResult] = useState<ListResult<ContactMessage> | null>(null)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)

  useAdminPageTitle(t('messages.title'))

  const load = useCallback(
    async (target: number) => {
      setLoading(true)
      setError(null)
      try {
        setResult(await adminGetMessages(target, pageSize))
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

  const selected = result?.data.find((message) => message.id === selectedId) ?? null

  const setRead = async (message: ContactMessage, read: boolean) => {
    try {
      await adminSetMessageRead(message.id, read)
      setResult((current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === message.id ? { ...item, isRead: read } : item,
              ),
            }
          : current,
      )
    } catch {
      notify(t('states.saveFailed'), 'error')
    }
  }

  const openMessage = (message: ContactMessage) => {
    setSelectedId(message.id)
    if (!message.isRead) void setRead(message, true)
  }

  const confirmDelete = async () => {
    if (!pending) return
    setDeleting(true)
    try {
      await adminDeleteMessage(pending.id)
      notify(t('messages.deleted'))
      if (selectedId === pending.id) setSelectedId(null)
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
      <AdminPageHeader title={t('messages.title')} description={t('messages.subtitle')} />

      {loading && <AdminLoading />}
      {!loading && error && <AdminError message={error} onRetry={() => void load(page)} />}

      {!loading && !error && result && result.data.length === 0 && (
        <AdminEmpty title={t('messages.empty')} description={t('messages.emptyNote')} />
      )}

      {!loading && !error && result && result.data.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {result.data.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => openMessage(message)}
                  className={cn(
                    'block w-full px-4 py-3.5 text-left transition-colors',
                    selectedId === message.id
                      ? 'bg-accent/60'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          message.isRead ? 'bg-border' : 'bg-primary',
                        )}
                      />
                      <span
                        className={cn(
                          'truncate text-sm',
                          message.isRead ? 'text-muted-foreground' : 'font-medium text-foreground',
                        )}
                      >
                        {message.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatDateTime(message.createdAt, lang)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'mt-1 truncate text-xs',
                      message.isRead ? 'text-muted-foreground' : 'font-medium text-foreground',
                    )}
                  >
                    {message.subject}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{message.message}</p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card">
              {selected ? (
                <div className="flex h-full flex-col">
                  <div className="border-b border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold tracking-tight">
                          {selected.subject}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selected.name} ·{' '}
                          <a
                            href={`mailto:${selected.email}`}
                            className="text-foreground underline-offset-2 hover:underline"
                          >
                            {selected.email}
                          </a>
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]',
                          selected.isRead
                            ? 'border-border text-muted-foreground'
                            : 'border-primary/30 bg-accent text-primary',
                        )}
                      >
                        {selected.isRead ? t('messages.read') : t('messages.unread')}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {formatDateTime(selected.createdAt, lang)}
                    </p>
                  </div>

                  <div className="flex-1 p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {selected.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
                    <button
                      type="button"
                      onClick={() => void setRead(selected, !selected.isRead)}
                      className="btn-secondary px-3.5 py-2 text-xs"
                    >
                      {selected.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
                      {selected.isRead ? t('messages.markUnread') : t('messages.markRead')}
                    </button>
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                      className="btn-secondary px-3.5 py-2 text-xs"
                    >
                      <Reply size={14} />
                      {t('messages.reply')}
                    </a>
                    <button
                      type="button"
                      onClick={() => setPending(selected)}
                      className="btn-secondary ml-auto px-3.5 py-2 text-xs hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      {t('actions.delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid h-full min-h-64 place-items-center p-8 text-center">
                  <div>
                    <MailOpen size={22} className="mx-auto text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">{t('messages.noSelection')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t('messages.noSelectionNote')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Pagination
            page={result.meta.page}
            limit={result.meta.limit}
            total={result.meta.total}
            onChange={(next) => {
              setSelectedId(null)
              setPage(next)
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={t('messages.deleteTitle')}
        description={pending ? t('messages.deleteNote', { name: pending.subject }) : undefined}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
