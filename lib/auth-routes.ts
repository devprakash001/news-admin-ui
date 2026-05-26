import type { User } from '@/context/auth-context'

export function getPostAuthPath(user: Pick<User, 'status' | 'role'>): string {
  if (user.status === 'rejected') return '/auth/pending-approval?status=rejected'
  if (user.status === 'pending') return '/auth/pending-approval'
  if (user.status === 'suspended') return '/auth/pending-approval?status=suspended'
  if (user.role === 'admin') return '/admin'
  if (user.status === 'approved' && (user.role === 'writer' || user.role === 'admin')) {
    return '/dashboard'
  }
  return '/auth/pending-approval'
}

export function canAccessDashboard(user: Pick<User, 'status' | 'role'> | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.status === 'approved' && user.role === 'writer'
}
