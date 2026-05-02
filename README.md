# XContext

AI-powered interview platform for a given codebase — run contests, upload/inspect code, and generate targeted JS/TS interview questions.

## Tech stack

- **Frontend**: Next.js (App Router) + React + Tailwind + shadcn/ui
- **Backend**: Bun + Express
- **Auth**: Better Auth (Google provider enabled)
- **DB**: Postgres (Neon) via Drizzle ORM
- **LLM**: Vercel AI Gateway (via `ai`)

## Repo structure

- `frontend/`: Next.js app (UI)
- `backend/`: Bun + Express API

## Prerequisites

- **Bun** installed (backend and scripts use Bun)
- A **Postgres** database URL (local Postgres or hosted Neon)
- Optional: **Google OAuth** credentials (for Better Auth social login)
- Optional: **Vercel AI Gateway** API key (required for question generation endpoint)

## Environment variables

### Backend (`backend/.env`)

Required:

- **`DATABASE_URL`**: Postgres connection string
- **`BETTER_AUTH_SECRET`**: Better Auth secret
- **`BETTER_AUTH_URL`**: Public backend base URL (e.g. `http://localhost:3000`)
- **`FRONTEND_URL`**: Frontend URL used for redirects (e.g. `http://localhost:7000`)
- **`AI_GATEWAY_API_KEY`**: Vercel AI Gateway API key (required for AI question generation)

Auth providers:

- **`GOOGLE_CLIENT_ID`**
- **`GOOGLE_CLIENT_SECRET`**

Optional:

- **`PORT`**: API port (defaults to `3000`)

### Frontend (`frontend/.env.local`)

Required:

- **`NEXT_PUBLIC_BACKEND_URL`**: Backend base URL (e.g. `http://localhost:3000`)

## Setup

Install dependencies (each package has its own `package.json`):

```bash
cd backend && bun install
cd ../frontend && bun install
```

## Run locally

Because the backend defaults to port `3000`, it’s easiest to run the frontend on `7000`.

### 1) Start the backend API

```bash
cd backend
bun run dev
```

The API serves:

- `GET /` → welcome message
- `GET /api/v1/health` → health check
- `POST /api/v1/ai-question` → generate a single JS/TS question (requires `AI_GATEWAY_API_KEY`)
- Better Auth routes under `GET|POST /api/auth/*`

### 2) Start the frontend

```bash
cd frontend
bun run dev -- -p 7000
```

## Database migrations (Drizzle)

The backend includes Drizzle Kit scripts:

```bash
cd backend
bun run gen
bun run migrate
```

Other available commands:

```bash
cd backend
bun run push
bun run pull
bun run studio
```

## Formatting & linting

From each package:

```bash
cd frontend && bun run format && bun run lint
cd ../backend && bun run format
```

Or from the repo root:

```bash
bun run format
bun run format:check
```

## Notes

- **Cross-origin isolation headers** are enabled in `frontend/next.config.ts` to support `@webcontainer/api` (SharedArrayBuffer).
- The frontend also includes a **rewrite for `/api/auth/*`** to the backend when `NEXT_PUBLIC_BACKEND_URL` is set, but Better Auth client requests should still be configured to preserve cookies correctly.
