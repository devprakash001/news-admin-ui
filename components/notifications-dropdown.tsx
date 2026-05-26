'use client'

import { useNotifications } from '@/context/notifications-context'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Bell, X, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export function NotificationsDropdown() {
  const { isAuthenticated } = useAdminAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refreshNotifications,
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!isAuthenticated) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '!'
      default:
        return 'i'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/15 text-emerald-600'
      case 'error':
        return 'bg-red-500/15 text-red-600'
      case 'warning':
        return 'bg-amber-500/15 text-amber-600'
      default:
        return 'bg-primary/15 text-primary'
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) refreshNotifications()
        }}
        className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-colors"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="fixed left-3 right-3 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 z-50 glass-card-elevated rounded-2xl overflow-hidden shadow-elevated max-h-[min(70vh,480px)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border/60 shrink-0">
              <div>
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                )}
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">Publish an article to get updates here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${notification.read ? '' : 'bg-primary/5'}`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getColor(notification.type)}`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {notification.link ? (
                            <Link
                              href={notification.link}
                              onClick={() => {
                                markAsRead(notification.id)
                                setIsOpen(false)
                              }}
                              className="block"
                            >
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                            </Link>
                          ) : (
                            <>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary mt-1 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 shrink-0 hover:bg-secondary rounded"
                          aria-label="Dismiss"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-border/60 p-3 flex flex-col xs:flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium hover:bg-secondary"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium hover:bg-secondary"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
