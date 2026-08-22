# ROLES.md — Dayflow

4 builders, 8 hours. Owner of a domain is the only one who touches its files. Interfaces are the contracts in `docs/BACKEND_STRUCTURE.md` and `docs/TECH_STACK.md` — if you need to break one, say it in Discord **before** coding, not after.

## Pranav — Team Lead / Integrations + Auth
Owns: `src/lib/supabase/*`, `src/lib/auth.ts`, `middleware.ts`, `.github/workflows/ci.yml`
- Supabase client setup (browser + server helpers), env plumbing
- Signup/login/logout flows wired to `companies` + `profiles`
- Role helper (`getCurrentProfile()`), route protection middleware
- CI workflow, Vercel deploy, seed script runner
- Unblocks everyone — do this FIRST, ship client helpers within hour 1

## Builder 2 — Attendance + Leave
Owns: `src/app/(dashboard)/attendance/*`, `src/app/(dashboard)/leave/*`, `src/components/attendance/*`
- Check-in/check-out UI + today-status card
- Leave apply form, team leave list (admin), approve/reject actions
- Calendar-days balance computation per BACKEND_STRUCTURE §leave
- Depends on: auth helpers from Pranav (hour 1)

## Builder 3 — Employees + Directory
Owns: `src/app/(dashboard)/employees/*`, `src/components/employees/*`, `src/lib/csv.ts`
- Employee table (list, search, filter by department/status)
- Add/edit employee modal, profile detail drawer
- CSV import/export (client-side parse, bulk insert)
- Org stats cards for admin dashboard header

## Builder 4 — Dashboard + Design System
Owns: `src/app/page.tsx`, `src/app/(dashboard)/layout.tsx`, `src/components/ui/*`, `tailwind.config.ts`, `src/app/globals.css`
- Landing page, login/signup shells (visuals only — Pranav wires logic)
- Sidebar/topbar layout, design tokens from DESIGN.md
- Shared primitives: Button, Card, Input, Modal, Table, Badge, EmptyState
- Admin vs employee dashboard views (stats grid, quick actions)
- Ship ui primitives by hour 2 — everyone else consumes them

## Sync Rules
- Standup every 2 hours, 5 min max, in voice
- Blocked > 20 min → ping the interface owner, don't improvise a workaround
- Commits: small, conventional (`feat(leave): approve flow`), push to your branch, PR into `main`
- Branch naming: `feat/<domain>-<thing>`, e.g. `feat/leave-approval`

## Hour Targets
| Hour | Milestone |
|---|---|
| H1 | Auth works end-to-end, schema migrated, ui primitives drafted |
| H3 | All CRUD flows functional behind auth |
| H5 | Dashboards assembled, roles enforced |
| H7 | Polish pass: empty states, loading skeletons, mobile |
| H8 | Deploy verified on Vercel, demo script rehearsed |
