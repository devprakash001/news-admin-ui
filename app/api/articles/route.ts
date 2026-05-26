import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { calcReadingTime, slugify } from '@/lib/auth'
import { toPublicArticle } from '@/lib/articles'
import { createNotification } from '@/lib/notifications'
import { plainTextFromContent } from '@/lib/html-content'
import type { DbArticle } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const db = await getDb()
    const filter = status === 'all' ? {} : status ? { status } : { status: 'pending' }
    const articles = await db
      .collection<DbArticle>('articles')
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ articles: articles.map(toPublicArticle) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      category,
      tags = [],
      status = 'draft',
      seoDescription = '',
      subtitle = '',
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const categorySlug = (category || 'Technology').toLowerCase().replace(/\s+/g, '-')
    const slug = customSlug?.trim() || slugify(title)
    const now = new Date()
    const db = await getDb()

    const existing = await db.collection<DbArticle>('articles').findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const article: DbArticle = {
      slug,
      title: title.trim(),
      subtitle: subtitle.trim() || excerpt?.trim()?.slice(0, 120) || '',
      excerpt: excerpt?.trim() || plainTextFromContent(content || '', 200),
      content: content?.trim() || '',
      featuredImage:
        featuredImage?.trim() ||
        'https://images.unsplash.com/photo-1504711434966-e33886168f5c?w=800&h=600&fit=crop',
      category: category || 'Technology',
      categorySlug,
      tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : tags,
      authorId: admin._id!,
      authorName: admin.name,
      authorAvatar: admin.profileImage,
      authorBio: admin.bio,
      status,
      readingTime: calcReadingTime(content || ''),
      views: 0,
      seoDescription,
      publishedAt: now,
      updatedAt: now,
    }

    const result = await db.collection<DbArticle>('articles').insertOne(article)
    article._id = result.insertedId

    if (status === 'published') {
      await db.collection('categories').updateOne(
        { slug: categorySlug },
        { $inc: { articleCount: 1 } }
      )
    }

    const editorUrl = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'
    if (status === 'published') {
      await createNotification(db, admin._id!, {
        type: 'success',
        title: 'Article published',
        message: `"${article.title}" is now live.`,
        link: `${editorUrl}/articles/${slug}`,
      })
    }

    return NextResponse.json({ article: toPublicArticle(article) }, { status: 201 })
  } catch (error) {
    console.error('Admin articles POST:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { articleId, status } = await req.json()
    const db = await getDb()
    const article = await db.collection<DbArticle>('articles').findOne({ _id: new ObjectId(articleId) })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const wasPublished = article.status === 'published'
    const willPublish = status === 'published'

    const updateFields: Record<string, unknown> = { status, updatedAt: new Date() }
    if (status === 'published' && !wasPublished) {
      updateFields.publishedAt = new Date()
    }
    await db.collection<DbArticle>('articles').updateOne(
      { _id: article._id },
      { $set: updateFields }
    )

    if (willPublish && !wasPublished) {
      await db.collection('categories').updateOne(
        { slug: article.categorySlug },
        { $inc: { articleCount: 1 } }
      )
    } else if (wasPublished && !willPublish) {
      await db.collection('categories').updateOne(
        { slug: article.categorySlug },
        { $inc: { articleCount: -1 } }
      )
    }

    const editorUrl = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'
    let type: 'success' | 'error' | 'warning' | 'info' = 'info'
    let title = 'Article review update'
    let msg = `Article status updated to ${status}.`

    if (status === 'published') {
      type = 'success'
      title = 'Article approved'
      msg = `"${article.title}" was approved and published.`
    } else if (status === 'rejected') {
      type = 'error'
      title = 'Article review update'
      msg = `"${article.title}" was not approved.`
    } else if (status === 'taken_down') {
      type = 'warning'
      title = 'Article removed from site'
      msg = `"${article.title}" was taken down by an administrator.`
    }

    await createNotification(db, article.authorId, {
      type,
      title,
      message: msg,
      link: status === 'published' ? `${editorUrl}/articles/${article.slug}` : `${editorUrl}/dashboard/articles`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { articleId } = await req.json()
    if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 })

    const db = await getDb()
    const article = await db.collection<DbArticle>('articles').findOne({ _id: new ObjectId(articleId) })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.collection<DbArticle>('articles').deleteOne({ _id: article._id })

    if (article.status === 'published') {
      await db.collection('categories').updateOne(
        { slug: article.categorySlug },
        { $inc: { articleCount: -1 } }
      )
    }

    const editorUrl = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'
    await createNotification(db, article.authorId, {
      type: 'error',
      title: 'Article deleted',
      message: `"${article.title}" was permanently removed by an administrator.`,
      link: `${editorUrl}/dashboard/articles`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
