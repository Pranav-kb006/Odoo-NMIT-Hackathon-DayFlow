# PRD.md — Dayflow (HRMS)

"Every workday, perfectly aligned." Hackathon build — 8 hour budget. This is the contract. If it's not here, it's not in scope.

## 1. What We're Building
Dayflow is a multi-tenant HRMS web app. A company signs up once (creating its Admin/HR account), then the Admin adds Employees manually — employees never self-register. The system covers auth, employee profiles, attendance (check-in/check-out), leave/time-off with approvals, and a formula-driven payroll view.

## 2. Who It's For
- **Admin / HR Officer** — one per company (v1: exactly one Admin, no multi-admin or Manager tier). Manages employees, approves attendance/leave, configures salary structure, views all payroll data.
- **Employee** — regular user. Views own profile, attendance, leave balance, and a read-only payslip. Applies for leave, checks in/out.

## 3. Locked Decisions (do not re-litigate mid-build)

| Area | Decision |
|---|---|
| Tenancy | Multi-tenant. One `companies` row per signup. All other tables scoped by `company_id`. |
| Employee accounts | Created by Admin only. System auto-generates Login ID + first-time password. No employee self-signup. |
| Company Code | Typed manually by Admin at signup (2–4 letters), used in Login ID. |
| Login ID format | `{CompanyCode}{first2(FirstName)}{first2(LastName)}{YearOfJoining}{4-digit serial}` — e.g. `DFJODO20260001` |
| Password reset | No email-reset flow. Admin manually resets from Employee list. |
| Roles | Exactly two: `admin`, `employee`. No Manager tier. |
| Salary visibility | Admin sees formula/config view (Salary Info tab). Employee sees read-only Payslip (final numbers only). |
| Working days / break | One global setting per company, not per-employee. |
| File uploads | PDF/JPG/PNG only, 5MB max, Supabase Storage. |
| Notifications | In-app only (activity feed / bell icon). |
| Reports/export | Out of scope v1. |
| Attendance verification | Simple check-in/check-out button. No geolocation/IP restriction. |

## 4. Tech Stack (locked)
- Next.js 14 (App Router), React 18, TypeScript 5
- Supabase (Postgres, Auth, Storage)
- Tailwind CSS + shadcn/ui, Lucide React icons
- Deploy: Vercel · Repo: GitHub

## 5. Functional Requirements

### 5.1 Auth
- **Company Sign Up** (`/signup`): Company Name, Company Code, Admin Name, Admin Email, Admin Phone, Password, Confirm Password, Logo upload (optional). Creates `companies` row + first `users` row with role `admin`.
- **Sign In** (`/login`): Login ID or Email + Password. Wrong credentials → inline error, no field-specific hints. Success → role-based dashboard redirect.
- **Employee creation** (Admin-only, `/employees/new`): name, personal email, DOI, department, job position, manager, location. System generates Login ID + temp password shown once to Admin. Employee forced to change password on first login.

### 5.2 Dashboard
- **Employee**: quick-access cards — Profile, Attendance, Leave Requests, Logout — plus recent activity feed.
- **Admin**: Employee card grid (avatar, name, status dot — 🟢 present, ✈️ on leave, 🟡 absent). Cards clickable → view-only profile.
- Fixed top nav: `Logo | Employees | Attendance | Time Off | (profile menu → My Profile / Logout)`.

### 5.3 Employee Profile
Tabbed: My Profile / Private Info / Resume / Salary Info (Admin-only) / Security.
- My Profile: name, mobile, email, department, position, company, manager, location, about, skills.
- Private Info: DOB, address, personal email, gender, nationality, marital status, bank details (acct no, bank, IFSC), PAN, UAN, Emp Code, DOI.
- Employee edits own: address, phone, picture, about/skills. Admin edits all fields for anyone.

### 5.4 Attendance
- Check In / Check Out button. On check-in, dot flips red → green.
- Employee view: current month day-wise table (Date, Check In, Check Out, Work Hours, Extra Hours) + Total Working Days & Leave Count summary.
- Admin view: all employees' attendance for today by default, searchable/filterable.
- Statuses: Present, Absent, Half-day, Leave. Feeds payroll payable days.

### 5.5 Leave / Time-Off
- Types: Paid Time Off, Sick Leave, Unpaid Leave. Balances shown per type ("24 Days Available").
- Apply form: type, From/To date range, days, optional attachment (prompted for Sick Leave, not enforced).
- Status: Pending / Approved / Rejected. Admin sees all requests with Approve/Reject + comment. Employees see only their own.

### 5.6 Payroll / Salary
Wage type: fixed only. Components auto-calc from Wage:
- Basic = 50% of Wage
- HRA = 50% of Basic
- Standard Allowance = flat ₹4,167/month
- Performance Bonus = 8.33% of Basic
- LTA = 8.333% of Basic
- Fixed Allowance = Wage − sum(all above); reject save if negative.
- Deductions: PF 12% employee + 12% employer (on Basic); Professional Tax flat ₹200/month.
- Payslip (read-only employee view): final numbers only — no formulas exposed.
- Payable days = total working days − (unpaid leave + unaccounted absent days).

## 6. Route Inventory

| Route | Access | Purpose |
|---|---|---|
| `/signup` | Public | Company + Admin signup |
| `/login` | Public | Sign in |
| `/dashboard` | Employee | Employee home |
| `/admin` | Admin | Admin home (employee grid) |
| `/employees` | Admin | List/search |
| `/employees/new` | Admin | Create employee |
| `/employees/[id]` | Admin | View/edit employee |
| `/profile` | Employee | Own profile (tabbed) |
| `/attendance` | Both | Own month (Emp) / all today (Admin) |
| `/timeoff` | Both | Own requests (Emp) / all + review (Admin) |
| `/timeoff/new` | Employee | Apply for leave |
| `/settings` | Admin | Working days/week, break time |

## 7. Design Tokens
shadcn/ui on Tailwind. Mobile-first, single-column below 640px.
Status colors: present `#22C55E`, on-leave `#F59E0B` (+ airplane icon), absent `#EAB308`, pending `#94A3B8`, approved `#22C55E`, rejected `#EF4444`. Primary accent: `#3B82F6`. Font: system UI stack.

## 8. Non-Goals
Employee self-registration · forgot-password/email reset · Manager role/multi-admin · email/push notifications · report export/analytics · geo check-in · per-employee working-hour overrides · hourly wage · multi-currency.

## 9. Success Criteria
1. Company can sign up → lands on Admin dashboard.
2. Admin adds an employee → gets working Login ID + temp password.
3. Employee logs in, forced password change, sees dashboard.
4. Employee checks in/out → reflected in attendance table.
5. Employee applies for leave; Admin approves/rejects → balance/status updates.
6. Admin sets a wage → all components auto-calculate per §5.6.
7. Employee sees read-only payslip with correct final numbers.
8. Works on a real phone screen without breaking layout.
