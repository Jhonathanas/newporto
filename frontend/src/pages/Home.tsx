import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowUpRight, MapPin, Mail, Phone } from 'lucide-react'
import { ContactForm } from '../components/ContactForm'
import { PostListItem } from '../components/PostListItem'
import { ProjectCard } from '../components/ProjectCard'
import { SectionHeading } from '../components/SectionHeading'
import { SocialLinks } from '../components/SocialLinks'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useContentData } from '../lib/content'
import { useLocale, usePageTitle } from '../lib/useLocale'

const PROFILE_PHOTO = '/profile.jpg'

export default function Home() {
  const { t } = useTranslation()
  const { translate } = useLocale()
  const { profile, projects, posts, skillGroups, experiences, education } = useContentData()
  const featuredProjects = projects.filter((project) => project.featured)
  const latestPosts = posts.slice(0, 3)
  usePageTitle()

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-dots pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-20 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-rise">
              <Badge variant="outline" className="gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                <span className="size-1.5 rounded-full bg-primary" />
                {t('hero.available')}
              </Badge>

              <p className="mt-7 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                {translate(profile.role)}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                {t('hero.greeting')} {profile.name}
                <span className="text-primary">.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {translate(profile.tagline)}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link to="/projects">
                    {t('common.viewProjects')}
                    <ArrowRight size={15} />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${profile.email}`}>{t('common.contactMe')}</a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {profile.location}
                </span>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail size={13} />
                  {profile.email}
                </a>
                <SocialLinks className="-ml-2" />
              </div>
            </div>

            <div className="animate-rise space-y-4" style={{ animationDelay: '120ms' }}>
              <Card className="overflow-hidden shadow-sm backdrop-blur">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-24">
                    <img
                      src={PROFILE_PHOTO}
                      alt={profile.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = '/JONA.jpeg'
                      }}
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      photo.jpg
                    </p>
                    <p className="mt-1 truncate text-base font-semibold tracking-tight">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {translate(profile.role)}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {t('hero.available')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-sm backdrop-blur">
                <CardHeader className="flex flex-row items-center gap-1.5 border-b py-3">
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">~/profile</span>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs leading-relaxed sm:text-[13px]">
                  <p>
                    <span className="text-primary">$</span> whoami
                  </p>
                  <p className="pl-4 text-foreground">{t('hero.codeRole')}</p>
                  <p className="pt-2">
                    <span className="text-primary">$</span> stack
                  </p>
                  <p className="pl-4 text-muted-foreground">{t('hero.codeStack')}</p>
                  <p className="pt-2">
                    <span className="text-primary">$</span> focus
                  </p>
                  <p className="pl-4 text-muted-foreground">{t('hero.codeFocus')}</p>
                  <div className="flex items-center gap-2 border-t border-border/70 pt-3">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{t('hero.codeStatus')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-24 border-b border-border py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="01"
            label={t('sections.projects.label')}
            title={t('sections.projects.title')}
            description={t('sections.projects.description')}
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/projects">
                  {t('common.viewAll')}
                  <ArrowUpRight size={15} />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 border-b border-border py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="02"
            label={t('sections.about.label')}
            title={t('sections.about.title')}
          />

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{translate(profile.bio)}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {profile.location}
                </span>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail size={13} />
                  {profile.email}
                </a>
              </div>
              <SocialLinks className="-ml-2 mt-2" />
            </div>

            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t('sections.skills.title')}
              </h3>
              <div className="mt-5 space-y-6">
                {skillGroups.map((group) => (
                  <div key={group.title.id}>
                    <h4 className="text-sm font-medium">{translate(group.title)}</h4>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge key={item} variant="secondary" className="font-mono text-[11px]">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-24 border-b border-border py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="03"
            label={t('sections.experience.label')}
            title={t('sections.experience.title')}
            description={t('sections.experience.description')}
          />

          <ol className="space-y-4">
            {experiences.map((item) => (
              <li key={`${item.company}-${item.period.id}`}>
                <Card>
                  <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <CardTitle className="text-base">
                      {translate(item.role)} <span className="text-muted-foreground">· {item.company}</span>
                    </CardTitle>
                    <span className="font-mono text-[11px] text-muted-foreground">{translate(item.period)}</span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {translate(item.description)}
                    </p>
                    {item.highlights && item.highlights.length > 0 && (
                      <ul className="max-w-2xl space-y-1.5">
                        {item.highlights.map((highlight) => (
                          <li key={highlight.id} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                            <span aria-hidden className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-muted-foreground/70" />
                            {translate(highlight)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {item.tech.map((tech) => (
                        <Badge key={tech} variant="outline" className="font-mono text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="education" className="scroll-mt-24 border-b border-border py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="04"
            label={t('sections.education.label')}
            title={t('sections.education.title')}
            description={t('sections.education.description')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {education.map((item) => (
              <Card key={item.school}>
                <CardHeader className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div>
                    <CardTitle className="text-base">{translate(item.degree)}</CardTitle>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.school}</p>
                  </div>
                  {item.period && (
                    <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {translate(item.period)}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{translate(item.details)}</p>
                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="space-y-1.5">
                      {item.highlights.map((highlight) => (
                        <li key={highlight.id} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                          <span aria-hidden className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-muted-foreground/70" />
                          {translate(highlight)}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="posts" className="scroll-mt-24 border-b border-border py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="05"
            label={t('sections.posts.label')}
            title={t('sections.posts.title')}
            description={t('sections.posts.description')}
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/blog">
                  {t('common.viewAll')}
                  <ArrowUpRight size={15} />
                </Link>
              </Button>
            }
          />
          <div>
            {latestPosts.map((post) => (
              <PostListItem key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            index="06"
            label={t('sections.contact.label')}
            title={t('sections.contact.title')}
          />

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {t('sections.contact.description')}
              </p>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {t('contact.directEmail')}
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-1 inline-block text-base font-medium tracking-tight hover:text-primary"
              >
                {profile.email}
              </a>

              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {t('contact.phone')}
              </p>
              <a
                href={`tel:${profile.phone.replace(/\s/g, '')}`}
                className="mt-1 inline-flex items-center gap-1.5 text-base font-medium tracking-tight hover:text-primary"
              >
                <Phone size={14} className="text-muted-foreground" />
                {profile.phone}
              </a>

              <SocialLinks className="-ml-2 mt-4" />
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
