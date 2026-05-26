'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Bell,
  User,
  Plus,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/context/admin-auth-context'

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', href: '/' },
  { icon: FileText, label: 'Articles', href: '/articles' },
  { icon: Plus, label: 'New article', href: '/articles/new' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface AdminSidebarProps {
  userName?: string
  userRole?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AdminSidebar({ 
  userName = 'Admin', 
  userRole = 'admin',
  isOpen: controlledIsOpen,
  onOpenChange
}: AdminSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAdminAuth()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Determine if this is controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  // Stable setIsOpen callback
  const setIsOpen = useCallback((open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open)
    } else {
      setInternalIsOpen(open)
    }
  }, [isControlled, onOpenChange])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsOpen(false)
      }
    }
    
    handleRouteChange()
  }, [pathname, setIsOpen])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await logout()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <>
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-dvh md:h-auto w-[min(280px,85vw)] md:w-64 shrink-0 flex flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-border/60">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">Admin Panel</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{userRole}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border/60 space-y-2">
          <div className="px-3 py-2.5 rounded-xl bg-secondary/50">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export function AdminMenuButton({ isOpen = false, onOpenChange }: { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange?.(!isOpen)}
      className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  )
}
