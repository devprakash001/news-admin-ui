import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { getEffectiveAvatarSrc } from '@/lib/avatar'
import { toPublicArticle } from '@/lib/articles'
import type { DbArticle, DbUser } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const [userCount, articleCount, publishedCount, pendingArticles, recentUsers, pendingList] =
      await Promise.all([
        db.collection<DbUser>('users').countDocuments(),
        db.collection<DbArticle>('articles').countDocuments(),
        db.collection<DbArticle>('articles').countDocuments({ status: 'published' }),
        db.collection<DbArticle>('articles').countDocuments({ status: 'pending' }),
        db.collection<DbUser>('users').find().sort({ createdAt: -1 }).limit(5).toArray(),
        db
          .collection<DbArticle>('articles')
          .find({ status: 'pending' })
          .sort({ updatedAt: -1 })
          .limit(5)
          .toArray(),
      ])

    const allPublished = await db.collection<DbArticle>('articles').find({ status: 'published' }).toArray()
    const totalViews = allPublished.reduce((s, a) => s + (typeof a.views === 'number' ? a.views : 0), 0)

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        publishedArticles: publishedCount,
        totalArticles: articleCount,
        pendingReviews: pendingArticles,
        totalViews,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u._id!.toString(),
        name: u.name,
        email: u.email,
        status: u.status,
        profileImage: getEffectiveAvatarSrc(u.profileImage) || '',
        createdAt: u.createdAt.toISOString(),
      })),
      pendingArticles: pendingList.map(toPublicArticle),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
