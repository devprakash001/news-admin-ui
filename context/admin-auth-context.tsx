'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { clearAdminToken, storeAdminToken } from '@/lib/api-client'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin'
  status: string
  bio: string
  profileImage: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  createdAt: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AdminUser>
  logout: () => Promise<void>
  updateProfile: (data: Partial<AdminUser>) => Promise<AdminUser>
  refreshUser: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          setUser(null)
          return
        }
        const { user: u } = await apiFetch<{ user: AdminUser }>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(u)
      } catch {
        clearAdminToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    check()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    storeAdminToken(data.token)
    setUser(data.user)
    return data.user
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) return
    const { user: u } = await apiFetch<{ user: AdminUser }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    setUser(u)
  }

  const updateProfile = async (data: Partial<AdminUser>) => {
    const token = localStorage.getItem('adminToken')
    const result = await apiFetch<{ user: AdminUser }>('/api/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    setUser(result.user)
    return result.user
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      /* ignore */
    }
    clearAdminToken()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AdminAuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateProfile, refreshUser }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
