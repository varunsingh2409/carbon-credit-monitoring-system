# Demo Guide

This file explains how to demonstrate the Carbon Credit Monitoring System in two ways:

- the published GitHub Pages demo
- the complete local full-stack version

Use the published version when you only need a clean online UI walkthrough.
Use the local version when you want to show the real backend, real database, and live ThingSpeak flow.

## 1. Demo Credentials

Use these accounts in both the published demo and the local app:

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`

Additional local API account:

- Sensor user: `sensor_api` / `SensorDemo123!`

## 2. Published Demo

URL:

- https://varunsingh2409.github.io/carbon-credit-monitoring-system/

What the published demo is good for:

- showing the landing page design
- showing role-based login
- opening farmer, verifier, and admin dashboards
- explaining the workflow visually
- showing CNDC and DBMS sections in the landing page and admin panel

What the published demo does not prove yet:

- real backend persistence
- real PostgreSQL data changes
- real ThingSpeak import
- real online verification records

Important note:

- the published demo is frontend-only and uses demo-mode data in the browser

### Published demo walkthrough

1. open the URL
2. click `Get Started` or `Sign In`
3. use the farmer account and show the farmer dashboard
4. log out and use the verifier account to show pending items and history
5. log out and use the admin account to show statistics, ThingSpeak sync, carbon calculation, and CNDC/DBMS sections
6. explain that this online version is the presentation-friendly frontend build, while the complete working stack already runs locally

## 3. Local Full-Stack Demo

The local version is the real implementation. It includes:

- FastAPI backend
- PostgreSQL database
- real JWT authentication
- real ThingSpeak sync
- real carbon calculation
- real verifier approval persistence

### Local prerequisites

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL
- internet connection for ThingSpeak

### ThingSpeak mapping used by the app

- `field1` -> `Nitrogen`
- `field2` -> `Phosphorus`
- `field3` -> `Potassium`
- `field4` -> `Moisture`
- `field5` -> `Organic_Carbon`
- `field6` -> `depth_cm`

### Local demo flow

1. reset the demo database
2. start the backend
3. start the frontend
4. open farmer, verifier, and admin sessions
5. send demo data to ThingSpeak
6. import ThingSpeak data from the admin panel
7. show new measurements on the farmer dashboard
8. trigger carbon calculation from the admin panel
9. approve the new record as verifier
10. refresh all dashboards and show the final verified result

## 4. Suggested Presentation Order

### Step 1: Landing page

Show:

- product positioning
- feature cards
- CNDC and DBMS evaluation section

Say:

- "This platform is designed to connect soil-data collection, carbon calculation, and verification into one workflow."
- "It also clearly demonstrates both CNDC and DBMS implementation."

### Step 2: Farmer dashboard

Show:

- farm and season summaries
- recent measurements
- carbon trend view

Say:

- "The farmer sees the operational result of the system without needing technical knowledge."

### Step 3: Verifier dashboard

Show:

- pending items
- approval history
- verification details

Say:

- "The verifier adds trust to the process by reviewing evidence before a carbon claim is accepted."

### Step 4: Admin panel

Show:

- platform statistics
- monthly credits chart
- ThingSpeak sync section
- carbon calculation button
- CNDC implementation section
- DBMS implementation section

Say:

- "This screen is where the system behavior becomes easy to explain technically."

### Step 5: Live data and workflow

Show:

- ThingSpeak import
- measurement updates
- carbon calculation
- verifier approval

Say:

- "The system moves from external data intake to verified carbon output in one continuous workflow."

## 5. CNDC Talking Points

Use these points if the evaluation focuses on communication and networking:

- the app communicates with ThingSpeak over HTTP
- the frontend communicates with FastAPI through REST APIs
- data moves as JSON between client and server
- JWT protects role-based routes
- the backend exposes `/health` and `/docs` for service validation
- the full communication path is:
  - ThingSpeak -> FastAPI -> PostgreSQL -> React dashboards

## 6. DBMS Talking Points

Use these points if the evaluation focuses on database management:

- PostgreSQL stores all persistent application records
- the schema is relational and normalized
- the workflow uses linked tables rather than one large flat table
- measurements, nutrients, seasons, sequestration, and verification are stored separately but connected with foreign keys
- verifier approval writes persistent workflow history
- admin statistics are generated from database-backed counts

## 7. Quick Local Commands

These are the minimum commands used most often.

Reset demo data:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f '.\scripts\seed_demo.sql'
```

Start backend:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start frontend:

```powershell
cd frontend
npm run dev
```

Send ThingSpeak demo batch:

```powershell
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

## 8. Common Questions To Be Ready For

### Is the published site fully live?

No. The published GitHub Pages site is a frontend demo build.

### Is the full app working?

Yes. The complete backend, database, ThingSpeak import, carbon calculation, and verification workflow work locally.

### Why use the published demo then?

Because it is easy to share online and useful for UI walkthroughs before the full backend deployment.

### What proves the DBMS part?

The PostgreSQL tables, relations, workflow history, and admin implementation summary.

### What proves the CNDC part?

ThingSpeak integration, FastAPI REST APIs, JSON communication, and role-based protected routes.
