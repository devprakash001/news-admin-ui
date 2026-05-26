'use client'

import { resolveAvatarUrl, getEffectiveAvatarSrc } from '@/lib/avatar'
import { AvatarPlaceholder } from '@/components/avatar-placeholder'

const SIZE_PX = {
  xs: 24,
  sm: 28,
  md: 36,
  lg: 52,
  xl: 144,
} as const

type UserAvatarProps = {
  src?: string | null
  name: string
  size?: keyof typeof SIZE_PX
  className?: string
  ring?: boolean
  cacheKey?: string | number
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  className = '',
  ring = false,
  cacheKey,
}: UserAvatarProps) {
  const px = SIZE_PX[size]
  const effective = getEffectiveAvatarSrc(src)
  const bust = cacheKey ?? (effective?.startsWith('/uploads/') ? effective.split('/').pop() : undefined)
  const resolved = resolveAvatarUrl(src, bust)

  if (!resolved) {
    return <AvatarPlaceholder name={name} size={px} className={className} ring={ring} />
  }

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden bg-secondary ${ring ? 'ring-2 ring-primary/20' : ''} ${className}`}
      style={{ width: px, height: px }}
      title={name}
      aria-label={`${name}'s profile photo`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resolved} alt={name} className="h-full w-full object-cover" />
    </div>
  )
}
