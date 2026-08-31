/**
 * Authenticated payment status check, called by the billing page after the
 * payer returns from ToyyibPay (and polled while it verifies).
 *
 * Also the reconciliation path for lost/delayed callbacks: if ToyyibPay's
 * own getBillTransactions says the bill is paid but our record is still
 * 'created', this route runs the same settlement transaction the callback
 * would have.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)

  const query = getQuery(event)
  const orderId = String(query.orderId || query.order_id || '')
  const billCode = String(query.billCode || query.billcode || '')

  const db = getAdminDb()

  // Locate the payment doc - prefer the exact orderId path, fall back to a
  // collection-group lookup by billCode.
  let weddingId = ''
  let paymentId = ''

  const decoded = orderId ? decodePaymentRef(orderId) : null
  if (decoded) {
    weddingId = decoded.weddingId
    paymentId = decoded.paymentId
  } else if (billCode) {
    const snapshot = await db
      .collectionGroup('payments')
      .where('billCode', '==', billCode)
      .limit(1)
      .get()
    if (snapshot.empty) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found.' })
    }
    const doc = snapshot.docs[0]!
    paymentId = doc.id
    weddingId = String(doc.data().weddingId ?? '')
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Missing orderId or billCode.' })
  }

  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'This payment belongs to another account.' })
  }

  const paymentSnap = await db.doc(`weddings/${weddingId}/payments/${paymentId}`).get()
  if (!paymentSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found.' })
  }
  const payment = paymentSnap.data() as Record<string, unknown>
  let status = String(payment.status ?? 'created')

  // Reconcile against ToyyibPay while the bill isn't settled locally yet.
  const effectiveBillCode = billCode || String(payment.billCode ?? '')
  let transactions: Array<Record<string, unknown>> = []
  if (status !== 'paid' && effectiveBillCode) {
    transactions = await getToyyibBillTransactions(effectiveBillCode)
    const paidTransaction = transactions.find((t) => Number(t.billpaymentStatus) === 1)
    if (paidTransaction) {
      await settleSuccessfulPayment(weddingId, paymentId, {
        toyyibpayStatus: 1,
        refNo: String(paidTransaction.billpaymentInvoiceNo ?? '')
      })
      status = 'paid'
    }
  }

  return {
    status,
    themeName: payment.themeName ?? '',
    amountCents: payment.amountCents ?? 0,
    paidAt: payment.paidAt ?? null
  }
})
