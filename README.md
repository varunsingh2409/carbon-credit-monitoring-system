# Carbon Credit Monitoring System

This repository contains a full-stack carbon credit monitoring application with:

- a FastAPI backend
- a PostgreSQL database
- a React + TypeScript + Vite frontend
- JWT authentication and role-based access control
- farmer, verifier, admin, and sensor workflows

If you want the fastest way to present the app live, use [DEMO_README.md](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/DEMO_README.md).

## Permanent Deploy With GitHub

This repo now includes a GitHub-connected Render Blueprint at [render.yaml](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/render.yaml).

There is also a free-tier-oriented variant at [render.free.yaml](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/render.free.yaml) for short-term demos and presentations where you want the entire stack on Render without paid services.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/varunsingh2409/carbon-credit-monitoring-system)

What this sets up:

- a Render web service for the FastAPI backend
- a Render static site for the Vite frontend
- a managed Render Postgres database
- automatic deploys on future GitHub pushes after the initial Render import

Important note:

- Render's current free Postgres instances expire after 30 days, so the Blueprint uses `basic-256mb` for the database to make the deployment durable instead of temporary
- the repo does not currently include checked-in Alembic migration files, so [scripts/bootstrap_db.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/bootstrap_db.py) creates the schema and runs the existing demo seed SQL during deploy
- if you want live ThingSpeak sync in production, fill in the prompted `THINGSPEAK_*` secrets during the first Render setup
- the static site build in both Render blueprints publishes from `frontend/dist`, which matches the configured `rootDir: frontend`

### Free Render Option

Use [render.free.yaml](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/render.free.yaml) if you want:

- a free Render backend
- a free Render static frontend
- a free Render Postgres database for short-term demonstration use

For that free setup, provide these values during the first Render import:

- `THINGSPEAK_CHANNEL_ID`
- `THINGSPEAK_READ_API_KEY`

The free blueprint is suitable for presentations and demos, but it keeps Render's free-tier tradeoffs:

- the web service can spin down when idle
- the free Postgres database is not intended for long-term production use

## 1. What The System Does

The platform is designed to track soil measurements, calculate carbon sequestration, and manage verification before carbon credits are considered issued.

The current implementation supports:

- user registration and login with JWT authentication
- automatic farmer-profile creation for farmer users
- sensor measurement ingestion with nutrient validation
- carbon sequestration calculation from Organic Carbon measurements
- verifier approval and rejection workflows
- admin statistics and carbon-calculation triggers
- farmer, verifier, and admin dashboards in the frontend

## 2. High-Level Architecture

## Backend

The backend lives under [app](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app) and is built with:

- FastAPI
- SQLAlchemy 2.x ORM
- Pydantic v2 schemas
- PostgreSQL
- Alembic migrations
- bcrypt password hashing
- JWT tokens with `python-jose`

Main backend entrypoints:

- root launcher: [main.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/main.py)
- FastAPI app: [app/main.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/main.py)
- DB session: [app/db/session.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/db/session.py)
- settings: [app/core/config.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/core/config.py)

## Frontend

The frontend lives under [frontend](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend) and is built with:

- React 18
- TypeScript
- Vite
- Zustand
- Axios
- React Router
- React Hook Form
- Zod
- Recharts
- Tailwind CSS

Main frontend entrypoints:

- app shell: [frontend/src/App.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/App.tsx)
- React entrypoint: [frontend/src/main.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/main.tsx)
- API client: [frontend/src/api/axiosConfig.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/api/axiosConfig.ts)
- auth store: [frontend/src/store/authStore.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/store/authStore.ts)

## Database

The database stores:

- users and farmer profiles
- farms and seasons
- soil measurements and nutrient results
- carbon sequestration results
- carbon verification decisions

Migrations are managed through:

- [alembic.ini](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/alembic.ini)
- [alembic](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/alembic)

## 3. Repository Structure

```text
carbon_credit_backend/
|-- alembic/                  Alembic migration environment
|-- app/
|   |-- api/                  Legacy compatibility endpoints under /api/v1
|   |-- auth/                 Password hashing, JWT handling, auth dependencies
|   |-- core/                 Settings and security helpers
|   |-- crud/                 CRUD helpers
|   |-- db/                   SQLAlchemy base and session
|   |-- models/               SQLAlchemy ORM models
|   |-- routers/              Main application routers under /api/*
|   |-- schemas/              Pydantic request/response models
|   |-- services/             Business logic services
|   `-- main.py               FastAPI application
|-- frontend/
|   |-- src/
|   |   |-- api/              Axios clients
|   |   |-- components/       Shared UI components
|   |   |-- pages/            Landing, login, and dashboards
|   |   |-- store/            Zustand auth state
|   |   `-- types/            Shared frontend types
|   |-- .env.example
|   `-- package.json
|-- scripts/
|   `-- seed_demo.sql         Demo reset and seeded credentials
|-- tests/
|-- .env.example
|-- main.py
|-- requirements.txt
`-- README.md
```

## 4. Backend Configuration

Backend settings are read from [app/core/config.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/core/config.py) and `.env`.

Backend environment variables:

- `PROJECT_NAME`
- `VERSION`
- `API_V1_STR`
- `DEBUG`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL`
- `BACKEND_CORS_ORIGINS`

Example backend env file:

```env
PROJECT_NAME=Carbon Credit Monitoring System
VERSION=1.0.0
API_V1_STR=/api/v1
DEBUG=true
SECRET_KEY=change_this_to_a_long_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=postgresql+psycopg2://carbon_app_user:your_password@localhost:5432/carbon_credit_db
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

Important implementation note:

- the JWT issuer currently uses constants in [app/auth/jwt_handler.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/auth/jwt_handler.py)
- those constants are not yet fully centralized into [app/core/config.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/core/config.py)
- for production, align these values before deployment

## 5. Frontend Configuration

Frontend environment variable:

```env
VITE_API_URL=http://localhost:8000
```

This is read by [frontend/src/api/axiosConfig.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/api/axiosConfig.ts), which builds the Axios base URL as:

```text
${VITE_API_URL}/api
```

That means frontend requests such as `/auth/login` become:

```text
http://localhost:8000/api/auth/login
```

## 6. Domain Model

Core ORM files:

- [app/models/user.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/user.py)
- [app/models/farmer.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/farmer.py)
- [app/models/farm.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/farm.py)
- [app/models/season.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/season.py)
- [app/models/measurement.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/measurement.py)
- [app/models/carbon.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/models/carbon.py)

Main entities:

- `User`: application account with role and JWT identity
- `Farmer`: farmer profile linked one-to-one with a farmer user
- `Farm`: land parcel owned by a farmer
- `Season`: crop cycle for a farm
- `SoilMeasurement`: one measurement event for a farm and season
- `MeasurementResult`: nutrient values attached to a soil measurement
- `Nutrient`: nutrient master table
- `CarbonSequestration`: calculated season-level carbon result
- `CarbonVerification`: verifier decision for a sequestration

## 7. Authentication And Authorization

Backend auth files:

- [app/auth/password.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/auth/password.py)
- [app/auth/jwt_handler.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/auth/jwt_handler.py)
- [app/auth/dependencies.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/auth/dependencies.py)

Behavior:

- passwords are hashed with bcrypt at cost factor `12`
- JWT payload includes `sub`, `user_id`, `role`, and `exp`
- `get_current_user()` resolves the authenticated user from the token
- `require_role([...])` restricts role-specific endpoints

Frontend auth files:

- [frontend/src/api/authApi.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/api/authApi.ts)
- [frontend/src/store/authStore.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/store/authStore.ts)
- [frontend/src/components/ProtectedRoute.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/ProtectedRoute.tsx)

Frontend auth flow:

1. user submits login form
2. frontend calls `POST /api/auth/login`
3. backend returns `{ access_token, token_type, user }`
4. Zustand persists token and user in local storage
5. Axios adds `Authorization: Bearer <token>` to future requests
6. protected routes allow or reject navigation based on authentication and role
7. a `401` response clears local auth state and redirects to `/login`

## 8. Main Backend API Surface

## Current top-level routes

Configured in [app/main.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/main.py):

- `GET /`
- `GET /health`
- `/api/auth/*`
- `/api/measurements`
- `/api/farmer/*`
- `/api/verifier/*`
- `/api/admin/*`
- `/api/v1/*` legacy compatibility routes

## Auth routes

Defined in [app/routers/auth.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/routers/auth.py):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Measurement ingestion

Defined in [app/routers/measurements.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/routers/measurements.py):

- `POST /api/measurements`

Allowed roles:

- `sensor`
- `admin`

Business logic:

- implemented in [app/services/measurement_service.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/services/measurement_service.py)
- validates farm and season
- ensures season belongs to the farm
- requires season status `active`
- validates nutrient names against the master table
- inserts the measurement and nutrient results in one transaction

## Farmer routes

Defined in [app/routers/farmer.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/routers/farmer.py):

- `GET /api/farmer/dashboard`
- `GET /api/farmer/carbon-reports?farm_id=<id>`

Allowed role:

- `farmer`

Dashboard returns:

- top-level farmer statistics
- farms with nested seasons
- carbon data by season
- recent measurements list

## Verifier routes

Defined in [app/routers/verifier.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/routers/verifier.py):

- `GET /api/verifier/pending-verifications`
- `GET /api/verifier/sequestration/{id}`
- `POST /api/verifier/approve/{id}`
- `POST /api/verifier/reject/{id}`

Allowed role:

- `verifier`

Business logic:

- implemented in [app/services/verification_service.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/services/verification_service.py)
- approval writes to both `carbon_sequestration` and `carbon_verification`
- season status is moved to `verified` on approval
- rejection keeps season at `completed` because the schema constraint does not allow `rejected` as a season status

## Admin routes

Defined in [app/routers/admin.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/routers/admin.py):

- `GET /api/admin/statistics`
- `GET /api/admin/monthly-credits`
- `POST /api/admin/trigger-carbon-calculation`
- `GET /api/admin/users`
- `POST /api/admin/users`

Allowed role:

- `admin`

Carbon calculation logic:

- implemented in [app/services/carbon_calculator.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/services/carbon_calculator.py)
- reads Organic Carbon measurements for a season
- requires at least 3 Organic Carbon results
- calculates average current carbon
- computes:

```text
estimated_carbon_credit = (net_carbon_increase * farm_area_hectares * 3.67) / 1000
```

## Legacy compatibility routes

Mounted from [app/api/v1/api.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/api/v1/api.py).

These currently provide list/detail helpers used by parts of the frontend and demo flow:

- `/api/v1/health`
- `/api/v1/auth/login`
- `/api/v1/users`
- `/api/v1/farmers`
- `/api/v1/farms`
- `/api/v1/seasons`
- `/api/v1/nutrients`
- `/api/v1/measurements`
- `/api/v1/sequestration`
- `/api/v1/verification`

Current frontend dependencies on legacy endpoints:

- [frontend/src/api/adminApi.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/api/adminApi.ts) uses `/api/v1/seasons` and `/api/v1/farms` to populate the admin season selector
- [frontend/src/api/verifierApi.ts](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/api/verifierApi.ts) uses `/api/v1/sequestration` for history data

## 9. Request / Response Schemas

The backend request and response contracts live in [app/schemas](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas).

Most important schema files:

- [app/schemas/user.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/user.py)
- [app/schemas/measurement.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/measurement.py)
- [app/schemas/carbon.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/carbon.py)
- [app/schemas/farmer_dashboard.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/farmer_dashboard.py)
- [app/schemas/verifier.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/verifier.py)
- [app/schemas/admin.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/app/schemas/admin.py)

## 10. Frontend Routing And Pages

Frontend routes are defined in [frontend/src/App.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/App.tsx):

- `/` -> Landing page
- `/login` -> Login page
- `/unauthorized` -> Unauthorized page
- `/farmer/dashboard` -> Farmer dashboard
- `/verifier/dashboard` -> Verifier dashboard
- `/verifier/verification/:id` -> Verification details
- `/admin/panel` -> Admin panel

Page files:

- [frontend/src/pages/LandingPage.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/LandingPage.tsx)
- [frontend/src/pages/LoginPage.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/LoginPage.tsx)
- [frontend/src/pages/farmer/FarmerDashboard.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/farmer/FarmerDashboard.tsx)
- [frontend/src/pages/verifier/VerifierDashboard.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/verifier/VerifierDashboard.tsx)
- [frontend/src/pages/verifier/VerificationDetails.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/verifier/VerificationDetails.tsx)
- [frontend/src/pages/admin/AdminPanel.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/pages/admin/AdminPanel.tsx)

Shared UI components:

- [frontend/src/components/Navbar.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/Navbar.tsx)
- [frontend/src/components/StatCard.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/StatCard.tsx)
- [frontend/src/components/StatusBadge.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/StatusBadge.tsx)
- [frontend/src/components/LoadingState.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/LoadingState.tsx)
- [frontend/src/components/ProtectedRoute.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/components/ProtectedRoute.tsx)

## 11. Local Development Setup

## Prerequisites

Backend:

- Python 3.10+ recommended
- PostgreSQL

Frontend:

- Node.js 18+
- npm 9+

## Backend setup

From [C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend):

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

After creating `.env`, update:

- `DATABASE_URL`
- `SECRET_KEY`
- any local values needed for your environment

Run migrations:

```powershell
alembic upgrade head
```

Start the backend:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend setup

From [frontend](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend):

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## 12. How The Full Workflow Connects

## Registration and login

1. user registers through `/api/auth/register`
2. backend creates `users` row
3. backend also creates `farmer` profile when role is `farmer`
4. user logs in through `/api/auth/login`
5. frontend stores the token in Zustand and local storage
6. all later frontend API calls include the JWT automatically
7. role-protected routes allow or reject navigation

## Measurement ingestion

1. sensor or admin posts to `/api/measurements`
2. backend validates farm, season, nutrient names, and season state
3. backend inserts `soil_measurement`
4. backend inserts `measurement_result` rows
5. farmer dashboard later surfaces these measurements

## Carbon calculation

1. admin triggers `/api/admin/trigger-carbon-calculation`
2. backend gathers Organic Carbon measurements for the season
3. backend computes current carbon average
4. backend derives net increase and estimated credit
5. backend inserts `carbon_sequestration`
6. season status moves to `completed`

## Verification

1. verifier sees pending items on `/api/verifier/pending-verifications`
2. verifier opens `/api/verifier/sequestration/{id}`
3. verifier approves or rejects
4. backend writes `carbon_verification`
5. sequestration status updates
6. farmer and admin views reflect the change

## 13. Build, Docs, And Quick Checks

Backend checks:

- root: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

Frontend check:

- Vite dev server usually runs at [http://localhost:5173](http://localhost:5173)

Production-style frontend build:

```powershell
cd frontend
npm run build
```

## 14. Demo Seed

The project includes a resettable demo dataset:

- SQL seed file: [scripts/seed_demo.sql](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/seed_demo.sql)

Use the demo guide for the exact reset command and walkthrough:

- [DEMO_README.md](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/DEMO_README.md)

## 15. Known Current Gaps

These are useful to know before production deployment:

- the frontend `Forgot password` action is still a placeholder
- admin `Export CSV` and `Export PDF` buttons are still placeholders
- some frontend admin and verifier flows still rely on legacy `/api/v1` endpoints
- JWT settings are not fully centralized in one config source yet
- the system is currently tuned for local development and demo use first, not hardened production deployment

## 16. Minimal End-to-End Smoke Flow

1. start PostgreSQL
2. run `alembic upgrade head`
3. start backend with `uvicorn main:app --reload`
4. start frontend with `npm run dev`
5. open the frontend
6. log in as a seeded user
7. verify role-based redirect works
8. use the demo guide for live ingestion, calculation, and approval
