import { importX509, jwtVerify } from 'jose'

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

let certsCache: { keys: Record<string, string>; expiresAt: number } | null = null

async function getSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now()
  if (certsCache && certsCache.expiresAt > now) return certsCache.keys

  const res = await fetch(CERTS_URL)
  if (!res.ok) throw new Error('Could not fetch Firebase cert keys')
  // Google caches these for ~6h; be conservative.
  const cacheControl = res.headers.get('cache-control') || ''
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600)
  const keys = (await res.json()) as Record<string, string>
  certsCache = { keys, expiresAt: now + Math.max(60, maxAge) * 1000 }
  return keys
}

/**
 * Verifies a Firebase Auth ID token using `jose` directly (ESM import, which
 * the Vercel runtime handles fine) instead of firebase-admin/auth, whose
 * jwks-rsa dependency `require()`s ESM-only jose and crashes at boot.
 *
 * Returns the decoded payload (with .uid / .sub) or throws.
 */
export async function verifyFirebaseIdToken(token: string): Promise<{ uid: string; [key: string]: unknown }> {
  const projectId = useRuntimeConfig().public.firebaseProjectId as string

  const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0]!, 'base64url').toString('utf8'))
  const kid = decodedHeader.kid as string | undefined
  if (!kid) throw new Error('Token missing kid')

  const certs = await getSecureTokenCerts()
  const certPem = certs[kid]
  if (!certPem) throw new Error('Unknown signing key')

  const publicKey = await importX509(certPem, 'RS256')
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  })

  const uid = (payload.sub as string) || ''
  if (!uid) throw new Error('Token missing sub')
  return { uid, ...payload }
}
