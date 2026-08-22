# DESIGN.md — Dayflow

Design language: calm, spacious, professional. One accent color, lots of white space, generous line-height. If a screen looks busy, cut elements — don't shrink them.

## Brand

- Name: **Dayflow**
- Tagline: "Every workday, perfectly aligned."
- Accent: `#3B82F6` (blue-500) — buttons, active nav, focus rings
- Accent-dark: `#2563EB` for hover states
- Neutrals: Tailwind slate scale; page bg `slate-50`, cards white, borders `slate-200`
- Semantic: success `#16A34A`, warning `#D97706`, danger `#DC2626`

## Typography

- Font: Inter (next/font, self-hosted via `next/font/google`)
- Display (page titles): 24px/600 tracking-tight
- Body: 14px/400; secondary text `text-slate-500`
- Numbers in stat cards: 30px/700 tabular-nums

## Components

- Cards: white bg, 1px `slate-200` border, rounded-xl, no shadows on dashboards (shadow-sm only on modals)
- Buttons: primary = accent fill, white text, rounded-lg, h-10; secondary = white with border; destructive = red outline
- Inputs: h-10, rounded-lg, border-slate-300, focus ring accent/40
- Tables: header row `bg-slate-50` uppercase 11px tracking-wide text-slate-500; row hover `bg-slate-50`; generous cell padding (py-3)
- Status badges: pill shape, tinted bg (green/red/amber/slate at 10% opacity), colored text
- Sidebar: 240px fixed, white, active item = accent-50 bg + accent-700 text

## Layout

- Dashboard shell: fixed sidebar + topbar (56px) with company name + user menu
- Content max-width none — fluid with px-8 py-6
- Mobile: sidebar collapses to hamburger sheet below md

## Motion & States

- Transitions: 150ms ease-out on hover/focus only — nothing bouncy
- Every list has a designed EmptyState (icon + one line + CTA)
- Loading = skeleton pulse blocks matching final layout, never spinners on dashboards

## Charts (admin dashboard)

- Attendance trend: simple bar chart, accent bars, slate gridlines
- Leave donut: approved/pending/rejected as green/amber/slate
- Keep charts to two per dashboard max
