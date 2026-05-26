'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authFetch } from '@/lib/api-client'
import { UserAvatar } from '@/components/user-avatar'
import { Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  profileImage: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    authFetch<{ users: AdminUser[] }>('/api/users')
      .then((d) => setUsers(d.users))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const updateUser = async (userId: string, updates: { status?: string; role?: string }) => {
    try {
      await authFetch('/api/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, ...updates }),
      })
      toast.success('User updated')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User management</h1>
        <p className="text-sm text-muted-foreground mt-1">View writers and editors, including profile photos they upload</p>
      </div>

      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-left">
              <th className="p-4 w-14" />
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-28" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="p-4">
                  <UserAvatar src={u.profileImage} name={u.name} size="md" ring />
                </td>
                <td className="p-4 font-medium">
                  <Link href={`/users/${u.id}`} className="hover:text-primary transition-colors">
                    {u.name}
                  </Link>
                </td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    className="px-2 py-1 rounded-lg bg-secondary text-xs"
                  >
                    <option value="user">user</option>
                    <option value="writer">writer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={u.status}
                    onChange={(e) => updateUser(u.id, { status: e.target.value })}
                    className="px-2 py-1 rounded-lg bg-secondary text-xs"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                    <option value="suspended">suspended</option>
                  </select>
                </td>
                <td className="p-4">
                  <Link
                    href={`/users/${u.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="glass-card p-4 rounded-2xl flex gap-3 items-start">
            <UserAvatar src={u.profileImage} name={u.name} size="lg" ring />
            <div className="flex-1 min-w-0 space-y-2">
              <Link href={`/users/${u.id}`} className="font-semibold truncate hover:text-primary block">
                {u.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={u.role}
                  onChange={(e) => updateUser(u.id, { role: e.target.value })}
                  className="px-2 py-1 rounded-lg bg-secondary text-xs"
                >
                  <option value="user">user</option>
                  <option value="writer">writer</option>
                  <option value="admin">admin</option>
                </select>
                <select
                  value={u.status}
                  onChange={(e) => updateUser(u.id, { status: e.target.value })}
                  className="px-2 py-1 rounded-lg bg-secondary text-xs"
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="suspended">suspended</option>
                </select>
                <Link
                  href={`/users/${u.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border hover:bg-secondary"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
