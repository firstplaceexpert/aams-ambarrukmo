import { z } from 'zod'

export const assetCategorySchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  default_useful_life_months: z
    .number({ invalid_type_error: 'Harus berupa angka' })
    .int('Harus bilangan bulat')
    .min(1, 'Minimal 1 bulan')
    .max(600, 'Maksimal 600 bulan (50 tahun)'),
  default_depreciation_method: z.enum(['straight_line', 'declining_balance'], {
    required_error: 'Pilih metode penyusutan',
  }),
})

export type AssetCategoryFormValues = z.infer<typeof assetCategorySchema>
