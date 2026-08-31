import { randomBytes } from 'node:crypto'

/**
 * Per-wedding secret token gating the public "guest intake" page
 * (app/pages/w/[slug]/guest-intake.vue) - the couple's own no-login way to
 * add their VIP/General guests (name + optional phone) themselves, without
 * ever seeing the admin Guest List dashboard.
 *
 * Stored in its own collection, never as a field on the wedding doc itself
 * - weddings/{weddingId} is fully PUBLIC once a wedding is published (see
 * firestore.rules), so a token living there would leak to every visitor of
 * the invitation page. Like driveConnections, this collection is
 * `allow read, write: if false` - Admin-SDK-only, and only ever handed to a
 * client by a server route that has already checked wedding ownership
 * (see server/api/admin/guest-intake/[weddingId].get.ts).
 */
export function guestIntakeRef(weddingId: string) {
  return getAdminDb().doc(`guestIntakeTokens/${weddingId}`)
}

function generateToken(): string {
  return randomBytes(24).toString('base64url')
}

/** Returns this wedding's current intake token, minting one on first use. */
export async function getOrCreateIntakeToken(weddingId: string): Promise<string> {
  const ref = guestIntakeRef(weddingId)
  const snap = await ref.get()
  const existing = (snap.data() as { token?: string } | undefined)?.token
  if (existing) return existing

  const token = generateToken()
  await ref.set({ weddingId, token, createdAt: new Date().toISOString() })
  return token
}

/**
 * Overwrites this wedding's token with a fresh one - immediately invalidates
 * every intake link already shared for it (used by the "New link" button).
 */
export async function rotateIntakeToken(weddingId: string): Promise<string> {
  const token = generateToken()
  await guestIntakeRef(weddingId).set({ weddingId, token, createdAt: new Date().toISOString() })
  return token
}

/** True only if `key` matches this wedding's current intake token exactly. */
export async function verifyIntakeToken(weddingId: string, key: string): Promise<boolean> {
  if (!key) return false
  const snap = await guestIntakeRef(weddingId).get()
  const token = (snap.data() as { token?: string } | undefined)?.token
  return !!token && token === key
}
