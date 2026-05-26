'use client'

import { useParams } from 'next/navigation'
import { ArticleForm } from '@/components/article-form'

export default function AdminEditArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  return <ArticleForm mode="edit" slug={slug} />
}
