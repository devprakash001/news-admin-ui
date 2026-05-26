/** Stock placeholder URLs assigned at signup — treat as no photo */
const DEFAULT_AVATAR_URL_MARKERS = [
  'images.unsplash.com/photo-1535713875002',
]

export function isDefaultAvatarUrl(url?: string | null): boolean {
  const trimmed = url?.trim()
  if (!trimmed) return true
  return DEFAULT_AVATAR_URL_MARKERS.some((marker) => trimmed.includes(marker))
}

export function getEffectiveAvatarSrc(url?: string | null): string | null {
  const trimmed = url?.trim()
  if (!trimmed || isDefaultAvatarUrl(trimmed)) return null
  return trimmed
}

/** Editor site serves /uploads — admin panel runs on a different port */
export function getPublicAssetBase(): string {
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_ASSETS_URL ||
    process.env.NEXT_PUBLIC_EDITOR_SITE_URL ||
    'http://localhost:3000'
  return base.replace(/\/$/, '')
}

export function resolveAvatarUrl(url?: string | null, cacheBust?: string | number): string | null {
  const effective = getEffectiveAvatarSrc(url)
  if (!effective) return null

  let resolved = effective
  if (effective.startsWith('/uploads/')) {
    // Admin panel rewrites /uploads/* to the editor site (see next.config.mjs)
    resolved = effective
  }

  if (cacheBust != null && resolved.includes('/uploads/')) {
    const sep = resolved.includes('?') ? '&' : '?'
    resolved = `${resolved}${sep}v=${cacheBust}`
  }

  return resolved
}

export function isUploadedAvatar(url?: string | null): boolean {
  return !!getEffectiveAvatarSrc(url)?.startsWith('/uploads/')
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
