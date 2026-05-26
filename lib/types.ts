import type { ObjectId } from 'mongodb'

export type UserRole = 'user' | 'writer' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'taken_down'
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface DbUser {
  _id?: ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  status: UserStatus
  bio: string
  profileImage: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  createdAt: Date
  updatedAt: Date
}

export interface DbArticle {
  _id?: ObjectId
  slug: string
  title: string
  subtitle: string
  excerpt: string
  content: string
  featuredImage: string
  category: string
  categorySlug: string
  tags: string[]
  authorId: ObjectId | string
  authorName: string
  authorAvatar: string
  authorBio?: string
  status: ArticleStatus
  readingTime: number
  views: number
  trending?: boolean
  seoDescription?: string
  publishedAt: Date
  updatedAt: Date
}

export interface DbCategory {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  icon: string
  articleCount: number
}

export interface DbNotification {
  _id?: ObjectId
  userId: ObjectId | string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

export interface ArticlePublic {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  content?: string
  featuredImage: string
  category: string
  categorySlug: string
  tags?: string[]
  author: {
    id?: string
    name: string
    avatar: string
    bio?: string
    articles?: number
  }
  publishedAt: string
  updatedAt?: string
  readingTime: number
  views: number
  trending?: boolean
  status?: ArticleStatus
}

export interface UserPublic {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  bio: string
  profileImage: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  createdAt: string
}

export interface NotificationPublic {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  timestamp: number
}
