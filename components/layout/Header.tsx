'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Bell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notifications'
import { logoutDemo } from '@/app/(auth)/login/actions'
import type { Profile, Notification } from '@/types'

export default function Header({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = async () => {
    const res = await getNotifications(8)
    setNotifications(res.notifications)
    setUnreadCount(res.unreadCount)
  }

  useEffect(() => {
    fetchNotifs()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    await logoutDemo()
    router.push('/login')
    router.refresh()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await markNotificationAsRead(n.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      )
    }
    setIsOpen(false)
    if (n.related_asset_id) {
      router.push(`/dashboard/assets/${n.related_asset_id}`)
    }
  }

  return (
    <header className="h-14 bg-white border-b border-stone-100 flex items-center justify-between px-6 flex-shrink-0 z-20">
      <div />

      <div className="flex items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors relative"
            title="Notifikasi"
            id="header-notifications-btn"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-heritage-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-fade-in">
              <div className="p-3.5 bg-surface-50 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800">
                    Notifikasi Sistem
                  </span>
                  {unreadCount > 0 && (
                    <span className="badge-red text-[10px] py-0 px-1.5 font-bold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-500 hover:text-brand-700 font-semibold"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    Tidak ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-surface-50 cursor-pointer transition-colors ${
                        !n.is_read ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          n.type === 'maintenance_report'
                            ? 'bg-amber-100 text-amber-600'
                            : n.type === 'disposal_approval'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {n.type === 'maintenance_report' ? (
                          <Wrench className="w-3.5 h-3.5" />
                        ) : n.type === 'disposal_approval' ? (
                          <Trash2 className="w-3.5 h-3.5" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-800 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {!n.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-stone-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2 text-sm text-stone-700">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {profile.full_name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <span className="font-semibold text-xs hidden sm:block">
            {profile.full_name || 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          id="header-logout-btn"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-heritage-50 hover:text-heritage-500 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
