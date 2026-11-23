import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { Markdown } from '../components/Markdown'
import { StatusBadge } from '../components/StatusBadge'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { useContentData } from '../lib/content'
import { useLocale, usePageTitle } from '../lib/useLocale'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const { translate } = useLocale()
  const { projects } = useContentData()
  const project = projects.find((item) => item.slug === slug)

  usePageTitle(project ? translate(project.title) : t('notFound.title'))

  if (!project) return <NotFound />

  return (
    <>
      <section className="border-b border-border">
        <div className="container-page py-12 sm:py-16">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link to="/projects">
              <ArrowLeft size={14} />
              {t('common.backToProjects')}
            </Link>
          </Button>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <Badge variant="outline" className="font-mono text-[11px]">
              {project.year}
            </Badge>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {translate(project.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {translate(project.summary)}
          </p>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-mono text-[10px]">
                {tech}
              </Badge>
            ))}
          </div>

          {(project.liveUrl || project.repoUrl) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && (
                <Button asChild>
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} />
                    {t('common.live')}
                  </a>
                </Button>
              )}
              {project.repoUrl && (
                <Button asChild variant="outline">
                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                    <Github size={14} />
                    {t('common.source')}
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <Card>
            <CardContent className="py-6">
              <Markdown content={translate(project.description)} />
            </CardContent>
          </Card>

          <div className="mt-14 border-t border-border pt-8">
            <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
              <Link to="/projects">
                <ArrowLeft size={14} />
                {t('common.backToProjects')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
