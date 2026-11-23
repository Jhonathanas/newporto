import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, PenLine } from 'lucide-react'
import { Markdown } from '../../components/Markdown'
import type { Localized } from '../../types'
import { cn } from '../../lib/utils'

type MarkdownEditorProps = {
  label: string
  value: Localized
  onChange: (value: Localized) => void
  errors?: Record<string, string>
  field?: string
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  errors,
  field = 'content',
}: MarkdownEditorProps) {
  const { t } = useTranslation('admin')
  const [preview, setPreview] = useState<Record<'id' | 'en', boolean>>({ id: false, en: false })

  return (
    <div>
      <p className="field-label">
        {label}
        <span className="ml-1 text-primary">*</span>
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {(['id', 'en'] as const).map((lang) => {
          const error = errors?.[`${field}.${lang}`]
          const isPreview = preview[lang]

          return (
            <div key={lang} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="rounded bg-card px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                    {lang.toUpperCase()}
                  </span>
                  {t(`common.${lang}`)}
                </span>
                <div className="flex rounded-full border border-border bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreview((current) => ({ ...current, [lang]: false }))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors',
                      !isPreview ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <PenLine size={11} />
                    {t('actions.write')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview((current) => ({ ...current, [lang]: true }))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors',
                      isPreview ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Eye size={11} />
                    {t('actions.preview')}
                  </button>
                </div>
              </div>

              {isPreview ? (
                <div className="min-h-72 max-h-[34rem] overflow-auto p-4">
                  {value[lang].trim() ? (
                    <Markdown content={value[lang]} />
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('states.previewEmpty')}</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={value[lang]}
                  onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
                  rows={18}
                  className="min-h-72 w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-relaxed text-foreground focus:outline-none"
                  aria-label={`${label} (${t(`common.${lang}`)})`}
                  aria-invalid={Boolean(error)}
                  spellCheck={false}
                />
              )}

              {error && (
                <p className="border-t border-border px-3 py-2 text-[11px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{t('actions.markdownHint')}</p>
    </div>
  )
}
