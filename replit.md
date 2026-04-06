# Sanctuary — AI-Enhanced Daily Productivity & Wellness App

## Overview
A full-stack productivity platform combining task management, habit tracking, Pomodoro focus sessions, and a gamified experience (levels, points, streaks). Backend uses MongoDB via Mongoose, frontend is React + Vite.

## Architecture

### Frontend (`frontend/`)
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4
- **Routing:** Wouter
- **State/Data:** TanStack Query
- **UI:** Radix UI + shadcn/ui components
- **Port:** 5000 (workflow: "Start application")

### Backend (`backend/`)
- **Runtime:** Node.js 20 (ESM)
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (access + refresh tokens, stored in localStorage as `sanctuary_access_token` / `sanctuary_refresh_token`)
- **Port:** 3001 (workflow: "Backend API")

## Key Files
- `backend/src/app.js` — Express app setup (CORS, Helmet, rate limiter)
- `backend/src/db/index.js` — MongoDB connection via Mongoose
- `backend/src/models/` — Mongoose models (User, Task, Habit, HabitLog, Activity, PomodoroSession)
- `backend/src/routes/` — API routes (auth, tasks, habits, dashboard, ai)
- `backend/src/lib/auth.js` — JWT helpers + requireAuth middleware
- `frontend/src/contexts/AuthContext.jsx` — Auth state management
- `frontend/src/api-client-react/` — Generated API client with custom fetch
- `frontend/vite.config.js` — Vite config, proxies /api → localhost:3001

## Environment Variables
- `MONGODB_URI` — MongoDB Atlas connection string (secret)
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — JWT secrets (falls back to defaults if not set)

## API Endpoints
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login, returns accessToken + refreshToken
- `POST /api/auth/refresh` — Refresh access token
- `GET  /api/auth/me` — Get current user
- `PATCH /api/auth/profile` — Update profile
- `GET/POST /api/tasks` — List/create tasks
- `GET/PATCH/DELETE /api/tasks/:id` — Task CRUD
- `POST /api/tasks/:id/subtasks` — Add subtask
- `PATCH /api/tasks/:id/subtasks/:subtaskId` — Toggle subtask
- `GET/POST /api/habits` — List/create habits
- `POST /api/habits/:id/log` — Log habit completion
- `GET /api/dashboard/summary` — Dashboard stats
- `GET /api/dashboard/today` — Today's tasks
- `GET /api/dashboard/urgent` — Urgent tasks
- `POST /api/ai/query` — AI assistant

## Demo Account
- Email: `demo@sanctuary.app`
- Password: `demo1234`

## Development
Both services must run simultaneously:
1. **Backend API** workflow: `cd backend && node src/index.js`
2. **Start application** workflow: `cd frontend && npm run dev`

The frontend proxies `/api` requests to `http://localhost:3001`.
