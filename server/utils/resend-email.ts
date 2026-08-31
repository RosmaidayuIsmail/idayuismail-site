/**
 * Thin wrapper over Resend's plain HTTP API (https://api.resend.com/emails)
 * - deliberately not using the `resend` npm package so this feature adds
 * zero new email-sending dependencies. Requires NUXT_RESEND_API_KEY and
 * NUXT_RESEND_FROM_EMAIL (an address on a domain verified in the user's own
 * Resend account) to be configured; callers should treat a missing key as
 * "email sending is not set up yet" rather than a hard crash where it's
 * reasonable to skip sending.
 */

export interface EmailAttachment {
  filename: string
  /** Base64-encoded file content - Resend's own attachment format. */
  content: string
}

export function isResendConfigured(): boolean {
  const config = useRuntimeConfig()
  return Boolean(config.resendApiKey && config.resendFromEmail)
}

export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  attachments?: EmailAttachment[]
}): Promise<{ id: string }> {
  const config = useRuntimeConfig()
  const apiKey = config.resendApiKey as string
  const from = config.resendFromEmail as string
  if (!apiKey || !from) {
    throw createError({ statusCode: 500, statusMessage: 'Email sending is not configured yet (missing NUXT_RESEND_API_KEY / NUXT_RESEND_FROM_EMAIL).' })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments
    })
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `Resend could not send the email: ${await res.text()}` })
  }
  return res.json() as Promise<{ id: string }>
}
