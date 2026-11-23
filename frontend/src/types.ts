export type Localized = {
  id: string
  en: string
}

export type ProjectStatus = 'completed' | 'in_progress' | 'planned'

export type Project = {
  id: string
  slug: string
  title: Localized
  summary: Localized
  description: Localized
  tech: string[]
  status: ProjectStatus
  year: number
  liveUrl?: string | null
  repoUrl?: string | null
  coverUrl?: string | null
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Post = {
  id: string
  slug: string
  title: Localized
  excerpt: Localized
  content: Localized
  tags: string[]
  readingMinutes: number
  coverUrl?: string | null
  published: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type SkillGroup = {
  id: string
  title: Localized
  items: string[]
  sortOrder: number
}

export type Experience = {
  id: string
  company: string
  role: Localized
  period: Localized
  description: Localized
  highlights?: Localized[]
  tech: string[]
  sortOrder: number
}

export type Education = {
  id: string
  school: string
  degree: Localized
  period?: Localized
  details: Localized
  highlights?: Localized[]
  sortOrder: number
}

export type SocialLink = {
  label: string
  url: string
}

export type Profile = {
  name: string
  initials: string
  role: Localized
  tagline: Localized
  bio: Localized
  location: string
  email: string
  phone: string
  socials: SocialLink[]
  availability: Localized
  updatedAt: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export type AdminUser = {
  id: string
  email: string
  name: string
  createdAt: string
}
