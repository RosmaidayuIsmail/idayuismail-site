# Rosmaidayu Ismail — personal site (database-backed)

React + Vite frontend, Vercel serverless API routes, Turso (libSQL/SQLite)
database. This is the complete, debugged version — every fix from our setup
session is already applied.

## 1. Set up Turso

Skip this for local testing — with no Turso env vars set, the app
automatically uses a local SQLite file instead. Set it up when you're ready
for real data:

```bash
turso db create rosmaidayu-site
turso db show rosmaidayu-site --url
turso db tokens create rosmaidayu-site
```
(Or do the same from the app.turso.tech dashboard.)

## 2. Configure environment variables

```bash
cp .env.example .env
```
Fill in `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (from step 1), and
`ADMIN_API_KEY` (make up any long random string — it's your own password for
adding/editing content, not something you get from anywhere external).

## 3. Install, seed, and run

```bash
npm install
npm run seed
npm run dev:full
```

First run of `npm run dev:full` will ask you to log into Vercel CLI (opens
your browser) and link the folder to a project — choose **"Create a new
project"**, accept the defaults, answer **No** to "Customize settings?".

It'll then print `Ready! Available at http://localhost:3000`.

## 4. Add or update content

Go to `localhost:3000/admin`, paste in your `ADMIN_API_KEY`, and use the
forms there to add/edit/delete projects, learning entries, and your profile.

## 5. Deploy to production

Before deploying, restore the SPA routing config:
```bash
mv vercel.json.for-production-deploy-only vercel.json
```
(It's named that way on purpose — this file actively breaks local `vercel
dev` if present, so it's kept renamed until you're ready to actually deploy.)

Then push to GitHub and import the repo into vercel.com, adding the same
three environment variables from your `.env` file in the project's
Environment Variables settings.

## Fixes already applied in this version

- `package.json`: `dev` runs plain Vite, `dev:full` runs `vercel dev` — 
  having both point to `vercel dev` causes an infinite recursion error
- `seed` script uses `node --env-file=.env` so it actually writes to Turso
  instead of silently falling back to a local file
- `vercel.json` is renamed to `.for-production-deploy-only` since its SPA
  rewrite rule breaks Vite's dev asset serving locally — restore it before
  deploying (step 5 above)
- `About`, `Work`, and `Learning` sections always render (with a brief
  "Loading…" state) instead of vanishing entirely while their data is still
  being fetched — fixes anchor links/nav clicks landing on nothing during
  that window

## Project structure

```
├── api/                    # Vercel serverless functions (backend)
│   ├── profile.js
│   ├── projects/{index,[slug]}.js
│   └── learning/{index,[slug]}.js
├── lib/
│   ├── db.js                 # Turso client + schema
│   └── auth.js                # API-key check + slugify helper
├── scripts/seed.js            # populates real starter data
├── src/
│   ├── App.jsx                 # routes
│   ├── pages/
│   │   ├── Home.jsx             # fetches + renders all sections
│   │   ├── WorkDetail.jsx        # /work/:slug
│   │   ├── LearningDetail.jsx    # /learning/:slug
│   │   └── Admin.jsx             # /admin — content management
│   ├── components/              # Header, Hero, About, Work, Learning, Services, Footer, SkillsMarquee, MobileMenu, SealCallout
│   ├── hooks/useApi.js           # fetch wrapper hook
│   └── data/content.js           # static UI strings only (nav labels etc.)
├── vercel.json.for-production-deploy-only
└── .env.example
```

## The API key

`/admin` and any write request need a matching `x-api-key` header — a single
shared password, not real user accounts. Fine for a personal site with one
owner; just don't share it publicly.
