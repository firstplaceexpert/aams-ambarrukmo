import { Suspense } from 'react'
import {
  Box,
  Building2,
  CheckCircle,
  MapPin,
  Tag,
  TrendingUp,
  Camera,
  Printer,
  ClipboardCheck,
  Wrench,
  TrendingDown,
  Trash2,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAssetStats } from './assets/actions'
import { getCurrentUser } from '@/lib/auth/permissions'
import BusinessUnitGallery from '@/components/dashboard/BusinessUnitGallery'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Overview - AAMS Ambarrukmo',
}

function formatRupiah(n?: number | null) {
  if (n == null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

async function StatsSection() {
  const supabase = await createClient()
  const stats = await getAssetStats()

  // Fetch financial sums
  const { data: assetSums } = await (supabase.from('assets') as any)
    .select('purchase_price, current_book_value')
    .neq('status', 'disposed')

  const totalAcquisition = (assetSums || []).reduce(
    (sum: number, a: any) => sum + (Number(a.purchase_price) || 0),
    0
  )
  const totalBookVal = (assetSums || []).reduce(
    (sum: number, a: any) => sum + (Number(a.current_book_value) || 0),
    0
  )

  const cards = [
    {
      label: 'Total Nilai Aset Tetap',
      value: formatRupiah(totalAcquisition),
      sub: `${stats.total.toLocaleString('id-ID')} unit aset terdaftar`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-brand-50 text-brand-500 border-l-4 border-l-brand-500',
      href: '/dashboard/assets',
    },
    {
      label: 'Nilai Buku Terkini (NBV)',
      value: formatRupiah(totalBookVal),
      sub: `${stats.active.toLocaleString('id-ID')} aset aktif operasional`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-emerald-50 text-emerald-600 border-l-4 border-l-emerald-600',
      href: '/dashboard/depreciation',
    },
    {
      label: 'Kondisi Prima (Baik)',
      value: stats.conditions.good.toLocaleString('id-ID'),
      sub: `${stats.total ? Math.round((stats.conditions.good / stats.total) * 100) : 0}% dari total inventaris`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-sky-50 text-sky-600 border-l-4 border-l-sky-600',
      href: '/dashboard/assets?condition=good',
    },
    {
      label: 'Perlu Perbaikan / Servis',
      value: (stats.conditions.damaged + stats.conditions.under_repair).toLocaleString('id-ID'),
      sub: 'Kerusakan & dalam perbaikan',
      icon: <Wrench className="w-6 h-6" />,
      color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600',
      href: '/dashboard/maintenance',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className={`card p-5 group hover:shadow-gold-glow transition-all ${c.color} bg-white`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">{c.label}</span>
            <div className="p-2 rounded-xl bg-stone-50 text-stone-600">{c.icon}</div>
          </div>
          <p className="text-xl font-extrabold text-stone-900 mt-2 truncate font-serif">
            {c.value}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">{c.sub}</p>
        </Link>
      ))}
    </div>
  )
}

async function QuickActionDock() {
  const actions = [
    {
      href: '/dashboard/scanner',
      title: 'QR Scanner',
      desc: 'Pindai label via kamera',
      icon: <Camera className="w-5 h-5" />,
      color: 'bg-blue-600 text-white',
    },
    {
      href: '/dashboard/assets/print-labels',
      title: 'Cetak Label QR',
      desc: 'Sticker grid & thermal',
      icon: <Printer className="w-5 h-5" />,
      color: 'bg-slate-800 text-white',
    },
    {
      href: '/dashboard/opname',
      title: 'Stock Opname',
      desc: 'Audit fisik berkala',
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: 'bg-emerald-600 text-white',
    },
    {
      href: '/dashboard/maintenance',
      title: 'Pemeliharaan',
      desc: 'Work order perbaikan',
      icon: <Wrench className="w-5 h-5" />,
      color: 'bg-amber-600 text-white',
    },
    {
      href: '/dashboard/depreciation',
      title: 'Penyusutan',
      desc: 'Kalkulator nilai buku',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'bg-purple-600 text-white',
    },
    {
      href: '/dashboard/disposal',
      title: 'Pelepasan Aset',
      desc: 'Jual, lelang, hibah',
      icon: <Trash2 className="w-5 h-5" />,
      color: 'bg-rose-600 text-white',
    },
    {
      href: '/dashboard/reports',
      title: 'Pusat Laporan',
      desc: 'Ekspor CSV & cetak',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-brand-700 text-white',
    },
  ]

  return (
    <div className="card p-5 bg-white border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-stone-900 tracking-wide font-serif">
            MODUL OPERASIONAL CEPAT
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Akses langsung ke seluruh fitur siklus hidup aset Ambarrukmo Group.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="p-3.5 rounded-xl bg-stone-50/70 hover:bg-white border border-stone-200/70 hover:border-brand-400/80 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
          >
            <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-105 transition-transform`}>
              {act.icon}
            </div>
            <span className="text-xs font-bold text-stone-800 group-hover:text-brand-700 block leading-tight transition-colors">
              {act.title}
            </span>
            <span className="text-[11px] text-stone-400 group-hover:text-stone-500 mt-0.5 block leading-tight transition-colors">
              {act.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function AttentionAlerts() {
  const supabase = await createClient()

  // Overdue maintenance
  const today = new Date().toISOString().split('T')[0]
  const { data: overdueMaint } = await (supabase
    .from('asset_maintenance') as any)
    .select('id, asset:assets(name, asset_code)')
    .eq('status', 'scheduled')
    .lt('scheduled_date', today)
    .limit(5)

  // Pending disposal
  const { data: pendingDisposal } = await (supabase
    .from('disposal_records') as any)
    .select('id, asset:assets(name, asset_code), disposal_type')
    .eq('approval_status', 'pending')
    .limit(5)

  const hasAlerts = (overdueMaint && overdueMaint.length > 0) || (pendingDisposal && pendingDisposal.length > 0)

  if (!hasAlerts) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {overdueMaint && overdueMaint.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900">
                {overdueMaint.length} Tiket Pemeliharaan Jatuh Tempo
              </h4>
              <Link
                href="/dashboard/maintenance"
                className="text-[11px] text-amber-700 font-semibold hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Jadwal servis preventif aset telah melewati batas tanggal yang ditentukan.
            </p>
          </div>
        </div>
      )}

      {pendingDisposal && pendingDisposal.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-900">
                {pendingDisposal.length} Pengajuan Pelepasan Menunggu Approval
              </h4>
              <Link
                href="/dashboard/disposal"
                className="text-[11px] text-blue-700 font-semibold hover:underline"
              >
                Tinjau &rarr;
              </Link>
            </div>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Terdapat permohonan disposal aset yang memerlukan persetujuan Manager / Direksi.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

async function ByUnitTable() {
  const stats = await getAssetStats()

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Distribusi Aset per Unit Bisnis
        </h2>
        <Link
          href="/dashboard/business-units"
          className="text-xs text-brand-500 hover:text-brand-600 font-semibold"
        >
          Lihat Unit &rarr;
        </Link>
      </div>
      <div className="table-wrapper rounded-none border-0">
        <table className="table">
          <thead>
            <tr>
              <th>Unit Bisnis</th>
              <th>Jumlah Aset</th>
              <th>Proporsi Inventaris</th>
            </tr>
          </thead>
          <tbody>
            {stats.byUnit.map((u) => {
              const pct = stats.total ? ((u.count / stats.total) * 100).toFixed(0) : '0'
              return (
                <tr key={u.name}>
                  <td className="font-semibold text-stone-900">{u.name}</td>
                  <td className="font-mono font-bold text-stone-800">
                    {u.count.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-stone-100 rounded-full h-2 max-w-32 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-600 tabular-nums w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function ConditionBreakdown() {
  const stats = await getAssetStats()
  const conditions = [
    { label: 'Kondisi Baik', value: stats.conditions.good, cls: 'badge-green', barColor: 'bg-emerald-500' },
    { label: 'Kondisi Cukup', value: stats.conditions.fair, cls: 'badge-yellow', barColor: 'bg-amber-500' },
    { label: 'Kondisi Rusak', value: stats.conditions.damaged, cls: 'badge-red', barColor: 'bg-rose-500' },
    { label: 'Dalam Perbaikan', value: stats.conditions.under_repair, cls: 'badge-blue', barColor: 'bg-blue-500' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Health Score & Kondisi Fisik
        </h2>
      </div>
      <div className="card-body space-y-3.5">
        {conditions.map((c) => {
          const pct = stats.total ? Math.round((c.value / stats.total) * 100) : 0
          return (
            <div key={c.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={c.cls}>{c.label}</span>
                <span className="font-bold text-stone-800">
                  {c.value.toLocaleString('id-ID')} ({pct}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${c.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const { profile } = await getCurrentUser()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-xl sm:text-2xl">
            Ambarrukmo Asset Management System
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Selamat datang, <b>{profile.full_name || 'User'}</b> &bull; Role:{' '}
            <span className="capitalize font-semibold text-stone-700">
              {profile.role.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="text-xs text-stone-400">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Quick Action Dock */}
      <QuickActionDock />

      {/* Business Unit Gallery */}
      <BusinessUnitGallery />

      {/* Attention Alerts Banner */}
      <AttentionAlerts />

      {/* KPI Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-stone-100" />
            ))}
          </div>
        }
      >
        <StatsSection />
      </Suspense>

      {/* Main Grid: Distribution & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="card h-64 animate-pulse bg-stone-100" />}>
            <ByUnitTable />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div className="card h-64 animate-pulse bg-stone-100" />}>
            <ConditionBreakdown />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
