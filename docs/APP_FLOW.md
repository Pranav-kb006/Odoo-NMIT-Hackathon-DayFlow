# APP_FLOW.md — Dayflow

Every page, every navigation path. Route inventory mirrors PRD §6.

## Public Routes

### `/signup`
1. User fills Company Name, Company Code (2–4 letters), Admin Name/Email/Phone, Password + Confirm, optional Logo upload.
2. Submit → `POST /api/company/signup`.
3. Success → auto sign-in → redirect **Admin** to `/admin`.
4. Errors: duplicate email → inline "Account already exists"; bad company_code format → inline field error.

### `/login`
1. Login ID **or** Email + Password → Supabase Auth sign-in.
2. Success → role-based redirect: `admin` → `/admin`, `employee` → `/dashboard`.
3. If `must_change_password = true` → redirect `/change-password` first.
4. Wrong credentials → single generic inline error ("Invalid login credentials"). No field hints.

## Admin Routes (role guard: admin only)

### `/admin`
- Employee card grid: avatar, name, status dot (🟢 present / ✈️ on leave / 🟡 absent).
- Card click → `/employees/[id]` (view-only mode by default).

### `/employees`
Searchable list view of same data.

### `/employees/new`
Form: name, personal email, DOI, department, position, manager (select), location.
Submit → `POST /api/employees` → success modal shows **generated Login ID + temp password once** → back to `/employees`.

### `/employees/[id]`
Tabbed profile (same tabs as `/profile`) plus editable-by-admin everything, incl. Salary Info tab:
- Wage input → live component breakdown per formulas (client preview) → Save validates fixed_allowance ≥ 0 server-side.

### `/attendance` (admin variant)
All employees' attendance for today by default; search/filter by employee, status.

### `/timeoff` (admin variant)
Table: Employee, Type, Start, End, Days, Status, comment box, Approve/Reject buttons.
Approve → `PATCH /api/leave-requests/[id]/review` → balance decremented.

### `/settings`
Working days/week + break time inputs → PATCH companies row.

## Employee Routes

### `/dashboard`
Quick cards: Profile, Attendance, Leave Requests, Logout. Recent activity feed below.
Header shows Check In / Check Out button (state-aware: disabled when already checked in/out).

### `/profile`
Tabs: My Profile · Private Info · Resume · Security. (Salary Info tab hidden.)
Editable: address, phone, avatar, about, skills. Everything else read-only for self.

### `/attendance` (employee variant)
Current-month table: Date, Check In, Check Out, Work Hours, Extra Hours.
Summary chips: Total Working Days · Leaves taken.

### `/timeoff`
Own requests list with status badges. Balance cards per type at top.

### `/timeoff/new`
Type select, From/To dates, days (auto-computed), attachment upload (prompted if sick).
Submit → `POST /api/leave-requests`.

### `/payslip`
Read-only final numbers: Basic, HRA, allowances, gross, PF, tax, net pay. No formulas shown.

## Shared Behaviors
- Fixed top nav everywhere post-login: Logo | Employees* | Attendance | Time Off | profile menu (My Profile, Logout). (*Employees link hidden for employees.)
- All role-guarded routes check session + role server-side (middleware.ts); unauthorized → redirect `/login`.
- Every mutation surfaces inline error states; optimistic UI only where rollback is trivial (check-in/out).
