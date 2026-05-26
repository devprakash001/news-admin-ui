'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Eye, FileText, Users, Loader2, AlertCircle } from 'lucide-react'
import { authFetch } from '@/lib/api-client'
import type { ArticlePublic } from '@/lib/types'

const PUBLIC_SITE = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    drafts: 0,
    pendingReviews: 0,
    activeWriters: 0,
    totalViews: 0,
  })
  const [topArticles, setTopArticles] = useState<ArticlePublic[]>([])
  const [categoryStats, setCategoryStats] = useState<{ category: string; articles: number; views: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch<{
      stats: typeof stats
      topArticles: ArticlePublic[]
      categoryStats: { category: string; articles: number; views: number }[]
    }>('/api/analytics')
      .then((d) => {
        setStats(d.stats)
        setTopArticles(d.topArticles)
        setCategoryStats(d.categoryStats)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const cards = [
    { icon: Eye, label: 'Total views', value: stats.totalViews.toLocaleString() },
    { icon: FileText, label: 'Published', value: stats.publishedArticles },
    { icon: Users, label: 'Users', value: stats.totalUsers },
    { icon: Users, label: 'Active writers', value: stats.activeWriters },
    { icon: FileText, label: 'Drafts', value: stats.drafts },
    { icon: AlertCircle, label: 'Pending review', value: stats.pendingReviews },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass-card p-5 sm:p-6 rounded-2xl">
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-5 sm:p-6 rounded-2xl min-w-0">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Top articles
          </h3>
          {topArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published articles yet</p>
          ) : (
            <ul className="space-y-2">
              {topArticles.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <span className="font-bold text-primary w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(a.views || 0).toLocaleString()} views · {a.author.name}
                    </p>
                  </div>
                  <a
                    href={`${PUBLIC_SITE}/articles/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-2xl min-w-0">
          <h3 className="font-semibold mb-4">Views by category</h3>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <ul className="space-y-3">
              {categoryStats.map((c) => (
                <li key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.category}</span>
                    <span className="text-muted-foreground">{c.views.toLocaleString()} views</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(100, (c.views / Math.max(stats.totalViews, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link href="/articles/new" className="inline-flex text-sm text-primary font-medium hover:underline">
        Create a new article →
      </Link>
    </div>
  )
}
