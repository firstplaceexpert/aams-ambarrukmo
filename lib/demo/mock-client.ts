import {
  DEMO_USERS,
  INITIAL_ASSETS,
  INITIAL_BUSINESS_UNITS,
  INITIAL_CATEGORIES,
  INITIAL_LOCATIONS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
} from './mock-data'

// In-memory persistent state during process lifetime
let assetsState = [...INITIAL_ASSETS]
let businessUnitsState = [...INITIAL_BUSINESS_UNITS]
let locationsState = [...INITIAL_LOCATIONS]
let categoriesState = [...INITIAL_CATEGORIES]
const maintenanceState = [...INITIAL_MAINTENANCE]
let notificationsState = [...INITIAL_NOTIFICATIONS]

export function getMockTableData(table: string): any[] {
  switch (table) {
    case 'assets':
      return assetsState
    case 'business_units':
      return businessUnitsState
    case 'locations':
      return locationsState
    case 'asset_categories':
      return categoriesState
    case 'asset_maintenance':
      return maintenanceState
    case 'notifications':
      return notificationsState
    case 'profiles':
      return Object.values(DEMO_USERS).map((u) => u.profile)
    case 'approval_workflows':
      return [
        { action_type: 'disposal_sale', min_value_threshold: 50000000, required_role: 'corporate_admin' },
        { action_type: 'disposal_sale', min_value_threshold: 500000000, required_role: 'super_admin' },
        { action_type: 'high_value_purchase', min_value_threshold: 100000000, required_role: 'corporate_admin' },
      ]
    case 'disposal_records':
    case 'disposal_requests':
      return [
        {
          id: 'dsp-00000000-0000-0000-0000-000000000001',
          asset_id: assetsState[7]?.id || 'ast-00000000-0000-0000-0000-000000000008',
          disposal_type: 'sale',
          proposed_price: 15000000,
          reason: 'Pergantian perabot foodcourt dengan model ergonomis terbaru',
          approval_status: 'pending',
          created_at: '2024-11-25T11:00:00Z',
          asset: assetsState[7] || { name: 'Meja Kursi Foodcourt Set A', asset_code: 'AMB-00008' },
        },
      ]
    case 'stock_opname_schedules':
      return [
        {
          id: 'opn-00000000-0000-0000-0000-000000000001',
          title: 'Stock Opname Tahunan 2024 - Royal Ambarrukmo',
          business_unit_id: 'bu-hotel-00000000-0000-0000-0000-000000000001',
          status: 'in_progress',
          scheduled_date: '2024-12-15',
          created_at: '2024-11-01T08:00:00Z',
        },
      ]
    case 'asset_location_history':
      return []
    case 'asset_depreciation_log':
      return []
    default:
      return []
  }
}

class MockQueryBuilder {
  private table: string
  private filters: Array<(item: any) => boolean> = []
  private sortFn: ((a: any, b: any) => number) | null = null
  private rangeFrom = 0
  private rangeTo = Infinity
  private isSingle = false
  private isMaybeSingle = false
  private isHead = false
  private selectCols: string = '*'
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null

  constructor(table: string) {
    this.table = table
  }

  select(columns = '*', options?: { count?: string; head?: boolean }) {
    this.selectCols = columns
    if (options?.head) {
      this.isHead = true
    }
    return this
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value)
    return this
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value)
    return this
  }

  lt(column: string, value: any) {
    this.filters.push((item) => {
      const val = item[column]
      if (val == null) return false
      return val < value
    })
    return this
  }

  lte(column: string, value: any) {
    this.filters.push((item) => {
      const val = item[column]
      if (val == null) return false
      return val <= value
    })
    return this
  }

  gt(column: string, value: any) {
    this.filters.push((item) => {
      const val = item[column]
      if (val == null) return false
      return val > value
    })
    return this
  }

  gte(column: string, value: any) {
    this.filters.push((item) => {
      const val = item[column]
      if (val == null) return false
      return val >= value
    })
    return this
  }

  ilike(column: string, pattern: string) {
    const clean = pattern.replace(/%/g, '').toLowerCase()
    this.filters.push((item) => {
      const val = String(item[column] || '').toLowerCase()
      return val.includes(clean)
    })
    return this
  }

  or(clause: string) {
    const parts = clause.split(',')
    this.filters.push((item) => {
      return parts.some((part) => {
        const [col, op, pattern] = part.split('.')
        if (op === 'ilike' && pattern) {
          const clean = pattern.replace(/%/g, '').toLowerCase()
          return String(item[col] || '').toLowerCase().includes(clean)
        }
        if (op === 'eq') {
          return item[col] === pattern
        }
        return false
      })
    })
    return this
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => values.includes(item[column]))
    return this
  }

  is(column: string, value: any) {
    this.filters.push((item) => item[column] === value)
    return this
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'eq') {
      this.filters.push((item) => item[column] !== value)
    }
    return this
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.sortFn = (a, b) => {
      const valA = a[column]
      const valB = b[column]
      if (valA === valB) return 0
      if (valA == null) return ascending ? -1 : 1
      if (valB == null) return ascending ? 1 : -1
      return ascending ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
    }
    return this
  }

  range(from: number, to: number) {
    this.rangeFrom = from
    this.rangeTo = to
    return this
  }

  limit(count: number) {
    this.rangeFrom = 0
    this.rangeTo = count - 1
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  insert(data: any) {
    this.operation = 'insert'
    this.payload = data
    return this
  }

  update(data: any) {
    this.operation = 'update'
    this.payload = data
    return this
  }

  delete() {
    this.operation = 'delete'
    return this
  }

  private execute() {
    const rawData = getMockTableData(this.table)

    // Handle INSERT
    if (this.operation === 'insert') {
      const itemsToInsert = Array.isArray(this.payload) ? this.payload : [this.payload]
      const created = itemsToInsert.map((item, idx) => ({
        id: item.id || `gen-${Date.now()}-${idx}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: item.is_active ?? true,
        ...item,
      }))

      if (this.table === 'assets') {
        assetsState = [...created, ...assetsState]
      } else if (this.table === 'business_units') {
        businessUnitsState = [...businessUnitsState, ...created]
      } else if (this.table === 'locations') {
        locationsState = [...locationsState, ...created]
      } else if (this.table === 'asset_categories') {
        categoriesState = [...categoriesState, ...created]
      }

      const res = this.isSingle ? created[0] : created
      return { data: res, error: null, count: created.length }
    }

    // Handle UPDATE
    if (this.operation === 'update') {
      const updated: any[] = []
      const updater = (item: any) => {
        if (this.filters.every((fn) => fn(item))) {
          const next = { ...item, ...this.payload, updated_at: new Date().toISOString() }
          updated.push(next)
          return next
        }
        return item
      }

      if (this.table === 'assets') assetsState = assetsState.map(updater)
      if (this.table === 'business_units') businessUnitsState = businessUnitsState.map(updater)
      if (this.table === 'locations') locationsState = locationsState.map(updater)
      if (this.table === 'asset_categories') categoriesState = categoriesState.map(updater)
      if (this.table === 'notifications') notificationsState = notificationsState.map(updater)

      const res = this.isSingle ? updated[0] : updated
      return { data: res, error: null, count: updated.length }
    }

    // Handle DELETE
    if (this.operation === 'delete') {
      const remaining = rawData.filter((item) => !this.filters.every((fn) => fn(item)))
      if (this.table === 'assets') assetsState = remaining
      if (this.table === 'business_units') businessUnitsState = remaining
      if (this.table === 'locations') locationsState = remaining
      if (this.table === 'asset_categories') categoriesState = remaining

      return { data: null, error: null, count: rawData.length - remaining.length }
    }

    // Handle SELECT
    let result = rawData.filter((item) => this.filters.every((fn) => fn(item)))
    const totalCount = result.length

    if (this.sortFn) {
      result.sort(this.sortFn)
    }

    // Join relations
    if (this.table === 'assets') {
      result = result.map((asset) => {
        const cat = categoriesState.find((c) => c.id === asset.category_id)
        const bu = businessUnitsState.find((b) => b.id === asset.business_unit_id)
        const loc = locationsState.find((l) => l.id === asset.current_location_id)
        const pic = Object.values(DEMO_USERS).find((u) => u.id === asset.current_pic_id)?.profile
        return {
          ...asset,
          category: cat ? { id: cat.id, name: cat.name } : null,
          asset_categories: cat ? { id: cat.id, name: cat.name } : null,
          business_unit: bu ? { id: bu.id, name: bu.name, type: bu.type } : null,
          business_units: bu ? { id: bu.id, name: bu.name, type: bu.type } : null,
          current_location: loc ? { id: loc.id, name: loc.name, level: loc.level } : null,
          locations: loc ? { id: loc.id, name: loc.name, level: loc.level } : null,
          current_pic: pic ? { id: pic.id, full_name: pic.full_name, role: pic.role } : null,
          profiles: pic ? { id: pic.id, full_name: pic.full_name, role: pic.role } : null,
        }
      })
    }

    if (this.table === 'asset_maintenance') {
      result = result.map((m) => {
        const ast = assetsState.find((a) => a.id === m.asset_id)
        return {
          ...m,
          asset: ast ? { id: ast.id, name: ast.name, asset_code: ast.asset_code } : null,
          assets: ast ? { id: ast.id, name: ast.name, asset_code: ast.asset_code } : null,
        }
      })
    }

    if (this.isHead) {
      return { data: null, error: null, count: totalCount }
    }

    const sliced = result.slice(this.rangeFrom, this.rangeTo + 1)

    if (this.isSingle) {
      if (sliced.length === 0) {
        return { data: null, error: { message: 'Row not found' }, count: 0 }
      }
      return { data: sliced[0], error: null, count: 1 }
    }

    if (this.isMaybeSingle) {
      return { data: sliced[0] || null, error: null, count: sliced.length }
    }

    return { data: sliced, error: null, count: totalCount }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const res = this.execute()
    return Promise.resolve(res).then(onfulfilled, onrejected)
  }
}

export function createMockSupabaseClient(activeDemoEmail = 'admin@ambarrukmo.co.id') {
  const currentDemoUser = DEMO_USERS[activeDemoEmail] || DEMO_USERS['admin@ambarrukmo.co.id']

  return {
    from: (table: string) => new MockQueryBuilder(table),
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: currentDemoUser.id,
            email: currentDemoUser.email,
            user_metadata: {
              full_name: currentDemoUser.profile.full_name,
              role: currentDemoUser.profile.role,
            },
          },
        },
        error: null,
      }),
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: currentDemoUser.id,
              email: currentDemoUser.email,
            },
          },
        },
        error: null,
      }),
      signInWithPassword: async ({ email }: { email: string }) => {
        const found = DEMO_USERS[email] || DEMO_USERS['admin@ambarrukmo.co.id']
        return {
          data: {
            user: {
              id: found.id,
              email: found.email,
            },
          },
          error: null,
        }
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: () => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/${path}` } }),
        remove: async () => ({ data: {}, error: null }),
      }),
    },
    rpc: async () => ({ data: null, error: null }),
  }
}
