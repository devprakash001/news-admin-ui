'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/rich-text-editor'
import { ImageUpload } from '@/components/image-upload'
import { plainTextFromContent } from '@/lib/html-content'
import { authFetch } from '@/lib/api-client'
import type { ArticlePublic, ArticleStatus } from '@/lib/types'

type FormData = {
  title: string
  slug: string
  category: string
  tags: string
  excerpt: string
  content: string
  featuredImage: string
  seoDescription: string
}

type ArticleFormProps = {
  mode: 'create' | 'edit'
  slug?: string
  authorLabel?: string
}

export function ArticleForm({ mode, slug, authorLabel }: ArticleFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>(['Technology', 'Business', 'Health'])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    category: 'Technology',
    tags: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    seoDescription: '',
  })
  const [currentStatus, setCurrentStatus] = useState<ArticleStatus>('draft')
  const [loadedAuthor, setLoadedAuthor] = useState<string | undefined>(authorLabel)
  const [loadingArticle, setLoadingArticle] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories?.length) {
          setCategories(d.categories.map((c: { name: string }) => c.name))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !slug) return
    setLoadingArticle(true)
    authFetch<{ article: ArticlePublic }>(`/api/articles/${slug}`)
      .then((data) => {
        const a = data.article
        setFormData({
          title: a.title,
          slug: a.slug,
          category: a.category,
          tags: (a.tags || []).join(', '),
          excerpt: a.excerpt || '',
          content: a.content || '',
          featuredImage: a.featuredImage || '',
          seoDescription: '',
        })
        setCurrentStatus(a.status || 'draft')
        setLoadedAuthor(a.author?.name)
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Failed to load article')
        router.push('/articles')
      })
      .finally(() => setLoadingArticle(false))
  }, [mode, slug, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'title' && mode === 'create') {
        updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      return updated
    })
  }

  const validate = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return false
    }
    const plain = plainTextFromContent(formData.content)
    if (!plain || plain.length < 20) {
      toast.error('Please write more article content')
      return false
    }
    return true
  }

  const saveCreate = async (status: 'draft' | 'published') => {
    if (!validate()) return
    setSaving(true)
    try {
      const excerpt = formData.excerpt.trim() || plainTextFromContent(formData.content, 200)
      await authFetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify({ ...formData, excerpt, status, tags: formData.tags }),
      })
      toast.success(status === 'published' ? 'Article published!' : 'Draft saved!')
      router.push('/articles')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (status?: ArticleStatus) => {
    if (!validate() || !slug) return
    setSaving(true)
    try {
      const excerpt = formData.excerpt.trim() || plainTextFromContent(formData.content, 200)
      const nextStatus = status ?? currentStatus
      await authFetch(`/api/articles/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...formData,
          excerpt,
          status: nextStatus,
          tags: formData.tags,
        }),
      })
      const labels: Record<string, string> = {
        draft: 'Draft saved',
        published: 'Article published!',
        pending: 'Submitted for review',
      }
      toast.success(labels[nextStatus] || 'Article updated')
      router.push('/articles')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const isPublished = currentStatus === 'published'
  const canPublish = currentStatus !== 'published'

  if (loadingArticle) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/articles" className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {mode === 'create' ? 'New Article' : 'Edit Article'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {loadedAuthor ? `By ${loadedAuthor} · ` : ''}
              Status: <span className="capitalize font-medium text-foreground">{currentStatus}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {mode === 'create' ? (
            <>
              <button
                type="button"
                onClick={() => saveCreate('draft')}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-border rounded-xl hover:bg-secondary flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => saveCreate('published')}
                disabled={saving || !formData.title}
                className="flex-1 sm:flex-none btn-primary-glow text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {saving ? 'Publishing…' : 'Publish'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => saveEdit(isPublished ? undefined : 'draft')}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-border rounded-xl hover:bg-secondary flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                {isPublished ? 'Save changes' : 'Save Draft'}
              </button>
              {canPublish && (
                <button
                  type="button"
                  onClick={() => saveEdit('published')}
                  disabled={saving}
                  className="flex-1 sm:flex-none btn-primary-glow text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {saving ? 'Publishing…' : 'Publish'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="glass-card p-5 sm:p-6 rounded-2xl">
            <label className="block text-sm font-medium mb-2">Article title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Write an engaging title…"
              className="w-full px-4 py-3 text-xl sm:text-2xl font-bold rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl">
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Short summary (auto-generated from content if empty)…"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{formData.excerpt.length}/200</p>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl">
            <ImageUpload
              label="Featured image"
              value={formData.featuredImage}
              onChange={(url) => setFormData((p) => ({ ...p, featuredImage: url }))}
            />
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl">
            <label className="block text-sm font-medium mb-3">Article content</label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
              placeholder="Start writing your story. Use the toolbar for Bold, Italic, links, quotes, code, and lists."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 text-sm">Status</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {currentStatus === 'draft'
                ? 'Draft — save or publish when ready'
                : currentStatus === 'published'
                  ? 'Published — changes go live on save'
                  : `${currentStatus} — edit and publish when ready`}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tech, news, ai"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <label className="block text-sm font-medium mb-2">SEO description</label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              rows={3}
              maxLength={160}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.seoDescription.length}/160</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <label className="block text-sm font-medium mb-2">URL slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
