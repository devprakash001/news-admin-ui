import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { toPublicUser } from '@/lib/auth'
import { toPublicArticle } from '@/lib/articles'
import type { DbArticle, DbUser } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection<DbUser>('users').findOne({ _id: new ObjectId(id) })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const authorId = user._id!
    const articles = await db
      .collection<DbArticle>('articles')
      .find({ authorId })
      .sort({ updatedAt: -1 })
      .toArray()

    const stats = {
      total: articles.length,
      published: 0,
      pending: 0,
      draft: 0,
      rejected: 0,
      taken_down: 0,
    }
    for (const a of articles) {
      if (a.status === 'published') stats.published += 1
      else if (a.status === 'pending') stats.pending += 1
      else if (a.status === 'draft') stats.draft += 1
      else if (a.status === 'rejected') stats.rejected += 1
      else if (a.status === 'taken_down') stats.taken_down += 1
    }

    return NextResponse.json({
      user: toPublicUser(user),
      stats,
      articles: articles.map(toPublicArticle),
    })
  } catch (error) {
    console.error('User profile GET:', error)
    return NextResponse.json({ error: 'Failed to load user profile' }, { status: 500 })
  }
}
