'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole, getCurrentUser } from '@/lib/auth/permissions'
import { assetSchema, type AssetFormValues } from '@/lib/validations/asset'
import type {
  ActionResult,
  Asset,
  AssetFilters,
  AssetListItem,
  AssetWithRelations,
  PaginatedResult,
} from '@/types'

export async function getAssets(
  filters: AssetFilters = {}
): Promise<PaginatedResult<AssetListItem>> {
  const supabase = await createClient()
  const { page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('assets')
    .select(
      `
      id, asset_code, name, condition, status, photo_url,
      purchase_price, current_book_value, purchase_date, created_at,
      category:asset_categories(id, name),
      business_unit:business_units(id, name, type),
      current_location:locations(id, name, level)
    `,
      { count: 'exact' }
    )
    .neq('status', 'disposed')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,asset_code.ilike.%${filters.search}%`
    )
  }
  if (filters.businessUnitId) {
    query = query.eq('business_unit_id', filters.businessUnitId)
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  const total = count ?? 0
  return {
    data: (data ?? []) as unknown as AssetListItem[],
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getAssetById(id: string): Promise<AssetWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assets')
    .select(
      `
      *,
      category:asset_categories(*),
      business_unit:business_units(*),
      current_location:locations(*),
      current_pic:profiles(id, full_name, role, department, phone)
    `
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as AssetWithRelations
}

export async function createAsset(
  values: AssetFormValues
): Promise<ActionResult<Asset>> {
  const { profile } = await getCurrentUser()

  if (!['super_admin', 'corporate_admin', 'unit_admin', 'field_officer'].includes(profile.role)) {
    return { success: false, error: 'Anda tidak memiliki izin untuk menambah aset' }
  }

  const parsed = assetSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('assets') as any)
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      category_id: parsed.data.category_id,
      business_unit_id: parsed.data.business_unit_id,
      current_location_id: parsed.data.current_location_id ?? null,
      current_pic_id: parsed.data.current_pic_id ?? null,
      photo_url: parsed.data.photo_url || null,
      purchase_date: parsed.data.purchase_date ?? null,
      purchase_price: parsed.data.purchase_price ?? null,
      useful_life_months: parsed.data.useful_life_months ?? null,
      depreciation_method: parsed.data.depreciation_method ?? null,
      current_book_value: parsed.data.purchase_price ?? null,
      condition: parsed.data.condition,
      warranty_until: parsed.data.warranty_until ?? null,
      legal_document_url: parsed.data.legal_document_url || null,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Record initial location history
  if (parsed.data.current_location_id && data) {
    await (supabase.from('asset_location_history') as any).insert({
      asset_id: data.id,
      location_id: parsed.data.current_location_id,
      moved_by: profile.id,
      note: 'Lokasi awal saat registrasi',
    })
  }

  revalidatePath('/dashboard/assets')
  return { success: true, data }
}

export async function updateAsset(
  id: string,
  values: AssetFormValues
): Promise<ActionResult<Asset>> {
  const { profile } = await getCurrentUser()

  if (!['super_admin', 'corporate_admin', 'unit_admin', 'field_officer'].includes(profile.role)) {
    return { success: false, error: 'Anda tidak memiliki izin untuk mengubah aset' }
  }

  const parsed = assetSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Check if location changed, if so record history
  const { data: existing } = await (supabase
    .from('assets') as any)
    .select('current_location_id')
    .eq('id', id)
    .single()

  const { data, error } = await (supabase
    .from('assets') as any)
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      category_id: parsed.data.category_id,
      business_unit_id: parsed.data.business_unit_id,
      current_location_id: parsed.data.current_location_id ?? null,
      current_pic_id: parsed.data.current_pic_id ?? null,
      photo_url: parsed.data.photo_url || null,
      purchase_date: parsed.data.purchase_date ?? null,
      purchase_price: parsed.data.purchase_price ?? null,
      useful_life_months: parsed.data.useful_life_months ?? null,
      depreciation_method: parsed.data.depreciation_method ?? null,
      condition: parsed.data.condition,
      warranty_until: parsed.data.warranty_until ?? null,
      legal_document_url: parsed.data.legal_document_url || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Record location history if location changed
  if (
    parsed.data.current_location_id &&
    existing?.current_location_id !== parsed.data.current_location_id
  ) {
    await (supabase.from('asset_location_history') as any).insert({
      asset_id: id,
      location_id: parsed.data.current_location_id,
      moved_by: profile.id,
      note: 'Pembaruan lokasi via edit aset',
    })
  }

  revalidatePath('/dashboard/assets')
  revalidatePath(`/dashboard/assets/${id}`)
  return { success: true, data }
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  await requireRole('super_admin', 'corporate_admin', 'unit_admin')

  const supabase = await createClient()
  const { error } = await (supabase
    .from('assets') as any)
    .update({ status: 'disposed' })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/assets')
  return { success: true, data: undefined }
}

export async function uploadAssetPhoto(
  formData: FormData
): Promise<ActionResult<string>> {
  const { profile } = await getCurrentUser()

  const file = formData.get('file') as File | null
  if (!file) return { success: false, error: 'File tidak ditemukan' }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'File harus berupa gambar' }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Ukuran file maksimal 5MB' }
  }

  const supabase = await createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${profile.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('asset-photos')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return { success: false, error: error.message }

  const { data: urlData } = supabase.storage
    .from('asset-photos')
    .getPublicUrl(data.path)

  return { success: true, data: urlData.publicUrl }
}

export async function uploadAssetDocument(
  formData: FormData
): Promise<ActionResult<string>> {
  const { profile } = await getCurrentUser()

  const file = formData.get('file') as File | null
  if (!file) return { success: false, error: 'File tidak ditemukan' }

  // Validate file type (PDF, Word, images)
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ]
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Format file tidak didukung (PDF, DOC, DOCX, JPG, PNG)' }
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Ukuran file maksimal 10MB' }
  }

  const supabase = await createClient()
  const ext = file.name.split('.').pop() ?? 'pdf'
  const filename = `${profile.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('asset-documents')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return { success: false, error: error.message }

  const { data: urlData } = supabase.storage
    .from('asset-documents')
    .getPublicUrl(data.path)

  return { success: true, data: urlData.publicUrl }
}

export async function getAssetStats() {
  const supabase = await createClient()

  const { count: totalData } = await (supabase
    .from('assets') as any)
    .select('*', { count: 'exact', head: true })
    .neq('status', 'disposed')

  const { count: activeData } = await (supabase
    .from('assets') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: conditionData } = await (supabase
    .from('assets') as any)
    .select('condition')
    .neq('status', 'disposed')

  const conditions = {
    good: 0,
    fair: 0,
    damaged: 0,
    under_repair: 0,
  }
  ;(conditionData as unknown as { condition: string }[])?.forEach((a) => {
    if (a.condition in conditions) {
      conditions[a.condition as keyof typeof conditions]++
    }
  })

  const { data: byUnit } = await (supabase
    .from('assets') as any)
    .select('business_unit_id, business_units(name)')
    .neq('status', 'disposed')

  const unitCounts: Record<string, { name: string; count: number }> = {}
  ;(byUnit as unknown as { business_unit_id: string; business_units: { name: string } | null }[])?.forEach((a) => {
    const id = a.business_unit_id
    if (!unitCounts[id]) {
      unitCounts[id] = { name: a.business_units?.name ?? 'Unknown', count: 0 }
    }
    unitCounts[id].count++
  })

  return {
    total: totalData ?? 0,
    active: activeData ?? 0,
    conditions,
    byUnit: Object.values(unitCounts),
  }
}

export async function getAssetLocationHistory(assetId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('asset_location_history') as any)
    .select(
      `
      id, asset_id, moved_at, note,
      location:locations(id, name, level),
      mover:profiles(id, full_name, role)
    `
    )
    .eq('asset_id', assetId)
    .order('moved_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function getAssetMaintenanceHistory(assetId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('asset_maintenance') as any)
    .select(
      `
      id, asset_id, maintenance_type, scheduled_date, completed_date, cost, notes, status, created_at,
      technician:profiles(id, full_name, role)
    `
    )
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function getAssetDepreciationLogs(assetId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('asset_depreciation_log') as any)
    .select('*')
    .eq('asset_id', assetId)
    .order('period_month', { ascending: false })

  if (error) return []
  return data || []
}

