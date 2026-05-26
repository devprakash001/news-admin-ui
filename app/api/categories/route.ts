import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminFromRequest } from '@/lib/api-auth'
import { reconcileCategoryCounts } from '@/lib/category-counts'
import type { DbCategory } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    await reconcileCategoryCounts(db)
    const categories = await db.collection<DbCategory>('categories').find().sort({ name: 1 }).toArray()
    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c._id!.toString(),
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        count: c.articleCount,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
