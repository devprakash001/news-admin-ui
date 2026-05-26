'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import { getAuthHeaders } from '@/lib/api-client'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  hint?: string
  aspect?: 'video' | 'square' | 'avatar'
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  hint = 'Drag and drop or click to upload (max 5MB)',
  aspect = 'video',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
          credentials: 'include',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        onChange(data.url)
        toast.success('Image uploaded')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [onChange]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const aspectClass =
    aspect === 'avatar' ? 'aspect-square max-w-[140px]' : aspect === 'square' ? 'aspect-square' : 'aspect-video'

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium">{label}</label>}

      {value && (
        <div className={`relative ${aspectClass} w-full rounded-xl overflow-hidden border border-border`}>
          <Image src={value} alt="Upload preview" fill className="object-cover" unoptimized={value.startsWith('/uploads')} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{hint}</p>
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.target.value = ''
          }}
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Or paste image URL</label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>
    </div>
  )
}
