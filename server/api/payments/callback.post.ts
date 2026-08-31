/**
 * ToyyibPay's server-to-server payment callback. Security model:
 * 1. Verify the MD5 hash (secretKey + status + order_id + refno + "ok") -
 *    forged callbacks fail here and are ignored.
 * 2. The order_id carries "weddingId:paymentId", so we locate the exact
 *    payment doc without trusting any caller-supplied ids.
 * 3. Settlement is idempotent inside a Firestore transaction, so duplicate
 *    callbacks never double-upgrade.
 *
 * Always answers 200 - ToyyibPay does not retry on error codes and a 500
 * would only pollute their logs.
 */
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Record<string, string> | null
  const status = String(body?.status ?? '')
  const refNo = String(body?.refno ?? '')
  const billCode = String(body?.billcode ?? '')
  const orderId = String(body?.order_id ?? '')
  const hash = String(body?.hash ?? '')

  if (!verifyToyyibHash({ status, orderId, refNo, hash })) {
    console.warn('[payments/callback] rejected: hash mismatch', { billCode, orderId })
    return { ok: false, reason: 'hash mismatch' }
  }

  const ref = decodePaymentRef(orderId)
  if (!ref) {
    console.warn('[payments/callback] rejected: unparseable order_id', { orderId })
    return { ok: false, reason: 'unknown order' }
  }

  try {
    if (status === '1') {
      const upgraded = await settleSuccessfulPayment(ref.weddingId, ref.paymentId, {
        toyyibpayStatus: 1,
        refNo
      })
      console.info('[payments/callback] payment settled', { orderId, upgraded })
    } else if (status === '3') {
      await markPaymentFailed(ref.weddingId, ref.paymentId, 3, refNo)
      console.info('[payments/callback] payment failed', { orderId })
    }
    // status '2' (pending) - nothing to do; the status route reconciles later.
  } catch (error) {
    console.error('[payments/callback] settlement error', { orderId }, error)
  }

  return { ok: true }
})
