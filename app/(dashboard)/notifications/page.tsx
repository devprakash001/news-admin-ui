'use client'

import { useNotifications } from '@/context/notifications-context'
import Link from 'next/link'
import { Bell, CheckCheck, Trash2, Loader2, RefreshCw } from 'lucide-react'

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    refreshNotifications,
  } = useNotifications()

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5'
      case 'error':
        return 'border-red-500/30 bg-red-500/5'
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5'
      default:
        return 'border-primary/30 bg-primary/5'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshNotifications}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary"
              >
                <CheckCheck className="h-4 w-4" /> Mark all read
              </button>
              <button
                type="button"
                onClick={clearNotifications}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30 text-destructive text-sm hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            New writer applications and platform updates appear here.
          </p>
          <Link href="/users" className="inline-block mt-6 text-primary font-medium hover:underline">
            Review users
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-card p-4 sm:p-5 rounded-2xl border ${getColor(n.type)} ${!n.read ? 'ring-1 ring-primary/20' : ''}`}
            >
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
