'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, FileText } from 'lucide-react'
import { assetSchema, type AssetFormValues } from '@/lib/validations/asset'
import { uploadAssetPhoto, uploadAssetDocument, createAsset, updateAsset } from './actions'
import type { AssetCategory, BusinessUnit, Location, Profile, Asset } from '@/types'

interface Props {
  initialData?: Asset
  assetId?: string
  categories: AssetCategory[]
  businessUnits: BusinessUnit[]
  locations: Location[]
  users: Profile[]
  onSubmit?: (values: AssetFormValues) => Promise<{ success: boolean; error?: string }>
  submitLabel?: string
  defaultBusinessUnitId?: string
}

const conditionOptions = [
  { value: 'good', label: 'Baik' },
  { value: 'fair', label: 'Cukup' },
  { value: 'damaged', label: 'Rusak' },
  { value: 'under_repair', label: 'Dalam Perbaikan' },
]

export default function AssetForm({
  initialData, assetId, categories, businessUnits, locations, users, onSubmit, submitLabel = 'Simpan Aset', defaultBusinessUnitId,
}: Props) {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url ?? null)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      category_id: initialData?.category_id ?? '',
      business_unit_id: initialData?.business_unit_id ?? defaultBusinessUnitId ?? businessUnits[0]?.id ?? '',
      current_location_id: initialData?.current_location_id ?? null,
      current_pic_id: initialData?.current_pic_id ?? null,
      photo_url: initialData?.photo_url ?? '',
      purchase_date: initialData?.purchase_date ?? '',
      purchase_price: initialData?.purchase_price ?? undefined,
      useful_life_months: initialData?.useful_life_months ?? undefined,
      depreciation_method: initialData?.depreciation_method ?? 'straight_line',
      condition: initialData?.condition ?? 'good',
      warranty_until: initialData?.warranty_until ?? '',
      legal_document_url: initialData?.legal_document_url ?? '',
    },
  })

  const selectedBuId = watch('business_unit_id')
  const filteredLocations = locations.filter((l) => l.business_unit_id === selectedBuId)
  const filteredUsers = users.filter(
    (u) => u.business_unit_id === selectedBuId || u.role === 'super_admin' || u.role === 'corporate_admin'
  )

  // Auto-fill useful_life_months from category
  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (cat) {
      setValue('useful_life_months', cat.default_useful_life_months)
      setValue('depreciation_method', cat.default_depreciation_method)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadAssetPhoto(fd)
    if (result.success) {
      setValue('photo_url', result.data)
      setPhotoPreview(result.data)
    } else {
      alert('Upload gagal: ' + result.error)
    }
    setUploadingPhoto(false)
  }

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadAssetDocument(fd)
    if (result.success) {
      setValue('legal_document_url', result.data)
    } else {
      alert('Upload gagal: ' + result.error)
    }
    setUploadingDoc(false)
  }

  const handleFormSubmit = async (values: AssetFormValues) => {
    let result: { success: boolean; error?: string }
    if (onSubmit) {
      result = await onSubmit(values)
    } else if (initialData?.id || assetId) {
      result = await updateAsset(initialData?.id || assetId!, values)
    } else {
      result = await createAsset(values)
    }
    if (!result.success) { setError('root', { message: result.error }); return }
    router.push('/dashboard/assets')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* --- SECTION: Info Dasar --- */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="asset-name" className="label">Nama Aset <span className="text-red-500">*</span></label>
            <input id="asset-name" {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Contoh: Sofa Lounge Premium 3-seater" />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="asset-category" className="label">Kategori <span className="text-red-500">*</span></label>
            <select
              id="asset-category"
              {...register('category_id', { onChange: (e) => handleCategoryChange(e.target.value) })}
              className={`input ${errors.category_id ? 'input-error' : ''}`}
            >
              <option value="">— Pilih kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="field-error">{errors.category_id.message}</p>}
          </div>

          <div>
            <label htmlFor="asset-bu" className="label">Unit Bisnis <span className="text-red-500">*</span></label>
            <select id="asset-bu" {...register('business_unit_id')} className={`input ${errors.business_unit_id ? 'input-error' : ''}`}>
              <option value="">— Pilih unit bisnis —</option>
              {businessUnits.map((bu) => <option key={bu.id} value={bu.id}>{bu.name}</option>)}
            </select>
            {errors.business_unit_id && <p className="field-error">{errors.business_unit_id.message}</p>}
          </div>

          <div>
            <label htmlFor="asset-location" className="label">Lokasi Awal</label>
            <select id="asset-location" {...register('current_location_id')} className="input">
              <option value="">— Pilih lokasi —</option>
              {filteredLocations.map((l) => <option key={l.id} value={l.id}>[{l.level.toUpperCase()}] {l.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="asset-pic" className="label">PIC (Penanggung Jawab)</label>
            <select id="asset-pic" {...register('current_pic_id')} className="input">
              <option value="">— Pilih PIC —</option>
              {filteredUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({u.role.replace('_', ' ')})</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="asset-condition" className="label">Kondisi <span className="text-red-500">*</span></label>
            <select id="asset-condition" {...register('condition')} className="input">
              {conditionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="asset-desc" className="label">Deskripsi</label>
            <textarea id="asset-desc" {...register('description')} rows={3} className="input resize-none" placeholder="Spesifikasi, merek, nomor seri, dll." />
          </div>
        </div>
      </div>

      {/* --- SECTION: Foto --- */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Foto Aset</h3>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} id="photo-file-input" />
        <input {...register('photo_url')} type="hidden" />

        <div className="flex items-start gap-4">
          {photoPreview ? (
            <div className="relative group">
              <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-slate-200" />
              <button
                type="button"
                onClick={() => { setPhotoPreview(null); setValue('photo_url', '') }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
              onClick={() => photoInputRef.current?.click()}
            >
              {uploadingPhoto ? <Loader2 className="w-6 h-6 animate-spin text-brand-500" /> : <Upload className="w-6 h-6 text-slate-300" />}
              <span className="text-xs text-slate-400">{uploadingPhoto ? 'Mengupload...' : 'Upload foto'}</span>
            </div>
          )}
          <div className="text-xs text-slate-400 space-y-1 pt-1">
            <p>Format: JPG, PNG, WebP</p>
            <p>Maksimal: 5MB</p>
            <button type="button" onClick={() => photoInputRef.current?.click()} className="btn-secondary btn-sm mt-2" disabled={uploadingPhoto}>
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {photoPreview ? 'Ganti Foto' : 'Pilih Foto'}
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION: Data Pembelian --- */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Pembelian & Penyusutan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="asset-purchase-date" className="label">Tanggal Pembelian</label>
            <input id="asset-purchase-date" type="date" {...register('purchase_date')} className="input" />
          </div>
          <div>
            <label htmlFor="asset-price" className="label">Harga Perolehan (Rp)</label>
            <input id="asset-price" type="number" min={0} step={1000} {...register('purchase_price', { valueAsNumber: true })} className="input" placeholder="0" />
            {errors.purchase_price && <p className="field-error">{errors.purchase_price.message}</p>}
          </div>
          <div>
            <label htmlFor="asset-life" className="label">Umur Ekonomis (bulan)</label>
            <input id="asset-life" type="number" min={1} {...register('useful_life_months', { valueAsNumber: true })} className="input" />
            {errors.useful_life_months && <p className="field-error">{errors.useful_life_months.message}</p>}
          </div>
          <div>
            <label htmlFor="asset-dep-method" className="label">Metode Penyusutan</label>
            <select id="asset-dep-method" {...register('depreciation_method')} className="input">
              <option value="straight_line">Garis Lurus (Straight Line)</option>
              <option value="declining_balance">Saldo Menurun (Declining Balance)</option>
            </select>
          </div>
          <div>
            <label htmlFor="asset-warranty" className="label">Garansi Hingga</label>
            <input id="asset-warranty" type="date" {...register('warranty_until')} className="input" />
          </div>
        </div>
      </div>

      {/* --- SECTION: Dokumen Legal --- */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Dokumen Legal</h3>
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleDocUpload} id="doc-file-input" />
        <input {...register('legal_document_url')} type="hidden" />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => docInputRef.current?.click()} className="btn-secondary" disabled={uploadingDoc}>
            {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {uploadingDoc ? 'Mengupload...' : 'Upload Dokumen'}
          </button>
          {watch('legal_document_url') && (
            <a href={watch('legal_document_url') ?? ''} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Lihat Dokumen
            </a>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">Format: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB.</p>
      </div>

      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{errors.root.message}</div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg" id="asset-form-submit">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : submitLabel}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/assets')} className="btn-secondary btn-lg">Batal</button>
      </div>
    </form>
  )
}
