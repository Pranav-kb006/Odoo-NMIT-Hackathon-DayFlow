# CLAUDE.md — Dayflow

Hackathon repo (Odoo × NMIT, 8 hours, 4 builders). Read `docs/PRD.md` first — it's the scope contract. Then your domain files.

## The Rules

1. **Scope is frozen.** If it's not in PRD.md, don't build it. Cool ideas go in a note, not the codebase.
2. **Contracts are frozen.** Table/column names and API shapes in `docs/BACKEND_STRUCTURE.md` are law. Need a change? Announce in team chat before you code it.
3. **One owner per domain.** See `docs/ROLES.md`. Don't touch another domain's files even to "fix" them — ping the owner.
4. **Small commits, conventional messages:** `feat(leave): approve flow`, `fix(auth): redirect loop`.
5. **Never commit `.env.local`.** Secrets live in Vercel dashboard + team vault, not git.
6. **TypeScript strict.** No `any` without a comment explaining why.
7. **Stuck > 20 minutes?** Ask in chat with the exact error + what you tried. Don't silently grind.

## Stack

Next.js 14 App Router · TypeScript strict · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage) · Zod for form validation · deploy on Vercel. Exact versions: `docs/TECH_STACK.md`.

## Layout

```
docs/           PRD, architecture, design, roles — read before you build
supabase/       migrations + seed.sql (schema is versioned, never edited by hand)
src/app/        routes only — thin pages that compose components
src/components/ ui/ = shared primitives; <domain>/ = feature components
src/lib/        supabase clients, auth helpers, csv parser, zod schemas
```

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill from team vault
pnpm supabase:push           # apply migrations
pnpm db:seed                 # demo company + users
pnpm dev
```

## Definition of Done

- Feature works against local schema with seed data
- `pnpm build` passes, no TS errors
- RLS behavior verified for both admin and employee roles
- Empty + loading states handled
