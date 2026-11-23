import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProjectCard } from '../components/ProjectCard'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button, buttonVariants } from '../components/ui/button'
import { useContentData } from '../lib/content'
import { usePageTitle } from '../lib/useLocale'
import { cn } from '../lib/utils'

export default function Projects() {
  const { t } = useTranslation()
  const { projects } = useContentData()
  const [activeTech, setActiveTech] = useState<string | null>(null)
  usePageTitle(t('projects.pageTitle'))

  const technologies = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.tech))).sort(),
    [projects],
  )

  const filtered = activeTech
    ? projects.filter((project) => project.tech.includes(activeTech))
    : projects

  const filterClass = (active: boolean) =>
    cn(buttonVariants({ variant: active ? 'default' : 'outline', size: 'sm' }), 'rounded-full font-mono text-[11px]')

  return (
    <>
      <section className="border-b border-border">
        <div className="container-page py-16 sm:py-20">
          <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {t('sections.projects.label')}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('projects.pageTitle')}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('projects.pageSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('projects.filterLabel')}>
              <Button
                type="button"
                onClick={() => setActiveTech(null)}
                aria-pressed={activeTech === null}
                className={filterClass(activeTech === null)}
              >
                {t('common.all')}
              </Button>
              {technologies.map((tech) => (
                <Button
                  key={tech}
                  type="button"
                  onClick={() => setActiveTech(tech)}
                  aria-pressed={activeTech === tech}
                  className={filterClass(activeTech === tech)}
                >
                  {tech}
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {filtered.length} {t('projects.count')}
            </Badge>
          </div>

          {filtered.length === 0 ? (
            <Alert className="mt-8">
              <AlertDescription>{t('projects.empty')}</AlertDescription>
            </Alert>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
