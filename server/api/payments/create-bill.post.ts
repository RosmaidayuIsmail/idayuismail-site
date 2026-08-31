import { z } from 'zod'

const bodySchema = z.object({
  weddingId: z.string().min(1),
  themeId: z.string().min(1),
  payerName: z.string().trim().min(2).max(100),
  payerEmail: z.string().trim().email().max(150),
  payerPhone: z.string().trim().min(8).max(20)
})

/**
 * Creates the Firestore payment record and a ToyyibPay bill, then hands the
 * client the hosted pay URL to redirect to. The amount is resolved
 * server-side from shared/theme-pricing.ts by themeId alone - anything the
 * client claims about price is ignored.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)

  const rawBody = await readBody(event)
  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please check the payer details and try again.' })
  }
  const input = parsed.data

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${input.weddingId}`).get()
  if (!weddingSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Wedding not found.' })
  }
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'You can only pay for your own wedding.' })
  }
  if (wedding?.plan === 'premium') {
    throw createError({ statusCode: 409, statusMessage: 'This wedding is already on Premium.' })
  }

  const priceRM = await resolveThemePriceRM(input.themeId)
  const themeName = await resolveThemeName(input.themeId)
  if (priceRM === null || priceRM <= 0 || !themeName) {
    throw createError({ statusCode: 400, statusMessage: 'That theme is not available for purchase.' })
  }
  const amountCents = Math.round(priceRM * 100)

  const siteUrl = ((useRuntimeConfig().public.siteUrl as string) || '').replace(/\/$/, '')
  if (!siteUrl) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_PUBLIC_SITE_URL is not configured.' })
  }

  const paymentRef = db.collection(`weddings/${input.weddingId}/payments`).doc()
  const orderId = encodePaymentRef(input.weddingId, paymentRef.id)

  // Write the record BEFORE creating the bill so the callback can always find
  // it (callback lookup uses orderId, not billCode). billCode is filled in
  // right after ToyyibPay responds.
  await paymentRef.set({
    weddingId: input.weddingId,
    billCode: '',
    themeId: input.themeId,
    themeName,
    amountCents,
    payerName: input.payerName,
    payerEmail: input.payerEmail,
    payerPhone: input.payerPhone,
    status: 'created',
    toyyibpayStatus: null,
    refNo: '',
    orderId,
    paidAt: null,
    createdAt: new Date().toISOString()
  })

  const { billCode, payUrl } = await createToyyibBill({
    billName: 'WeddingCard Premium',
    billDescription: `Premium upgrade - ${themeName}`,
    amountCents,
    externalReferenceNo: orderId,
    // ToyyibPay appends status_id, billcode and order_id to the return URL.
    returnUrl: `${siteUrl}/dashboard/billing?payment=return`,
    callbackUrl: `${siteUrl}/api/payments/callback`,
    payerName: input.payerName,
    payerEmail: input.payerEmail,
    payerPhone: input.payerPhone
  })

  await paymentRef.update({ billCode })

  return { paymentId: paymentRef.id, billCode, payUrl }
})
