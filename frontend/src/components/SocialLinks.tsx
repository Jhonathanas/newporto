import { Github, Linkedin, Link as LinkIcon, Mail } from 'lucide-react'
import { useContentData } from '../lib/content'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

function iconFor(label: string) {
  const key = label.toLowerCase()
  if (key.includes('github')) return Github
  if (key.includes('linkedin')) return Linkedin
  if (key.includes('mail') || key.includes('email')) return Mail
  return LinkIcon
}

type SocialLinksProps = {
  includeEmail?: boolean
  className?: string
}

export function SocialLinks({ includeEmail = true, className }: SocialLinksProps) {
  const { profile } = useContentData()

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {profile.socials.map((social) => {
        const Icon = iconFor(social.label)
        return (
          <Button key={social.label} asChild variant="ghost" size="icon">
            <a href={social.url} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
              <Icon size={17} strokeWidth={1.8} />
            </a>
          </Button>
        )
      })}
      {includeEmail && (
        <Button asChild variant="ghost" size="icon">
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.email}`}
            title={profile.email}
          >
            <Mail size={17} strokeWidth={1.8} />
          </a>
        </Button>
      )}
    </div>
  )
}
