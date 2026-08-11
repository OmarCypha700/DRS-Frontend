# Document Request System — Frontend

Next.js (App Router, JavaScript) frontend for the Document Request System.
Two roles, one codebase: applicants request and pay for documents; registry
officers review, process, and report on them.

## Tech stack

- Next.js 16 (App Router, Turbopack)
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
  layout/     AppShell, Navbar, Sidebar, PageHeader
  auth/       RoleGuard, AuthNavActions
  notifications/  NotificationBell
features/     one folder per domain area — the actual page logic
lib/
  api/        one Axios service module per backend resource
  auth/       AuthProvider (React Context)
  constants/  enums mirrored 1:1 from the backend
proxy.js       route-protection gate (cookie presence only — see below)
```

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

## Production build

```bash
npm run build
npm run start
```

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
