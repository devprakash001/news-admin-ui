'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { getAuthHeaders } from '@/lib/api-client'
import { useAdminAuth } from '@/context/admin-auth-context'
import type { NotificationPublic } from '@/lib/types'

interface NotificationsContextType {
  notifications: NotificationPublic[]
  unreadCount: number
  isLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearNotifications: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationPublic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAdminAuth()
  const unreadCount = notifications.filter((n) => !n.read).length

  const refreshNotifications = useCallback(async () => {
    if (!localStorage.getItem('adminToken')) {
      setNotifications([])
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications', { headers: getAuthHeaders(), credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications()
      const t = setInterval(refreshNotifications, 30000)
      return () => clearInterval(t)
    }
    setNotifications([])
  }, [isAuthenticated, user?.id, refreshNotifications])

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'read', id }),
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'readAll' }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotifications = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'clearAll' }),
    })
    setNotifications([])
  }

  const removeNotification = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        removeNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
