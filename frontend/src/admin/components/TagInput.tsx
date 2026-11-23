import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'

type TagInputProps = {
  label: string
  field: string
  value: string[]
  onChange: (value: string[]) => void
  errors?: Record<string, string>
  placeholder?: string
  max?: number
}

export function TagInput({
  label,
  field,
  value,
  onChange,
  errors,
  placeholder,
  max = 30,
}: TagInputProps) {
  const { t } = useTranslation('admin')
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const candidates = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (candidates.length === 0) return

    const next = [...value]
    for (const candidate of candidates) {
      if (next.length >= max) break
      if (!next.includes(candidate)) next.push(candidate)
    }
    onChange(next)
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const remove = (tag: string) => {
    onChange(value.filter((item) => item !== tag))
  }

  const error = errors?.[field]

  return (
    <div>
      <label htmlFor={`tag-${field}`} className="field-label">
        {label}
      </label>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted py-1 pr-1 pl-2.5 font-mono text-[11px] text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label={`${t('actions.remove')} ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          id={`tag-${field}`}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={placeholder}
          className="field"
          disabled={value.length >= max}
        />
        <button
          type="button"
          onClick={() => commit(draft)}
          disabled={!draft.trim() || value.length >= max}
          className="btn-secondary shrink-0 px-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('actions.add')}
        >
          <Plus size={15} />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{t('actions.tagHint', { max })}</p>
      {error && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
