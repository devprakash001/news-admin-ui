import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { calcReadingTime } from '@/lib/auth'
import { toPublicArticle } from '@/lib/articles'
import { createNotification } from '@/lib/notifications'
import { plainTextFromContent } from '@/lib/html-content'
import { syncArticleCategoryCounts } from '@/lib/category-counts'
import type { DbArticle, ArticleStatus } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const db = await getDb()
    const article = await db.collection<DbArticle>('articles').findOne({ slug })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ article: toPublicArticle(article) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const body = await req.json()
    const db = await getDb()
    const article = await db.collection<DbArticle>('articles').findOne({ slug })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const wasPublished = article.status === 'published'
    const updates: Partial<DbArticle> = { updatedAt: new Date() }

    if (body.title?.trim()) updates.title = body.title.trim()
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt.trim()
    if (body.content !== undefined) {
      updates.content = body.content.trim()
      updates.readingTime = calcReadingTime(updates.content)
      if (!body.excerpt) updates.excerpt = plainTextFromContent(updates.content, 200)
    }
    if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage.trim()
    if (body.category) {
      updates.category = body.category
      updates.categorySlug = body.category.toLowerCase().replace(/\s+/g, '-')
    }
    if (body.tags !== undefined) {
      updates.tags =
        typeof body.tags === 'string'
          ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : body.tags
    }

    const allowedStatuses: ArticleStatus[] = ['draft', 'pending', 'published', 'rejected', 'taken_down']
    if (body.status && allowedStatuses.includes(body.status)) updates.status = body.status
    if (updates.status === 'published' && !wasPublished) updates.publishedAt = new Date()

    await db.collection<DbArticle>('articles').updateOne({ _id: article._id }, { $set: updates })

    const willPublish = (updates.status ?? article.status) === 'published'
    await syncArticleCategoryCounts(db, {
      oldCategorySlug: article.categorySlug,
      newCategorySlug: updates.categorySlug ?? article.categorySlug,
      wasPublished,
      willPublish,
    })

    const updated = await db.collection<DbArticle>('articles').findOne({ _id: article._id })
    return NextResponse.json({ article: toPublicArticle(updated!) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}
