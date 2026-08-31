import { FieldValue } from 'firebase-admin/firestore'

export type PaymentStatus = 'created' | 'paid' | 'failed'

export interface PaymentDoc {
  weddingId: string
  billCode: string
  themeId: string
  themeName: string
  amountCents: number
  payerName: string
  payerEmail: string
  payerPhone: string
  status: PaymentStatus
  toyyibpayStatus: number | null
  refNo: string
  orderId: string
  paidAt: string | null
  createdAt: string
}

/**
 * Marks a payment paid and flips the wedding to premium in ONE Firestore
 * transaction, so a payment can never be recorded without the upgrade (or
 * vice versa). Idempotent: an already-paid payment is a no-op, which makes
 * duplicate callbacks and poll/callback races safe.
 *
 * Returns true if this call performed the upgrade, false if it was already done.
 */
export async function settleSuccessfulPayment(weddingId: string, paymentId: string, extra?: { toyyibpayStatus?: number; refNo?: string }): Promise<boolean> {
  const db = getAdminDb()
  const paymentRef = db.doc(`weddings/${weddingId}/payments/${paymentId}`)
  const weddingRef = db.doc(`weddings/${weddingId}`)

  let upgraded = false

  await db.runTransaction(async (tx) => {
    const paymentSnap = await tx.get(paymentRef)
    if (!paymentSnap.exists) throw new Error('Payment record not found')

    if (paymentSnap.data()?.status === 'paid') return
    upgraded = true

    tx.update(paymentRef, {
      status: 'paid',
      toyyibpayStatus: extra?.toyyibpayStatus ?? 1,
      refNo: extra?.refNo ?? paymentSnap.data()?.refNo ?? '',
      paidAt: new Date().toISOString()
    })
    tx.update(weddingRef, {
      plan: 'premium',
      paymentStatus: 'paid',
      premiumUnlockedAt: FieldValue.serverTimestamp()
    })
  })

  return upgraded
}

/** Marks a payment failed (never touches the wedding plan). Idempotent. */
export async function markPaymentFailed(weddingId: string, paymentId: string, toyyibpayStatus: number, refNo?: string): Promise<void> {
  const db = getAdminDb()
  const paymentRef = db.doc(`weddings/${weddingId}/payments/${paymentId}`)

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef)
    if (!snap.exists) return
    if (snap.data()?.status === 'paid') return
    tx.update(paymentRef, {
      status: 'failed',
      toyyibpayStatus,
      refNo: refNo ?? snap.data()?.refNo ?? ''
    })
  })
}
