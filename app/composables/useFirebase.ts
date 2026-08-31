import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'

let cachedApp: FirebaseApp | null = null
let cachedDb: Firestore | null = null
let cachedAuth: Auth | null = null
let cachedStorage: FirebaseStorage | null = null
let appCheckInitialized = false

/**
 * Lazily initializes Firebase on the client only (the Auth/Firestore/Storage
 * browser SDKs rely on window/IndexedDB, so they must never run during SSR).
 * If the required public env vars haven't been set yet, `isConfigured` is
 * false and callers should show a friendly notice instead of crashing.
 */
export function useFirebase() {
  const config = useRuntimeConfig().public

  const isConfigured = Boolean(config.firebaseApiKey && config.firebaseProjectId)

  if (import.meta.client && isConfigured && !cachedApp) {
    cachedApp = getApps().length
      ? getApps()[0]!
      : initializeApp({
          apiKey: config.firebaseApiKey,
          authDomain: config.firebaseAuthDomain,
          projectId: config.firebaseProjectId,
          storageBucket: config.firebaseStorageBucket,
          messagingSenderId: config.firebaseMessagingSenderId,
          appId: config.firebaseAppId
        })
    cachedDb = getFirestore(cachedApp)
    cachedAuth = getAuth(cachedApp)
    cachedStorage = getStorage(cachedApp)
    if (config.recaptchaEnterpriseSiteKey && !appCheckInitialized) {
      initializeAppCheck(cachedApp, { provider: new ReCaptchaEnterpriseProvider(config.recaptchaEnterpriseSiteKey), isTokenAutoRefreshEnabled: true })
      appCheckInitialized = true
    }
  }

  return {
    app: cachedApp,
    db: cachedDb,
    auth: cachedAuth,
    storage: cachedStorage,
    isConfigured
  }
}
