# Local Demonstration Guide

This file is for the real local full-stack presentation.

Use the local app when you need to prove:

- real FastAPI backend behavior
- real PostgreSQL persistence
- real ThingSpeak import
- real carbon calculation
- real verifier approval workflow
- visible CNDC and DBMS proof inside the website

The public GitHub Pages site is only a limited visual demo and should be treated as secondary.

## 1. Credentials

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`
- Sensor user: `sensor_api` / `SensorDemo123!`

## 2. Local Demo Flow

1. reset the demo database
2. start the backend
3. start the frontend
4. open farmer, verifier, and admin sessions
5. send the ThingSpeak demo batch
6. import ThingSpeak data from the admin panel
7. show the updated measurement evidence
8. trigger carbon calculation
9. approve the record as verifier
10. refresh all roles and show the final verified state

## 3. Recommended Presentation Order

### Step 1: Landing page

Show:

- hero section
- implementation evidence explorer
- CNDC trace
- DBMS query lab

Say:

- "This platform connects soil-data collection, carbon calculation, and verification into one workflow."
- "The website now proves CNDC and DBMS directly through a visible technical evidence surface."

### Step 2: Farmer dashboard

Show:

- farm and season summary
- recent measurements
- carbon results

Say:

- "The farmer sees the outcome of the workflow without needing technical backend access."

### Step 3: Verifier dashboard

Show:

- pending items
- verification detail screen

Say:

- "The verifier is the trust layer. Carbon records are reviewed before they become accepted outcomes."

### Step 4: Admin panel

Show:

- statistics
- ThingSpeak sync
- carbon calculation
- implementation control room

Say:

- "This is the operational control center where both the live workflow and the technical proof are visible."

### Step 5: Live workflow

Show:

- ThingSpeak sender
- ThingSpeak import
- fresh measurement evidence
- carbon calculation
- verifier approval
- final dashboard state

Say:

- "The system moves from external communication to stored database records and then to verified carbon output."

## 4. CNDC Talking Points

- ThingSpeak is the external communication source
- the frontend communicates with FastAPI through REST APIs
- data moves in JSON payloads
- JWT protects role-based routes
- `/health` and `/docs` validate the backend service
- the CNDC trace explorer shows endpoints, methods, payloads, and outcomes directly in the website

One-line answer:

> CNDC is demonstrated through ThingSpeak communication, REST APIs, JSON exchange, secure role-based routes, and the visible in-app communication trace.

## 5. DBMS Talking Points

- PostgreSQL stores all persistent records
- the schema is relational and normalized
- measurements, nutrients, seasons, sequestration, and verification are stored in connected tables
- constraints and indexes protect data quality and queryability
- the DBMS query lab shows real tables, row samples, constraints, and indexes in the app

One-line answer:

> DBMS is demonstrated through a relational PostgreSQL schema, stored workflow history, constraints, indexes, and a visible queryable table explorer.

## 6. Quick Commands

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

## 7. Presentation-Readiness Checks

Before presenting, confirm:

- backend `/health` returns `ok`
- backend `/docs` opens
- frontend opens at `http://localhost:5173`
- landing page shows the implementation evidence explorer
- farmer login works
- verifier login works
- admin login works
- ThingSpeak import works
- carbon calculation works
- verifier approval works

## 8. Public Demo Note

The published website is useful when you only need to share the look of the product.

It is not the version you should rely on for proving:

- live database writes
- live ThingSpeak import
- real API workflow persistence
- end-to-end verifier approval storage
