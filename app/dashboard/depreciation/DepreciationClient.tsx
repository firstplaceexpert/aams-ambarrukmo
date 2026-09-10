'use client'

import { useState } from 'react'
import {
  TrendingDown,
  DollarSign,
  Calculator,
  Play,
  Calendar,
  Building2,
  Tag,
  Loader2,
  Printer,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import {
  runBatchMonthlyDepreciation,
  type DepreciationLogItem,
} from './actions'
import type { BusinessUnit } from '@/types'

function formatRupiah(n?: number | null) {
  if (n == null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function DepreciationClient({
  initialLogs,
  metrics,
  businessUnits,
}: {
  initialLogs: DepreciationLogItem[]
  metrics: {
    totalAcquisition: number
    totalBookValue: number
    totalAccumulatedDepreciation: number
    totalAssets: number
  }
  businessUnits: BusinessUnit[]
}) {
  const currentMonthStr = new Date().toISOString().slice(0, 7) // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [selectedUnit, setSelectedUnit] = useState('')
  const [search, setSearch] = useState('')
  const [running, setRunning] = useState(false)
  const [batchResult, setBatchResult] = useState<{
    processedCount: number
    totalDepreciated: number
  } | null>(null)

  const handleRunBatch = async () => {
    if (
      !confirm(
        `Jalankan perhitungan dan pembukuan penyusutan otomatis untuk periode ${selectedMonth} ${
          selectedUnit ? `pada unit terpilih` : 'seluruh unit bisnis'
        }?`
      )
    )
      return

    setRunning(true)
    setBatchResult(null)

    const res = await runBatchMonthlyDepreciation(
      selectedMonth,
      selectedUnit || undefined
    )
    setRunning(false)

    if (res.success) {
      setBatchResult(res.data)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      alert(res.error)
    }
  }

  const filteredLogs = initialLogs.filter((log) => {
    const matchSearch =
      !search ||
      log.asset?.name.toLowerCase().includes(search.toLowerCase()) ||
      log.asset?.asset_code.toLowerCase().includes(search.toLowerCase())
    const matchUnit = !selectedUnit || log.asset?.business_unit?.id === selectedUnit
    return matchSearch && matchUnit
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Engine Penyusutan Aset (Depreciation)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan nilai buku, depresiasi fiskal & komersial otomatis dengan metode Garis Lurus & Saldo Menurun.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2.5"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan Depresiasi
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-brand-600 bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Harga Perolehan
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatRupiah(metrics.totalAcquisition)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dari {metrics.totalAssets} total aset terdaftar
          </span>
        </div>

        <div className="card p-5 border-l-4 border-l-rose-500 bg-white">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Akumulasi Penyusutan
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatRupiah(metrics.totalAccumulatedDepreciation)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total penyusutan terbukukan
          </span>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-600 bg-white">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Nilai Buku Terkini (Net Book Value)
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatRupiah(metrics.totalBookValue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Nilai sisa aset aktif seluruh unit
          </span>
        </div>
      </div>

      {/* Batch Calculation Runner Bar */}
      <div className="card p-5 bg-gradient-to-r from-slate-900 to-brand-950 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold text-white">
                Jalankan Penyusutan Bulanan Otomatis
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Sistem akan menghitung dan mencatat jurnal penyusutan bulanan untuk seluruh aset aktif sesuai masa manfaatnya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-brand-300" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none"
              />
            </div>

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="">Semua Unit Bisnis</option>
              {businessUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunBatch}
              disabled={running}
              className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4 bg-brand-500 hover:bg-brand-400 shadow-lg shadow-brand-500/30"
              id="btn-run-depreciation"
            >
              {running ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghitung...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Hitung & Bukukan Penyusutan
                </>
              )}
            </button>
          </div>
        </div>

        {batchResult && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Berhasil membukukan penyusutan untuk <b>{batchResult.processedCount} aset</b> dengan total nominal{' '}
              <b>{formatRupiah(batchResult.totalDepreciated)}</b>.
            </span>
          </div>
        )}
      </div>

      {/* Depreciation Log History Table */}
      <div className="card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Log Pembukuan Penyusutan ({filteredLogs.length} Catatan)
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama aset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">Belum ada riwayat log penyusutan.</p>
            <p className="mt-1">
              Jalankan batch perhitungan penyusutan di atas untuk membuat log periode pertama.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama Aset</th>
                  <th className="py-3 px-4 font-semibold">Unit Bisnis</th>
                  <th className="py-3 px-4 font-semibold">Periode</th>
                  <th className="py-3 px-4 font-semibold">Metode</th>
                  <th className="py-3 px-4 font-semibold">Penyusutan Periode Ini</th>
                  <th className="py-3 px-4 font-semibold">Nilai Buku Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link
                        href={`/dashboard/assets/${log.asset_id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {log.asset?.asset_code}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium">{log.asset?.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {log.asset?.business_unit?.name}
                    </td>
                    <td className="py-3 px-4 font-semibold">{log.period_month}</td>
                    <td className="py-3 px-4 capitalize text-slate-500">
                      {log.asset?.depreciation_method?.replace('_', ' ') || 'Straight Line'}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      -{formatRupiah(log.depreciation_amount)}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {formatRupiah(log.book_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Sheet */}
      <div className="hidden print:block space-y-6 text-black">
        <div className="text-center border-b-2 border-black pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider">
            LAPORAN REKAPITULASI PENYUSUTAN & NILAI BUKU ASET
          </h2>
          <p className="text-sm font-semibold mt-1">
            AMBARRUKMO GROUP &bull; Periode: {selectedMonth}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="p-3 border border-black">
            <p className="font-bold">Total Perolehan:</p>
            <p className="text-base font-bold mt-1">{formatRupiah(metrics.totalAcquisition)}</p>
          </div>
          <div className="p-3 border border-black">
            <p className="font-bold">Akumulasi Penyusutan:</p>
            <p className="text-base font-bold mt-1">{formatRupiah(metrics.totalAccumulatedDepreciation)}</p>
          </div>
          <div className="p-3 border border-black">
            <p className="font-bold">Nilai Buku Bersih:</p>
            <p className="text-base font-bold mt-1">{formatRupiah(metrics.totalBookValue)}</p>
          </div>
        </div>

        <table className="w-full text-[10px] border border-black text-left">
          <thead>
            <tr className="border-b border-black bg-slate-100 font-bold">
              <th className="p-1 border-r border-black">Kode Aset</th>
              <th className="p-1 border-r border-black">Nama Aset</th>
              <th className="p-1 border-r border-black">Unit Bisnis</th>
              <th className="p-1 border-r border-black">Penyusutan</th>
              <th className="p-1">Nilai Buku Akhir</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-300">
                <td className="p-1 border-r border-black font-mono font-bold">{log.asset?.asset_code}</td>
                <td className="p-1 border-r border-black">{log.asset?.name}</td>
                <td className="p-1 border-r border-black">{log.asset?.business_unit?.name}</td>
                <td className="p-1 border-r border-black">{formatRupiah(log.depreciation_amount)}</td>
                <td className="p-1 font-bold">{formatRupiah(log.book_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
