'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authFetch } from '@/lib/api-client'
import { Loader2, Check, X, EyeOff, Trash2, ExternalLink, Edit2, Plus, Send } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'
import { toast } from 'sonner'
import type { ArticlePublic } from '@/lib/types'

const FILTERS = ['pending', 'published', 'taken_down', 'rejected', 'draft', 'all'] as const
const PUBLIC_SITE = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  draft: 'bg-secondary text-muted-foreground',
  rejected: 'bg-destructive/10 text-destructive',
  taken_down: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticlePublic[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('published')
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    authFetch<{ articles: ArticlePublic[] }>(`/api/articles?status=${filter}`)
      .then((d) => setArticles(d.articles))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [filter])

  const setStatus = async (articleId: string, status: 'published' | 'rejected' | 'taken_down') => {
    setActingId(articleId)
    try {
      await authFetch('/api/articles', {
        method: 'PATCH',
        body: JSON.stringify({ articleId, status }),
      })
      toast.success(status === 'published' ? 'Article published' : 'Updated')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setActingId(null)
    }
  }

  const removeArticle = async (article: ArticlePublic) => {
    if (window.prompt(`Permanently delete "${article.title}"?`) === null) return
    setActingId(article.id)
    try {
      await authFetch('/api/articles', {
        method: 'DELETE',
        body: JSON.stringify({ articleId: article.id }),
      })
      toast.success('Article deleted')
      setArticles((prev) => prev.filter((a) => a.id !== article.id))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setActingId(null)
    }
  }

  const busy = (id: string) => actingId === id

  const ArticleActions = ({ a, compact }: { a: ArticlePublic; compact?: boolean }) => (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'shrink-0'}`}>
      <Link
        href={`/articles/${a.slug}/edit`}
        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm border border-border hover:bg-secondary min-h-[40px]"
      >
        <Edit2 className="h-4 w-4" /> Edit
      </Link>
      {a.status === 'published' && (
        <a
          href={`${PUBLIC_SITE}/articles/${a.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm border border-border hover:bg-secondary min-h-[40px]"
        >
          <ExternalLink className="h-4 w-4" /> View
        </a>
      )}
      {a.status !== 'published' && (
        <button
          type="button"
          disabled={busy(a.id)}
          onClick={() => setStatus(a.id, 'published')}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm disabled:opacity-50 min-h-[40px]"
        >
          {a.status === 'pending' ? (
            <>
              <Check className="h-4 w-4" /> Approve
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Publish
            </>
          )}
        </button>
      )}
      {a.status === 'pending' && (
        <button
          type="button"
          disabled={busy(a.id)}
          onClick={() => setStatus(a.id, 'rejected')}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-destructive/40 text-destructive rounded-xl text-sm min-h-[40px]"
        >
          <X className="h-4 w-4" /> Reject
        </button>
      )}
      {a.status === 'published' && (
        <button
          type="button"
          disabled={busy(a.id)}
          onClick={() => {
            if (confirm(`Take down "${a.title}"?`)) setStatus(a.id, 'taken_down')
          }}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-amber-500/50 text-amber-700 dark:text-amber-400 rounded-xl text-sm min-h-[40px]"
        >
          <EyeOff className="h-4 w-4" /> Take down
        </button>
      )}
      <button
        type="button"
        disabled={busy(a.id)}
        onClick={() => removeArticle(a)}
        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-destructive/10 text-destructive rounded-xl text-sm min-h-[40px]"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, publish, moderate, and delete content</p>
        </div>
        <Link
          href="/articles/new"
          className="btn-primary-glow inline-flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> New article
        </Link>
      </div>

      <div className="glass-card p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium capitalize ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {s === 'taken_down' ? 'taken down' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center text-muted-foreground">No articles in this view</div>
      ) : (
        <>
          <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="py-3 px-4 font-semibold">Article</th>
                    <th className="py-3 px-4 font-semibold">Author</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Views</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="font-medium line-clamp-2">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.category}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/users/${a.author.id}`}
                          className="flex items-center gap-2 hover:text-primary min-w-0"
                        >
                          <UserAvatar src={a.author.avatar} name={a.author.name} size="sm" />
                          <span className="font-medium truncate max-w-[120px]">{a.author.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_BADGE[a.status || 'draft'] || STATUS_BADGE.draft
                          }`}
                        >
                          {(a.status || 'draft').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{(a.views || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <ArticleActions a={a} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="glass-card p-4 rounded-2xl space-y-3">
                <div className="flex gap-3 items-start">
                  <UserAvatar src={a.author.avatar} name={a.author.name} size="md" ring className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold line-clamp-2">{a.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full font-medium ${
                          STATUS_BADGE[a.status || 'draft'] || STATUS_BADGE.draft
                        }`}
                      >
                        {(a.status || 'draft').replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">{a.category}</span>
                      {a.views > 0 && (
                        <span className="text-muted-foreground">{a.views.toLocaleString()} views</span>
                      )}
                    </div>
                    <Link
                      href={`/users/${a.author.id}`}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      {a.author.name}
                    </Link>
                  </div>
                </div>
                <ArticleActions a={a} compact />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
