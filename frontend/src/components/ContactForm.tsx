import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Send } from 'lucide-react'
import { ApiError, submitContact } from '../lib/api'
import { useContentData } from '../lib/content'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
}

type FieldName = keyof typeof initialForm

export function ContactForm() {
  const { t } = useTranslation()
  const { profile } = useContentData()
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const update = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await submitContact(form)
      setSent(true)
      setForm(initialForm)
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 429) {
          setError(t('contact.rateLimited'))
        } else if (reason.status === 422) {
          setFieldErrors(reason.fields ?? {})
          setError(t('contact.validationError'))
        } else if (reason.status === 0) {
          setError(t('contact.networkError'))
        } else {
          setError(t('contact.errorNote'))
        }
      } else {
        setError(t('contact.errorNote'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <Card role="status" aria-live="polite" className="h-full justify-center">
        <CardContent className="py-6">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
            <Check size={18} />
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">{t('contact.successTitle')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('contact.successNote')}</p>
          <Button
            type="button"
            variant="link"
            className="mt-4 px-0"
            onClick={() => {
              setForm(initialForm)
              setSent(false)
            }}
          >
            {t('contact.sendAnother')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="py-2">
          <div className="sr-only" aria-hidden="true">
            <Label htmlFor="contact-website">Website</Label>
            <Input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => update('website', event.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{t('contact.name')}</Label>
              <Input
                id="contact-name"
                required
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder={t('contact.namePlaceholder')}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <p className="text-[11px] text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{t('contact.email')}</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder={t('contact.emailPlaceholder')}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="text-[11px] text-destructive">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="contact-subject">{t('contact.subject')}</Label>
            <Input
              id="contact-subject"
              required
              value={form.subject}
              onChange={(event) => update('subject', event.target.value)}
              placeholder={t('contact.subjectPlaceholder')}
              aria-invalid={Boolean(fieldErrors.subject)}
            />
            {fieldErrors.subject && (
              <p className="text-[11px] text-destructive">{fieldErrors.subject}</p>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="contact-message">{t('contact.message')}</Label>
            <Textarea
              id="contact-message"
              required
              rows={5}
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
              placeholder={t('contact.messagePlaceholder')}
              aria-invalid={Boolean(fieldErrors.message)}
            />
            {fieldErrors.message && (
              <p className="text-[11px] text-destructive">{fieldErrors.message}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? t('contact.sending') : t('contact.send')}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('contact.directEmail')}{' '}
              <a href={`mailto:${profile.email}`} className="font-medium text-foreground hover:text-primary">
                {profile.email}
              </a>
            </p>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
