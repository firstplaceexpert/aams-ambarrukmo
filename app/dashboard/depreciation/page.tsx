import { getBusinessUnits } from '@/app/dashboard/business-units/actions'
import {
  getDepreciationLogs,
  getDepreciationMetrics,
} from './actions'
import DepreciationClient from './DepreciationClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Penyusutan Aset - AAMS Ambarrukmo',
}

export default async function DepreciationPage() {
  const [logs, metrics, businessUnits] = await Promise.all([
    getDepreciationLogs(),
    getDepreciationMetrics(),
    getBusinessUnits(),
  ])

  return (
    <DepreciationClient
      initialLogs={logs}
      metrics={metrics}
      businessUnits={businessUnits}
    />
  )
}
