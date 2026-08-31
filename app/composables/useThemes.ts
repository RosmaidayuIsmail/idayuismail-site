import type { WeddingContent } from './useWeddingTypes'
import { BUILTIN_THEME_PRICING } from '~~/shared/utils/theme-pricing'

export interface ThemePalette {
  bgFrom: string
  bgVia: string
  bgTo: string
  accent: string
  accentSoft: string
  ink: string
  onAccent: string
}

export interface StarterFlowItem {
  time: string
  title: string
  description: string
}

// The "shared template" every NEW wedding starts from - not any existing
// couple's own data. Admin changes here only affect weddings created AFTER
// the change; nothing already-created is touched.
export interface StarterDefaults {
  story: string
  enablePetals: boolean
  petalStyle: string
  ornamentStyle: string
  textWeight: string
  btnDetails: string
  btnRsvp: string
  flow: StarterFlowItem[]
}

export const defaultStarterDefaults: StarterDefaults = {
  story: 'With humble hearts, we joyfully invite you to celebrate our wedding with us.',
  enablePetals: true,
  petalStyle: 'petals',
  ornamentStyle: 'none',
  textWeight: '300',
  btnDetails: 'View Details',
  btnRsvp: 'RSVP Now',
  flow: []
}

export interface Theme {
  id: string
  name: string
  tagline: string
  price: number
  currency: 'RM'
  headingFont: string
  palette: ThemePalette
  /** Default look for the RSVP/Inner Card panel when a couple hasn't
   *  chosen one themselves (WeddingContent.cardStyle is empty):
   *  'theme' (default when unset) tints the card with this theme's own
   *  bg-via/bg-to and keeps its own ink for text - self-consistent, since
   *  the theme's ink was chosen to contrast with its own background.
   *  'dark' forces a fixed dark card with light text regardless of the
   *  theme's own palette. Every couple can still override either way
   *  per-wedding via WeddingContent.cardStyle - this is only the default. */
  defaultCardStyle?: 'theme' | 'dark'
  /** When true, this theme's card style is fixed to defaultCardStyle and a
   *  couple's own WeddingContent.cardStyle is ignored entirely for it (used
   *  instead of just changing defaultCardStyle, so any wedding that already
   *  had 'dark' saved from before this theme's colors were revised isn't
   *  stuck showing the old mismatched dark card). Leave unset for a theme
   *  where the per-wedding override should keep working normally. */
  lockCardStyle?: boolean
  /** Opacity (0-1) of the dark scrim laid over an uploaded cover/opening
   *  photo for text legibility (Opening screen doors/background, Hero cover
   *  photo). Defaults to 0.4 when unset - the right amount for a photo sitting
   *  behind mostly-dark theme colors. A theme whose own palette (and likely
   *  its couples' photos) is already light and pastel needs much less
   *  darkening to stay legible - too much just muddies the photo's real
   *  colors into grey instead of protecting the text. */
  overlayTintOpacity?: number
}

export interface FontOption {
  id: string
  label: string
  category: 'script' | 'serif' | 'sans'
}

export const fontOptions: FontOption[] = [
  { id: 'Great Vibes', label: 'Great Vibes (elegant script)', category: 'script' },
  { id: 'Dancing Script', label: 'Dancing Script (flowing script)', category: 'script' },
  { id: 'Allura', label: 'Allura (delicate script)', category: 'script' },
  { id: 'Parisienne', label: 'Parisienne (romantic script)', category: 'script' },
  { id: 'Tangerine', label: 'Tangerine (fine calligraphy)', category: 'script' },
  { id: 'Playfair Display', label: 'Playfair Display (classic serif)', category: 'serif' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond (refined serif)', category: 'serif' },
  { id: 'Cinzel', label: 'Cinzel (engraved serif)', category: 'serif' },
  { id: 'Marcellus', label: 'Marcellus (modern serif)', category: 'serif' },
  { id: 'Amiri', label: 'Amiri (traditional serif)', category: 'serif' },
  { id: 'Poppins', label: 'Poppins (clean sans-serif)', category: 'sans' }
]

export const DEFAULT_FONT = 'Great Vibes'

export const themes: Theme[] = [
  {
    id: 'timeless-gold',
    name: BUILTIN_THEME_PRICING['timeless-gold'].name,
    tagline: 'Midnight navy with champagne gold — the original',
    price: BUILTIN_THEME_PRICING['timeless-gold'].priceRM,
    currency: 'RM',
    headingFont: 'Great Vibes',
    palette: {
      bgFrom: '#04101f',
      bgVia: '#0b1c30',
      bgTo: '#142a45',
      accent: '#d4a017',
      accentSoft: 'rgba(212, 160, 23, 0.18)',
      ink: '#ffffff',
      onAccent: '#1f1400'
    }
  },
  {
    id: 'ivory-minimalist',
    name: BUILTIN_THEME_PRICING['ivory-minimalist'].name,
    tagline: 'Clean cream and charcoal for a modern, understated look',
    price: BUILTIN_THEME_PRICING['ivory-minimalist'].priceRM,
    currency: 'RM',
    headingFont: 'Marcellus',
    palette: {
      bgFrom: '#faf6ee',
      bgVia: '#f2ead9',
      bgTo: '#e8dcc4',
      accent: '#8a6d3b',
      accentSoft: 'rgba(138, 109, 59, 0.14)',
      ink: '#2a2420',
      onAccent: '#faf6ee'
    }
  },
  {
    id: 'nusantara-elegance',
    name: BUILTIN_THEME_PRICING['nusantara-elegance'].name,
    tagline: 'Deep emerald and rich bronze inspired by traditional heritage',
    price: BUILTIN_THEME_PRICING['nusantara-elegance'].priceRM,
    currency: 'RM',
    headingFont: 'Amiri',
    palette: {
      bgFrom: '#061a14',
      bgVia: '#0d2b22',
      bgTo: '#133d31',
      accent: '#cd7f32',
      accentSoft: 'rgba(205, 127, 50, 0.18)',
      ink: '#fdfbf7',
      onAccent: '#061a14'
    }
  },
  {
    id: 'blush-botanical',
    name: BUILTIN_THEME_PRICING['blush-botanical'].name,
    tagline: 'Soft blush and sage for a romantic, floral feel',
    price: BUILTIN_THEME_PRICING['blush-botanical'].priceRM,
    currency: 'RM',
    headingFont: 'Parisienne',
    palette: {
      bgFrom: '#3c2a30',
      bgVia: '#55343b',
      bgTo: '#6b4550',
      accent: '#e8b4bc',
      accentSoft: 'rgba(232, 180, 188, 0.18)',
      ink: '#fbeff1',
      onAccent: '#3c1620'
    }
  },
  {
    id: 'velvet-romance',
    name: BUILTIN_THEME_PRICING['velvet-romance'].name,
    tagline: 'Deep burgundy and rose gold for a striking, intimate mood',
    price: BUILTIN_THEME_PRICING['velvet-romance'].priceRM,
    currency: 'RM',
    headingFont: 'Playfair Display',
    palette: {
      bgFrom: '#1f040a',
      bgVia: '#330814',
      bgTo: '#4a0b1d',
      accent: '#b76e79',
      accentSoft: 'rgba(183, 110, 121, 0.18)',
      ink: '#fff0f3',
      onAccent: '#1f040a'
    }
  },
  {
    id: 'royal-emerald',
    name: BUILTIN_THEME_PRICING['royal-emerald'].name,
    tagline: 'Deep emerald and gold for a luxurious statement',
    price: BUILTIN_THEME_PRICING['royal-emerald'].priceRM,
    currency: 'RM',
    headingFont: 'Cinzel',
    palette: {
      bgFrom: '#04140f',
      bgVia: '#0a2b1f',
      bgTo: '#123d2c',
      accent: '#c9a227',
      accentSoft: 'rgba(201, 162, 39, 0.18)',
      ink: '#f2f7f2',
      onAccent: '#0a2b1f'
    }
  },
  {
    id: 'lavender-dusk',
    name: BUILTIN_THEME_PRICING['lavender-dusk'].name,
    tagline: 'Deep plum and soft lilac for a dreamy, romantic evening',
    price: BUILTIN_THEME_PRICING['lavender-dusk'].priceRM,
    currency: 'RM',
    headingFont: 'Allura',
    palette: {
      bgFrom: '#170a29',
      bgVia: '#2b1350',
      bgTo: '#3d1e6b',
      accent: '#c9a7eb',
      accentSoft: 'rgba(201, 167, 235, 0.18)',
      ink: '#f6f0fb',
      onAccent: '#170a29'
    }
  },
  {
    id: 'sky-serenade',
    name: BUILTIN_THEME_PRICING['sky-serenade'].name,
    tagline: 'Soft powder blue and cream for a light, airy feel',
    price: BUILTIN_THEME_PRICING['sky-serenade'].priceRM,
    currency: 'RM',
    headingFont: 'Cormorant Garamond',
    palette: {
      bgFrom: '#eef5fb',
      bgVia: '#dbe9f5',
      bgTo: '#c5daeb',
      accent: '#3b7ba3',
      accentSoft: 'rgba(59, 123, 163, 0.14)',
      ink: '#1e3a4c',
      onAccent: '#eef5fb'
    }
  },
  {
    id: 'matcha-strawberry',
    name: BUILTIN_THEME_PRICING['matcha-strawberry'].name,
    tagline: 'Soft strawberry cream with matcha green accents for a sweet, playful feel',
    price: BUILTIN_THEME_PRICING['matcha-strawberry'].priceRM,
    currency: 'RM',
    headingFont: 'Dancing Script',
    palette: {
      bgFrom: '#fef6f3',
      bgVia: '#fbe8ec',
      bgTo: '#f6cdd6',
      accent: '#7c9a6f',
      accentSoft: 'rgba(124, 154, 111, 0.16)',
      ink: '#4a3b3a',
      onAccent: '#fefaf6'
    },
    // Used to force a fixed dark navy card (defaultCardStyle: 'dark'), but
    // that clashed badly against this theme's own soft strawberry-pink
    // palette and floral cover photos - now always follows its own colors
    // instead. lockCardStyle also overrides any 'dark' value a wedding may
    // already have saved from before this change, so every Matcha
    // Strawberry wedding shows the light card without needing anyone to
    // manually flip a setting.
    lockCardStyle: true,
    // The default 0.4 dark scrim over an uploaded photo was mixing with
    // this theme's already-light, pastel colors and reading as a flat grey
    // wash instead of the couple's actual photo - a much lighter touch
    // keeps text legible (text also carries its own drop-shadow) without
    // hiding the photo's real colors.
    overlayTintOpacity: 0.16
  }
]

export const DEFAULT_THEME_ID = 'timeless-gold'

export interface ColorOverrides {
  bgFrom?: string
  bgTo?: string
  accent?: string
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return `rgba(212, 160, 23, ${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Used to pick which flavor of text-shadow keeps hero-overlay text (see
// index.vue's .overlay-text-shadow) legible against a photo: themes whose
// ink is a light color (near-white - the ink sits on a dark background/
// dark card, like most themes) need a dark shadow behind the light text;
// themes whose ink is a dark color (Matcha Strawberry, and other light
// pastel themes) sit their dark ink text on a light background/photo, so a
// heavy dark shadow there just reads as an unwanted bold/muddy outline -
// they need a soft light glow instead, same idea as EnvelopeIntro's
// titleShadow switching between its 'minimal-light' and default variants.
function inkIsDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return false
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  // Relative luminance (simple sRGB approximation is plenty here).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.6
}

export interface TextPreset {
  id: string
  label: string
  openingTitle: string
  openingGreeting: string
  openingActionText: string
}

export const rsvpTextFields = [
  { key: 'rsvpTitle', label: 'RSVP page title' }, { key: 'rsvpDeadlineText', label: 'Deadline prefix' }, { key: 'rsvpAttendQuestion', label: 'Attendance question' }, { key: 'rsvpAttendYes', label: 'Attending option' }, { key: 'rsvpAttendNo', label: 'Not attending option' }, { key: 'rsvpNameLabel', label: 'Name label' }, { key: 'rsvpNamePlaceholder', label: 'Name placeholder' }, { key: 'rsvpGuestLabel', label: 'Guest count label' }, { key: 'rsvpSeatingLabel', label: 'Special seating question' }, { key: 'rsvpSeatingYesLabel', label: "Seating 'Yes' option" }, { key: 'rsvpSeatingNoLabel', label: "Seating 'No' option" }, { key: 'rsvpDietaryLabel', label: 'Dietary label' }, { key: 'rsvpDietaryPlaceholder', label: 'Dietary placeholder' }, { key: 'rsvpWishesLabel', label: 'Wishes label' }, { key: 'rsvpWishesSubtitle', label: 'Wishes subtitle' }, { key: 'rsvpWishesPlaceholder', label: 'Wishes placeholder' }, { key: 'rsvpStepAboutYou', label: 'Step 1 label' }, { key: 'rsvpStepDetails', label: 'Step 2 label' }, { key: 'rsvpStepWishes', label: 'Step 3 label' }, { key: 'rsvpSummaryTitle', label: 'Summary title' }, { key: 'rsvpSummaryNameLabel', label: 'Summary name label' }, { key: 'rsvpSummaryStatusLabel', label: 'Summary status label' }, { key: 'rsvpSummaryGuestsLabel', label: 'Summary guests label' }, { key: 'rsvpSummarySpecialLabel', label: 'Summary special-needs label' }, { key: 'rsvpSummaryDietaryLabel', label: 'Summary dietary label' }, { key: 'rsvpAttendingText', label: 'Attending status text' }, { key: 'rsvpNotAttendingText', label: 'Not attending status text' }, { key: 'rsvpBackButton', label: 'Back button' }, { key: 'rsvpContinueButton', label: 'Continue button' }, { key: 'rsvpConfirmButton', label: 'Confirm button' }, { key: 'rsvpSuccessYes', label: 'Attending success text' }, { key: 'rsvpSuccessNo', label: 'Not-attending success text' }, { key: 'rsvpReturnButton', label: 'Return to invitation button' }, { key: 'rsvpDeclineMessage', label: 'Decline sympathy message ({name} token)' }, { key: 'rsvpThankYouTitle', label: 'Thank-you title ({name} token)' }, { key: 'rsvpThankYouIntro', label: 'Thank-you intro sentence' }, { key: 'rsvpSubmitAnotherButton', label: 'Submit another response button' }, { key: 'rsvpWishesWallTitle', label: 'Wishes wall heading' }, { key: 'rsvpWishesEmptyText', label: 'Wishes wall empty text' }
] as const satisfies ReadonlyArray<{ key: keyof WeddingContent, label: string }>
export type RsvpTextKey = (typeof rsvpTextFields)[number]['key']
export interface RsvpPreset { id: string; label: string; texts: Partial<Pick<WeddingContent, RsvpTextKey>> }
export const builtInRsvpPresets: RsvpPreset[] = [
  {
    id: 'en',
    label: 'English',
    texts: {
      rsvpTitle: 'RSVP', rsvpDeadlineText: 'Kindly respond by', rsvpAttendQuestion: 'Will you be attending?', rsvpAttendYes: 'Joyfully Accept', rsvpAttendNo: 'Regretfully Decline',
      rsvpNameLabel: 'Name(s)', rsvpNamePlaceholder: 'Type your full name',
      rsvpGuestLabel: 'Number of guests attending', rsvpSeatingLabel: 'Do you require special seating? (e.g., wheelchair access)', rsvpSeatingYesLabel: 'Yes', rsvpSeatingNoLabel: 'No',
      rsvpDietaryLabel: 'Dietary restrictions (if any)', rsvpDietaryPlaceholder: 'e.g. Vegetarian, No Seafood',
      rsvpWishesLabel: 'Wishes & Blessings', rsvpWishesSubtitle: 'Write your well wishes for the couple', rsvpWishesPlaceholder: 'May your marriage be blessed...',
      rsvpStepAboutYou: 'About You', rsvpStepDetails: 'Details', rsvpStepWishes: 'Wishes',
      rsvpSummaryTitle: 'RSVP Summary', rsvpSummaryNameLabel: 'Name:', rsvpSummaryStatusLabel: 'Status:', rsvpSummaryGuestsLabel: 'Guests:', rsvpSummarySpecialLabel: 'Special:', rsvpSummaryDietaryLabel: 'Dietary:',
      rsvpAttendingText: 'Attending', rsvpNotAttendingText: 'Not Attending',
      rsvpBackButton: 'Back', rsvpContinueButton: 'Continue', rsvpConfirmButton: 'Confirm RSVP',
      rsvpSuccessYes: 'We are absolutely thrilled to celebrate with you.', rsvpSuccessNo: 'You will be dearly missed.',
      rsvpReturnButton: 'Return to Invitation',
      rsvpDeclineMessage: "We'll miss you, {name}! Feel free to leave us a wish on the next step.",
      rsvpThankYouTitle: 'Thank you, {name}!', rsvpThankYouIntro: 'Your RSVP has been securely received.',
      rsvpSubmitAnotherButton: 'Submit another response',
      rsvpWishesWallTitle: 'Wishes & Blessings', rsvpWishesEmptyText: 'Be the first to leave a wish 💛'
    }
  },
  {
    id: 'ms',
    label: 'Bahasa Melayu',
    texts: {
      rsvpTitle: 'RSVP / Pengesahan', rsvpDeadlineText: 'Sila sahkan kehadiran sebelum', rsvpAttendQuestion: 'Adakah anda akan hadir?', rsvpAttendYes: 'Ya, Akan Hadir', rsvpAttendNo: 'Maaf, Tidak Dapat Hadir',
      rsvpNameLabel: 'Nama', rsvpNamePlaceholder: 'Taip nama penuh anda',
      rsvpGuestLabel: 'Jumlah tetamu yang akan hadir', rsvpSeatingLabel: 'Adakah anda memerlukan tempat duduk khas? (cth: akses kerusi roda)', rsvpSeatingYesLabel: 'Ya', rsvpSeatingNoLabel: 'Tidak',
      rsvpDietaryLabel: 'Sekatan pemakanan (jika ada)', rsvpDietaryPlaceholder: 'cth. Vegetarian, Tiada Makanan Laut',
      rsvpWishesLabel: 'Ucapan & Doa Restu', rsvpWishesSubtitle: 'Tuliskan ucapan dan doa restu anda untuk pengantin', rsvpWishesPlaceholder: 'Semoga perkahwinan anda diberkati...',
      rsvpStepAboutYou: 'Maklumat Anda', rsvpStepDetails: 'Butiran', rsvpStepWishes: 'Ucapan',
      rsvpSummaryTitle: 'Ringkasan RSVP', rsvpSummaryNameLabel: 'Nama:', rsvpSummaryStatusLabel: 'Status:', rsvpSummaryGuestsLabel: 'Tetamu:', rsvpSummarySpecialLabel: 'Khas:', rsvpSummaryDietaryLabel: 'Pemakanan:',
      rsvpAttendingText: 'Akan Hadir', rsvpNotAttendingText: 'Tidak Hadir',
      rsvpBackButton: 'Kembali', rsvpContinueButton: 'Seterusnya', rsvpConfirmButton: 'Sahkan RSVP',
      rsvpSuccessYes: 'Kami amat teruja untuk meraikan bersama anda.', rsvpSuccessNo: 'Kehadiran anda amat dirindui.',
      rsvpReturnButton: 'Kembali ke Jemputan',
      rsvpDeclineMessage: 'Kehadiran anda amat dirindui, {name}! Jangan lupa tinggalkan ucapan di langkah seterusnya.',
      rsvpThankYouTitle: 'Terima kasih, {name}!', rsvpThankYouIntro: 'RSVP anda telah berjaya diterima.',
      rsvpSubmitAnotherButton: 'Hantar respons lain',
      rsvpWishesWallTitle: 'Ucapan & Doa Restu', rsvpWishesEmptyText: 'Jadilah yang pertama tinggalkan ucapan 💛'
    }
  }
]

export const detailsTextFields = [
  { key: 'detailsHeading', label: 'Details section heading' },
  { key: 'coupleDividerLabel', label: "Couple divider caption (e.g. 'Bride & Groom')" },
  { key: 'familyBrideLabel', label: 'Bride label' },
  { key: 'familyGroomLabel', label: 'Groom label' },
  { key: 'childOfLabel', label: "Family slide caption (e.g. 'Child of')" },
  { key: 'locationHeading', label: 'Location section heading' },
  { key: 'locationSubtitle', label: 'Location subtitle' },
  { key: 'locationMapsButtonLabel', label: 'Maps button label' },
  { key: 'calendarButtonLabel', label: "'Add to Calendar' button label" },
  { key: 'eventFlowHeading', label: 'Event schedule heading' }
] as const satisfies ReadonlyArray<{ key: keyof WeddingContent, label: string }>
export type DetailsTextKey = (typeof detailsTextFields)[number]['key']
export interface DetailsPreset { id: string; label: string; texts: Partial<Pick<WeddingContent, DetailsTextKey>> }
export const builtInDetailsPresets: DetailsPreset[] = [
  {
    id: 'en',
    label: 'English',
    texts: {
      detailsHeading: 'The Details',
      coupleDividerLabel: 'Bride & Groom',
      familyBrideLabel: 'Bride',
      familyGroomLabel: 'Groom',
      childOfLabel: 'Child of',
      locationHeading: 'Location',
      locationSubtitle: 'Scan or tap to open in Maps',
      locationMapsButtonLabel: 'Google Maps',
      calendarButtonLabel: 'Add to Calendar',
      eventFlowHeading: 'Event Flow'
    }
  },
  {
    id: 'ms',
    label: 'Bahasa Melayu',
    texts: {
      detailsHeading: 'Butiran Perkahwinan',
      coupleDividerLabel: 'Pengantin Perempuan & Pengantin Lelaki',
      familyBrideLabel: 'Pengantin Perempuan',
      familyGroomLabel: 'Pengantin Lelaki',
      childOfLabel: 'Anak kepada',
      locationHeading: 'Lokasi',
      locationSubtitle: 'Imbas atau ketik untuk buka dalam Peta',
      locationMapsButtonLabel: 'Google Maps',
      calendarButtonLabel: 'Tambah kepada Kalendar',
      eventFlowHeading: 'Atur Cara Majlis'
    }
  }
]

/** Platform controls for the couple dashboard. Routes and permissions stay
 * in source code; admin changes only labels and availability. */
export interface DashboardNavSetting {
  id: 'overview' | 'opening' | 'editor' | 'rsvp' | 'guests' | 'flow' | 'billing'
  label: string
  enabled: boolean
}

export interface DashboardSettings {
  navItems: DashboardNavSetting[]
  overviewEyebrow: string
  overviewTitle: string
  createCardTitle: string
  createCardDescription: string
}

export const defaultDashboardSettings: DashboardSettings = {
  navItems: [
    { id: 'overview', label: 'Overview', enabled: true },
    { id: 'opening', label: 'Opening Design', enabled: true },
    { id: 'editor', label: 'Design Studio', enabled: true },
    { id: 'rsvp', label: 'RSVP Editor', enabled: true },
    { id: 'guests', label: 'Guest List', enabled: true },
    { id: 'flow', label: 'Day Flow', enabled: true },
    { id: 'billing', label: 'Billing & Plans', enabled: true }
  ],
  overviewEyebrow: 'Dashboard Overview',
  overviewTitle: 'Dashboard Overview',
  createCardTitle: "Let's create your card",
  createCardDescription: 'You can change everything except your link name later.'
}

// The two presets that already existed as hardcoded buttons on the Opening
// Design page - kept as permanent built-ins alongside anything admins add.
export const builtInTextPresets: TextPreset[] = [
  { id: 'en', label: 'English', openingTitle: "You're Invited", openingGreeting: 'Dear {guestName}', openingActionText: 'Tap to open' },
  { id: 'ms', label: 'Bahasa Melayu', openingTitle: 'Walimatul Urus', openingGreeting: 'Menjemput {guestName} sekeluarga', openingActionText: 'Klik untuk buka' }
]

// Global Day Flow "quick start" templates - the two that already existed as
// hardcoded buttons on the Day Flow page, kept as permanent built-ins
// alongside anything admins add. Same pattern as builtInTextPresets above.
export interface FlowPreset {
  id: string
  label: string
  items: StarterFlowItem[]
}

export const builtInDayFlowPresets: FlowPreset[] = [
  {
    id: 'traditional-nikah-sanding',
    label: 'Traditional Nikah & Sanding',
    items: [
      { time: '10:00 AM', title: 'Ketibaan Tetamu', description: 'Para tetamu mula hadir.' },
      { time: '10:30 AM', title: 'Ketibaan Pengantin', description: 'Pengantin tiba berserta rombongan.' },
      { time: '11:00 AM', title: 'Majlis Akad Nikah', description: 'Upacara akad nikah bermula.' },
      { time: '1:00 PM', title: 'Jamuan Makan', description: 'Hidangan utama disajikan.' },
      { time: '2:00 PM', title: 'Sesi Bergambar', description: 'Bersama keluarga dan rakan-rakan.' }
    ]
  },
  {
    id: 'modern-evening-reception',
    label: 'Modern Evening Reception',
    items: [
      { time: '6:30 PM', title: 'Guest Arrival', description: 'Welcome drinks and mingling.' },
      { time: '7:30 PM', title: 'Grand Entrance', description: 'The couple arrives.' },
      { time: '8:00 PM', title: 'Dinner Served', description: 'Enjoy the feast.' },
      { time: '9:00 PM', title: 'Speeches & Toasts', description: 'Words from family and friends.' },
      { time: '9:30 PM', title: 'Cake Cutting', description: 'Followed by the first dance.' }
    ]
  }
]

/** Platform controls for the Day Flow page. Mirrors DashboardSettings'
 * label-only pattern - the page and its behaviour stay in source code. */
export interface DayFlowSettings {
  pageTitle: string
  pageDescription: string
}

export const defaultDayFlowSettings: DayFlowSettings = {
  pageTitle: 'Wedding Day Flow',
  pageDescription: 'Lay out your ceremony and reception run-of-show.'
}

/** Platform controls for the Guest List page - labels and which optional
 * columns are shown. The underlying guest data model is unchanged. */
export interface GuestListSettings {
  pageTitle: string
  pageDescription: string
  vipLabel: string
  generalLabel: string
  showSpecialSeating: boolean
  showDietary: boolean
}

export const defaultGuestListSettings: GuestListSettings = {
  pageTitle: 'Guest List',
  pageDescription: 'Manage invitations, RSVPs, and dietary requirements.',
  vipLabel: 'VIP',
  generalLabel: 'General',
  showSpecialSeating: true,
  showDietary: true
}

/**
 * Admin-authored CSS/HTML/JS injected onto every live wedding page.
 *
 * SAFETY DESIGN: this is rendered inside a sandboxed <iframe> (see
 * CustomCodeBlock.vue) with `sandbox="allow-scripts"` and NO
 * `allow-same-origin`. That combination means any script here runs in a
 * throwaway, opaque-origin document: it CANNOT read this site's cookies,
 * Firebase session, localStorage, or reach into the parent page's DOM (no
 * couples' data, no other visitors' data, no way to deface the rest of the
 * app). It CAN still run animations, fetch its own external resources, and
 * render arbitrary markup - full creative freedom, contained blast radius.
 * A broken or malicious paste can only break the sandboxed box itself.
 */
export interface CustomCode {
  enabled: boolean
  position: 'top' | 'bottom'
  css: string
  html: string
}

export const defaultCustomCode: CustomCode = {
  enabled: false,
  position: 'bottom',
  css: '',
  html: ''
}

interface PlatformCatalog {
  themes: Theme[]
  fonts: FontOption[]
  textPresets: TextPreset[]
  disabledOpeningStyles: string[]
  disabledOrnamentStyles: string[]
  disabledPetalStyles: string[]
  disabledTopIcons: string[]
  disabledDetailsLayoutStyles: string[]
  starterDefaults: StarterDefaults
  dashboardSettings: DashboardSettings
  rsvpPresets: RsvpPreset[]
  dayFlowPresets: FlowPreset[]
  dayFlowSettings: DayFlowSettings
  guestListSettings: GuestListSettings
  customCode: CustomCode
  // Admin edits to BUILT-IN entities, keyed by id. Merged over the hardcoded
  // baseline at read time (see all* computeds). Empty/absent = original.
  themeOverrides: Record<string, Partial<Theme>>
  fontOverrides: Record<string, Partial<FontOption>>
  textPresetOverrides: Record<string, Partial<TextPreset>>
  rsvpPresetOverrides: Record<string, Partial<RsvpPreset>>
  dayFlowPresetOverrides: Record<string, Partial<FlowPreset>>
  // Admin-defined color choices offered per design-option style. Key = style
  // value (e.g. 'botanical-corners'), value = array of hex colors a couple
  // can pick from for that style.
  ornamentColorTags: Record<string, string[]>
  petalColorTags: Record<string, string[]>
  topIconColorTags: Record<string, string[]>
  openingStyleConfigs: OpeningStyleConfig[]
}

export interface OpeningStyle {
  value: string
  label: string
  icon: string
}

/**
 * An admin-authorable opening style. `template` picks one of the fixed,
 * well-crafted renderer implementations in EnvelopeIntro.vue; everything else
 * is data (label, colors, timing) the admin composes in the UI. Built-in
 * styles are seeded as configs too, so new styles need no code.
 */
export interface OpeningStyleConfig {
  id: string
  label: string
  icon: string
  template: 'gradient-fade' | 'split-door' | 'confetti-burst' | 'blob-background'
  enabled: boolean
  bgFrom: string
  bgVia: string
  bgTo: string
  accent: string
  /** 0-1 dark tint over the background for text legibility */
  overlayTint: number
  durationMs: number
}

export const defaultOpeningStyleConfig = (): OpeningStyleConfig => ({
  id: '',
  label: '',
  icon: 'i-heroicons-sparkles',
  template: 'gradient-fade',
  enabled: true,
  bgFrom: '#04101f',
  bgVia: '#0b1c30',
  bgTo: '#142a45',
  accent: '#d4a017',
  overlayTint: 0.4,
  durationMs: 900
})

// The full set of opening-style animations that exist in code (each one is
// real CSS/animation logic in EnvelopeIntro.vue, not just data) - admins
// can't invent new ones here, but they CAN choose which of these couples
// are allowed to pick from. Kept here as the one shared source of truth so
// the admin toggle list and the dashboard's picker can never drift apart.
export const openingStyleCatalog: OpeningStyle[] = [
  { label: 'Classic Envelope', value: 'classic', icon: 'i-heroicons-envelope' },
  { label: 'Wax Seal', value: 'wax-seal', icon: 'i-heroicons-check-badge' },
  { label: 'Modern Dark', value: 'modern-dark', icon: 'i-heroicons-moon' },
  { label: 'Minimal Light', value: 'minimal-light', icon: 'i-heroicons-sun' },
  { label: 'Canva (Fade)', value: 'custom', icon: 'i-heroicons-photo' },
  { label: 'Canva (Split Door)', value: 'custom-split', icon: 'i-heroicons-arrows-right-left' },
  { label: 'Slide Up', value: 'slide-up', icon: 'i-heroicons-arrow-up' },
  { label: 'Slide Down', value: 'slide-down', icon: 'i-heroicons-arrow-down' },
  { label: 'Slide Left', value: 'slide-left', icon: 'i-heroicons-arrow-left' },
  { label: 'Slide Right', value: 'slide-right', icon: 'i-heroicons-arrow-right' },
  { label: 'Confetti Burst', value: 'confetti-burst', icon: 'i-heroicons-sparkles' },
]

// Curated color palettes for the Modern Dark and Minimal Light opening
// styles - real CSS gradients/blob colors applied in EnvelopeIntro.vue, not
// just labels. A couple picks one by id (WeddingContent.openingModernDarkPalette
// / openingMinimalLightPalette); an empty/unknown id falls back to the first
// entry so older cards keep today's look unchanged.
export interface OpeningPalette {
  id: string
  label: string
  swatch: string // small preview color for the picker button
  bgFrom: string
  bgVia: string
  bgTo: string
  blobPrimary: string
  blobSecondary: string
  ink?: string // text color override - only Minimal Light palettes use this
}

export const modernDarkPaletteCatalog: OpeningPalette[] = [
  { id: 'midnight', label: 'Midnight Blue', swatch: '#1d4ed8', bgFrom: '#0a192f', bgVia: '#112240', bgTo: '#020c1b', blobPrimary: '#1d4ed8', blobSecondary: '#e3b04a' },
  { id: 'wine', label: 'Deep Wine', swatch: '#9d174d', bgFrom: '#2a0a14', bgVia: '#3d0f1f', bgTo: '#0f0308', blobPrimary: '#9d174d', blobSecondary: '#e3b04a' },
  { id: 'emerald', label: 'Emerald Noir', swatch: '#059669', bgFrom: '#05201a', bgVia: '#0a2e24', bgTo: '#01100c', blobPrimary: '#059669', blobSecondary: '#e3b04a' },
  { id: 'onyx', label: 'Onyx Gold', swatch: '#e3b04a', bgFrom: '#161616', bgVia: '#1e1e1e', bgTo: '#060606', blobPrimary: '#e3b04a', blobSecondary: '#8a8a8a' }
]

export const minimalLightPaletteCatalog: OpeningPalette[] = [
  { id: 'ivory', label: 'Ivory', swatch: '#c9b48a', bgFrom: '#fdfcfb', bgVia: '#f6f3ee', bgTo: '#ece5d8', blobPrimary: '#c9b48a', blobSecondary: '#93c5fd', ink: '#1e293b' },
  { id: 'blush', label: 'Blush', swatch: '#f4b8c6', bgFrom: '#fdf2f8', bgVia: '#fbe4ee', bgTo: '#f6cfdf', blobPrimary: '#f4b8c6', blobSecondary: '#f9d4a8', ink: '#5b3a44' },
  { id: 'sage', label: 'Sage', swatch: '#a8c4a2', bgFrom: '#f5f8f2', bgVia: '#e8f0e2', bgTo: '#d8e6cf', blobPrimary: '#a8c4a2', blobSecondary: '#e3b04a', ink: '#374a35' },
  { id: 'champagne', label: 'Champagne', swatch: '#e3c27a', bgFrom: '#fffbf2', bgVia: '#faf0da', bgTo: '#f2e0bc', blobPrimary: '#e3c27a', blobSecondary: '#d9a5a5', ink: '#5b4636' }
]

// Same "toggle, don't author" pattern as openingStyleCatalog: each of these
// is real CSS/markup in CardOrnament.vue, PetalsBackground.vue, or the
// Cover/Inner icon template branches - admin controls which of these every
// couple is allowed to pick from in their own Design Studio.
export const ornamentStyleCatalog: OpeningStyle[] = [
  { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
  { label: 'Botanical Corners', value: 'botanical-corners', icon: 'i-heroicons-sparkles' },
  { label: 'Floral Wreath', value: 'floral-wreath', icon: 'i-heroicons-globe-alt' },
  { label: 'Minimal Arch', value: 'minimal-arch', icon: 'i-heroicons-stop' },
  { label: 'Art Deco', value: 'geometric-deco', icon: 'i-heroicons-viewfinder-circle' }
]

export const petalStyleCatalog: OpeningStyle[] = [
  { label: 'Petals', value: 'petals', icon: 'i-heroicons-sparkles' },
  { label: 'Confetti', value: 'confetti', icon: 'i-heroicons-squares-2x2' },
  { label: 'Hearts', value: 'hearts', icon: 'i-heroicons-heart' },
  { label: 'Sparkle', value: 'sparkles', icon: 'i-heroicons-star' },
  { label: 'Stars', value: 'stars', icon: 'i-heroicons-star' }
]

export const topIconCatalog: OpeningStyle[] = [
  { label: 'None', value: 'none', icon: 'i-heroicons-no-symbol' },
  { label: 'Bismillah (﷽)', value: 'bismillah', icon: 'i-heroicons-language' },
  { label: 'Interlocking Rings', value: 'rings', icon: 'i-heroicons-lifebuoy' },
  { label: 'Heart', value: 'heart', icon: 'i-heroicons-heart' },
  { label: 'Custom Upload', value: 'custom', icon: 'i-heroicons-arrow-up-tray' }
]

// Same "toggle, don't author" pattern as ornamentStyleCatalog/petalStyleCatalog:
// both templates are real markup/behavior on the guest-facing
// /w/[slug]/details page (see the `detailsLayoutStyle` branch in
// details.vue) - admin controls which of these a couple is allowed to pick
// from in their own Day Flow page (WeddingContent.detailsLayoutStyle).
export const detailsLayoutStyleCatalog: OpeningStyle[] = [
  { label: 'Classic Slideshow', value: 'classic', icon: 'i-heroicons-rectangle-stack' },
  { label: 'Menu Style (Tabs)', value: 'menu', icon: 'i-heroicons-book-open' }
]

// Merge an admin override partial over a built-in baseline. No override (or an
// empty one) returns the baseline untouched, so existing behavior is preserved.
function mergeOverride<T extends object>(base: T, override?: Partial<T>): T {
  if (!override) return base
  return { ...base, ...override }
}
function mergeThemeOverride(base: Theme, override?: Partial<Theme>): Theme {
  if (!override) return base
  return { ...base, ...override, palette: { ...base.palette, ...(override.palette || {}) } }
}
function mergeRsvpOverride(base: RsvpPreset, override?: Partial<RsvpPreset>): RsvpPreset {
  if (!override) return base
  return { ...base, ...override, texts: { ...base.texts, ...(override.texts || {}) } }
}

export function useThemes() {
  const { db, isConfigured } = useFirebase()

  // Shared across every component that calls useThemes() in this session,
  // so the catalog is only fetched from Firestore once, not once per call.
  const customThemes = useState<Theme[]>('catalog-themes', () => [])
  const customFonts = useState<FontOption[]>('catalog-fonts', () => [])
  const customTextPresets = useState<TextPreset[]>('catalog-text-presets', () => [])
  const disabledOpeningStyles = useState<string[]>('catalog-disabled-opening-styles', () => [])
  const disabledOrnamentStyles = useState<string[]>('catalog-disabled-ornament-styles', () => [])
  const disabledPetalStyles = useState<string[]>('catalog-disabled-petal-styles', () => [])
  const disabledTopIcons = useState<string[]>('catalog-disabled-top-icons', () => [])
  const disabledDetailsLayoutStyles = useState<string[]>('catalog-disabled-details-layout-styles', () => [])
  const starterDefaults = useState<StarterDefaults>('catalog-starter-defaults', () => ({ ...defaultStarterDefaults }))
  const dashboardSettings = useState<DashboardSettings>('catalog-dashboard-settings', () => structuredClone(defaultDashboardSettings))
  const customRsvpPresets = useState<RsvpPreset[]>('catalog-rsvp-presets', () => [])
  const customDayFlowPresets = useState<FlowPreset[]>('catalog-day-flow-presets', () => [])
  const dayFlowSettings = useState<DayFlowSettings>('catalog-day-flow-settings', () => structuredClone(defaultDayFlowSettings))
  const guestListSettings = useState<GuestListSettings>('catalog-guest-list-settings', () => structuredClone(defaultGuestListSettings))
  const customCode = useState<CustomCode>('catalog-custom-code', () => structuredClone(defaultCustomCode))
  const themeOverrides = useState<Record<string, Partial<Theme>>>('catalog-theme-overrides', () => ({}))
  const fontOverrides = useState<Record<string, Partial<FontOption>>>('catalog-font-overrides', () => ({}))
  const textPresetOverrides = useState<Record<string, Partial<TextPreset>>>('catalog-text-preset-overrides', () => ({}))
  const rsvpPresetOverrides = useState<Record<string, Partial<RsvpPreset>>>('catalog-rsvp-preset-overrides', () => ({}))
  const dayFlowPresetOverrides = useState<Record<string, Partial<FlowPreset>>>('catalog-day-flow-preset-overrides', () => ({}))
  const ornamentColorTags = useState<Record<string, string[]>>('catalog-ornament-color-tags', () => ({}))
  const petalColorTags = useState<Record<string, string[]>>('catalog-petal-color-tags', () => ({}))
  const topIconColorTags = useState<Record<string, string[]>>('catalog-top-icon-color-tags', () => ({}))
  const openingStyleConfigs = useState<OpeningStyleConfig[]>('catalog-opening-style-configs', () => [])
  const catalogFetched = useState('catalog-fetched', () => false)

  async function ensureCatalogLoaded() {
    if (catalogFetched.value || !isConfigured || !db) return
    catalogFetched.value = true
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(db, 'platformCatalog', 'catalog'))
      if (snap.exists()) {
        const data = snap.data() as Partial<PlatformCatalog>
        customThemes.value = Array.isArray(data.themes) ? data.themes : []
        customFonts.value = Array.isArray(data.fonts) ? data.fonts : []
        customTextPresets.value = Array.isArray(data.textPresets) ? data.textPresets : []
        disabledOpeningStyles.value = Array.isArray(data.disabledOpeningStyles) ? data.disabledOpeningStyles : []
        disabledOrnamentStyles.value = Array.isArray(data.disabledOrnamentStyles) ? data.disabledOrnamentStyles : []
        disabledPetalStyles.value = Array.isArray(data.disabledPetalStyles) ? data.disabledPetalStyles : []
        disabledTopIcons.value = Array.isArray(data.disabledTopIcons) ? data.disabledTopIcons : []
        disabledDetailsLayoutStyles.value = Array.isArray(data.disabledDetailsLayoutStyles) ? data.disabledDetailsLayoutStyles : []
        starterDefaults.value = data.starterDefaults ? { ...defaultStarterDefaults, ...data.starterDefaults } : { ...defaultStarterDefaults }
        if (data.dashboardSettings) {
          const savedItems = Array.isArray(data.dashboardSettings.navItems) ? data.dashboardSettings.navItems : []
          dashboardSettings.value = {
            ...defaultDashboardSettings,
            ...data.dashboardSettings,
            navItems: defaultDashboardSettings.navItems.map((defaultItem) => {
              const saved = savedItems.find((item) => item?.id === defaultItem.id)
              return { ...defaultItem, ...(saved || {}) }
            })
          }
        }
        customRsvpPresets.value = Array.isArray(data.rsvpPresets) ? data.rsvpPresets : []
        customDayFlowPresets.value = Array.isArray(data.dayFlowPresets) ? data.dayFlowPresets : []
        dayFlowSettings.value = data.dayFlowSettings ? { ...defaultDayFlowSettings, ...data.dayFlowSettings } : { ...defaultDayFlowSettings }
        guestListSettings.value = data.guestListSettings ? { ...defaultGuestListSettings, ...data.guestListSettings } : { ...defaultGuestListSettings }
        customCode.value = data.customCode ? { ...defaultCustomCode, ...data.customCode } : { ...defaultCustomCode }
        themeOverrides.value = data.themeOverrides && typeof data.themeOverrides === 'object' ? data.themeOverrides : {}
        fontOverrides.value = data.fontOverrides && typeof data.fontOverrides === 'object' ? data.fontOverrides : {}
        textPresetOverrides.value = data.textPresetOverrides && typeof data.textPresetOverrides === 'object' ? data.textPresetOverrides : {}
        rsvpPresetOverrides.value = data.rsvpPresetOverrides && typeof data.rsvpPresetOverrides === 'object' ? data.rsvpPresetOverrides : {}
        dayFlowPresetOverrides.value = data.dayFlowPresetOverrides && typeof data.dayFlowPresetOverrides === 'object' ? data.dayFlowPresetOverrides : {}
        ornamentColorTags.value = data.ornamentColorTags && typeof data.ornamentColorTags === 'object' ? data.ornamentColorTags : {}
        petalColorTags.value = data.petalColorTags && typeof data.petalColorTags === 'object' ? data.petalColorTags : {}
        topIconColorTags.value = data.topIconColorTags && typeof data.topIconColorTags === 'object' ? data.topIconColorTags : {}
        openingStyleConfigs.value = Array.isArray(data.openingStyleConfigs) ? data.openingStyleConfigs : []
      }
    } catch (error) {
      // Non-fatal: the app still works fine with just the built-in catalog.
      console.error('Could not load platform catalog', error)
    }
  }

  if (import.meta.client) ensureCatalogLoaded()

  async function saveCatalogField<K extends keyof PlatformCatalog>(field: K, value: PlatformCatalog[K]) {
    if (!db) throw new Error('Firebase is not configured')
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'platformCatalog', 'catalog'), { [field]: value }, { merge: true })
  }

  // Add AND edit both go through this one function: since it replaces any
  // existing entry with the same id before adding the new version, calling
  // it again with an existing id (and changed fields) is how an edit works.
  async function addCustomTheme(theme: Theme) {
    const next = [...customThemes.value.filter((t) => t.id !== theme.id), theme]
    await saveCatalogField('themes', next)
    customThemes.value = next
  }
  async function removeCustomTheme(themeId: string) {
    const next = customThemes.value.filter((t) => t.id !== themeId)
    await saveCatalogField('themes', next)
    customThemes.value = next
  }

  async function addCustomFont(font: FontOption) {
    const next = [...customFonts.value.filter((f) => f.id !== font.id), font]
    await saveCatalogField('fonts', next)
    customFonts.value = next
  }
  async function removeCustomFont(fontId: string) {
    const next = customFonts.value.filter((f) => f.id !== fontId)
    await saveCatalogField('fonts', next)
    customFonts.value = next
  }

  async function addTextPreset(preset: TextPreset) {
    const next = [...customTextPresets.value.filter((p) => p.id !== preset.id), preset]
    await saveCatalogField('textPresets', next)
    customTextPresets.value = next
  }
  async function removeTextPreset(presetId: string) {
    const next = customTextPresets.value.filter((p) => p.id !== presetId)
    await saveCatalogField('textPresets', next)
    customTextPresets.value = next
  }

  async function setOpeningStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledOpeningStyles.value.filter((v) => v !== styleValue)
      : [...disabledOpeningStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledOpeningStyles', next)
    disabledOpeningStyles.value = next
  }

  async function setOrnamentStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledOrnamentStyles.value.filter((v) => v !== styleValue)
      : [...disabledOrnamentStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledOrnamentStyles', next)
    disabledOrnamentStyles.value = next
  }

  async function setPetalStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledPetalStyles.value.filter((v) => v !== styleValue)
      : [...disabledPetalStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledPetalStyles', next)
    disabledPetalStyles.value = next
  }

  async function setTopIconEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledTopIcons.value.filter((v) => v !== styleValue)
      : [...disabledTopIcons.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledTopIcons', next)
    disabledTopIcons.value = next
  }

  async function setDetailsLayoutStyleEnabled(styleValue: string, enabled: boolean) {
    const next = enabled
      ? disabledDetailsLayoutStyles.value.filter((v) => v !== styleValue)
      : [...disabledDetailsLayoutStyles.value.filter((v) => v !== styleValue), styleValue]
    await saveCatalogField('disabledDetailsLayoutStyles', next)
    disabledDetailsLayoutStyles.value = next
  }

  async function addDayFlowPreset(preset: FlowPreset) {
    const next = [...customDayFlowPresets.value.filter((p) => p.id !== preset.id), preset]
    await saveCatalogField('dayFlowPresets', next)
    customDayFlowPresets.value = next
  }
  async function removeDayFlowPreset(id: string) {
    const next = customDayFlowPresets.value.filter((p) => p.id !== id)
    await saveCatalogField('dayFlowPresets', next)
    customDayFlowPresets.value = next
  }
  async function saveDayFlowSettings(next: DayFlowSettings) {
    await saveCatalogField('dayFlowSettings', next)
    dayFlowSettings.value = next
  }
  async function saveGuestListSettings(next: GuestListSettings) {
    await saveCatalogField('guestListSettings', next)
    guestListSettings.value = next
  }
  async function saveCustomCode(next: CustomCode) {
    await saveCatalogField('customCode', next)
    customCode.value = next
  }

  async function saveStarterDefaults(next: StarterDefaults) {
    await saveCatalogField('starterDefaults', next)
    starterDefaults.value = next
  }

  async function saveDashboardSettings(next: DashboardSettings) {
    await saveCatalogField('dashboardSettings', next)
    dashboardSettings.value = next
  }
  async function addRsvpPreset(preset: RsvpPreset) {
    const next = [...customRsvpPresets.value.filter((item) => item.id !== preset.id), preset]
    await saveCatalogField('rsvpPresets', next)
    customRsvpPresets.value = next
  }
  async function removeRsvpPreset(id: string) {
    const next = customRsvpPresets.value.filter((item) => item.id !== id)
    await saveCatalogField('rsvpPresets', next)
    customRsvpPresets.value = next
  }

  // ---- Built-in override helpers ----
  // Saving an override merges the partial over any existing override for that
  // id; resetting deletes the key so the entity falls back to its baseline.
  type OverrideField = 'themeOverrides' | 'fontOverrides' | 'textPresetOverrides' | 'rsvpPresetOverrides' | 'dayFlowPresetOverrides'
  async function saveOverride(field: OverrideField, state: ReturnType<typeof useState<Record<string, object>>>, id: string, partial: object) {
    const next = { ...state.value, [id]: { ...(state.value[id] || {}), ...partial } }
    await saveCatalogField(field, next as never)
    state.value = next
  }
  async function resetOverride(field: OverrideField, state: ReturnType<typeof useState<Record<string, object>>>, id: string) {
    const next = { ...state.value }
    delete next[id]
    await saveCatalogField(field, next as never)
    state.value = next
  }

  const saveThemeOverride = (id: string, p: Partial<Theme>) => saveOverride('themeOverrides', themeOverrides as never, id, p)
  const resetThemeOverride = (id: string) => resetOverride('themeOverrides', themeOverrides as never, id)
  const saveFontOverride = (id: string, p: Partial<FontOption>) => saveOverride('fontOverrides', fontOverrides as never, id, p)
  const resetFontOverride = (id: string) => resetOverride('fontOverrides', fontOverrides as never, id)
  const saveTextPresetOverride = (id: string, p: Partial<TextPreset>) => saveOverride('textPresetOverrides', textPresetOverrides as never, id, p)
  const resetTextPresetOverride = (id: string) => resetOverride('textPresetOverrides', textPresetOverrides as never, id)
  const saveRsvpPresetOverride = (id: string, p: Partial<RsvpPreset>) => saveOverride('rsvpPresetOverrides', rsvpPresetOverrides as never, id, p)
  const resetRsvpPresetOverride = (id: string) => resetOverride('rsvpPresetOverrides', rsvpPresetOverrides as never, id)
  const saveDayFlowPresetOverride = (id: string, p: Partial<FlowPreset>) => saveOverride('dayFlowPresetOverrides', dayFlowPresetOverrides as never, id, p)
  const resetDayFlowPresetOverride = (id: string) => resetOverride('dayFlowPresetOverrides', dayFlowPresetOverrides as never, id)

  async function saveOrnamentColorTags(styleValue: string, colors: string[]) {
    const next = { ...ornamentColorTags.value, [styleValue]: colors }
    await saveCatalogField('ornamentColorTags', next)
    ornamentColorTags.value = next
  }
  async function savePetalColorTags(styleValue: string, colors: string[]) {
    const next = { ...petalColorTags.value, [styleValue]: colors }
    await saveCatalogField('petalColorTags', next)
    petalColorTags.value = next
  }
  async function saveTopIconColorTags(styleValue: string, colors: string[]) {
    const next = { ...topIconColorTags.value, [styleValue]: colors }
    await saveCatalogField('topIconColorTags', next)
    topIconColorTags.value = next
  }

  // --- Admin-authored opening styles ---
  async function saveOpeningStyleConfig(config: OpeningStyleConfig) {
    const id = config.id || `os-${Date.now()}`
    const next = [...openingStyleConfigs.value.filter((c) => c.id !== id), { ...config, id }]
    await saveCatalogField('openingStyleConfigs', next)
    openingStyleConfigs.value = next
    return id
  }
  async function removeOpeningStyleConfig(id: string) {
    const next = openingStyleConfigs.value.filter((c) => c.id !== id)
    await saveCatalogField('openingStyleConfigs', next)
    openingStyleConfigs.value = next
  }
  function getOpeningStyleConfig(id: string | undefined | null): OpeningStyleConfig | undefined {
    return openingStyleConfigs.value.find((c) => c.id === id)
  }

  // What couples should actually see in the Opening Design picker - the
  // built-in catalog minus whatever admin has turned off.
  const enabledOpeningStyles = computed(() => [
    ...openingStyleCatalog.filter((s) => !disabledOpeningStyles.value.includes(s.value)),
    ...openingStyleConfigs.value
      .filter((c) => c.enabled)
      .map((c) => ({ value: c.id, label: c.label, icon: c.icon }))
  ])
  const enabledOrnamentStyles = computed(() => ornamentStyleCatalog.filter((s) => !disabledOrnamentStyles.value.includes(s.value)))
  const enabledPetalStyles = computed(() => petalStyleCatalog.filter((s) => !disabledPetalStyles.value.includes(s.value)))
  const enabledTopIcons = computed(() => topIconCatalog.filter((s) => !disabledTopIcons.value.includes(s.value)))
  // Falls back to the full catalog if admin has (accidentally) disabled every
  // style, so a couple's Day Flow page always has at least one to pick from.
  const enabledDetailsLayoutStyles = computed(() => {
    const filtered = detailsLayoutStyleCatalog.filter((s) => !disabledDetailsLayoutStyles.value.includes(s.value))
    return filtered.length > 0 ? filtered : detailsLayoutStyleCatalog
  })
  const allDayFlowPresets = computed(() => [
    ...builtInDayFlowPresets.map((p) => mergeOverride(p, dayFlowPresetOverrides.value[p.id])),
    ...customDayFlowPresets.value
  ])

  // The full, "what should actually render" lists - built-ins (with any admin
  // override merged on top) plus whatever admins have added. Every existing
  // call site that destructures the plain `themes`/`fontOptions` arrays keeps
  // working unchanged (those stay static exports below); anything that should
  // reflect admin additions/edits uses these.
  const allThemes = computed(() => [
    ...themes.map((t) => mergeThemeOverride(t, themeOverrides.value[t.id])),
    ...customThemes.value
  ])
  const allFontOptions = computed(() => [
    ...fontOptions.map((f) => mergeOverride(f, fontOverrides.value[f.id])),
    ...customFonts.value
  ])
  const allTextPresets = computed(() => [
    ...builtInTextPresets.map((p) => mergeOverride(p, textPresetOverrides.value[p.id])),
    ...customTextPresets.value
  ])
  const allRsvpPresets = computed(() => [
    ...builtInRsvpPresets.map((p) => mergeRsvpOverride(p, rsvpPresetOverrides.value[p.id])),
    ...customRsvpPresets.value
  ])

  function getTheme(themeId: string | undefined | null): Theme {
    return allThemes.value.find((theme) => theme.id === themeId) ?? themes.find((theme) => theme.id === DEFAULT_THEME_ID)!
  }

  // Single source of truth for "should this wedding's RSVP/Inner Card panel
  // render as a dark card, or tinted with its own theme colors" - used by
  // rsvp.vue, details.vue, and their admin preview mirrors so they can never
  // drift out of sync with each other. A couple's own WeddingContent.cardStyle
  // choice always wins; an empty/unset value falls back to the theme's own
  // defaultCardStyle (which only Matcha Strawberry sets to 'dark' today).
  function resolveCardStyle(themeId: string | undefined | null, override?: string | null): 'theme' | 'dark' {
    const theme = getTheme(themeId)
    // Locked themes ignore any saved per-wedding override, including a
    // stale 'dark' value saved back when the theme's own default forced a
    // dark card - see Theme.lockCardStyle.
    if (theme.lockCardStyle) return theme.defaultCardStyle === 'dark' ? 'dark' : 'theme'
    if (override === 'dark' || override === 'theme') return override
    return theme.defaultCardStyle === 'dark' ? 'dark' : 'theme'
  }

  function themeStyleVars(themeId: string | undefined | null, overrides?: ColorOverrides, fontFamily?: string, textWeight?: string) {
    const theme = getTheme(themeId)
    const bgFrom = overrides?.bgFrom || theme.palette.bgFrom
    const bgTo = overrides?.bgTo || theme.palette.bgTo
    const accent = overrides?.accent || theme.palette.accent

    // If the font string contains a comma or quote, it's a custom Google Font (e.g. "'Roboto', sans-serif")
    const isCustomFont = fontFamily && (fontFamily.includes(',') || fontFamily.includes("'") || fontFamily.includes('"'))
    const finalFont = isCustomFont ? fontFamily : `"${fontFamily || theme.headingFont}"`

    return {
      '--theme-bg-from': bgFrom,
      '--theme-bg-via': overrides?.bgFrom || overrides?.bgTo ? bgFrom : theme.palette.bgVia,
      '--theme-bg-to': bgTo,
      '--theme-accent': accent,
      '--theme-accent-soft': overrides?.accent ? hexToRgba(accent, 0.18) : theme.palette.accentSoft,
      '--theme-ink': theme.palette.ink,
      '--theme-on-accent': theme.palette.onAccent,
      '--theme-heading-font': finalFont,
      '--theme-text-weight': textWeight || '300',
      '--overlay-tint': String(theme.overlayTintOpacity ?? 0.4),
      '--overlay-shadow': inkIsDark(theme.palette.ink)
        ? '0 2px 16px rgba(255, 255, 255, 0.75), 0 2px 6px rgba(255, 255, 255, 0.85)'
        : '0 2px 12px rgba(0, 0, 0, 0.6), 0 2px 5px rgba(0, 0, 0, 0.75), 0 1px 2px rgba(0, 0, 0, 0.9)'
    }
  }

  return {
    themes,
    fontOptions,
    builtInTextPresets,
    builtInRsvpPresets,
    rsvpTextFields,
    builtInDetailsPresets,
    detailsTextFields,
    ensureCatalogLoaded,
    openingStyleCatalog,
    disabledOpeningStyles,
    enabledOpeningStyles,
    starterDefaults,
    saveStarterDefaults,
    dashboardSettings,
    saveDashboardSettings,
    allThemes,
    allFontOptions,
    allTextPresets,
    allRsvpPresets,
    getTheme,
    resolveCardStyle,
    themeStyleVars,
    addCustomTheme,
    removeCustomTheme,
    addCustomFont,
    removeCustomFont,
    addTextPreset,
    removeTextPreset,
    addRsvpPreset,
    removeRsvpPreset,
    setOpeningStyleEnabled,
    ornamentStyleCatalog,
    petalStyleCatalog,
    topIconCatalog,
    disabledOrnamentStyles,
    disabledPetalStyles,
    disabledTopIcons,
    enabledOrnamentStyles,
    enabledPetalStyles,
    enabledTopIcons,
    setOrnamentStyleEnabled,
    setPetalStyleEnabled,
    setTopIconEnabled,
    builtInDayFlowPresets,
    allDayFlowPresets,
    addDayFlowPreset,
    removeDayFlowPreset,
    dayFlowSettings,
    saveDayFlowSettings,
    guestListSettings,
    saveGuestListSettings,
    customCode,
    saveCustomCode,
    themeOverrides,
    fontOverrides,
    textPresetOverrides,
    rsvpPresetOverrides,
    dayFlowPresetOverrides,
    saveThemeOverride,
    resetThemeOverride,
    saveFontOverride,
    resetFontOverride,
    saveTextPresetOverride,
    resetTextPresetOverride,
    saveRsvpPresetOverride,
    resetRsvpPresetOverride,
    saveDayFlowPresetOverride,
    resetDayFlowPresetOverride,
    ornamentColorTags,
    petalColorTags,
    topIconColorTags,
    saveOrnamentColorTags,
    savePetalColorTags,
    saveTopIconColorTags,
    openingStyleConfigs,
    saveOpeningStyleConfig,
    removeOpeningStyleConfig,
    getOpeningStyleConfig,
    detailsLayoutStyleCatalog,
    disabledDetailsLayoutStyles,
    enabledDetailsLayoutStyles,
    setDetailsLayoutStyleEnabled
  }
}
