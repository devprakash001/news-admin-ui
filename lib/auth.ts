import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { DbUser, UserPublic } from './types'
import { getEffectiveAvatarSrc } from './avatar'

const JWT_SECRET_ADMIN =
  process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET || 'admin-dev-secret-change-me'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signAdminToken(userId: string): string {
  return jwt.sign({ sub: userId, aud: 'admin' }, JWT_SECRET_ADMIN, { expiresIn: '7d' })
}

export function verifyAdminToken(token: string): { sub: string; aud?: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET_ADMIN) as { sub: string; aud?: string }
    if (payload.aud && payload.aud !== 'admin') return null
    return payload
  } catch {
    return null
  }
}

export function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function toPublicUser(user: DbUser): UserPublic {
  return {
    id: user._id!.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    bio: user.bio,
    profileImage: getEffectiveAvatarSrc(user.profileImage) || '',
    location: user.location,
    website: user.website,
    twitter: user.twitter,
    linkedin: user.linkedin,
    createdAt: user.createdAt.toISOString(),
  }
}
