/**
 * Builds the same personalized invite link + pre-filled WhatsApp send link
 * that the client computes via useGuests.ts's personalizedLink()/
 * whatsappLink(). Duplicated here (rather than imported) because those live
 * in a Vue composable, and every place that needs this server-side (the
 * Guest Links Sheet, the guest-intake page's own per-guest share links)
 * has no Vue runtime to import it from - keep the two in sync if either
 * ever changes.
 *
 * With a phone number, the WhatsApp link opens straight into a chat with
 * that exact contact, message already typed - true "send this one
 * personally" sharing. Without one, it falls back to a generic
 * https://wa.me/?text=... link, which still opens WhatsApp with the
 * message pre-filled but lets the sender pick who to send it to - so a
 * guest never NEEDS a phone number on file for their link to be shareable,
 * it's just a nicer experience when there is one.
 */
export function buildGuestLinks(
  siteUrl: string,
  slug: string,
  content: { shareMessage?: string; brideName?: string; groomName?: string; dateLabel?: string },
  guestId: string,
  guestName: string,
  guestPhone: string
): { inviteUrl: string; whatsappUrl: string } {
  const inviteUrl = `${siteUrl}/w/${slug}?to=${encodeURIComponent(guestName)}&gid=${encodeURIComponent(guestId)}`
  const template = content.shareMessage || "Dear {guestName}, you're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}"
  const message = template
    .replace(/\{guestName\}/g, guestName)
    .replace(/\{brideName\}/g, content.brideName || '')
    .replace(/\{groomName\}/g, content.groomName || '')
    .replace(/\{date\}/g, content.dateLabel || '')
    .replace(/\{link\}/g, inviteUrl)
    .replace(/\s{2,}/g, ' ')
    .trim()
  const digitsOnly = guestPhone.replace(/[^0-9]/g, '')
  const whatsappUrl = digitsOnly
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`
  return { inviteUrl, whatsappUrl }
}
