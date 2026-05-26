import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { toPublicNotification } from '@/lib/notifications'
import type { DbNotification } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const notifications = await db
      .collection<DbNotification>('notifications')
      .find({ userId: admin._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      notifications: notifications.map(toPublicNotification),
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, id } = await req.json()
    const db = await getDb()

    if (action === 'readAll') {
      await db.collection<DbNotification>('notifications').updateMany(
        { userId: admin._id, read: false },
        { $set: { read: true } }
      )
      return NextResponse.json({ success: true })
    }

    if (action === 'clearAll') {
      await db.collection<DbNotification>('notifications').deleteMany({ userId: admin._id })
      return NextResponse.json({ success: true })
    }

    if (id) {
      await db.collection<DbNotification>('notifications').updateOne(
        { _id: new ObjectId(id), userId: admin._id },
        { $set: { read: true } }
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    const db = await getDb()
    if (id) {
      await db.collection<DbNotification>('notifications').deleteOne({
        _id: new ObjectId(id),
        userId: admin._id,
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
