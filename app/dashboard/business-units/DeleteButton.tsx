'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteBusinessUnit } from './actions'

export default function DeleteBusinessUnitButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Nonaktifkan unit bisnis "${name}"? Aset yang terkait tidak akan terhapus.`)) return
    setLoading(true)
    const result = await deleteBusinessUnit(id)
    if (!result.success) {
      alert('Gagal: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
      id={`btn-delete-bu-${id}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Hapus
    </button>
  )
}
