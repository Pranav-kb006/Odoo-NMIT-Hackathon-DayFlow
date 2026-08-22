# Dayflow demo script — 3 minutes, rehearse once before judges

## Setup before demo
- `pnpm db:seed` done, Vercel deploy live, hard-refresh browser
- Two browser windows: admin (admin@acme.test) + employee (ravi@acme.test), both logged in
- Backup: screenshots of every screen in `docs/demo-screens/` in case wifi dies

## Script

**0:00 — Hook (landing page)**
"Managing people shouldn't feel like paperwork. Dayflow gives a small company attendance, leave, and a live directory in one place. Watch how fast it is."
→ Login as employee.

**0:30 — Employee journey**
1. Dashboard: today's status → **Check in** (watch the timer/status flip)
2. Leave → apply for 2 days next week with reason
3. Show "My leaves" list: pending badge on the new one
4. Directory: search a teammate by name

**1:30 — Admin journey (second window)**
1. Login as admin — note the different sidebar (Employees, Approvals)
2. Dashboard stat cards: headcount, present today, pending approvals
3. Attendance view: today's grid across the company
4. Leave requests: **Approve** Ravi's request
5. Employees → Add Employee modal → save → appears in table + directory instantly

**2:30 — Close (multi-tenant proof)**
"We're fully multi-tenant — sign up a brand-new company in 30 seconds and it sees none of Acme's data. RLS enforced at the database level, not app code."
→ Signup a throwaway company "Beta LLC", show empty dashboard, stop.

## If something breaks
- Check-in fails → refresh, click again; if still broken, skip to leave flow
- Approve fails → use backup screenshot of the approval state
- Never debug live in front of judges. Narrate the architecture instead.
