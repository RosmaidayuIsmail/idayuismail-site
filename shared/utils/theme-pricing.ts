/**
 * Single source of truth for built-in theme pricing (RM).
 *
 * Lives in shared/ so BOTH sides can trust it:
 * - app/composables/useThemes.ts reads names/prices for the catalog UI
 * - server/api/payments/* validates the checkout amount server-side
 *
 * Never trust a client-submitted amount - the create-bill route resolves the
 * price from this map by themeId only. Admin-created custom themes are
 * intentionally excluded (no stable pricing), so they cannot be checked out.
 */
export const BUILTIN_THEME_PRICING = {
  'timeless-gold': { name: 'Timeless Gold', priceRM: 0 },
  'ivory-minimalist': { name: 'Ivory Minimalist', priceRM: 0 },
  'nusantara-elegance': { name: 'Nusantara Elegance', priceRM: 0 },
  'blush-botanical': { name: 'Blush Botanical', priceRM: 29 },
  'velvet-romance': { name: 'Velvet Romance', priceRM: 29 },
  'royal-emerald': { name: 'Royal Emerald', priceRM: 49 },
  'lavender-dusk': { name: 'Lavender Dusk', priceRM: 29 },
  'sky-serenade': { name: 'Sky Serenade', priceRM: 0 },
  'matcha-strawberry': { name: 'Matcha Strawberry', priceRM: 0 }
} as const satisfies Record<string, { name: string; priceRM: number }>

export type BuiltinThemeId = keyof typeof BUILTIN_THEME_PRICING

/** Returns the RM price for a built-in theme, or null if not a built-in theme. */
export function getBuiltinPriceRM(themeId: string): number | null {
  const entry = (BUILTIN_THEME_PRICING as Record<string, { name: string; priceRM: number }>)[themeId]
  return entry ? entry.priceRM : null
}

/** Returns the display name for a built-in theme, or null if not built-in. */
export function getBuiltinThemeName(themeId: string): string | null {
  const entry = (BUILTIN_THEME_PRICING as Record<string, { name: string; priceRM: number }>)[themeId]
  return entry ? entry.name : null
}
