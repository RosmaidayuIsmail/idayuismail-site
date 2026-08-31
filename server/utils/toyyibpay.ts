import { createHash } from 'node:crypto'

interface ToyyibConfig {
  secretKey: string
  categoryCode: string
  baseUrl: string
}

function toyyibConfig(): ToyyibConfig {
  const config = useRuntimeConfig()
  return {
    secretKey: config.toyyibpaySecretKey as string,
    categoryCode: config.toyyibpayCategoryCode as string,
    baseUrl: (config.toyyibpayBaseUrl as string).replace(/\/$/, '')
  }
}

function assertToyyibConfigured(cfg: ToyyibConfig) {
  if (!cfg.secretKey || !cfg.categoryCode) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Payments are unavailable: ToyyibPay is not configured.'
    })
  }
}

export interface CreateBillInput {
  billName: string
  billDescription: string
  /** Whole cents - RM 29 is 2900. */
  amountCents: number
  /** Our own reference, echoed back on callback and return. */
  externalReferenceNo: string
  returnUrl: string
  callbackUrl: string
  payerName: string
  payerEmail: string
  payerPhone: string
}

/**
 * Creates a ToyyibPay bill and returns its BillCode + hosted pay URL.
 * The API answers with a JSON array like [{"BillCode":"abc123"}]; anything
 * else (HTML error page, empty array) means bad credentials/category code.
 */
export async function createToyyibBill(input: CreateBillInput): Promise<{ billCode: string; payUrl: string }> {
  const cfg = toyyibConfig()
  assertToyyibConfigured(cfg)

  const form = new URLSearchParams()
  form.set('userSecretKey', cfg.secretKey)
  form.set('categoryCode', cfg.categoryCode)
  form.set('billName', input.billName)
  form.set('billDescription', input.billDescription)
  form.set('billPriceSetting', '1')
  form.set('billPayorInfo', '1')
  form.set('billAmount', String(input.amountCents))
  form.set('billReturnUrl', input.returnUrl)
  form.set('billCallbackUrl', input.callbackUrl)
  form.set('billExternalReferenceNo', input.externalReferenceNo)
  form.set('billTo', input.payerName)
  form.set('billEmail', input.payerEmail)
  form.set('billPhone', input.payerPhone)

  let responseText: string
  try {
    responseText = await $fetch(`${cfg.baseUrl}/index.php/api/createBill`, {
      method: 'POST',
      body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      timeout: 15000
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not reach ToyyibPay. Please try again.' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'ToyyibPay rejected the request. Check the secret key and category code.' })
  }

  const billCode =
    Array.isArray(parsed) && parsed.length > 0 && typeof (parsed[0] as Record<string, unknown>).BillCode === 'string'
      ? ((parsed[0] as Record<string, string>).BillCode as string)
      : null

  if (!billCode) {
    throw createError({ statusCode: 502, statusMessage: 'ToyyibPay did not return a bill. Please try again.' })
  }

  return { billCode, payUrl: `${cfg.baseUrl}/${billCode}` }
}

/**
 * Asks ToyyibPay for a bill's transactions (used to reconcile when the
 * callback is late or lost). Returns the raw array; callers check
 * billpaymentStatus === 1 (successful).
 */
export async function getToyyibBillTransactions(billCode: string): Promise<Array<Record<string, unknown>>> {
  const cfg = toyyibConfig()
  assertToyyibConfigured(cfg)

  const form = new URLSearchParams()
  form.set('userSecretKey', cfg.secretKey)
  form.set('billCode', billCode)

  try {
    // ToyyibPay prefixes its JSON with stray tabs/spaces. ofetch's auto-parse
    // (destr) treats a leading tab as "not JSON" and returns the raw string,
    // so fetch as text and JSON.parse manually (which trims whitespace).
    const responseText = await $fetch(`${cfg.baseUrl}/index.php/api/getBillTransactions`, {
      method: 'POST',
      body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      timeout: 15000
    })
    const parsed = JSON.parse(responseText)
    return Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : []
  } catch {
    return []
  }
}

/**
 * Validates ToyyibPay's callback hash: md5(userSecretKey + status +
 * order_id + refno + "ok") - the trailing "ok" is a literal per their docs.
 * Any callback failing this check is treated as forged and ignored.
 */
export function verifyToyyibHash(params: { status: string; orderId: string; refNo: string; hash: string }): boolean {
  const cfg = toyyibConfig()
  if (!cfg.secretKey || !params.hash) return false
  const expected = createHash('md5')
    .update(`${cfg.secretKey}${params.status}${params.orderId}${params.refNo}ok`)
    .digest('hex')
  return expected.toLowerCase() === String(params.hash).toLowerCase()
}

/**
 * The billExternalReferenceNo we send to ToyyibPay carries
 * "weddingId:paymentId" so the callback can locate the exact payment doc
 * in O(1) without a collection-group query.
 */
export function encodePaymentRef(weddingId: string, paymentId: string): string {
  return `${weddingId}:${paymentId}`
}

export function decodePaymentRef(orderId: string): { weddingId: string; paymentId: string } | null {
  const separator = orderId.indexOf(':')
  if (separator <= 0 || separator >= orderId.length - 1) return null
  const weddingId = orderId.slice(0, separator)
  const paymentId = orderId.slice(separator + 1)
  if (!weddingId || !paymentId) return null
  return { weddingId, paymentId }
}
