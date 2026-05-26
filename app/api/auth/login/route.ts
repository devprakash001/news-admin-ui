import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { verifyPassword, signAdminToken, toPublicUser } from '@/lib/auth'
import { setAdminAuthCookie } from '@/lib/api-auth'
import type { DbUser } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection<DbUser>('users').findOne({
      email: email.toLowerCase().trim(),
      role: 'admin',
    })

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    const token = signAdminToken(user._id!.toString())
    const response = NextResponse.json({ token, user: toPublicUser(user) })
    setAdminAuthCookie(response, token)
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
