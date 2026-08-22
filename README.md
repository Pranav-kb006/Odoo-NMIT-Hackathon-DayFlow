# Dayflow — HRMS

> Every workday, perfectly aligned.

Odoo × NMIT hackathon build. Multi-tenant HRMS: attendance, leave, employees, dashboards — built in 8 hours by 4 people on Next.js + Supabase.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Zod · Vercel

## Quick Start

```bash
pnpm install
cp .env.example .env.local    # ask team lead for values
pnpm supabase:push            # create schema
pnpm db:seed                  # demo company, users, attendance
pnpm dev                      # http://localhost:3000
```

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@acme.test | see seed.sql |
| Employee | employee@acme.test | see seed.sql |

## Docs

Everything is in [`docs/`](docs/). Read in this order:

1. [PRD](docs/PRD.md) — scope contract. If it's not here, we're not building it.
2. [Backend Structure](docs/BACKEND_STRUCTURE.md) — schema + RLS, the data law.
3. [App Flow](docs/APP_FLOW.md) — every route and navigation path.
4. [Design](docs/DESIGN.md) — tokens and component rules.
5. [Tech Stack](docs/TECH_STACK.md) — locked versions.
6. [Roles](docs/ROLES.md) — who owns what.

## Team

| Person | Domain |
|---|---|
| Pranav | Lead / Auth + Integrations |
| Builder 2 | Attendance + Leave |
| Builder 3 | Employees + Directory |
| Builder 4 | Dashboard + Design System |

## License

MIT — hackathon code, do whatever.
