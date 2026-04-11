'use client'

/**
 * Admin Dashboard — v2.0
 * Main admin interface with tabs for all management features.
 */
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function AdminPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminDashboard />
}
