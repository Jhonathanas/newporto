import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { AdminError, AdminLoading } from '../components/AdminState'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { BilingualField } from '../components/BilingualField'
import { useToast } from '../components/Toast'
import { adminGetProfile, adminUpdateProfile } from '../../lib/api'
import type { ProfileInput } from '../../lib/api'
import type { Profile } from '../../types'
import { fieldErrorsFrom, messageFrom } from '../lib/errors'
import { useAdminPageTitle } from '../lib/useAdminPageTitle'
import { useBeforeUnload } from '../lib/useBeforeUnload'

function toInput(profile: Profile): ProfileInput {
  return {
    name: profile.name,
    initials: profile.initials,
    role: profile.role,
    tagline: profile.tagline,
    bio: profile.bio,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    socials: profile.socials,
    availability: profile.availability,
  }
}

const emptyProfile: ProfileInput = {
  name: '',
  initials: '',
  role: { id: '', en: '' },
  tagline: { id: '', en: '' },
  bio: { id: '', en: '' },
  location: '',
  email: '',
  phone: '',
  socials: [],
  availability: { id: '', en: '' },
}

export default function ProfilePage() {
  const { t } = useTranslation('admin')
  const { notify } = useToast()
  const [form, setForm] = useState<ProfileInput | null>(null)
  const [initialJson, setInitialJson] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useAdminPageTitle(t('profile.title'))

  const dirty = form !== null && JSON.stringify(form) !== initialJson
  useBeforeUnload(dirty)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const profile = await adminGetProfile()
      const input = toInput(profile)
      setForm(input)
      setInitialJson(JSON.stringify(input))
      setFieldErrors({})
    } catch {
      setLoadError(t('states.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const update = <K extends keyof ProfileInput,>(key: K, value: ProfileInput[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  const updateSocial = (index: number, key: 'label' | 'url', value: string) => {
    setForm((current) => {
      if (!current) return current
      const socials = current.socials.map((social, position) =>
        position === index ? { ...social, [key]: value } : social,
      )
      return { ...current, socials }
    })
  }

  const addSocial = () => {
    setForm((current) =>
      current ? { ...current, socials: [...current.socials, { label: '', url: '' }] } : current,
    )
  }

  const removeSocial = (index: number) => {
    setForm((current) =>
      current
        ? { ...current, socials: current.socials.filter((_, position) => position !== index) }
        : current,
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form) return

    setSaving(true)
    setFieldErrors({})
    setFormError(null)

    try {
      const profile = await adminUpdateProfile(form)
      const input = toInput(profile)
      setForm(input)
      setInitialJson(JSON.stringify(input))
      notify(t('profile.saved'))
    } catch (reason) {
      setFieldErrors(fieldErrorsFrom(reason))
      setFormError(messageFrom(reason, t('states.saveFailed')))
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setForm(JSON.parse(initialJson) as ProfileInput)
    setFieldErrors({})
    setFormError(null)
  }

  if (loading) return <AdminLoading />
  if (loadError) return <AdminError message={loadError} onRetry={() => void load()} />

  const current = form ?? emptyProfile

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <AdminPageHeader title={t('profile.title')} description={t('profile.subtitle')} />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.identity')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="field-label">
              {t('profile.name')} <span className="text-primary">*</span>
            </label>
            <input
              id="profile-name"
              value={current.name}
              onChange={(event) => update('name', event.target.value)}
              className="field"
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="profile-initials" className="field-label">
              {t('profile.initials')} <span className="text-primary">*</span>
            </label>
            <input
              id="profile-initials"
              value={current.initials}
              maxLength={8}
              onChange={(event) => update('initials', event.target.value)}
              className="field"
              aria-invalid={Boolean(fieldErrors.initials)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">{t('profile.initialsHint')}</p>
            {fieldErrors.initials && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.initials}</p>
            )}
          </div>
          <div>
            <label htmlFor="profile-location" className="field-label">
              {t('profile.location')} <span className="text-primary">*</span>
            </label>
            <input
              id="profile-location"
              value={current.location}
              onChange={(event) => update('location', event.target.value)}
              className="field"
              aria-invalid={Boolean(fieldErrors.location)}
            />
            {fieldErrors.location && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.location}</p>
            )}
          </div>
          <div>
            <label htmlFor="profile-phone" className="field-label">
              {t('profile.phone')}
            </label>
            <input
              id="profile-phone"
              value={current.phone}
              onChange={(event) => update('phone', event.target.value)}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-email" className="field-label">
              {t('profile.email')} <span className="text-primary">*</span>
            </label>
            <input
              id="profile-email"
              type="email"
              value={current.email}
              onChange={(event) => update('email', event.target.value)}
              className="field"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.about')}</h2>
        <div className="mt-4 space-y-5">
          <BilingualField
            label={t('profile.role')}
            field="role"
            value={current.role}
            onChange={(value) => update('role', value)}
            errors={fieldErrors}
            required
          />
          <BilingualField
            label={t('profile.tagline')}
            field="tagline"
            value={current.tagline}
            onChange={(value) => update('tagline', value)}
            errors={fieldErrors}
            required
          />
          <BilingualField
            label={t('profile.bio')}
            field="bio"
            value={current.bio}
            onChange={(value) => update('bio', value)}
            errors={fieldErrors}
            multiline
            rows={5}
            required
          />
          <BilingualField
            label={t('profile.availability')}
            field="availability"
            value={current.availability}
            onChange={(value) => update('availability', value)}
            errors={fieldErrors}
            required
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{t('profile.socials')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('profile.socialsNote')}</p>
          </div>
          <button
            type="button"
            onClick={addSocial}
            disabled={current.socials.length >= 10}
            className="btn-secondary px-3.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} />
            {t('profile.addSocial')}
          </button>
        </div>

        {current.socials.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            {t('profile.noSocials')}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {current.socials.map((social, index) => {
              const error = fieldErrors[`socials.${index}`] ?? fieldErrors.socials
              return (
                <div key={index}>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                    <input
                      value={social.label}
                      onChange={(event) => updateSocial(index, 'label', event.target.value)}
                      placeholder={t('profile.socialLabel')}
                      className="field"
                      aria-label={t('profile.socialLabel')}
                    />
                    <input
                      value={social.url}
                      onChange={(event) => updateSocial(index, 'url', event.target.value)}
                      placeholder="https://…"
                      className="field"
                      aria-label={t('profile.socialUrl')}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400"
                      aria-label={t('actions.remove')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
        <p className="text-xs text-muted-foreground">
          {dirty ? t('states.unsaved') : t('states.noChanges')}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('actions.reset')}
          </button>
          <button
            type="submit"
            disabled={saving || !dirty}
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
