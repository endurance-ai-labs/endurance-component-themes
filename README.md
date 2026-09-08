# Endurance component themes

Internal Foundations gallery: CRM ink, Looking Glass remaps, and light/dark pairs.

The gallery is a small Next.js app. Unauthenticated requests are sent to
`/sign-in`. Endurance Google accounts (`@endurancelabs.ai`) can open it after
sign-in. Vercel SSO cannot protect production on this plan, so the app owns
the lock.

Live: https://endurance-component-themes-gallery.vercel.app

## How access works

Same model as endurance-crm:

1. Google OAuth (`openid email profile`) with `hd=endurancelabs.ai` as a hint.
2. The callback verifies the ID token (signature, issuer, audience,
   `email_verified`) and then applies `ALLOWED_EMAIL_DOMAIN`.
3. A signed `session` cookie (7 days) is set. Next 16 `proxy.ts` (the session
   gate, same job as middleware) rejects anything without a valid cookie.
4. The existing gallery HTML is served as the authenticated home page. It is
   kept in `content/gallery.html`, not `public/`, so a static file cannot
   bypass the cookie.

## Environment variables

Reuse the CRM / UI Library names:

| Name | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Web client secret |
| `SESSION_SECRET` | Signs the session cookie. `openssl rand -base64 32` |
| `ALLOWED_EMAIL_DOMAIN` | `endurancelabs.ai` on production |

Set all four on the Vercel project `endurance-component-themes-gallery`,
Production environment. Preview can use the same Google pair plus an optional
`DEV_LOGIN_EMAIL` (ignored on production).

## Google redirect URIs

In [Google Cloud credentials](https://console.cloud.google.com/apis/credentials),
add these Authorised redirect URIs to the Web client. Google does not accept
wildcards.

Production:

```
https://endurance-component-themes-gallery.vercel.app/api/auth/google/callback
```

Local:

```
http://localhost:3000/api/auth/google/callback
```

This project has no custom domain today. If one is attached later, add:

```
https://<custom-domain>/api/auth/google/callback
```

You can reuse the CRM Google client: add the gallery callback on that client
and copy `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Or register a gallery-only
client. Either way, the env var names stay the same.

## Local

```bash
cp .env.example .env.local
# For laptop sign-in without Google, keep DEV_LOGIN_EMAIL on the allowed domain.
npm install
npm run dev
```

`npm run dev` at http://localhost:3000 should send you to `/sign-in`.
`npm run test` covers the domain gate, public-path list, and gallery content.

## Deploy notes

Vercel project: `endurance-component-themes-gallery`, linked to this repo.
Vercel should treat this as Next.js (`vercel.json` pins `framework: nextjs`).
The gallery stays locked without env vars. Google sign-in works after the
four auth env vars are set on Production.
