import type { getDb } from '@/lib/mongodb'
import type { DbArticle, DbCategory } from '@/lib/types'

type Db = Awaited<ReturnType<typeof getDb>>

export async function adjustCategoryCount(db: Db, categorySlug: string, delta: number) {
  if (!categorySlug || delta === 0) return
  await db.collection('categories').updateOne({ slug: categorySlug }, { $inc: { articleCount: delta } })
}

/** Keep categories.articleCount in sync when an article is edited */
export async function syncArticleCategoryCounts(
  db: Db,
  opts: {
    oldCategorySlug: string
    newCategorySlug: string
    wasPublished: boolean
    willPublish: boolean
  }
) {
  const { oldCategorySlug, newCategorySlug, wasPublished, willPublish } = opts
  const categoryChanged = oldCategorySlug !== newCategorySlug

  if (categoryChanged) {
    if (wasPublished) await adjustCategoryCount(db, oldCategorySlug, -1)
    if (willPublish) await adjustCategoryCount(db, newCategorySlug, 1)
    return
  }

  if (willPublish && !wasPublished) {
    await adjustCategoryCount(db, newCategorySlug, 1)
  } else if (wasPublished && !willPublish) {
    await adjustCategoryCount(db, oldCategorySlug, -1)
  }
}

/** Recompute articleCount from published articles (fixes drift from past edits) */
export async function reconcileCategoryCounts(db: Db) {
  const counts = await db
    .collection<DbArticle>('articles')
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: 'published' } },
      { $group: { _id: '$categorySlug', count: { $sum: 1 } } },
    ])
    .toArray()

  const countBySlug = new Map(counts.map((row) => [row._id, row.count]))
  const categories = await db.collection<DbCategory>('categories').find().toArray()

  await Promise.all(
    categories.map((cat) => {
      const actual = countBySlug.get(cat.slug) ?? 0
      if (cat.articleCount === actual) return Promise.resolve()
      return db.collection<DbCategory>('categories').updateOne(
        { _id: cat._id },
        { $set: { articleCount: actual } }
      )
    })
  )
}
