'use client'

import { getInitials } from '@/lib/avatar'

type AvatarPlaceholderProps = {
  name: string
  size?: number
  className?: string
  ring?: boolean
}

export function AvatarPlaceholder({ name, size = 36, className = '', ring = false }: AvatarPlaceholderProps) {
  const fontSize = Math.max(10, Math.round(size * 0.36))
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground font-semibold ${ring ? 'ring-2 ring-primary/20' : ''} ${className}`}
      style={{ width: size, height: size, fontSize }}
      title={name}
      aria-label={`${name} — no profile photo`}
    >
      {getInitials(name)}
    </div>
  )
}
