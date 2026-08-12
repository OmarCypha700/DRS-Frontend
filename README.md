# Document Request System — Frontend

Next.js (App Router, JavaScript) frontend for the Document Request System.
Two roles, one codebase: applicants request and pay for documents; registry
officers review, process, and report on them.

## Tech stack

- Next.js 15 (App Router, Turbopack)
- Installable PWA — manifest, service worker, Web Push with app badging
- Tailwind CSS + shadcn/ui (Radix primitives, Lucide icons)
- Axios (`withCredentials: true` — cookie-based auth, never `localStorage`)
- React Hook Form

## Project layout

```
app/
  (auth)/                login, register, forgot/reset password
  (applicant)/            applicant dashboard, applications, notifications, profile
  (registry)/registry/    registry dashboard, applications, reports, notifications, profile
  payments/callback/      Paystack redirect-back handler
components/
  ui/         shadcn primitives
  shared/     DataTable, StatusBadge, ConfirmDialog, EmptyState, etc.
  layout/     AppShell, Navbar, Sidebar, BottomNav (applicant mobile), PageHeader
  auth/       RoleGuard, GuestGuard, AuthNavActions
  notifications/  NotificationBell
  pwa/        service worker registration, icon glyph
features/     one folder per domain area — the actual page logic
lib/
  api/        one Axios service module per backend resource
  auth/       AuthProvider (React Context)
  constants/  enums mirrored 1:1 from the backend
  hooks/      use-unread-count, use-push-notifications, use-debounced-value
public/sw.js   service worker — pass-through fetch handler, push/notificationclick
proxy.js       route-protection gate (cookie presence only — see below)
```

Applicant portal navigation is a fixed bottom tab bar on mobile
(`components/layout/bottom-nav.jsx`); registry keeps its drawer at all
sizes. Both share the same unread-notification-count hook so their badges
never drift.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL defaults to the local backend
npm run dev
```

Requires the backend running at the URL in `NEXT_PUBLIC_API_URL` (default
`http://localhost:8000/api/v1`) — see the backend README.

## Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL. Public (bundled client-side) since it's just an origin, not a secret. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key — must match the backend's `VAPID_PUBLIC_KEY`. |

## Production build

```bash
npm run build
npm run start
```

## PWA / Web Push

The app is installable (manifest + service worker, app-wide) and supports
Web Push with OS-level app badging (applicant and registry portals both).
Users opt in explicitly from the Profile page — permission is never
requested on page load. iOS Safari needs the PWA installed to the Home
Screen before push works at all, and doesn't support the Badging API; both
degrade silently rather than erroring.

## Why Next.js 15, not 16

Next.js 16 shipped genuine, reproducible 307-redirect bugs on this project
when deployed to Vercel (`/dashboard`, `/profile`, all of `/registry/*`,
`/payments/callback`) — confirmed unrelated to app code (ruled out
middleware, `vercel.json`, project settings, even a full project
delete/reimport) before downgrading to 15 resolved it. Don't bump past 15
without re-testing production routing on Vercel first.

## Notes on the auth model

- Tokens live in HttpOnly cookies set by the backend — this app never reads
  or stores a JWT itself.
- `proxy.js` only checks for the **presence** of the `refresh_token` cookie
  before allowing a protected route to render — it cannot safely verify a
  JWT's signature at the edge without duplicating the backend's secret. This
  is a UX convenience (avoids a flash of protected content), not the
  security boundary; the backend's permission classes are what actually
  enforce access.
- `RoleGuard` (client-side) enforces the applicant/registry-officer split
  the same way: it's authorization for navigation purposes, not a substitute
  for the backend checking the caller's role on every request.
- `GuestGuard` redirects already-authenticated users away from guest-only
  pages (`/login`, `/register`) to their role's home, honoring a `?next=`
  param. Login/register forms don't redirect themselves — `GuestGuard` owns
  that, avoiding a race between the two.
