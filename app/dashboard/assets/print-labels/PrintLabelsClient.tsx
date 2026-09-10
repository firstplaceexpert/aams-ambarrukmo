'use client'

import { useState, useEffect } from 'react'
import {
  Printer,
  Grid,
  Layers,
  Tag,
  CheckSquare,
  Square,
  Search,
  Filter,
  ArrowLeft,
  Building2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import type { AssetListItem, BusinessUnit, AssetCategory } from '@/types'

interface AssetWithQR extends AssetListItem {
  qr_code_uuid: string
  qrDataUrl?: string
}

type LayoutPreset = 'grid_2x5' | 'grid_3x7' | 'thermal_50x30'

export default function PrintLabelsClient({
  initialAssets,
  businessUnits,
  categories,
}: {
  initialAssets: (AssetListItem & { qr_code_uuid: string })[]
  businessUnits: BusinessUnit[]
  categories: AssetCategory[]
}) {
  const [assets, setAssets] = useState<AssetWithQR[]>(initialAssets)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialAssets.slice(0, 10).map((a) => a.id)
  )
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [layout, setLayout] = useState<LayoutPreset>('grid_2x5')
  const [qrCache, setQrCache] = useState<Record<string, string>>({})
  const [generatingQRs, setGeneratingQRs] = useState(false)

  // Generate QR codes for all selected assets
  useEffect(() => {
    async function generateQRs() {
      setGeneratingQRs(true)
      const newCache = { ...qrCache }
      const baseUrl = window.location.origin

      for (const asset of assets) {
        if (!newCache[asset.id] && asset.qr_code_uuid) {
          const url = `${baseUrl}/scan/${asset.qr_code_uuid}`
          try {
            const dataUrl = await QRCode.toDataURL(url, {
              width: 256,
              margin: 1,
              color: { dark: '#0f172a', light: '#ffffff' },
            })
            newCache[asset.id] = dataUrl
          } catch (e) {
            console.error('Error generating QR for', asset.asset_code, e)
          }
        }
      }

      setQrCache(newCache)
      setGeneratingQRs(false)
    }

    generateQRs()
  }, [assets])

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchSearch =
      !search ||
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(search.toLowerCase())
    const matchUnit = !selectedUnit || asset.business_unit?.id === selectedUnit
    const matchCategory = !selectedCategory || asset.category?.id === selectedCategory
    return matchSearch && matchUnit && matchCategory
  })

  const selectedAssets = assets.filter((a) => selectedIds.includes(a.id))

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllFiltered = () => {
    const ids = filteredAssets.map((a) => a.id)
    const allSelected = ids.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Screen Controls (Hidden during print) */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/assets"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Aset
            </Link>
            <h1 className="page-title">Cetak Label QR Aset</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih aset, atur layout sticker, dan cetak label barcode/QR fisik.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={selectedAssets.length === 0 || generatingQRs}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-600/20"
              id="btn-trigger-print"
            >
              <Printer className="w-4 h-4" />
              Cetak {selectedAssets.length} Label
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Format & Ukuran Label
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayout('grid_2x5')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  layout === 'grid_2x5'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                A4 (2x5 Grid)
                <span className="block text-[10px] opacity-75">10 per lembar</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('grid_3x7')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  layout === 'grid_3x7'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                A4 (3x7 Grid)
                <span className="block text-[10px] opacity-75">21 per lembar</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('thermal_50x30')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  layout === 'thermal_50x30'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Thermal Roll
                <span className="block text-[10px] opacity-75">50 x 30 mm</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Assets */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Filter Pilihan Aset ({selectedAssets.length} Terpilih)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode / nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Semua Unit Bisnis</option>
                {businessUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Asset Selection Table Collapsible */}
        <div className="card overflow-hidden">
          <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={handleSelectAllFiltered}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600"
            >
              {filteredAssets.length > 0 &&
              filteredAssets.every((a) => selectedIds.includes(a.id)) ? (
                <CheckSquare className="w-4 h-4 text-brand-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              Pilih Semua Hasil Filter ({filteredAssets.length} Aset)
            </button>
            <span className="text-xs text-slate-500">
              Total {selectedAssets.length} siap dicetak
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
            {filteredAssets.map((asset) => {
              const isSelected = selectedIds.includes(asset.id)
              return (
                <div
                  key={asset.id}
                  onClick={() => handleToggleSelect(asset.id)}
                  className={`px-4 py-2 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                    />
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">
                        {asset.asset_code}
                      </span>
                      <span className="font-medium text-slate-800">{asset.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    <span>{asset.business_unit?.name}</span>
                    <span>{asset.category?.name}</span>
                  </div>
                </div>
              )
            })}
            {filteredAssets.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada aset yang cocok dengan filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div className="print-container">
        {selectedAssets.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 print:hidden">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Belum ada aset yang dipilih untuk dicetak.</p>
            <p className="text-xs mt-1">Pilih satu atau beberapa aset pada tabel di atas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden text-xs text-slate-500 px-1">
              <span>Preview Cetak ({selectedAssets.length} Label)</span>
              <span>Layout: {layout}</span>
            </div>

            {/* Render based on layout */}
            {layout === 'grid_2x5' && (
              <div className="label-grid-2x5 bg-white p-4 sm:p-6 shadow-md rounded-xl border border-slate-200 print:border-0 print:shadow-none print:p-0">
                {selectedAssets.map((asset) => (
                  <div key={asset.id} className="label-card-2x5 border border-slate-300 rounded-lg p-2.5 flex items-center gap-3 bg-white">
                    <div className="w-20 h-20 flex-shrink-0 bg-white flex items-center justify-center">
                      {qrCache[asset.id] ? (
                        <img
                          src={qrCache[asset.id]}
                          alt={asset.asset_code}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                          QR...
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-brand-900 tracking-wider">
                            AMBARRUKMO
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {asset.business_unit?.name?.substring(0, 16)}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-extrabold text-slate-900 leading-tight mt-0.5">
                          {asset.asset_code}
                        </p>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight mt-0.5">
                          {asset.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[9px] text-slate-500">
                        <span className="truncate">{asset.category?.name}</span>
                        <span className="font-mono text-[8px] text-slate-400">
                          scan.amb
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {layout === 'grid_3x7' && (
              <div className="label-grid-3x7 bg-white p-4 sm:p-6 shadow-md rounded-xl border border-slate-200 print:border-0 print:shadow-none print:p-0">
                {selectedAssets.map((asset) => (
                  <div key={asset.id} className="label-card-3x7 border border-slate-300 rounded-md p-1.5 flex items-center gap-2 bg-white">
                    <div className="w-14 h-14 flex-shrink-0 bg-white flex items-center justify-center">
                      {qrCache[asset.id] ? (
                        <img
                          src={qrCache[asset.id]}
                          alt={asset.asset_code}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                          QR...
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-14">
                      <div>
                        <span className="text-[8px] font-bold text-brand-900 block leading-tight">
                          AMBARRUKMO
                        </span>
                        <p className="text-[10px] font-mono font-extrabold text-slate-900 leading-tight">
                          {asset.asset_code}
                        </p>
                        <p className="text-[9px] font-semibold text-slate-800 line-clamp-1 leading-tight">
                          {asset.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-slate-500">
                        <span className="truncate">{asset.business_unit?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {layout === 'thermal_50x30' && (
              <div className="thermal-roll-grid flex flex-wrap gap-4 bg-white p-6 shadow-md rounded-xl border border-slate-200 print:border-0 print:shadow-none print:p-0">
                {selectedAssets.map((asset) => (
                  <div key={asset.id} className="label-card-thermal border border-slate-400 rounded-md p-2 flex items-center gap-2 bg-white w-[50mm] h-[30mm]">
                    <div className="w-[22mm] h-[22mm] flex-shrink-0 flex items-center justify-center">
                      {qrCache[asset.id] ? (
                        <img
                          src={qrCache[asset.id]}
                          alt={asset.asset_code}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                          QR
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div>
                        <span className="text-[8px] font-bold text-slate-900 leading-none block">
                          AMBARRUKMO
                        </span>
                        <p className="text-[11px] font-mono font-black text-slate-950 leading-tight mt-0.5">
                          {asset.asset_code}
                        </p>
                        <p className="text-[9px] font-bold text-slate-800 line-clamp-2 leading-tight">
                          {asset.name}
                        </p>
                      </div>
                      <p className="text-[8px] text-slate-500 truncate">
                        {asset.business_unit?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt;
          }
          aside,
          header,
          footer,
          .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .label-grid-2x5 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            grid-gap: 6mm !important;
            page-break-inside: avoid !important;
          }
          .label-card-2x5 {
            height: 52mm !important;
            border: 1px dashed #cbd5e1 !important;
            page-break-inside: avoid !important;
          }
          .label-grid-3x7 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            grid-gap: 4mm !important;
            page-break-inside: avoid !important;
          }
          .label-card-3x7 {
            height: 36mm !important;
            border: 1px dashed #cbd5e1 !important;
            page-break-inside: avoid !important;
          }
          .thermal-roll-grid {
            display: block !important;
          }
          .label-card-thermal {
            width: 50mm !important;
            height: 30mm !important;
            page-break-after: always !important;
            border: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
