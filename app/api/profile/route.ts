import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { toPublicUser } from '@/lib/auth'
import type { DbUser } from '@/lib/types'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ user: toPublicUser(admin) })
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updates: Partial<DbUser> = { updatedAt: new Date() }

    if (body.name?.trim()) updates.name = body.name.trim()
    if (body.bio !== undefined) updates.bio = body.bio.trim()
    if (body.profileImage !== undefined) updates.profileImage = String(body.profileImage).trim()
    if (body.location !== undefined) updates.location = body.location.trim()
    if (body.website !== undefined) updates.website = body.website.trim()
    if (body.twitter !== undefined) updates.twitter = body.twitter.trim()
    if (body.linkedin !== undefined) updates.linkedin = body.linkedin.trim()

    const db = await getDb()
    await db.collection<DbUser>('users').updateOne({ _id: admin._id }, { $set: updates })

    if (updates.name || updates.profileImage !== undefined || updates.bio !== undefined) {
      await db.collection('articles').updateMany(
        { authorId: admin._id },
        {
          $set: {
            ...(updates.name && { authorName: updates.name }),
            ...(updates.profileImage !== undefined && { authorAvatar: updates.profileImage }),
            ...(updates.bio !== undefined && { authorBio: updates.bio }),
          },
        }
      )
    }

    const updated = await db.collection<DbUser>('users').findOne({ _id: admin._id })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ user: toPublicUser(updated) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
