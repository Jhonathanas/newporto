import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { ApiError, assetUrl, uploadImage } from '../../lib/api'
import { useToast } from './Toast'

type ImageFieldProps = {
  label: string
  value?: string | null
  onChange: (value: string | null) => void
  error?: string
  hint?: string
}

export function ImageField({ label, value, onChange, error, hint }: ImageFieldProps) {
  const { t } = useTranslation('admin')
  const { notify } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const preview = value ? (value.startsWith('/') ? assetUrl(value) : value) : null

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadImage(file)
      onChange(result.url)
      notify(t('toasts.uploaded'))
    } catch (reason) {
      notify(
        reason instanceof ApiError ? reason.message : t('states.uploadFailed'),
        'error',
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border bg-muted">
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-muted-foreground">
              <ImagePlus size={22} />
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 size={20} className="animate-spin text-primary" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            inputMode="url"
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value.trim() === '' ? null : event.target.value)}
            placeholder="/uploads/… atau https://…"
            className="field"
            aria-label={label}
            aria-invalid={Boolean(error)}
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary px-3.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              {uploading ? t('actions.uploading') : t('actions.upload')}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="btn-secondary px-3.5 py-2 text-xs hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 size={14} />
                {t('actions.remove')}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{hint ?? t('actions.imageHint')}</p>
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
