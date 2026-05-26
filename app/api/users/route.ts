import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { getEffectiveAvatarSrc } from '@/lib/avatar'
import { createNotification } from '@/lib/notifications'
import type { DbUser } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const users = await db.collection<DbUser>('users').find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id!.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        profileImage: getEffectiveAvatarSrc(u.profileImage) || '',
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, status, role } = await req.json()
    const db = await getDb()
    const target = await db.collection<DbUser>('users').findOne({ _id: new ObjectId(userId) })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updates: Partial<DbUser> = { updatedAt: new Date() }
    if (status) updates.status = status
    if (role) updates.role = role
    if (status === 'approved' && target.role === 'user') updates.role = 'writer'

    await db.collection<DbUser>('users').updateOne({ _id: new ObjectId(userId) }, { $set: updates })

    const editorUrl = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'
    if (status === 'approved') {
      await createNotification(db, userId, {
        type: 'success',
        title: 'You are an official Editorial writer',
        message: 'Your application was approved. You can now write and publish on Editorial.',
        link: `${editorUrl}/dashboard`,
      })
    } else if (status === 'rejected') {
      await createNotification(db, userId, {
        type: 'error',
        title: 'Writer application not approved',
        message: 'Your application was not approved at this time.',
        link: `${editorUrl}/auth/pending-approval?status=rejected`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
