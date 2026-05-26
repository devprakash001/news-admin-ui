import type { DbArticle, ArticlePublic } from './types'
import { getEffectiveAvatarSrc } from './avatar'

export function toPublicArticle(article: DbArticle): ArticlePublic {
  return {
    id: article._id!.toString(),
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    content: article.content,
    featuredImage: article.featuredImage,
    category: article.category,
    categorySlug: article.categorySlug,
    tags: article.tags,
    author: {
      id: article.authorId.toString(),
      name: article.authorName,
      avatar: getEffectiveAvatarSrc(article.authorAvatar) || '',
      bio: article.authorBio,
    },
    publishedAt: article.publishedAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    readingTime: article.readingTime,
    views: typeof article.views === 'number' ? article.views : 0,
    trending: article.trending,
    status: article.status,
  }
}
