import type {
  AdminUser,
  ContactMessage,
  Education,
  Experience,
  Post,
  Profile,
  Project,
  SkillGroup,
} from '../types'

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '')

export const ADMIN_UNAUTHORIZED_EVENT = 'admin:unauthorized'

type ErrorBody = {
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string>
  }
}

export type ListResult<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export type UploadResult = {
  url: string
  size: number
  contentType: string
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type PostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
export type ProfileInput = Omit<Profile, 'updatedAt'>

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(0, 'network_error', 'Tidak dapat terhubung ke server')
  }

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/admin')) {
      window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
    }

    const error = (body as ErrorBody | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'request_failed',
      error?.message ?? `Permintaan gagal (${response.status})`,
      error?.fields,
    )
  }

  return body as T
}

export async function getProfile(): Promise<Profile> {
  return request<Profile>('/profile')
}

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>('/projects')
}

export async function getPosts(): Promise<Post[]> {
  const response = await request<ListResult<Post>>('/posts?limit=50')
  return response.data
}

export async function getSkills(): Promise<SkillGroup[]> {
  return request<SkillGroup[]>('/skills')
}

export async function getExperiences(): Promise<Experience[]> {
  return request<Experience[]>('/experiences')
}

export async function getEducation(): Promise<Education[]> {
  return request<Education[]>('/education')
}

export type ContactInput = {
  name: string
  email: string
  subject: string
  message: string
  website?: string
}

export type ContactResult = {
  data: {
    received: boolean
    createdAt?: string
  }
}

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  return request<ContactResult>('/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// --- Admin auth -----------------------------------------------------------

export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  const response = await request<{ user: AdminUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return response.user
}

export async function adminLogout(): Promise<void> {
  await request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
}

export async function adminMe(): Promise<AdminUser> {
  const response = await request<{ user: AdminUser }>('/auth/me')
  return response.user
}

// --- Admin content --------------------------------------------------------

export async function adminGetProfile(): Promise<Profile> {
  return request<Profile>('/admin/profile')
}

export async function adminUpdateProfile(input: ProfileInput): Promise<Profile> {
  return request<Profile>('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function adminGetProjects(): Promise<Project[]> {
  return request<Project[]>('/admin/projects')
}

export async function adminCreateProject(input: ProjectInput): Promise<Project> {
  return request<Project>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function adminUpdateProject(id: string, input: ProjectInput): Promise<Project> {
  return request<Project>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function adminDeleteProject(id: string): Promise<void> {
  await request<{ ok: boolean }>(`/admin/projects/${id}`, { method: 'DELETE' })
}

export async function adminGetPosts(page = 1, limit = 10): Promise<ListResult<Post>> {
  return request<ListResult<Post>>(`/admin/posts?page=${page}&limit=${limit}`)
}

export async function adminGetPost(id: string): Promise<Post> {
  return request<Post>(`/admin/posts/${id}`)
}

export async function adminCreatePost(input: PostInput): Promise<Post> {
  return request<Post>('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function adminUpdatePost(id: string, input: PostInput): Promise<Post> {
  return request<Post>(`/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function adminDeletePost(id: string): Promise<void> {
  await request<{ ok: boolean }>(`/admin/posts/${id}`, { method: 'DELETE' })
}

export async function adminGetMessages(page = 1, limit = 10): Promise<ListResult<ContactMessage>> {
  return request<ListResult<ContactMessage>>(`/admin/messages?page=${page}&limit=${limit}`)
}

export async function adminSetMessageRead(id: string, read: boolean): Promise<void> {
  await request<{ ok: boolean }>(`/admin/messages/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  })
}

export async function adminDeleteMessage(id: string): Promise<void> {
  await request<{ ok: boolean }>(`/admin/messages/${id}`, { method: 'DELETE' })
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  return request<UploadResult>('/admin/uploads', {
    method: 'POST',
    body: form,
  })
}

export function assetUrl(path: string): string {
  return `${API_BASE.replace(/\/api\/v1$/, '')}${path}`
}
