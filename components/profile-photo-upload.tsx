'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, Loader2, Link2, Upload, User } from 'lucide-react'
import { getAuthHeaders } from '@/lib/api-client'
import { resolveAvatarUrl, getEffectiveAvatarSrc } from '@/lib/avatar'
import { AvatarPlaceholder } from '@/components/avatar-placeholder'
import { toast } from 'sonner'

interface ProfilePhotoUploadProps {
  value: string
  onChange: (url: string) => void
  /** Save profile image to database immediately after upload */
  onPersist?: (url: string) => Promise<void>
  displayName?: string
}

export function ProfilePhotoUpload({
  value,
  onChange,
  onPersist,
  displayName = 'You',
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [cacheKey, setCacheKey] = useState(0)

  const imageSrc = resolveAvatarUrl(value, cacheKey)
  const hasPhoto = !!getEffectiveAvatarSrc(value)
  const isBusy = uploading || saving

  const persistPhoto = useCallback(
    async (url: string) => {
      onChange(url)
      setCacheKey((k) => k + 1)
      if (!onPersist) return
      setSaving(true)
      try {
        await onPersist(url)
        toast.success('Profile photo saved')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save photo')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [onChange, onPersist]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose a JPG, PNG, GIF, or WebP image')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB')
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
        await persistPhoto(data.url)
      } catch (e) {
        if (e instanceof Error && !e.message.includes('Could not save')) {
          toast.error(e.message || 'Upload failed')
        }
      } finally {
        setUploading(false)
      }
    },
    [persistPhoto]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleUrlBlur = async () => {
    const url = value?.trim()
    if (!url || !onPersist || url.startsWith('/uploads')) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) return
    setSaving(true)
    try {
      await onPersist(url)
      setCacheKey((k) => k + 1)
      toast.success('Profile photo saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save photo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-b border-border/50">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-foreground mb-1">Profile photo</p>
          <p className="text-xs text-muted-foreground mb-6 max-w-xs">
            Upload saves automatically. Your photo appears on your profile, in the header, and on every article you publish so readers can see who wrote the story.
          </p>

          <div
            className={`relative group ${dragOver ? 'scale-[1.02]' : ''} transition-transform duration-200`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div
              className={`relative h-32 w-32 sm:h-36 sm:w-36 rounded-full p-1 bg-gradient-to-br from-primary via-accent to-cyan-500 shadow-elevated ${
                dragOver ? 'ring-4 ring-primary/30' : ''
              }`}
            >
              <div className="relative h-full w-full rounded-full overflow-hidden bg-secondary border-4 border-background">
                {isBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : hasPhoto && imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={imageSrc}
                    src={imageSrc}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarPlaceholder name={displayName} size={128} className="!w-full !h-full !rounded-full" />
                )}
                {!isBusy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-full">
                    <Camera className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 sm:right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 border-4 border-background"
              aria-label="Upload photo"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
          </div>

          {hasPhoto && (
            <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Saved on Editorial
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Choose from device
          </button>
          {value && (
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                onChange('')
                if (onPersist) {
                  try {
                    await onPersist('')
                    setCacheKey((k) => k + 1)
                    toast.success('Photo removed')
                  } catch {
                    toast.error('Could not remove photo')
                  }
                }
              }}
              className="sm:w-auto px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Remove photo
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground sm:hidden">
          or drag and drop an image onto your avatar above
        </p>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground pointer-events-none">
            <Link2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-xs font-medium pr-1 border-r border-border/80">
              URL
            </span>
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="https://example.com/your-photo.jpg"
            className="w-full pl-10 sm:pl-[4.5rem] pr-4 py-3 rounded-xl bg-secondary/80 border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Square images work best. Max 5MB. Readers see this photo on news articles and your profile.
        </p>
      </div>

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
  )
}
