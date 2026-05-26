import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { hashPassword, verifyPassword } from '@/lib/auth'
import type { DbUser } from '@/lib/types'

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const valid = await verifyPassword(String(currentPassword), admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const sameAsOld = await verifyPassword(String(newPassword), admin.passwordHash)
    if (sameAsOld) {
      return NextResponse.json({ error: 'Choose a different password than your current one' }, { status: 400 })
    }

    const passwordHash = await hashPassword(String(newPassword))
    const db = await getDb()
    await db.collection<DbUser>('users').updateOne(
      { _id: admin._id },
      { $set: { passwordHash, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin password PATCH:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
