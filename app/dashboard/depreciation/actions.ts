'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateAssetMonthlyDepreciation } from '@/lib/utils/depreciation'
import type { ActionResult, AssetDepreciationLog } from '@/types'

export interface DepreciationLogItem extends AssetDepreciationLog {
  asset: {
    id: string
    asset_code: string
    name: string
    purchase_price: number | null
    depreciation_method: string | null
    business_unit: { id: string; name: string } | null
    category: { id: string; name: string } | null
  } | null
}

export async function getDepreciationMetrics(businessUnitId?: string) {
  const supabase = await createClient()

  let query = (supabase.from('assets') as any)
    .select('purchase_price, current_book_value, status')
    .neq('status', 'disposed')

  if (businessUnitId) {
    query = query.eq('business_unit_id', businessUnitId)
  }

  const { data: assets } = await query

  const items = (assets || []) as {
    purchase_price: number | null
    current_book_value: number | null
  }[]

  const totalAcquisition = items.reduce(
    (sum, a) => sum + (Number(a.purchase_price) || 0),
    0
  )
  const totalBookValue = items.reduce(
    (sum, a) => sum + (Number(a.current_book_value) || 0),
    0
  )
  const totalAccumulatedDepreciation = Math.max(
    0,
    totalAcquisition - totalBookValue
  )

  return {
    totalAcquisition,
    totalBookValue,
    totalAccumulatedDepreciation,
    totalAssets: items.length,
  }
}

export async function getDepreciationLogs(filters: {
  periodMonth?: string
  businessUnitId?: string
} = {}): Promise<DepreciationLogItem[]> {
  const supabase = await createClient()

  let query = (supabase.from('asset_depreciation_log') as any)
    .select(
      `
      *,
      asset:assets(
        id, asset_code, name, purchase_price, depreciation_method,
        business_unit:business_units(id, name),
        category:asset_categories(id, name)
      )
    `
    )
    .order('period_month', { ascending: false })
    .order('calculated_at', { ascending: false })

  if (filters.periodMonth) {
    query = query.eq('period_month', filters.periodMonth)
  }

  const { data, error } = await query
  if (error) return []

  let list = (data || []) as DepreciationLogItem[]

  if (filters.businessUnitId) {
    list = list.filter((i) => i.asset?.business_unit?.id === filters.businessUnitId)
  }

  return list
}

/**
 * Execute batch calculation for all active assets in the specified month
 */
export async function runBatchMonthlyDepreciation(
  periodMonth: string, // e.g. "2025-08-01"
  businessUnitId?: string
): Promise<
  ActionResult<{
    processedCount: number
    totalDepreciated: number
  }>
> {
  const supabase = await createClient()

  // Format periodMonth to YYYY-MM-01
  const cleanPeriod = periodMonth.length === 7 ? `${periodMonth}-01` : periodMonth

  // 1. Fetch eligible active assets
  let query = (supabase.from('assets') as any)
    .select(
      'id, asset_code, purchase_price, useful_life_months, depreciation_method, current_book_value'
    )
    .eq('status', 'active')

  if (businessUnitId) {
    query = query.eq('business_unit_id', businessUnitId)
  }

  const { data: assets, error } = await query

  if (error || !assets || assets.length === 0) {
    return {
      success: false,
      error: 'Tidak ditemukan aset aktif untuk diproses penyusutannya.',
    }
  }

  let processedCount = 0
  let totalDepreciated = 0

  for (const asset of assets) {
    const calc = calculateAssetMonthlyDepreciation(
      asset.purchase_price,
      asset.useful_life_months,
      asset.current_book_value,
      asset.depreciation_method || 'straight_line'
    )

    if (calc.monthlyDepreciation > 0) {
      // Check if already calculated for this month
      const { data: existing } = await (supabase
        .from('asset_depreciation_log') as any)
        .select('id')
        .eq('asset_id', asset.id)
        .eq('period_month', cleanPeriod)
        .single()

      if (existing) {
        // Update existing log
        await (supabase.from('asset_depreciation_log') as any)
          .update({
            book_value: calc.newBookValue,
            depreciation_amount: calc.monthlyDepreciation,
            calculated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        // Insert new log
        await (supabase.from('asset_depreciation_log') as any).insert({
          asset_id: asset.id,
          period_month: cleanPeriod,
          book_value: calc.newBookValue,
          depreciation_amount: calc.monthlyDepreciation,
          calculated_at: new Date().toISOString(),
        })
      }

      // Update asset's current_book_value
      await (supabase
        .from('assets') as any)
        .update({ current_book_value: calc.newBookValue })
        .eq('id', asset.id)

      processedCount++
      totalDepreciated += calc.monthlyDepreciation
    }
  }

  revalidatePath('/dashboard/depreciation')
  revalidatePath('/dashboard/assets')

  return {
    success: true,
    data: {
      processedCount,
      totalDepreciated,
    },
  }
}
