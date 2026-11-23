import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  getEducation,
  getExperiences,
  getPosts,
  getProfile,
  getProjects,
  getSkills,
} from './api'
import type {
  Education,
  Experience,
  Post,
  Profile,
  Project,
  SkillGroup,
} from '../types'

export type ContentData = {
  profile: Profile
  projects: Project[]
  posts: Post[]
  skillGroups: SkillGroup[]
  experiences: Experience[]
  education: Education[]
}

type ContentContextValue = {
  data: ContentData | null
  loading: boolean
  error: string | null
  reload: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

let cached: ContentData | null = null
let inflight: Promise<ContentData> | null = null

async function loadContent(): Promise<ContentData> {
  if (cached) return cached
  if (!inflight) {
    inflight = Promise.all([
      getProfile(),
      getProjects(),
      getPosts(),
      getSkills(),
      getExperiences(),
      getEducation(),
    ])
      .then(([profile, projects, posts, skillGroups, experiences, education]) => {
        const data: ContentData = {
          profile,
          projects,
          posts,
          skillGroups,
          experiences,
          education,
        }
        cached = data
        return data
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ContentData | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)

    loadContent()
      .then((content) => {
        if (!active) return
        setData(content)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Gagal memuat konten')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt])

  const reload = useCallback(() => {
    cached = null
    inflight = null
    setData(null)
    setAttempt((value) => value + 1)
  }, [])

  return (
    <ContentContext.Provider value={{ data, loading, error, reload }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent harus dipakai di dalam ContentProvider')
  }
  return context
}

export function useContentData(): ContentData {
  const { data } = useContent()
  if (!data) {
    throw new Error('Konten belum siap dipakai')
  }
  return data
}
