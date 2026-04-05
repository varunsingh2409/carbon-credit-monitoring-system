# Carbon Credit Monitoring System

The Carbon Credit Monitoring System is a full-stack web application for collecting soil measurements, calculating carbon sequestration, and routing carbon-credit claims through verifier approval before they are treated as issued.

It combines:

- a React + TypeScript frontend
- a FastAPI backend
- a PostgreSQL relational database
- ThingSpeak-based external sensor ingestion
- JWT authentication with farmer, verifier, admin, and sensor roles

## 1. Live Demo Options

### Published GitHub Pages demo

Frontend-only demo URL:

- https://varunsingh2409.github.io/carbon-credit-monitoring-system/

Published demo credentials:

- `farmer1` / `FarmerDemo123!`
- `verifier1` / `VerifierDemo123!`
- `admin` / `AdminDemo123!`

What works on the published demo:

- landing page
- login
- farmer dashboard
- verifier dashboard and review flow
- admin panel with demo sync/calculation behavior
- CNDC and DBMS presentation sections

Current limitation of the published demo:

- it runs in frontend demo mode on GitHub Pages
- it does not use the live FastAPI backend
- it does not use the live PostgreSQL database
- it does not use live ThingSpeak data online
- demo actions are stored in browser local storage

### Full local demo

The local version is the complete implementation and supports:

- real FastAPI APIs
- real PostgreSQL persistence
- real JWT authentication
- real ThingSpeak import
- real carbon calculation
- real verifier approval workflow

For the presentation flow, use `DEMO_README.md`.
For installation and rebuild commands, use `INSTALL_DEPENDENCIES.md`.

## 2. Why This Project Fits CNDC And DBMS

### CNDC implementation

This project clearly demonstrates communication and networking concepts through:

- ThingSpeak HTTP channel integration
- FastAPI REST endpoints
- JSON request and response payloads
- JWT-protected client-server communication
- role-based API access
- health and documentation endpoints for service validation

Typical network flow:

1. ThingSpeak receives measurement data from an external source
2. the admin panel calls the backend sync API
3. FastAPI reads ThingSpeak over HTTP
4. FastAPI validates and stores the data
5. React dashboards fetch the updated records through REST APIs

### DBMS implementation

This project clearly demonstrates database-management concepts through:

- PostgreSQL as the relational database
- normalized tables for users, farms, seasons, nutrients, measurements, sequestration, and verification
- foreign-key relationships across the workflow
- persisted calculation history and verifier decisions
- transactional updates during approval and rejection
- database-backed statistics used in the admin panel

Core workflow tables:

- `users`
- `farmer`
- `farm`
- `season`
- `soil_measurement`
- `measurement_result`
- `nutrient`
- `carbon_sequestration`
- `carbon_verification`

## 3. End-To-End Workflow

1. sensor-style data is sent to ThingSpeak
2. admin imports the latest ThingSpeak entries into the selected season
3. FastAPI validates the season, maps the fields, and stores measurements in PostgreSQL
4. admin triggers carbon calculation for that season
5. the backend calculates estimated carbon credit from Organic Carbon readings
6. verifier reviews the pending record and approves or rejects it
7. farmer, verifier, and admin dashboards reflect the final status

## 4. Main Features

- role-based login for farmer, verifier, admin, and sensor users
- farmer dashboard with farms, seasons, recent measurements, and carbon history
- verifier dashboard with pending items, history, and approval comments
- admin panel with statistics, monthly credits, ThingSpeak sync, user view, and carbon calculation
- CNDC and DBMS implementation summary cards inside the admin panel
- landing page section that explicitly explains CNDC and DBMS evaluation value
- GitHub Pages demo mode for frontend-only presentations

## 5. Demo Accounts

Application accounts:

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`
- Sensor API user: `sensor_api` / `SensorDemo123!`

ThingSpeak channel used in the project:

- Channel ID: `3313997`

ThingSpeak field mapping:

- `field1` -> `Nitrogen`
- `field2` -> `Phosphorus`
- `field3` -> `Potassium`
- `field4` -> `Moisture`
- `field5` -> `Organic_Carbon`
- `field6` -> `depth_cm`

`Organic_Carbon` is the key field required for carbon-credit calculation.

## 6. Technology Stack

Frontend:

- React 18
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- Recharts
- Tailwind CSS

Backend:

- FastAPI
- SQLAlchemy 2.x
- Pydantic v2
- python-jose
- passlib bcrypt

Database:

- PostgreSQL
- Alembic environment for schema management

External integration:

- ThingSpeak

## 7. Repository Structure

```text
carbon_credit_backend/
|-- alembic/
|-- app/
|   |-- api/
|   |-- auth/
|   |-- core/
|   |-- crud/
|   |-- db/
|   |-- models/
|   |-- routers/
|   |-- schemas/
|   |-- services/
|   `-- main.py
|-- docs/                       GitHub Pages build output
|-- frontend/
|   |-- src/
|   |-- public/
|   `-- package.json
|-- scripts/
|-- tests/
|-- DEMO_README.md
|-- INSTALL_DEPENDENCIES.md
|-- main.py
`-- README.md
```

## 8. Quick Local Run

Backend:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Useful local URLs:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`
- `http://localhost:5173`

## 9. Main API Areas

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Farmer:

- `GET /api/farmer/dashboard`
- `GET /api/farmer/carbon-reports`

Verifier:

- `GET /api/verifier/pending-verifications`
- `GET /api/verifier/sequestration/{id}`
- `POST /api/verifier/approve/{id}`
- `POST /api/verifier/reject/{id}`

Admin:

- `GET /api/admin/statistics`
- `GET /api/admin/monthly-credits`
- `GET /api/admin/implementation-summary`
- `POST /api/admin/sync-thingspeak`
- `POST /api/admin/trigger-carbon-calculation`
- `GET /api/admin/users`
- `POST /api/admin/users`

Measurements:

- `POST /api/measurements`

## 10. Current Known Gaps

- the published GitHub Pages demo is still frontend-only
- `Forgot password` is still a placeholder
- CSV and PDF report export buttons are still placeholders
- some frontend data helpers still rely on legacy `/api/v1` endpoints
- production deployment should centralize all auth and environment settings more tightly

## 11. Recommended Reading Order

If you are new to the project, use this order:

1. `README.md` for project overview
2. `DEMO_README.md` for presentation and walkthrough steps
3. `INSTALL_DEPENDENCIES.md` for installation, testing, and rebuild commands
