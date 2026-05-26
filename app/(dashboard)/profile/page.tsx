'use client'

import { useAdminAuth } from '@/context/admin-auth-context'
import { DashboardProfilePage } from '@/components/dashboard-profile-page'

export default function AdminProfilePage() {
  const { user, updateProfile, refreshUser } = useAdminAuth()
  if (!user) return null
  return <DashboardProfilePage user={user} updateProfile={updateProfile} refreshUser={refreshUser} />
}
