import { ApiError } from '../../lib/api'

export function fieldErrorsFrom(reason: unknown): Record<string, string> {
  if (reason instanceof ApiError && reason.status === 422) {
    return reason.fields ?? {}
  }
  return {}
}

export function messageFrom(reason: unknown, fallback: string): string {
  if (reason instanceof ApiError) {
    if (reason.status === 0) return fallback
    if (reason.status === 409) return reason.message
    if (reason.status === 429) return reason.message
    if (reason.message) return reason.message
  }
  return fallback
}
