// Re-export all database types
export * from './database'

// ============================================================
// Computed / Joined Types
// ============================================================

import type {
  Asset,
  AssetCategory,
  BusinessUnit,
  Location,
  Profile,
} from './database'

/** Asset with all related entities joined */
export type AssetWithRelations = Asset & {
  category: AssetCategory | null
  business_unit: BusinessUnit | null
  current_location: Location | null
  current_pic: Profile | null
}

/** Location node for tree UI */
export type LocationNode = Location & {
  business_unit: BusinessUnit | null
  children?: LocationNode[]
}

/** Profile with business unit info */
export type ProfileWithUnit = Profile & {
  business_unit: BusinessUnit | null
}

/** Asset list item (lighter than full relations) */
export type AssetListItem = Pick<
  Asset,
  | 'id'
  | 'asset_code'
  | 'name'
  | 'condition'
  | 'status'
  | 'photo_url'
  | 'purchase_price'
  | 'current_book_value'
  | 'purchase_date'
  | 'created_at'
> & {
  category: Pick<AssetCategory, 'id' | 'name'> | null
  business_unit: Pick<BusinessUnit, 'id' | 'name' | 'type'> | null
  current_location: Pick<Location, 'id' | 'name' | 'level'> | null
}

/** Pagination meta */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Paginated result wrapper */
export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

/** Server Action result */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/** Asset filters for list query */
export interface AssetFilters {
  search?: string
  businessUnitId?: string
  categoryId?: string
  status?: string
  condition?: string
  page?: number
  pageSize?: number
}
