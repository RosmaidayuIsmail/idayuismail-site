import { getBuiltinPriceRM, getBuiltinThemeName } from '~~/shared/utils/theme-pricing'

interface CachedCatalog {
  themeOverrides: Record<string, { price?: number; name?: string }>
  fetchedAt: number
}

let cache: CachedCatalog | null = null
const TTL_MS = 60_000

/**
 * Reads the platform catalog's admin theme overrides (with a short TTL cache)
 * and resolves a theme's price/name the same way the client does: an admin
 * override wins over the static built-in baseline in shared/theme-pricing.ts.
 * Kept server-side so checkout always charges what the admin configured,
 * never a client-submitted amount.
 */
async function loadCatalog(): Promise<CachedCatalog> {
  const now = Date.now()
  if (cache && now - cache.fetchedAt < TTL_MS) return cache

  let themeOverrides: CachedCatalog['themeOverrides'] = {}
  try {
    const snap = await getAdminDb().doc('platformCatalog/catalog').get()
    if (snap.exists) {
      const data = snap.data() as { themeOverrides?: CachedCatalog['themeOverrides'] } | undefined
      if (data?.themeOverrides && typeof data.themeOverrides === 'object') themeOverrides = data.themeOverrides
    }
  } catch {
    // Non-fatal: fall back to the static baseline below.
  }

  cache = { themeOverrides, fetchedAt: now }
  return cache
}

export async function resolveThemePriceRM(themeId: string): Promise<number | null> {
  const catalog = await loadCatalog()
  const override = catalog.themeOverrides[themeId]
  if (override && typeof override.price === 'number') return override.price
  return getBuiltinPriceRM(themeId)
}

export async function resolveThemeName(themeId: string): Promise<string | null> {
  const catalog = await loadCatalog()
  const override = catalog.themeOverrides[themeId]
  if (override && typeof override.name === 'string' && override.name.trim()) return override.name
  return getBuiltinThemeName(themeId)
}
