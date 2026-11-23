import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../types'
import { useLocale } from '../lib/useLocale'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { StatusBadge } from './StatusBadge'

export function ProjectCard({ project }: { project: Project }) {
  const { translate } = useLocale()

  return (
    <Link to={`/projects/${project.slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/40">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <StatusBadge status={project.status} />
          <span className="font-mono text-[11px] text-muted-foreground">{project.year}</span>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <CardTitle className="flex items-start justify-between gap-3 text-base">
            {translate(project.title)}
            <ArrowUpRight
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </CardTitle>
          <CardDescription className="mt-2 flex-1 text-sm leading-relaxed">
            {translate(project.summary)}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-mono text-[10px]">
              {tech}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  )
}
