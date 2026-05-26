'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { authFetch } from '@/lib/api-client'
import { UserAvatar } from '@/components/user-avatar'
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Edit2,
} from 'lucide-react'
import type { ArticlePublic, UserPublic } from '@/lib/types'

type UserStats = {
  total: number
  published: number
  pending: number
  draft: number
  rejected: number
  taken_down: number
}

const PUBLIC_SITE = process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000'

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  draft: 'bg-secondary text-muted-foreground',
  rejected: 'bg-destructive/10 text-destructive',
  taken_down: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  href?: string
}) {
  if (!value?.trim()) return null
  const content = href ? (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline break-all"
    >
      {value}
    </a>
  ) : (
    <span className="break-all">{value}</span>
  )
  return (
    <div className="flex gap-3 py-3 border-b border-border/50 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  )
}

export default function AdminUserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserPublic | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [articles, setArticles] = useState<ArticlePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    authFetch<{ user: UserPublic; stats: UserStats; articles: ArticlePublic[] }>(`/api/users/${userId}`)
      .then((data) => {
        setUser(data.user)
        setStats(data.stats)
        setArticles(data.articles)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [userId])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl space-y-4">
        <Link href="/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
        <p className="text-muted-foreground">{error || 'User not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 pt-8 pb-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <UserAvatar src={user.profileImage} name={user.name} size="xl" ring />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                  {user.role}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium capitalize">
                  {user.status}
                </span>
              </div>
              {user.bio && (
                <p className="text-sm text-foreground/90 mt-4 leading-relaxed max-w-xl">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground pb-1 border-b border-border/60 mb-1">
            Personal information
          </h2>
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={MapPin} label="Location" value={user.location} />
          <InfoRow icon={Globe} label="Website" value={user.website} href={user.website} />
          <InfoRow
            icon={Link2}
            label="Twitter"
            value={user.twitter ? `@${user.twitter.replace(/^@/, '')}` : undefined}
            href={user.twitter ? `https://twitter.com/${user.twitter.replace(/^@/, '')}` : undefined}
          />
          <InfoRow icon={Link2} label="LinkedIn" value={user.linkedin} href={user.linkedin} />
          <InfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total posts', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Pending', value: stats.pending },
            { label: 'Drafts', value: stats.draft },
            { label: 'Rejected', value: stats.rejected },
            { label: 'Taken down', value: stats.taken_down },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Posts ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-muted-foreground text-sm">
            This user has not created any articles yet.
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        STATUS_STYLES[a.status || 'draft'] || STATUS_STYLES.draft
                      }`}
                    >
                      {(a.status || 'draft').replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.category}</span>
                  </div>
                  <p className="font-semibold line-clamp-2">{a.title}</p>
                  {a.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.excerpt}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {formatDate(a.updatedAt)}
                    {a.views > 0 ? ` · ${a.views.toLocaleString()} views` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:shrink-0">
                  <Link
                    href={`/articles/${a.slug}/edit`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm border border-border hover:bg-secondary min-h-[40px]"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </Link>
                  {a.status === 'published' && (
                    <a
                      href={`${PUBLIC_SITE}/articles/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm border border-border hover:bg-secondary min-h-[40px]"
                    >
                      <ExternalLink className="h-4 w-4" /> View live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
