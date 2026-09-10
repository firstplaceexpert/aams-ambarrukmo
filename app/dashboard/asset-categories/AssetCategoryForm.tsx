'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { assetCategorySchema, type AssetCategoryFormValues } from '@/lib/validations/asset-category'
import type { AssetCategory } from '@/types'

interface Props {
  initialData?: AssetCategory
  onSubmit: (values: AssetCategoryFormValues) => Promise<{ success: boolean; error?: string }>
  submitLabel: string
}

export default function AssetCategoryForm({ initialData, onSubmit, submitLabel }: Props) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<AssetCategoryFormValues>({
    resolver: zodResolver(assetCategorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      default_useful_life_months: initialData?.default_useful_life_months ?? 60,
      default_depreciation_method: initialData?.default_depreciation_method ?? 'straight_line',
    },
  })

  const handleFormSubmit = async (values: AssetCategoryFormValues) => {
    const result = await onSubmit(values)
    if (!result.success) { setError('root', { message: result.error }); return }
    router.push('/dashboard/asset-categories')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="cat-name" className="label">Nama Kategori <span className="text-red-500">*</span></label>
        <input id="cat-name" {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Contoh: Furniture & Fixture" />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="cat-life" className="label">Umur Ekonomis Default (bulan) <span className="text-red-500">*</span></label>
        <input
          id="cat-life"
          type="number"
          min={1}
          max={600}
          {...register('default_useful_life_months', { valueAsNumber: true })}
          className={`input ${errors.default_useful_life_months ? 'input-error' : ''}`}
        />
        {errors.default_useful_life_months && <p className="field-error">{errors.default_useful_life_months.message}</p>}
        <p className="mt-1 text-xs text-slate-400">Nilai ini menjadi default saat aset baru dibuat dengan kategori ini.</p>
      </div>

      <div>
        <label htmlFor="cat-method" className="label">Metode Penyusutan Default <span className="text-red-500">*</span></label>
        <select id="cat-method" {...register('default_depreciation_method')} className="input">
          <option value="straight_line">Garis Lurus (Straight Line)</option>
          <option value="declining_balance">Saldo Menurun (Declining Balance)</option>
        </select>
      </div>

      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{errors.root.message}</div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary" id="cat-form-submit">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : submitLabel}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/asset-categories')} className="btn-secondary">Batal</button>
      </div>
    </form>
  )
}
