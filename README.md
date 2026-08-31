# IdayuIsmail — one site, two apps

This project merges two of my projects into **a single website with a single deploy**:

| Path | App | What it is |
|---|---|---|
| `/` | **WeddingCard platform** | The Nuxt 4 wedding-invitation & RSVP platform (Firebase, ToyyibPay, super-admin) |
| `/portfolio` | **Personal portfolio** | My personal site (React + Vite, content in Turso, "Ask about Idayu" chat) |

Visitors land on the WeddingCard platform at the root. My personal portfolio lives at `/portfolio` on the same domain, backed by the same server and the same deployment.

## How it's wired

- The **Nuxt app is the host** and owns the root (`/`). Nothing about the wedding platform changed — all its `/api/*` routes still work exactly as before.
- The **portfolio is built as a static SPA** into `public/portfolio/` (Vite `base: '/portfolio/'`), so Nuxt serves it from the `/portfolio` subpath.
- The portfolio's backend (profile, projects, journey, learning, moments, chat, translate, admin auth) is **ported into Nitro** under `server/api/portfolio/**`, reading the same Turso database the standalone portfolio used.
- A Nitro SPA-fallback route (`server/routes/portfolio/**`) serves the portfolio's `index.html` for deep links like `/portfolio/admin`, so refresh and direct links work. The HTML is bundled into the server build (`server/generated/portfolio-index.ts`), so it also works on serverless deploys.

## Run it locally

```bash
npm install
npm run build:portfolio   # builds the portfolio SPA into public/portfolio/
npm run dev               # Nuxt dev server on :3000
```

Then open:
- `http://localhost:3000/` → WeddingCard platform
- `http://localhost:3000/portfolio` → personal portfolio

While iterating on portfolio UI, run `npm run dev:portfolio` in a second terminal to rebuild it on change.

## Environment

All env vars live in one root `.env` (see `.env.example` for the full commented list):

- **Wedding platform** — `NUXT_*` vars: Firebase public config, `NUXT_ADMIN_PASSWORD`, `NUXT_ADMIN_SESSION_SECRET`, Cloudinary, Resend, ToyyibPay, Google OAuth, `NUXT_FIREBASE_SERVICE_ACCOUNT_JSON`.
- **Portfolio** — `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_API_KEY`, `ANTHROPIC_API_KEY`.

## Deploy (one Vercel project)

Create a single Vercel project pointing at this repo root:
- Framework: **Nuxt** (Node 22.x)
- Build command: `npm run build` (it builds the portfolio first, then Nuxt)
- Set every env var from `.env.example` in the Vercel dashboard.

That's it — one deploy serves both apps on one URL.

## One-time Firebase console steps (new project `idayuismail-e4526`)

1. Authentication → Sign-in method → enable **Email/Password**.
2. Firestore Database → **Create database** (enables the Firestore API), then `firebase deploy --only firestore:indexes`.
3. Project settings → Service accounts → **Generate new private key**, paste the JSON into `NUXT_FIREBASE_SERVICE_ACCOUNT_JSON`.

The new Firestore starts empty; existing weddings live in the old project and can be migrated separately if desired.
