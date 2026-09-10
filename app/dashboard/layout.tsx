import { getCurrentUser } from '@/lib/auth/permissions'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await getCurrentUser()

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar profile={profile} />
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        <Header profile={profile} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
