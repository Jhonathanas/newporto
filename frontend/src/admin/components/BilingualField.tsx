import { useId } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Localized } from '../../types'
import { cn } from '../../lib/utils'

type BilingualFieldProps = {
  label: string
  field: string
  value: Localized
  onChange: (value: Localized) => void
  errors?: Record<string, string>
  multiline?: boolean
  rows?: number
  required?: boolean
  placeholder?: { id?: string; en?: string }
}

export function BilingualField({
  label,
  field,
  value,
  onChange,
  errors,
  multiline = false,
  rows = 4,
  required = false,
  placeholder,
}: BilingualFieldProps) {
  const { t } = useTranslation('admin')
  const baseId = useId()
  const idError = errors?.[`${field}.id`]
  const enError = errors?.[`${field}.en`]

  return (
    <div>
      <p className="field-label">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['id', 'en'] as const).map((lang) => {
          const error = lang === 'id' ? idError : enError
          const inputId = `${baseId}-${lang}`
          const shared = {
            id: inputId,
            value: value[lang],
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, [lang]: event.target.value }),
            placeholder: placeholder?.[lang],
            className: cn('field', multiline && 'resize-y'),
            'aria-invalid': Boolean(error),
            'aria-label': `${label} (${t(`common.${lang}`)})`,
          }

          return (
            <div key={lang}>
              <label
                htmlFor={inputId}
                className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                  {lang.toUpperCase()}
                </span>
                {t(`common.${lang}`)}
              </label>
              {multiline ? (
                <textarea {...shared} rows={rows} />
              ) : (
                <input {...shared} type="text" />
              )}
              {error && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
