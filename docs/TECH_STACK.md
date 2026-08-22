# TECH_STACK.md — Dayflow (LOCKED — exact versions, no substitutions mid-build)

## Core

| Package | Version | Notes |
|---|---|---|
| next | ^14.2.x | App Router only — no pages/ directory |
| react / react-dom | ^18.3.x | |
| typescript | ^5.5.x | strict: true |

## Backend

| Service | Notes |
|---|---|
| @supabase/supabase-js | ^2.x — client SDK |
| @supabase/ssr | ^0.5.x — cookie-based session handling for App Router |
| Supabase project | Postgres + Auth + Storage. Run migrations from `supabase/migrations/`. |

## UI

| Package | Version | Notes |
|---|---|---|
| tailwindcss | ^3.4.x | |
| shadcn/ui | latest (CLI-installed components land in `src/components/ui/`) |
| lucide-react | latest | icons only — no other icon set |

## Deploy & Hosting

- Vercel — env vars configured in dashboard (do NOT rely on local `.env`)
- GitHub — repo of record

## Environment Variables (`.env.local`, never commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, NEVER expose to client
```

## Rules
- No additional state-management library (React context + server components are enough for this scope).
- No form library unless agreed — native forms + server actions are fine for hackathon speed.
- No date library — use `Intl.DateTimeFormat` / native Date.
- Any new dependency requires a one-line edit here first.
