'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Save, KeyRound, ChevronRight, Sun, Moon, Monitor } from 'lucide-react'
import { useAdminAuth } from '@/context/admin-auth-context'
import { useEffect } from 'react'

export default function AdminSettingsPage() {
  const { user } = useAdminAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    siteName: 'Editorial',
    siteUrl: process.env.NEXT_PUBLIC_EDITOR_SITE_URL || 'http://localhost:3000',
    requireArticleApproval: true,
    allowUserRegistration: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <div className="max-w-2xl space-y-6 min-w-0 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform and account preferences</p>
      </div>

      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold">Appearance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {mounted && [
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${
                theme === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-secondary'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">
          Signed in as <strong className="text-foreground">{user?.email}</strong>
        </p>
        <p className="text-sm text-muted-foreground capitalize">
          Role: {user?.role} · Status: {user?.status}
        </p>
        <Link
          href="/settings/change-password"
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:bg-secondary/80 transition-colors group"
        >
          <span className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </span>
            <span>
              <span className="font-medium text-sm block">Change password</span>
              <span className="text-xs text-muted-foreground">Update your admin sign-in password</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground shrink-0" />
        </Link>
      </div>
    </div>
  )
}
