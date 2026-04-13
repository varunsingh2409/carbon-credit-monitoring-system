# Carbon Credit Monitoring System

This project should be presented and judged from the local full-stack app, not from the public website.

The local version is the real implementation and includes:

- React + TypeScript frontend
- FastAPI backend
- PostgreSQL database
- ThingSpeak integration
- JWT authentication with farmer, verifier, admin, and sensor roles
- real carbon calculation and verifier approval workflow
- visible CNDC trace and DBMS query lab inside the website
- optional supporting analytics and submission material inside the website

## 1. What To Use For Presentation

Use the local app for the actual presentation because it proves:

- real backend APIs
- real PostgreSQL persistence
- real ThingSpeak import
- real carbon calculation
- real verifier approval and stored workflow history

Your main semester evaluation focus should stay on CNDC and DBMS. The supporting analytics/reporting layer is available only if faculty asks about the broader problem statement.

Use these files in this order:

1. `README.md` for the local overview
2. `DEMO_README.md` for the live presentation flow
3. `INSTALL_DEPENDENCIES.md` for setup, reset, testing, and rebuild commands
4. `LOCAL_PRESENTATION_GUIDE.md` for the full speaking guide
5. `LOCAL_PRESENTATION_CHEATSHEET.md` for the short version during rehearsal

## 2. Core Workflow

1. sensor-style data is sent to ThingSpeak
2. admin imports that data into the selected season
3. FastAPI validates and stores the measurements in PostgreSQL
4. admin triggers carbon calculation
5. verifier reviews the resulting carbon record
6. verifier approves or rejects the record
7. farmer, verifier, and admin screens reflect the final state

## 3. Why This Fits CNDC

This project demonstrates CNDC through:

- ThingSpeak HTTP communication
- FastAPI REST APIs
- JSON request and response flow
- JWT-protected client-server access
- role-based routes
- `/health` and `/docs`
- a visible in-app CNDC trace explorer with endpoints, payloads, and workflow outcomes

Typical CNDC path:

1. ThingSpeak channel receives external data
2. admin triggers `/api/admin/sync-thingspeak`
3. backend reads ThingSpeak over HTTP
4. backend returns structured JSON to the frontend
5. dashboards consume live API responses
6. the implementation evidence screen shows the flow step by step

## 4. Why This Fits DBMS

This project demonstrates DBMS through:

- PostgreSQL as the main database
- normalized relational tables
- foreign keys across the measurement and verification workflow
- unique constraints and check constraints
- stored carbon-calculation results
- persistent verification history
- live counts and queryable table previews in the UI

Main tables:

- `users`
- `farmer`
- `farm`
- `season`
- `nutrient`
- `soil_measurement`
- `measurement_result`
- `carbon_sequestration`
- `carbon_verification`

## 5. Main Features

- role-based login for farmer, verifier, admin, and sensor users
- farmer dashboard with farms, seasons, measurements, and carbon outcomes
- verifier dashboard with pending review workflow and evidence details
- admin panel with statistics, ThingSpeak sync, carbon calculation, and user visibility
- admin support panel with direct links to the live database bootstrap, demo seed SQL, and faculty artifacts
- landing page with embedded technical proof
- CNDC trace explorer showing real communication flow
- DBMS query lab showing table rows, constraints, indexes, and schema details
- admin implementation control room using the same evidence surface
- optional supporting analytics panel for broader project questions
- optional faculty-deliverable support panel and submission files

## 6. Demo Accounts

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`
- Sensor API user: `sensor_api` / `SensorDemo123!`

ThingSpeak mapping used by the app:

- `field1` -> `Nitrogen`
- `field2` -> `Phosphorus`
- `field3` -> `Potassium`
- `field4` -> `Moisture`
- `field5` -> `Organic_Carbon`
- `field6` -> `depth_cm`

`Organic_Carbon` is the required field for carbon-credit calculation.

## 7. Local URLs

- Frontend: `http://localhost:5173`
- Backend root: `http://127.0.0.1:8000`
- Health: `http://127.0.0.1:8000/health`
- Docs: `http://127.0.0.1:8000/docs`
- Public implementation evidence: `http://127.0.0.1:8000/api/implementation/evidence`

## 8. Main API Areas

Authentication:

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

Technical proof:

- `GET /api/implementation/evidence`
- `GET /api/implementation/artifacts/{artifact_id}`

## 9. Technology Stack

Frontend:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios

Backend:

- FastAPI
- SQLAlchemy 2.x
- Pydantic v2
- python-jose
- passlib bcrypt

Database:

- PostgreSQL
- Alembic

External integration:

- ThingSpeak

## 10. Repository Structure

```text
carbon_credit_backend/
|-- alembic/
|-- app/
|-- deliverables/
|-- docs/                       GitHub Pages build output only
|-- frontend/
|-- scripts/
|-- tests/
|-- DEMO_README.md
|-- INSTALL_DEPENDENCIES.md
|-- LOCAL_PRESENTATION_GUIDE.md
|-- LOCAL_PRESENTATION_CHEATSHEET.md
`-- README.md
```

## 11. Faculty Deliverables

Faculty-facing submission files are kept in:

- `deliverables/CNDC_SECURITY_AND_AUTHENTICITY_NOTE.md`
- `deliverables/CNDC_OSI_MODEL_MAPPING.md`
- `deliverables/SOIL_CARBON_ER_DIAGRAM.md`
- `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`
- `deliverables/r_analysis/soil_carbon_measurements.csv`
- `deliverables/r_analysis/soil_carbon_analysis.R`
- `deliverables/CARBON_CREDIT_ANALYTICAL_REPORT.md`
- `deliverables/SUBMISSION_MAP.md`

These files support the local app demonstration. They are secondary to the CNDC and DBMS proof shown in the app.

The admin panel now exposes direct artifact links for the real schema/bootstrap script, the real demo seed SQL, and these supporting deliverables so you can open them during viva or faculty questions without leaving the app context.

## 12. Quick Local Start

Backend:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Demo reset:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f '.\scripts\seed_demo.sql'
```

ThingSpeak sender:

```powershell
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

## 13. Public Demo Note

The GitHub Pages site is only for visual sharing and limited walkthroughs.

It uses the same frontend design, but it is still frontend-only and should not be used as proof of:

- real database persistence
- live backend behavior
- live ThingSpeak import
- live verifier workflow storage

For actual presentation and evaluation, use the local app.
