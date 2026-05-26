import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from './mongodb'
import { verifyAdminToken } from './auth'
import type { DbUser } from './types'

const ADMIN_COOKIE = 'adminToken'

export function getAdminTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  return (
    authHeader?.replace('Bearer ', '') ||
    req.cookies.get(ADMIN_COOKIE)?.value ||
    null
  )
}

export async function getAdminFromRequest(req: NextRequest): Promise<DbUser | null> {
  const token = getAdminTokenFromRequest(req)
  if (!token) return null

  const payload = verifyAdminToken(token)
  if (!payload?.sub) return null

  try {
    const db = await getDb()
    const user = await db.collection<DbUser>('users').findOne({
      _id: new ObjectId(payload.sub),
      role: 'admin',
    })
    return user
  } catch {
    return null
  }
}

export function setAdminAuthCookie(response: { cookies: { set: (name: string, value: string, options: object) => void } }, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAdminAuthCookie(response: { cookies: { set: (name: string, value: string, options: object) => void } }) {
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
}
