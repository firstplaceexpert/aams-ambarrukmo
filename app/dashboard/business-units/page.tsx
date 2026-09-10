import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Building2 } from 'lucide-react'
import { getBusinessUnits } from './actions'
import { requireRole } from '@/lib/auth/permissions'
import DeleteBusinessUnitButton from './DeleteButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Unit Bisnis' }

const typeLabels: Record<string, { label: string; cls: string }> = {
  hotel:    { label: 'Hotel', cls: 'badge-blue' },
  mall:     { label: 'Mall / Retail', cls: 'badge-purple' },
  property: { label: 'Properti', cls: 'badge-green' },
  other:    { label: 'Lainnya', cls: 'badge-slate' },
}

function getBusinessUnitLogo(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes('royal')) return '/logos/royal-ambarrukmo.webp'
  if (n.includes('gramm')) return '/logos/gramm-hotel-black.png'
  if (n.includes('porta')) return '/logos/porta.png'
  if (n.includes('malyabhara')) return '/logos/malyabhara.svg'
  if (n.includes('plaza ambarrukmo')) return '/logos/plaza-ambarrukmo.png'
  if (n.includes('plaza malioboro')) return '/logos/plaza-malioboro-black.png'
  if (n.includes('vrtx')) return '/logos/vrtx.png'
  if (n.includes('ambarrukmo')) return '/logos/ambarrukmo-group.png'
  return null
}

export default async function BusinessUnitsPage() {
  const profile = await requireRole('super_admin', 'corporate_admin')
  const units = await getBusinessUnits()

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Unit Bisnis</h1>
          <p className="page-subtitle">{units.length} unit bisnis aktif</p>
        </div>
        <Link href="/dashboard/business-units/new" className="btn-primary" id="btn-add-business-unit">
          <Plus className="w-4 h-4" /> Tambah Unit Bisnis
        </Link>
      </div>

      {units.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-medium">Belum ada unit bisnis</h3>
          <p className="text-slate-400 text-sm mt-1">Mulai dengan menambahkan unit bisnis pertama.</p>
          <Link href="/dashboard/business-units/new" className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Tambah Sekarang
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Alamat</th>
                <th>Dibuat</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => {
                const t = typeLabels[unit.type] ?? typeLabels.other
                const logo = getBusinessUnitLogo(unit.name)
                return (
                  <tr key={unit.id} className="hover:bg-brand-50/20 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-xl bg-stone-50/90 border border-stone-200/80 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {logo ? (
                            <Image
                              src={logo}
                              alt={unit.name}
                              width={48}
                              height={32}
                              className="max-h-7 w-auto max-w-full object-contain drop-shadow-xs"
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-brand-600" />
                          )}
                        </div>
                        <span className="font-semibold text-stone-900">{unit.name}</span>
                      </div>
                    </td>
                    <td><span className={t.cls}>{t.label}</span></td>
                    <td className="text-slate-500 max-w-xs truncate">{unit.address ?? '—'}</td>
                    <td className="text-slate-400 text-xs">
                      {new Date(unit.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/business-units/${unit.id}/edit`}
                          className="btn-ghost btn-sm"
                          id={`btn-edit-bu-${unit.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        {profile.role === 'super_admin' && (
                          <DeleteBusinessUnitButton id={unit.id} name={unit.name} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
