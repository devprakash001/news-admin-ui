'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { ProfilePhotoUpload } from '@/components/profile-photo-upload'
import { getEffectiveAvatarSrc } from '@/lib/avatar'
import { toast } from 'sonner'

export type ProfileFormUser = {
  id: string
  name: string
  email: string
  bio?: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  profileImage?: string
}

type DashboardProfilePageProps = {
  user: ProfileFormUser
  updateProfile: (data: Partial<ProfileFormUser>) => Promise<ProfileFormUser>
  refreshUser?: () => Promise<void>
}

export function DashboardProfilePage({ user, updateProfile, refreshUser }: DashboardProfilePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    profileImage: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setFormData({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      twitter: user.twitter || '',
      linkedin: user.linkedin || '',
      profileImage: getEffectiveAvatarSrc(user.profileImage) || '',
    })
  }, [
    user.id,
    user.name,
    user.email,
    user.bio,
    user.location,
    user.website,
    user.twitter,
    user.linkedin,
    user.profileImage,
  ])

  const persistProfileImage = async (url: string) => {
    const updated = await updateProfile({ profileImage: url })
    setFormData((p) => ({ ...p, profileImage: getEffectiveAvatarSrc(updated.profileImage) || '' }))
    try {
      await refreshUser?.()
    } catch {
      /* user already updated from PATCH response */
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage how you appear on Editorial</p>
      </div>

      <ProfilePhotoUpload
        value={formData.profileImage}
        onChange={(url) => setFormData((p) => ({ ...p, profileImage: url }))}
        onPersist={persistProfileImage}
        displayName={formData.name || user.name}
      />

      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground pb-1 border-b border-border/60">Personal details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            type="url"
            className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <input
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </button>
    </div>
  )
}
