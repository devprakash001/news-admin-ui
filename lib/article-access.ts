import type { ObjectId } from 'mongodb'
import type { DbArticle, DbUser } from './types'

export function articleAuthorId(authorId: ObjectId | string): string {
  return authorId.toString()
}

export function isArticleOwner(article: DbArticle, user: DbUser): boolean {
  return articleAuthorId(article.authorId) === user._id!.toString()
}

export function canEditArticle(article: DbArticle, user: DbUser): boolean {
  return isArticleOwner(article, user) || user.role === 'admin'
}
