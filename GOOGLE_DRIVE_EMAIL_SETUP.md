# Google Drive + Email export setup

This covers the external setup needed to turn on the two Guest List features:
"Connect Google Drive" (Save to Drive) and the automatic countdown-end guest
list email. All the code is already built and wired up (see
`server/api/drive/*`, `server/api/cron/send-post-wedding-exports.post.ts`,
`server/utils/google-drive.ts`, `server/utils/resend-email.ts`, and the
Google Drive panel on the Guest List page) - what's left is creating a few
credentials and adding them as environment variables.

## 1. Google Cloud OAuth Client (for "Connect Google Drive")

Each couple connects their *own* Google Drive - your app just needs one
OAuth Client so Google knows to trust it.

1. Go to https://console.cloud.google.com/ and create a project (or reuse an
   existing one).
2. **APIs & Services > Library** - enable the **Google Drive API**.
3. **APIs & Services > OAuth consent screen** - set it up as "External",
   fill in the app name/support email. While testing, you can add your own
   Google account under "Test users" so you don't need Google's full app
   review. (Full review is only required before opening this to the public
   with unverified scopes - `drive.file` is a low-sensitivity scope, so
   review is usually quick if/when you do need it.)
4. **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `https://YOURDOMAIN.com/api/drive/callback`
     (must match exactly, including https and no trailing slash)
5. Copy the **Client ID** and **Client Secret**.

Add these as environment variables (Vercel: Project Settings > Environment
Variables; Firebase Functions: `firebase functions:config:set` or your
`.env` depending on how you deploy):

```
NUXT_GOOGLE_CLIENT_ID=...
NUXT_GOOGLE_CLIENT_SECRET=...
NUXT_GOOGLE_REDIRECT_URI=https://YOURDOMAIN.com/api/drive/callback
```

## 2. Resend (for the countdown-end email)

1. Sign up at https://resend.com.
2. **Domains** - add and verify a domain you own (follow their DNS
   instructions - a few DNS records, usually verifies within minutes to a
   few hours).
3. **API Keys** - create one.

```
NUXT_RESEND_API_KEY=re_...
NUXT_RESEND_FROM_EMAIL=weddings@yourdomain.com
```

`NUXT_RESEND_FROM_EMAIL` must be an address on the domain you verified in
step 2 (e.g. `weddings@yourdomain.com`).

## 3. Cron secret + scheduler

The countdown-end email is sent by `POST /api/cron/send-post-wedding-exports`,
which is meant to be called once a day by an external scheduler - it isn't
triggered by anything inside the app. It requires a header
`x-cron-secret: <your secret>` to prevent random people from triggering it.

```
NUXT_CRON_SECRET=<any long random string you make up>
```

Then set up ONE of these to call it daily:

- **Vercel Cron** (if hosting on Vercel) - add to `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/send-post-wedding-exports", "schedule": "0 3 * * *" }] }
  ```
  Note: Vercel Cron sends GET by default to the path, but this route only
  accepts POST and needs the secret header - Vercel Cron can't add custom
  headers, so for Vercel you'll want a small wrapper GET route, or use
  cron-job.org instead (below), which can set headers.
- **cron-job.org** (free, works with any host) - create a job hitting
  `https://YOURDOMAIN.com/api/cron/send-post-wedding-exports` as POST once a
  day, with a custom header `x-cron-secret: <your secret>`.
- **Google Cloud Scheduler** - similar, if you're already on Firebase/GCP.

## 4. Deploy the updated Firestore rules

```
firebase deploy --only firestore:rules
```

This makes the new `driveConnections` and `driveOAuthStates` collections
explicitly deny all client access (they hold OAuth tokens - only the
server's Admin SDK ever touches them). Note: even without deploying this,
those collections were never reachable by clients anyway, since no rule
ever granted access to them - this just makes the intent explicit and
future-proof.

## What happens without any of this configured

Nothing breaks. The "Connect Google Drive" button will show a clear error
("Google Drive is not configured on this server yet...") instead of
connecting, and the daily cron endpoint returns `{ skipped: '...' }` instead
of sending anything, until the corresponding environment variables are set.

## One assumption worth knowing

The countdown-end email goes to the **couple's own account email** (the
address they signed up with) with the CSV + PDF guest list attached - not to
each individual guest. Guest emails (now collected via the optional Email
field when adding/importing guests) aren't used by this automation; they're
just there for you to use later if you ever want per-guest emails for
something else.
