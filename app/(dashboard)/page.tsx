'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, FileText, Eye, AlertCircle, Loader2 } from 'lucide-react'
import { authFetch } from '@/lib/api-client'
import { UserAvatar } from '@/components/user-avatar'
import type { ArticlePublic } from '@/lib/types'

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    stats: { totalUsers: number; publishedArticles: number; pendingReviews: number; totalViews: number }
    recentUsers: {
      id: string
      name: string
      email: string
      status: string
      profileImage?: string
      createdAt: string
    }[]
    pendingArticles: ArticlePublic[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch<typeof data>('/api/stats')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = data?.stats
  const statCards = stats
    ? [
        { icon: Users, label: 'Users', value: stats.totalUsers },
        { icon: FileText, label: 'Published', value: stats.publishedArticles },
        { icon: AlertCircle, label: 'Pending', value: stats.pendingReviews },
        { icon: Eye, label: 'Total views', value: stats.totalViews.toLocaleString() },
      ]
    : []

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Platform overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Live data from MongoDB</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-5 sm:p-6 rounded-2xl">
              <div className="flex justify-between mb-3">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <Icon className="h-5 w-5 text-primary shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold">Recent registrations</h3>
            <Link href="/users" className="text-xs text-primary hover:underline shrink-0">
              View all
            </Link>
          </div>
          {data?.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet</p>
          ) : (
            <div className="space-y-2">
              {data?.recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/users/${u.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  <UserAvatar src={u.profileImage} name={u.name} size="sm" ring />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-xs capitalize shrink-0">{u.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold">Pending review</h3>
            <Link href="/articles" className="text-xs text-primary hover:underline shrink-0">
              Review
            </Link>
          </div>
          {data?.pendingArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending articles</p>
          ) : (
            <div className="space-y-2">
              {data?.pendingArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}/edit`}
                  className="block p-3 rounded-xl bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  <p className="font-medium line-clamp-2">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">by {a.author.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
