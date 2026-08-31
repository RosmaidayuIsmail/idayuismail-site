import { collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { createDefaultContent, type WeddingContent } from './useWeddingTypes'

export interface ApplyDefaultsResult {
  weddingsScanned: number
  weddingsUpdated: number
  fieldsBackfilled: number
}

/**
 * "Apply platform template to existing weddings" - the decision made for
 * this feature was: never touch anything a couple already has, only fill in
 * whatever a specific wedding document is genuinely missing (a field that
 * doesn't exist on it at all, most often because it was created before that
 * field existed in the schema, or before an admin default for it existed).
 *
 * This deliberately does NOT overwrite a field just because its current
 * value happens to match the old default - there is no reliable way to
 * distinguish "never touched" from "deliberately set back to the default"
 * once a value has been written, so the safe rule is: presence, not value,
 * decides what counts as "already theirs".
 *
 * Catalog-referenced things (which theme/font/opening-style a wedding uses,
 * Day Flow presets, Guest List labels, Custom Code) are NOT part of this
 * migration - those are read live from the platform catalog on every page
 * view already, so an admin edit reaches every wedding immediately without
 * needing a backfill step at all.
 */
export function useAdminMigrations() {
  const { db, isConfigured } = useFirebase()
  const { ensureCatalogLoaded, starterDefaults } = useThemes()

  const running = ref(false)
  const lastResult = ref<ApplyDefaultsResult | null>(null)

  // Which WeddingContent keys should be filled from the admin's Starter
  // Defaults catalog (when missing) rather than the plain hardcoded schema
  // default - keeps this migration consistent with what "Starter Defaults"
  // already means for brand-new weddings.
  const starterGovernedKeys: (keyof WeddingContent)[] = [
    'story', 'enablePetals', 'petalStyle', 'ornamentStyle', 'textWeight', 'btnDetails', 'btnRsvp'
  ]

  async function previewMissingCount(): Promise<number> {
    if (!isConfigured || !db) return 0
    await ensureCatalogLoaded()
    const snapshot = await getDocs(collection(db, 'weddings'))
    let missing = 0
    const schemaDefaults = createDefaultContent()
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as { content?: Partial<WeddingContent>; flow?: unknown }
      const content = data.content || {}
      for (const key of Object.keys(schemaDefaults) as (keyof WeddingContent)[]) {
        if (!(key in content)) missing++
      }
      if (!('flow' in data)) missing++
    }
    return missing
  }

  async function applyPlatformDefaultsToExistingWeddings(): Promise<ApplyDefaultsResult> {
    if (!db) throw new Error('Firebase is not configured')
    running.value = true
    try {
      await ensureCatalogLoaded()
      const schemaDefaults = createDefaultContent()
      const starter = starterDefaults.value

      const snapshot = await getDocs(collection(db, 'weddings'))
      let weddingsUpdated = 0
      let fieldsBackfilled = 0

      // Firestore batches cap at 500 writes; chunk defensively even though a
      // typical install here is nowhere near that.
      const BATCH_LIMIT = 400
      let batch = writeBatch(db)
      let opsInBatch = 0
      const pendingBatches: ReturnType<typeof writeBatch>[] = []

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as { content?: Partial<WeddingContent>; flow?: unknown }
        const existingContent = data.content || {}
        const patch: Record<string, unknown> = {}
        let touched = false

        for (const key of Object.keys(schemaDefaults) as (keyof WeddingContent)[]) {
          if (key in existingContent) continue
          const value = starterGovernedKeys.includes(key) ? (starter as Record<string, unknown>)[key] : schemaDefaults[key]
          patch[`content.${key}`] = value
          fieldsBackfilled++
          touched = true
        }

        if (!('flow' in data)) {
          patch.flow = []
          fieldsBackfilled++
          touched = true
        }

        if (touched) {
          patch.updatedAt = serverTimestamp()
          batch.update(docSnap.ref, patch)
          opsInBatch++
          weddingsUpdated++
          if (opsInBatch >= BATCH_LIMIT) {
            pendingBatches.push(batch)
            batch = writeBatch(db)
            opsInBatch = 0
          }
        }
      }
      if (opsInBatch > 0) pendingBatches.push(batch)

      for (const pending of pendingBatches) {
        await pending.commit()
      }

      const result: ApplyDefaultsResult = {
        weddingsScanned: snapshot.docs.length,
        weddingsUpdated,
        fieldsBackfilled
      }
      lastResult.value = result
      return result
    } finally {
      running.value = false
    }
  }

  return {
    running,
    lastResult,
    previewMissingCount,
    applyPlatformDefaultsToExistingWeddings
  }
}
