export interface WeddingBank {
  name: string
  accountName: string
  accountNumber: string
  qrCodeUrl?: string
}

export interface WeddingContent {
  brideName: string
  groomName: string
  brideFullName: string
  brideParents: string
  groomFullName: string
  groomParents: string
  /** Individual portrait photos shown on the Family slide */
  bridePhotoUrl: string
  groomPhotoUrl: string
  /**
   * One picture of the couple together (a photo, or an illustration with a
   * transparent background works best) shown inside the VIP Cinematic
   * cover's ornamental arch frame - see VipCinematicInvite.vue. Optional;
   * the cover falls back to its plain text-only frame when unset.
   */
  coupleIllustrationUrl?: string
  /**
   * Optional "doa" (prayer) stop in the VIP Cinematic fly-through, shown
   * between the event details and location scenes - see VipCinematicInvite.vue.
   * Off by default since not every couple wants a religious text stop;
   * when turned on with no custom text, a generic Malay wedding doa is
   * shown instead so the stop is never left blank.
   */
  enableDoa?: boolean
  doaText?: string
  story: string
  dateISO: string
  dateLabel: string
  timeLabel: string
  venueName: string
  venueAddress: string
  mapUrl: string
  rsvpDeadlineLabel: string
  /** Details page section headings/labels - translatable so a couple can
   *  offer the Details/Location page fully in Malay (or any language). */
  detailsHeading: string
  locationHeading: string
  locationSubtitle: string
  locationMapsButtonLabel: string
  coupleDividerLabel: string
  familyBrideLabel: string
  familyGroomLabel: string
  /** "Child of" above each parent's names on the Family slide. */
  childOfLabel: string
  /** Label on the "Add to Calendar" button under the Details/Event section. */
  calendarButtonLabel: string
  /** Heading above the day-of schedule (FlowTimeline) shown on the Details page. */
  eventFlowHeading: string
  /**
   * Which visual template the whole /w/[slug]/details page renders with.
   * 'classic' (default) is today's one-card-at-a-time auto-advancing
   * slideshow, unchanged. 'menu' is a tabbed/browsable layout - inspired by
   * a restaurant menu page - where every slide (including the Wedding Menu
   * below, when it has items) is listed as a tappable category up front and
   * guests jump straight to what they want instead of waiting through an
   * auto-advancing carousel. Admin controls which of these a couple is
   * allowed to pick from (see detailsLayoutStyleCatalog in useThemes.ts);
   * old weddings with no value saved yet fall back to 'classic' so nothing
   * changes for anyone who hasn't opted in. */
  detailsLayoutStyle: 'classic' | 'menu'
  /** Heading shown above the Wedding Menu slide, e.g. "Our Wedding Menu". */
  menuHeading: string
  /** Short optional line under the Wedding Menu heading, e.g. "A taste of what's on the table". */
  menuSubtitle: string
  hashtag: string
  enableGift: boolean
  enablePetals: boolean
  /** Which floating particle style to use: 'petals' | 'confetti' | 'hearts' | 'sparkles' */
  petalStyle: string
  /** Chosen color for the falling particles; empty = the style's default colors */
  petalColor: string
  bank: WeddingBank
  /** Optional second gift account (e.g. the groom's family's own account) -
   * shown alongside `bank` on the live Gift page when it has any data. */
  bank2: WeddingBank
  coverPhotoUrl: string
  audioSrc: string
  customAccent: string
  customBgFrom: string
  customBgTo: string
  fontFamily: string
  customFontUrl: string
  customFontFamily: string
  ornamentStyle: string
  /** Chosen color for the ornament; empty = the ornament's default color */
  ornamentColor: string
  /** Chosen color for the cover/inner top icon; empty = the theme accent */
  topIconColor: string
  /** CSS font-weight for body/description text (intro, story, addresses) - helps legibility on busy or low-contrast themes */
  textWeight: string
  /** Override color for the bride & groom names specifically - falls back to the theme's ink color when empty */
  nameColor: string
  /** Percentage scale for the bride & groom names, 50-200, default 100 */
  nameSize: number
  /** How the RSVP/Inner Card panel background is styled: '' (auto - follows
   *  the theme's own default, see Theme.defaultCardStyle) | 'theme' (always
   *  tint the card with the wedding's own theme colors, keeping the theme's
   *  own ink for text) | 'dark' (always use a fixed dark card with light
   *  text, regardless of theme - matches the original Matcha Strawberry
   *  treatment). A manual override so one couple's choice never changes the
   *  default for every other theme. */
  cardStyle: string
  /** Override text color for content inside the RSVP/Inner Card panel -
   *  blank uses whatever the resolved cardStyle would use automatically
   *  (theme ink for 'theme', white for 'dark'). */
  cardTextColor: string
  /** Monogram / logo emblem shown on the print card and details page */
  monogramEnabled: boolean
  monogramType: string // 'auto' | 'custom-text' | 'upload'
  monogramText: string // used when monogramType is 'custom-text'
  monogramImageUrl: string // used when monogramType is 'upload'
  monogramFont: string // curated font id, used unless monogramFontUrl is set
  monogramFontUrl: string // custom Google Font stylesheet URL
  monogramFontFamily: string // custom Google Font CSS family name
  /** 'classic' (default) is today's Opening -> Details -> RSVP three-page
   *  flow, unchanged. 'story' is a single continuously-scrolling page that
   *  reveals the same content (story, couple, family, event, location,
   *  gift, flow) as scroll-triggered scenes instead of separate pages, then
   *  ends on an RSVP call to action - see StoryInvite.vue. Old weddings with
   *  no value saved yet fall back to 'classic' so nothing changes for
   *  anyone who hasn't opted in. */
  layoutStyle: 'classic' | 'story'
  openingStyle: string
  openingBgUrl: string
  /** Hides the site's own Main Title / guest-name box / "tap to open" text
   *  on the closed envelope screen entirely, and switches the uploaded
   *  cover image from cropped+tinted to fully shown (object-contain, no
   *  dark overlay) - for a couple whose own custom-designed image (e.g. a
   *  Canva poster with its own baked-in typography) already has everything
   *  it needs and was getting cropped/duplicated by the site's overlay.
   *  Guests can still tap anywhere on the image to open it. Independent of
   *  hideSystemText, which only affects the opened/Hero page. */
  openingHideText: boolean
  /** Horizontal alignment of the Main Title / guest-name box / action text
   *  on the closed envelope screen, for when openingHideText is off but the
   *  couple's background image needs the text shifted out of the way
   *  instead of centered. */
  openingTextAlign: 'left' | 'center' | 'right'
  openingTitle: string
  openingGreeting: string
  openingActionText: string
  /** Which curated color palette the Modern Dark / Minimal Light opening
   *  styles render with - see modernDarkPaletteCatalog / minimalLightPaletteCatalog
   *  in useThemes.ts. Empty string falls back to each catalog's first entry,
   *  so existing cards keep their current look until a couple opts in. */
  openingModernDarkPalette: string
  openingMinimalLightPalette: string
  /**
   * Per-element typography overrides for the opening/envelope screen's text
   * elements. Each falls back to sensible defaults when empty, so existing
   * cards are unaffected until the user opts in. The guest-name box has
   * three independently-stylable parts - the greeting text before the name
   * (e.g. "Menjemput"), the guest's name itself, and the greeting text after
   * it (e.g. "sekeluarga") - so a couple can mix fonts across all three.
   */
  openingTitleFont: string
  openingTitleFontUrl: string
  openingTitleFontFamily: string
  openingTitleSize: number
  openingTitleColor: string
  openingTitleWeight: string
  openingGreetingFont: string
  openingGreetingFontUrl: string
  openingGreetingFontFamily: string
  openingGreetingSize: number
  openingGreetingColor: string
  openingGreetingWeight: string
  openingGuestNameFont: string
  openingGuestNameFontUrl: string
  openingGuestNameFontFamily: string
  openingGuestNameSize: number
  openingGuestNameColor: string
  openingGuestNameWeight: string
  /** How the guest's name is set off from the background on the opening
   *  screen - a gallery of actual SHAPES (dome arch, oval pill, hexagon,
   *  notched ribbon banner), not color/border variations on one rectangle,
   *  so each couple can pick a silhouette that matches their own invitation
   *  instead of getting one fixed box. 'custom' means their own uploaded
   *  decorative image sits behind the text (see openingGuestNameBoxImageUrl
   *  below). Old weddings with no value saved yet fall back to 'none' - the
   *  frosted box used to be a default nobody could turn off, not a
   *  deliberate choice, so plain text is the safe fallback. */
  openingGuestNameBox: 'none' | 'arch' | 'pill' | 'hexagon' | 'ribbon' | 'custom'
  /** The couple's own uploaded image, shown behind the guest-name text when
   *  openingGuestNameBox is 'custom' - lets them bring a decorative frame,
   *  ribbon, or box graphic of their own instead of picking from the
   *  built-in styles. */
  openingGuestNameBoxImageUrl: string
  /** When true, the guest's name unrolls into view (like a scroll or
   *  parchment opening) instead of just appearing on load - independent of
   *  which openingGuestNameBox shape is chosen above. Off by default: it's
   *  an optional flourish, not something every wedding should get without
   *  asking for it. Also switched off automatically for guests who have
   *  requested reduced motion, regardless of this setting. */
  openingGuestNameAnimate: boolean
  openingGreetingAfterFont: string
  openingGreetingAfterFontUrl: string
  openingGreetingAfterFontFamily: string
  openingGreetingAfterSize: number
  openingGreetingAfterColor: string
  openingGreetingAfterWeight: string
  openingActionFont: string
  openingActionFontUrl: string
  openingActionFontFamily: string
  openingActionSize: number
  openingActionColor: string
  openingActionWeight: string
  innerGreeting: string
  innerIntro: string
  btnDetails: string
  btnRsvp: string
  /** When false, the RSVP button/page are hidden - for invitation-only cards */
  rsvpEnabled: boolean
  /**
   * WhatsApp/copy-link share message template. Supports tokens:
   * {guestName} {brideName} {groomName} {date} {link}
   * {guestName} is only filled in when sharing a specific guest's
   * personalized link from the Guests page - it's empty on the general
   * share button on the invitation itself.
   */
  shareMessage: string
  rsvpTitle: string
  rsvpDeadlineText: string
  rsvpAttendQuestion: string
  rsvpAttendYes: string
  rsvpAttendNo: string
  rsvpGuestLabel: string
  rsvpSeatingLabel: string
  /** Simple "Yes"/"No" toggle labels for the special-seating question */
  rsvpSeatingYesLabel: string
  rsvpSeatingNoLabel: string
  rsvpDietaryLabel: string
  rsvpWishesLabel: string
  /** Additional RSVP text - all translatable so a Malay (or any language) card can be fully localized */
  rsvpNameLabel: string
  rsvpNamePlaceholder: string
  rsvpDietaryPlaceholder: string
  rsvpWishesSubtitle: string
  rsvpWishesPlaceholder: string
  rsvpSummaryTitle: string
  rsvpSummaryNameLabel: string
  rsvpSummaryStatusLabel: string
  rsvpSummaryGuestsLabel: string
  rsvpSummarySpecialLabel: string
  rsvpSummaryDietaryLabel: string
  rsvpAttendingText: string
  rsvpNotAttendingText: string
  rsvpBackButton: string
  rsvpContinueButton: string
  rsvpConfirmButton: string
  rsvpSuccessYes: string
  rsvpSuccessNo: string
  rsvpStepAboutYou: string
  rsvpStepDetails: string
  rsvpStepWishes: string
  /** "Return to Invitation" button shown at the top of the RSVP page */
  rsvpReturnButton: string
  /** Sympathy message shown when a guest declines - supports the {name} token */
  rsvpDeclineMessage: string
  /** Thank-you screen title after a successful submission - supports the {name} token */
  rsvpThankYouTitle: string
  /** Thank-you screen intro sentence, shown before the attending/not-attending success text */
  rsvpThankYouIntro: string
  /** "Submit another response" button on the thank-you screen */
  rsvpSubmitAnotherButton: string
  /** Heading shown above the Wishes & Blessings wall on the thank-you screen */
  rsvpWishesWallTitle: string
  /** Message shown on the Wishes & Blessings wall when no one has left a wish yet */
  rsvpWishesEmptyText: string
  innerTopIcon: string
  /** Percentage scale for the icon, 50-200, default 100 */
  iconSize: number
  /** Independent icon setting for the Inner Card (details/story) page - see innerTopIcon for the Cover page's icon */
  detailsTopIcon: string
  detailsIconSize: number
  /** Optional line shown below the Cover page's icon, e.g. "Together with their families" */
  iconSubtitle: string
  customIconUrl: string
  hideSystemText: boolean
  
  // --- NEW: Independent Drag & Drop Positions & Layouts ---
  namesLayout: string // 'horizontal' | 'vertical'
  iconX: number
  iconY: number
  greetingX: number
  greetingY: number
  introX: number
  introY: number
  namesX: number
  namesY: number
  dateX: number
  dateY: number
  venueX: number
  venueY: number
}

export interface FlowItem {
  id: string
  time: string
  title: string
  description: string
  /** Optional venue/hall name for this event, shown under the description when set. */
  location?: string
  /** Marks a key moment (e.g. Akad Nikah) so it's shown with extra emphasis on the timeline. */
  highlight?: boolean
}

/**
 * One dish/course on the couple's own Wedding Menu slide (see MenuList.vue /
 * the 'menu' slide in app/pages/w/[slug]/details.vue) - inspired by a
 * restaurant menu page, grouped by `category` (e.g. "Appetizer", "Main
 * Course", "Dessert") so guests can browse the reception food the same way
 * they would a restaurant's own menu.
 */
export interface MenuItem {
  id: string
  category: string
  name: string
  description?: string
  imageUrl?: string
}

/**
 * A single admin-authored "scene" shown in the VIP Cinematic invitation's
 * automatic camera fly-through (see VipCinematicInvite.vue / VipScenesPanel.vue).
 * These are the narrative middle scenes (couple story, family, custom notes,
 * etc.) that the couple writes themselves - separate from the automatic
 * data-bound scenes (event details, location, gift, flow, closing) which are
 * still generated straight from `content`/`flow`.
 */
export interface VipScene {
  id: string
  title: string
  body: string
  imageUrl?: string
  /** Where the camera looks during this scene in the fly-through. Unset (or
   *  'auto') alternates left/right automatically so the camera visibly
   *  travels, not just zooms - see VipCinematicInvite.vue. */
  position?: 'auto' | 'left' | 'center' | 'right'
  /** How zoomed-in the camera gets on this scene, as a percentage (100 = no
   *  zoom, e.g. 112 = 12% zoomed in). Unset uses a calm automatic default. */
  zoomPercent?: number
  /** How many seconds the camera lingers on this scene before moving to the
   *  next one. Unset estimates a hold time from how much text is written. */
  holdSeconds?: number
}

export type WeddingPlan = 'free' | 'premium'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid'
export type WeddingStatus = 'draft' | 'published'

export interface WeddingDoc {
  id: string
  ownerUid: string
  slug: string
  themeId: string
  plan: WeddingPlan
  paymentStatus: PaymentStatus
  status: WeddingStatus
  content: WeddingContent
  flow: FlowItem[]
  /** The couple's own Wedding Menu (reception food) items - see MenuItem.
   *  Optional/absent on older weddings; the 'menu' details slide only
   *  appears once at least one item exists. */
  menu?: MenuItem[]
  /**
   * Whether the separate VIP Cinematic guest page (/w/[slug]/vip) is turned
   * on. Only ever meaningful for a wedding owned by a VIP-tier account
   * (see UserRole/VipApprovalStatus in useAuth.ts) - whether that account
   * is even allowed to use VIP Cinematic at all is gated at the account
   * level via admin approval, not per-wedding.
   */
  vipEnabled: boolean
  /** Admin-authored narrative scenes shown in the VIP Cinematic fly-through - see VipScene. */
  vipScenes: VipScene[]
  /**
   * A photo of the wedding's own venue/place, used as a fixed backdrop
   * behind the entire VIP Cinematic fly-through (see VipCinematicInvite.vue)
   * instead of the plain theme gradient. Optional - falls back to the
   * gradient when unset.
   */
  vipBackgroundImageUrl?: string
  /**
   * Set once the post-wedding Guest List export (CSV + PDF) has been
   * emailed to this account's own email address by the countdown-end cron
   * job (see server/api/cron/send-post-wedding-exports.post.ts). Prevents
   * sending the same wedding's export more than once. Written only by that
   * server route via the Admin SDK - never set from the client.
   */
  postWeddingExportSent?: boolean
}

export interface GuestDoc {
  id: string
  name: string
  tier: 'vip' | 'general'
  phone: string
  /** Optional - only needed for guests who should receive their exported
   *  file/QR by email (see useGoogleDrive.ts and the countdown-end email
   *  job). Blank for guests who are only ever reached over WhatsApp. */
  email?: string
  attending: 'Yes' | 'No' | ''
  guestCount: number
  specialSeating: boolean
  dietary: string
  doa: string
  /** Optional reception table assignment (e.g. "T1"). */
  tableAssignment: string
  submittedAt: string
}

export function createDefaultContent(brideName = '', groomName = ''): WeddingContent {
  return {
    brideName,
    groomName,
    brideFullName: '',
    brideParents: '',
    groomFullName: '',
    groomParents: '',
    bridePhotoUrl: '',
    groomPhotoUrl: '',
    coupleIllustrationUrl: '',
    enableDoa: false,
    doaText: '',
    story: 'With humble hearts, we joyfully invite you to celebrate our wedding with us.',
    dateISO: '',
    dateLabel: '',
    timeLabel: '',
    venueName: '',
    venueAddress: '',
    mapUrl: '',
    rsvpDeadlineLabel: '',
    detailsHeading: 'The Details',
    locationHeading: 'Location',
    locationSubtitle: 'Scan or tap to open in Maps',
    locationMapsButtonLabel: 'Google Maps',
    coupleDividerLabel: 'Bride & Groom',
    familyBrideLabel: 'Bride',
    familyGroomLabel: 'Groom',
    childOfLabel: 'Child of',
    calendarButtonLabel: 'Add to Calendar',
    eventFlowHeading: 'Event Flow',
    detailsLayoutStyle: 'classic',
    menuHeading: 'Our Wedding Menu',
    menuSubtitle: '',
    hashtag: '',
    enableGift: false,
    enablePetals: true,
    petalStyle: 'petals',
    petalColor: '',
    bank: { name: '', accountName: '', accountNumber: '', qrCodeUrl: '' },
    bank2: { name: '', accountName: '', accountNumber: '', qrCodeUrl: '' },
    coverPhotoUrl: '',
    audioSrc: '',
    customAccent: '',
    customBgFrom: '',
    customBgTo: '',
    fontFamily: '',
    customFontUrl: '',
    customFontFamily: '',
    ornamentStyle: 'none',
    textWeight: '300',
    nameColor: '',
    nameSize: 100,
    cardStyle: '',
    cardTextColor: '',
    monogramEnabled: false,
    monogramType: 'auto',
    monogramText: '',
    monogramImageUrl: '',
    monogramFont: 'Cormorant Garamond',
    monogramFontUrl: '',
    monogramFontFamily: '',
    layoutStyle: 'classic',
    openingStyle: 'classic',
    openingBgUrl: '',
    openingHideText: false,
    openingTextAlign: 'center',
    openingTitle: "You're Invited",
    openingGreeting: 'Dear',
    openingActionText: 'Tap to open',
    openingModernDarkPalette: '',
    openingMinimalLightPalette: '',
    openingTitleFont: '',
    openingTitleFontUrl: '',
    openingTitleFontFamily: '',
    openingTitleSize: 100,
    openingTitleColor: '',
    openingTitleWeight: '',
    openingGreetingFont: '',
    openingGreetingFontUrl: '',
    openingGreetingFontFamily: '',
    openingGreetingSize: 100,
    openingGreetingColor: '',
    openingGreetingWeight: '',
    openingGuestNameFont: '',
    openingGuestNameFontUrl: '',
    openingGuestNameFontFamily: '',
    openingGuestNameSize: 100,
    openingGuestNameColor: '',
    openingGuestNameWeight: '',
    openingGuestNameBox: 'none',
    openingGuestNameBoxImageUrl: '',
    openingGuestNameAnimate: false,
    openingGreetingAfterFont: '',
    openingGreetingAfterFontUrl: '',
    openingGreetingAfterFontFamily: '',
    openingGreetingAfterSize: 100,
    openingGreetingAfterColor: '',
    openingGreetingAfterWeight: '',
    openingActionFont: '',
    openingActionFontUrl: '',
    openingActionFontFamily: '',
    openingActionSize: 100,
    openingActionColor: '',
    openingActionWeight: '',
    innerGreeting: "You're Invited",
    innerIntro: 'To the wedding celebration of',
    btnDetails: 'View Details',
    btnRsvp: 'RSVP Now',
    rsvpEnabled: true,
    shareMessage: "You're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}",
    rsvpTitle: 'RSVP',
    rsvpDeadlineText: 'Kindly respond by',
    rsvpAttendQuestion: 'Will you be attending?',
    rsvpAttendYes: 'Joyfully Accept',
    rsvpAttendNo: 'Regretfully Decline',
    rsvpGuestLabel: 'Number of guests attending',
    rsvpSeatingLabel: 'Do you require special seating? (e.g., wheelchair access)',
    rsvpSeatingYesLabel: 'Yes',
    rsvpSeatingNoLabel: 'No',
    rsvpDietaryLabel: 'Dietary restrictions (if any)',
    rsvpWishesLabel: 'Wishes & Blessings',
    rsvpNameLabel: 'Name(s)',
    rsvpNamePlaceholder: 'Type your full name',
    rsvpDietaryPlaceholder: 'e.g. Vegetarian, No Seafood',
    rsvpWishesSubtitle: 'Write your well wishes for the couple',
    rsvpWishesPlaceholder: 'May your marriage be blessed...',
    rsvpSummaryTitle: 'RSVP Summary',
    rsvpSummaryNameLabel: 'Name:',
    rsvpSummaryStatusLabel: 'Status:',
    rsvpSummaryGuestsLabel: 'Guests:',
    rsvpSummarySpecialLabel: 'Special:',
    rsvpSummaryDietaryLabel: 'Dietary:',
    rsvpAttendingText: 'Attending',
    rsvpNotAttendingText: 'Not Attending',
    rsvpBackButton: 'Back',
    rsvpContinueButton: 'Continue',
    rsvpConfirmButton: 'Confirm RSVP',
    rsvpSuccessYes: 'We are absolutely thrilled to celebrate with you.',
    rsvpSuccessNo: 'You will be dearly missed.',
    rsvpStepAboutYou: 'About You',
    rsvpStepDetails: 'Details',
    rsvpStepWishes: 'Wishes',
    rsvpReturnButton: 'Return to Invitation',
    rsvpDeclineMessage: "We'll miss you, {name}! Feel free to leave us a wish on the next step.",
    rsvpThankYouTitle: 'Thank you, {name}!',
    rsvpThankYouIntro: 'Your RSVP has been securely received.',
    rsvpSubmitAnotherButton: 'Submit another response',
    rsvpWishesWallTitle: 'Wishes & Blessings',
    rsvpWishesEmptyText: 'Be the first to leave a wish 💛',
    innerTopIcon: 'none',
    iconSize: 100,
    detailsTopIcon: 'none',
    detailsIconSize: 100,
    iconSubtitle: '',
    customIconUrl: '',
    hideSystemText: false,
    namesLayout: 'horizontal',
    iconX: 50, iconY: 10,
    greetingX: 50, greetingY: 20,
    introX: 50, introY: 30,
    namesX: 50, namesY: 50,
    dateX: 50, dateY: 68,
    venueX: 50, venueY: 78
  }
}

/**
 * Builds a "B & G" style monogram from initials when the couple hasn't
 * typed a custom monogram text of their own.
 */
export function autoMonogramText(brideName: string, groomName: string): string {
  const b = brideName.trim().charAt(0).toUpperCase()
  const g = groomName.trim().charAt(0).toUpperCase()
  if (!b && !g) return ''
  if (!b) return g
  if (!g) return b
  return `${b} & ${g}`
}

/**
 * Fills the {name} token used in RSVP guest-facing messages (the decline
 * sympathy line and the thank-you title) with the guest's own name.
 */
export function fillNameToken(template: string, name: string): string {
  return (template || '').replace(/\{name\}/g, name || 'friend')
}

export function buildShareMessage(
  template: string,
  tokens: { guestName?: string; brideName: string; groomName: string; date?: string; link: string }
): string {
  return template
    .replace(/\{guestName\}/g, tokens.guestName || '')
    .replace(/\{brideName\}/g, tokens.brideName || '')
    .replace(/\{groomName\}/g, tokens.groomName || '')
    .replace(/\{date\}/g, tokens.date || '')
    .replace(/\{link\}/g, tokens.link || '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}