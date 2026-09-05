export default defineNuxtConfig({
  compatibilityDate: '2026-07-18',

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  // Hub and Home Studio default to light; wedding-platform routes force
  // 'dark' from app/plugins/route-color-mode.ts.
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    experimental: { processCSSVariables: false },
    providers: {
      google: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      googleicons: false
    }
  },

  // Forces every response to skip HTTP/CDN caching entirely. Added because
  // the VIP dashboard was intermittently showing stale content after
  // deploys - this removes any caching layer as a possible cause, at the
  // cost of a little raw performance (fine for a low-traffic app like this).
  routeRules: {
    '/**': {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Idayu Ismail — Designer & Creator',
      meta: [
        { name: 'description', content: 'The personal home of Idayu Ismail: WeddingCard invitation platform, portfolio, and the Home Studio house designer.' },
        { name: 'theme-color', content: '#04101f' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        // Both declared: some browsers (older Safari in particular) don't
        // honor an SVG favicon and silently fall back to /favicon.ico -
        // that file itself is now also a real render of the same logo
        // (public/favicon.ico), not the old default Nuxt/ring icon.
        // ?v=2 query strings: browsers cache favicons far more stubbornly
        // than ordinary assets, sometimes keeping the old one even after
        // the file at the same URL changes - bump this suffix any time the
        // favicon image itself changes again, to force every browser to
        // treat it as a new resource instead of reusing its old icon.
        { rel: 'icon', type: 'image/svg+xml', href: '/idayuismail-logo.svg?v=3' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=3' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  runtimeConfig: {
    // Server-only: ToyyibPay credentials must never reach the browser.
    toyyibpaySecretKey: process.env.NUXT_TOYYIBPAY_SECRET_KEY || '',
    toyyibpayCategoryCode: process.env.NUXT_TOYYIBPAY_CATEGORY_CODE || '',
    // Sandbox: https://dev.toyyibpay.com | Production: https://toyyibpay.com
    toyyibpayBaseUrl: process.env.NUXT_TOYYIBPAY_BASE_URL || 'https://dev.toyyibpay.com',
    // Stringified Firebase service-account JSON (Firebase Admin SDK), used by
    // the payments API routes to verify ID tokens and write plan upgrades.
    firebaseServiceAccountJson: process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON || '',
    // Optional Papago (Naver) translation keys for the RSVP translation assist.
    papagoClientId: process.env.PAPAGO_CLIENT_ID || '',
    papagoClientSecret: process.env.PAPAGO_CLIENT_SECRET || '',

    // Google Cloud OAuth Client (Web application type) for the per-couple
    // "Connect Google Drive" feature on the Guest List page. Create one at
    // https://console.cloud.google.com/apis/credentials, enable the Google
    // Drive API for that project, and add googleRedirectUri below as an
    // authorized redirect URI on the OAuth Client. See server/utils/google-drive.ts.
    googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET || '',
    // Must exactly match an "Authorized redirect URI" on the Google OAuth
    // Client, e.g. https://yourdomain.com/api/drive/callback
    googleRedirectUri: process.env.NUXT_GOOGLE_REDIRECT_URI || '',

    // Resend (https://resend.com) API key + a "from" address on a domain
    // verified in that Resend account - used for the countdown-end guest
    // list export email. See server/utils/resend-email.ts.
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    resendFromEmail: process.env.NUXT_RESEND_FROM_EMAIL || '',

    // Shared secret an external scheduler (Vercel Cron / Google Cloud
    // Scheduler / cron-job.org) must send as the `x-cron-secret` header to
    // trigger /api/cron/send-post-wedding-exports. Pick any long random
    // string - it never needs to be shared with anyone but that scheduler.
    cronSecret: process.env.NUXT_CRON_SECRET || '',

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      recaptchaEnterpriseSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY || '',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
    }
  }
})
