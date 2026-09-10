'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export interface PublicAssetInfo {
  id: string
  asset_code: string
  name: string
  description: string | null
  photo_url: string | null
  condition: string
  status: string
  qr_code_uuid: string
  business_unit: {
    id: string
    name: string
    type: string
  } | null
  category: {
    id: string
    name: string
  } | null
  current_location: {
    id: string
    name: string
    level: string
  } | null
}

export async function getAssetByQrCode(qrCodeUuid: string): Promise<PublicAssetInfo | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('assets') as any)
    .select(
      `
      id, asset_code, name, description, photo_url, condition, status, qr_code_uuid,
      business_unit:business_units(id, name, type),
      category:asset_categories(id, name),
      current_location:locations(id, name, level)
    `
    )
    .eq('qr_code_uuid', qrCodeUuid)
    .single()

  if (error || !data) return null
  return data as unknown as PublicAssetInfo
}

export interface PublicIssueReportInput {
  assetId: string
  reporterName?: string
  reporterContact?: string
  description: string
  issueType: 'corrective' | 'preventive'
  urgency?: 'urgent' | 'medium' | 'low'
  category?: string
  photoDataUrl?: string
}

export interface PublicIssueReportResult {
  ticketNumber: string
  assetName: string
  assetCode: string
}

export async function submitPublicIssueReport(
  input: PublicIssueReportInput
): Promise<ActionResult<PublicIssueReportResult>> {
  if (!input.description?.trim()) {
    return { success: false, error: 'Deskripsi kendala wajib diisi' }
  }

  const reporterDisplayName = input.reporterName?.trim() || 'Tamu / Pengunjung Lapangan'

  const supabase = await createClient()

  // Generate unique ticket number: e.g. TKT-202609-4821
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const ticketNumber = `TKT-${dateStr}-${randomSuffix}`

  const urgencyLabels: Record<string, string> = {
    urgent: 'DARURAT / KRITIS',
    medium: 'SEDANG / BUTUH PENANGANAN',
    low: 'RINGAN / RUTIN',
  }
  const urgencyLabel = urgencyLabels[input.urgency || 'medium'] || 'SEDANG'

  // Format rich notes
  const notesContent = [
    `[Tiket Aduan QR: #${ticketNumber}]`,
    `Tingkat Urgensi: ${urgencyLabel}`,
    `Kategori Kendala: ${input.category || 'Umum'}`,
    `Pelapor: ${reporterDisplayName}`,
    input.reporterContact?.trim() ? `Kontak: ${input.reporterContact.trim()}` : '',
    `Waktu Registrasi: ${new Date().toLocaleString('id-ID')}`,
    `----------------------------------------`,
    `Deskripsi Kendala:`,
    input.description.trim(),
    input.photoDataUrl ? `[Bukti Foto Kerusakan Terlampir]` : '',
  ]
    .filter(Boolean)
    .join('\n')

  // 1. Create maintenance work order record
  const { error: maintError } = await (supabase
    .from('asset_maintenance') as any)
    .insert({
      asset_id: input.assetId,
      maintenance_type: input.issueType || 'corrective',
      status: 'scheduled',
      scheduled_date: new Date().toISOString().split('T')[0],
      notes: notesContent,
    })

  if (maintError) {
    return { success: false, error: maintError.message }
  }

  // 2. Fetch asset info to notify admins & update status if urgent
  const { data: asset } = await (supabase
    .from('assets') as any)
    .select('asset_code, name, business_unit_id, condition')
    .eq('id', input.assetId)
    .single()

  if (asset) {
    // If report is marked urgent, update asset condition to under_repair/damaged
    if (input.urgency === 'urgent' && asset.condition === 'good') {
      await (supabase.from('assets') as any)
        .update({ condition: 'under_repair' })
        .eq('id', input.assetId)
    }

    // 3. Notify admins of the unit
    const { data: admins } = await (supabase
      .from('profiles') as any)
      .select('id')
      .in('role', ['super_admin', 'corporate_admin', 'unit_admin'])
      .eq('is_active', true)

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin: { id: string }) => ({
        user_id: admin.id,
        type: 'maintenance_report',
        title: `Aduan Lapangan #${ticketNumber}: ${asset.asset_code} (${urgencyLabel})`,
        message: `${reporterDisplayName} melaporkan kendala [${urgencyLabel}] pada ${asset.name}: "${input.description.substring(0, 80)}..."`,
        related_asset_id: input.assetId,
      }))

      await (supabase.from('notifications') as any).insert(notifications)
    }
  }

  return {
    success: true,
    data: {
      ticketNumber,
      assetName: asset?.name || 'Aset',
      assetCode: asset?.asset_code || '',
    },
  }
}
