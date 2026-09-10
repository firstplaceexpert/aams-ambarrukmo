import { z } from 'zod'

export const businessUnitSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  type: z.enum(['hotel', 'mall', 'property', 'other'], {
    required_error: 'Pilih tipe unit bisnis',
  }),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
})

export type BusinessUnitFormValues = z.infer<typeof businessUnitSchema>
