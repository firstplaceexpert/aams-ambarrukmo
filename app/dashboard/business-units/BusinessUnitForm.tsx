'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { businessUnitSchema, type BusinessUnitFormValues } from '@/lib/validations/business-unit'
import type { BusinessUnit } from '@/types'

interface Props {
  initialData?: BusinessUnit
  onSubmit: (values: BusinessUnitFormValues) => Promise<{ success: boolean; error?: string }>
  submitLabel: string
}

export default function BusinessUnitForm({ initialData, onSubmit, submitLabel }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<BusinessUnitFormValues>({
    resolver: zodResolver(businessUnitSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'hotel',
      address: initialData?.address ?? '',
    },
  })

  const handleFormSubmit = async (values: BusinessUnitFormValues) => {
    const result = await onSubmit(values)
    if (!result.success) {
      setError('root', { message: result.error })
      return
    }
    router.push('/dashboard/business-units')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-lg">
      {/* Name */}
      <div>
        <label htmlFor="bu-name" className="label">Nama Unit Bisnis <span className="text-red-500">*</span></label>
        <input
          id="bu-name"
          {...register('name')}
          className={`input ${errors.name ? 'input-error' : ''}`}
          placeholder="Contoh: Royal Ambarrukmo Yogyakarta"
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="bu-type" className="label">Tipe <span className="text-red-500">*</span></label>
        <select id="bu-type" {...register('type')} className={`input ${errors.type ? 'input-error' : ''}`}>
          <option value="hotel">Hotel</option>
          <option value="mall">Mall / Retail</option>
          <option value="property">Properti / Kondotel</option>
          <option value="other">Lainnya</option>
        </select>
        {errors.type && <p className="field-error">{errors.type.message}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="bu-address" className="label">Alamat</label>
        <textarea
          id="bu-address"
          {...register('address')}
          rows={3}
          className={`input resize-none ${errors.address ? 'input-error' : ''}`}
          placeholder="Jl. Laksda Adisucipto..."
        />
        {errors.address && <p className="field-error">{errors.address.message}</p>}
      </div>

      {/* Root error */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {errors.root.message}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary" id="bu-form-submit">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/business-units')}
          className="btn-secondary"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
