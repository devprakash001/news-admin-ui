import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { toPublicArticle } from '@/lib/articles'
import type { DbArticle, DbUser } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const [
      totalUsers,
      totalArticles,
      publishedCount,
      draftCount,
      pendingCount,
      writersCount,
      allPublished,
    ] = await Promise.all([
      db.collection<DbUser>('users').countDocuments(),
      db.collection<DbArticle>('articles').countDocuments(),
      db.collection<DbArticle>('articles').countDocuments({ status: 'published' }),
      db.collection<DbArticle>('articles').countDocuments({ status: 'draft' }),
      db.collection<DbArticle>('articles').countDocuments({ status: 'pending' }),
      db.collection<DbUser>('users').countDocuments({ role: 'writer', status: 'approved' }),
      db
        .collection<DbArticle>('articles')
        .find({ status: 'published' })
        .sort({ views: -1 })
        .limit(10)
        .toArray(),
    ])

    const totalViews = allPublished.reduce(
      (s, a) => s + (typeof a.views === 'number' ? a.views : 0),
      0
    )

    const categoryStats = await db
      .collection<DbArticle>('articles')
      .aggregate<{ _id: string; count: number; views: number }>([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            views: { $sum: '$views' },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ])
      .toArray()

    return NextResponse.json({
      stats: {
        totalUsers,
        totalArticles,
        publishedArticles: publishedCount,
        drafts: draftCount,
        pendingReviews: pendingCount,
        activeWriters: writersCount,
        totalViews,
      },
      topArticles: allPublished.slice(0, 10).map(toPublicArticle),
      categoryStats: categoryStats.map((c) => ({
        category: c._id,
        articles: c.count,
        views: c.views,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
