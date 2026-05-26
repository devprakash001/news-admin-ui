'use client'

import { AdminSidebar, AdminMenuButton } from '@/components/admin-sidebar'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { ThemeToggleButton } from '@/components/theme-toggle'
import { useAdminAuth } from '@/context/admin-auth-context'
import Link from 'next/link'
import { UserAvatar } from '@/components/user-avatar'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAdminAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <AdminSidebar 
        userName={user.name} 
        userRole={user.role} 
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-dvh">
        <header className="nav-glass px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-20 shrink-0 border-b border-border/40">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AdminMenuButton isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
            <h1 className="text-lg sm:text-xl font-bold gradient-text truncate">Editorial Admin</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggleButton />
            <NotificationsDropdown />
            <Link href="/profile" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="text-right hidden sm:block max-w-[120px]">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <UserAvatar src={user.profileImage} name={user.name} size="md" ring className="sm:!w-10 sm:!h-10" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 pb-6 md:pb-8 max-w-6xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
