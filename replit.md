# The Sanctuary – Daily Planner

A full-stack productivity and daily planning web application. Dark navy sidebar design inspired by reference images.

## Architecture

**Monorepo** managed by `pnpm` workspaces.

### Packages
- `lib/db` – Drizzle ORM schema + PostgreSQL migrations (`users`, `tasks` tables)
- `lib/api-spec` – OpenAPI 3.1 spec (`openapi.yaml`)
- `lib/api-client-react` – Auto-generated React Query hooks (Orval codegen + custom-fetch with JWT Bearer support)

### Artifacts
- `artifacts/api-server` – Express 5 + Node.js backend (port 8080)
- `artifacts/daily-planner` – React + Vite frontend, **plain JavaScript (.jsx)** (no TypeScript types in components)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Wouter (routing), TailwindCSS v4, React Query |
| Backend | Express 5, TypeScript, pnpm |
| Database | PostgreSQL via Drizzle ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs, stored in localStorage |
| PWA | manifest.json + service worker (sw.js) |
| Code gen | Orval (OpenAPI → React Query hooks + types) |

## Design System (The Sanctuary)

- **Sidebar**: dark navy `hsl(222, 47%, 18%)` — 210px wide
- **Background**: light blue-gray `hsl(213, 33%, 95%)`
- **Cards**: white with subtle border
- **Priority badges**: High=red, Medium=amber, Low=green
- **Completion rate card**: dark navy with green ring chart

## Frontend (daily-planner) – Plain JS

All component files use `.jsx` extension. All source files are plain JavaScript — no TypeScript files anywhere in the project.
Entry point: `src/main.jsx` (referenced in `index.html`).

### Pages
- `/` – Dashboard (greeting, daily focus tasks, urgent tasks panel, completion rate widget, focus timer)
- `/tasks` – Task list (stats bar, filter sidebar, task table with priority/deadline, deep focus banner)
- `/tasks/:id` – Task detail (inline edit, timeline, priority, category, focus timer)
- `/calendar` – Monthly calendar with task chips, unscheduled sidebar, focus widget
- `/settings` – Account, notifications, focus preferences, PWA install, sign out
- `/login` – JWT auth login with split layout
- `/register` – Account creation

### Key Files
- `src/main.jsx` – Entry, QueryClient, service worker registration, setAuthTokenGetter
- `src/App.jsx` – Wouter router, ProtectedRoute / PublicRoute guards
- `src/contexts/AuthContext.jsx` – User state, login/logout, token validation on mount
- `src/components/Sidebar.jsx` – Nav, view badges, PWA install banner
- `src/components/TopBar.jsx` – Search, Quick Add button, bell, user menu
- `src/components/QuickAddModal.jsx` – Modal form to create tasks
- `src/components/FocusTimer.jsx` – Pomodoro timer (15/25/50 min), native notifications
- `src/lib/utils.js` – formatDeadline, getGreeting, badge class helpers

## Backend (api-server) – TypeScript

### Routes (`/api/*`)
- `POST /auth/register` – Create account + return JWT
- `POST /auth/login` – Authenticate + return JWT
- `GET /auth/me` – Current user (requireAuth)
- `GET /tasks` – List tasks (filter: status, timeRange)
- `POST /tasks` – Create task
- `GET /tasks/:id` – Get single task
- `PUT /tasks/:id` – Update task
- `DELETE /tasks/:id` – Delete task
- `PATCH /tasks/:id/complete` – Toggle completion
- `GET /dashboard/summary` – Stats: totalActive, completed, overdue, completionRate
- `GET /dashboard/today` – Tasks due today
- `GET /dashboard/urgent` – Overdue + high-priority tasks

### Auth
- `requireAuth` middleware validates Bearer JWT in `Authorization` header
- `req.user` is set to `{ userId, email }` after validation

## Database Schema

```sql
users (id, name, email, passwordHash, createdAt, updatedAt)
tasks (id, userId, title, description, startDate, deadlineDate, reminderTime, priority, category, completed, status, createdAt, updatedAt)
```

- `priority`: 'low' | 'medium' | 'high'
- `category`: 'work' | 'personal' | 'study'
- `status`: 'pending' | 'overdue' | 'completed'

## Demo Credentials

Email: `demo@sanctuary.app`
Password: `demo1234`

## Workflows

- `artifacts/api-server: API Server` – builds and starts Express on port 8080
- `artifacts/daily-planner: web` – Vite dev server

## PWA

- `public/manifest.json` – name, icons, theme, display: standalone
- `public/sw.js` – network-first for /api, cache-first for static assets

## User Preferences

- Entire project in plain JavaScript (.jsx/.js) — zero TypeScript files anywhere
- Design matches "The Sanctuary" reference images: dark navy sidebar, white cards, priority badges, completion ring
- No emojis as primary UI elements
