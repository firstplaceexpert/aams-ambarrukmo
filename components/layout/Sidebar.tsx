'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Box,
  Building2,
  ChevronDown,
  LayoutDashboard,
  MapPin,
  Settings,
  Tag,
  Camera,
  Printer,
  ClipboardCheck,
  Wrench,
  TrendingDown,
  Trash2,
  FileText,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { Profile } from '@/types'

interface NavGroup {
  groupLabel?: string
  items: {
    href: string
    label: string
    icon: React.ReactNode
    children?: { href: string; label: string }[]
  }[]
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: 'OPERASIONAL & SCAN',
    items: [
      {
        href: '/dashboard/scanner',
        label: 'QR Scanner',
        icon: <Camera className="w-4 h-4" />,
      },
      {
        href: '/dashboard/assets/print-labels',
        label: 'Cetak Label QR',
        icon: <Printer className="w-4 h-4" />,
      },
      {
        href: '/dashboard/opname',
        label: 'Stock Opname',
        icon: <ClipboardCheck className="w-4 h-4" />,
      },
      {
        href: '/dashboard/maintenance',
        label: 'Pemeliharaan / WO',
        icon: <Wrench className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: 'DATA INVENTARIS',
    items: [
      {
        href: '/dashboard/assets',
        label: 'Daftar Aset',
        icon: <Box className="w-4 h-4" />,
      },
      {
        href: '/dashboard/locations',
        label: 'Lokasi Fisik',
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        href: '/dashboard/business-units',
        label: 'Unit Bisnis',
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        href: '/dashboard/asset-categories',
        label: 'Kategori Aset',
        icon: <Tag className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: 'FINANSIAL & SIKLUS',
    items: [
      {
        href: '/dashboard/depreciation',
        label: 'Penyusutan Nilai',
        icon: <TrendingDown className="w-4 h-4" />,
      },
      {
        href: '/dashboard/disposal',
        label: 'Pelepasan / Disposal',
        icon: <Trash2 className="w-4 h-4" />,
      },
      {
        href: '/dashboard/reports',
        label: 'Pusat Laporan',
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: 'SISTEM',
    items: [
      {
        href: '/dashboard/settings',
        label: 'Pengaturan User',
        icon: <Settings className="w-4 h-4" />,
        children: [
          { href: '/dashboard/settings/users', label: 'Manajemen User' },
        ],
      },
    ],
  },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full z-30 flex flex-col"
      style={{ width: 'var(--sidebar-w)', backgroundColor: '#1C1917' }}
    >
      {/* Logo — Ambarrukmo Group */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-500/20 flex-shrink-0">
        <div className="w-11 h-11 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-400/30 p-1 shadow-xs">
          <Image
            src="/favicon.png"
            alt="Ambarrukmo"
            width={40}
            height={40}
            className="object-contain w-full h-full scale-110 drop-shadow-sm"
          />
        </div>
        <div className="min-w-0">
          <p className="text-brand-100 font-bold text-sm tracking-wide truncate leading-tight font-serif">
            AMBARRUKMO
          </p>
          <p className="text-brand-400/70 text-[11px] truncate">Asset Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin space-y-4">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.groupLabel && (
              <p className="text-[10px] font-bold text-brand-500/60 tracking-wider px-3 py-1">
                {group.groupLabel}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)

                if (item.children) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.children[0].href}
                        className={clsx('nav-item', active && 'active')}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx('nav-item', active && 'active')}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-brand-500/15 flex-shrink-0 bg-black/20">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/30 border border-brand-400/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-200">
              {profile.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {profile.full_name || 'User'}
            </p>
            <p className="text-brand-400/60 text-[10px] truncate capitalize mt-0.5">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
