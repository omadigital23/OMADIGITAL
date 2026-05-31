# OMA Digital

Production Next.js app for OMA Digital: bilingual agency website, SEO landing pages, lead capture, AI chat, PWA install, and offline support.

## Stack

- Next.js App Router 16
- React 19
- TypeScript strict
- Tailwind CSS 4
- next-intl
- Supabase SSR/Admin
- Groq SDK
- Nodemailer
- Vitest
- Playwright

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run audit
npm run quality
```

`npm run quality` is the required local gate before pushing: lint, typecheck, unit tests, production build, and security audit.

## Environment

Copy `.env.local.example` to `.env.local` and fill the production values.

Important server-only secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `SMTP_PASSWORD`
- `CALLMEBOT_API_KEY`

Never expose server-only secrets with a `NEXT_PUBLIC_` prefix.

## Database

Supabase migrations live in `supabase/migrations`.

The app expects:

- RLS enabled on exposed tables.
- Public form writes routed through Next.js API routes.
- Distributed rate limiting through `public.consume_rate_limit(...)` backed by `private.rate_limits`.

When the Supabase CLI is available, create future migrations with:

```bash
supabase migration new descriptive_name
```

## Quality Standard

Every change should keep:

- `npm run quality` green.
- `npm audit` at 0 known vulnerabilities where the ecosystem allows it.
- Server secrets isolated behind `server-only` modules.
- User input validated on the server.
- SEO alternates, sitemap, robots, metadata, and structured data consistent.
- PWA install/offline behavior verified on a Chromium browser.
