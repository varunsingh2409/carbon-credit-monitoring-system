# Local Demonstration Guide

This file is for the real local full-stack presentation.

When the DBMS rubric is used, `DBMS_EVALUATION_RUBRIC_README.md` maps each marking item to the exact app area, file, and viva explanation.

The local app proves:

- real FastAPI backend behavior
- real PostgreSQL persistence
- real ThingSpeak import
- real carbon calculation
- real verifier approval workflow
- visible CNDC and DBMS proof inside the website
- downloadable SQL and faculty artifacts if broader questions are asked

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
7. show the imported measurement evidence
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
- faculty-deliverable evaluation panel

Say:

- "This platform connects soil-data collection, carbon calculation, and verification into one workflow."
- "The website presents CNDC and DBMS directly through a visible technical evidence surface."

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
- sent-to-ThingSpeak and received-by-backend proof cards
- database population verification after sync
- carbon calculation
- final implementation evidence panel with CNDC trace, DBMS Query Lab, constraints, indexes, and artifact links

Say:

- "This is the operational control center where both the live workflow and the technical proof are visible."

### Step 5: Live workflow

Show:

- ThingSpeak sender
- ThingSpeak import
- Last Sync Result with imported/skipped counts and stored measurement IDs
- DBMS Query Lab row counts for `soil_measurement` and `measurement_result`
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
- the schema is relational and normalized to a practical 3NF shape, with BCNF-style determinants where suitable
- measurements, nutrients, seasons, sequestration, and verification are stored in connected tables
- formal constraints protect data quality, domain validity, coordinates, carbon snapshots, and verifier decisions
- indexes protect queryability for role filters, season lookups, measurement timelines, and verification history
- the DBMS query lab shows real tables, row samples, constraints, and indexes in the app
- the Normalization Atlas shows why `soil_measurement`, `measurement_result`, and `nutrient` are split instead of stored as one wide table
- database population is verified by comparing ThingSpeak imported counts with `soil_measurement` and `measurement_result` row counts

One-line answer:

> DBMS is demonstrated through a relational PostgreSQL schema, stored workflow history, constraints, indexes, and a visible queryable table explorer.

Data-population proof line:

> One normal ThingSpeak batch sends 5 measurement events. After import, that can create 5 `soil_measurement` rows and 25 `measurement_result` rows because each measurement stores 5 nutrient values separately.

## 6. Optional Supporting Analytics Talking Points

- the app correlates soil-health variables with organic carbon
- the app shows a regression model for the strongest predictor
- the app shows a seasonal hypothesis test
- the app shows a confidence interval for the carbon-credit estimate
- the final report status is presented as certification-readiness, not just as a raw number

This section is secondary material for questions beyond CNDC and DBMS. It should not lead the demonstration.

One-line answer:

> Supporting analytics is available through live correlation, regression, hypothesis testing, and confidence-interval output tied to the same soil and carbon records used by the workflow.

## 7. Quick Commands

Faculty deliverable files:

- `DBMS_EVALUATION_RUBRIC_README.md`
- `scripts/bootstrap_db.py`
- `scripts/formal_schema_constraints.sql`
- `scripts/seed_demo.sql`
- `deliverables/CNDC_SECURITY_AND_AUTHENTICITY_NOTE.md`
- `deliverables/CNDC_OSI_MODEL_MAPPING.md`
- `deliverables/SOIL_CARBON_ER_DIAGRAM.md`
- `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`
- `deliverables/r_analysis/soil_carbon_analysis.R`
- `deliverables/CARBON_CREDIT_ANALYTICAL_REPORT.md`

Admin implementation-artifact links open these same files directly from the local app.

Reset demo data:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f '.\scripts\seed_demo.sql'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f '.\scripts\formal_schema_constraints.sql'
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

## 8. Presentation-Readiness Checks

Before presenting, confirm:

- backend `/health` returns `ok`
- backend `/docs` opens
- frontend opens at `http://localhost:5173`
- landing page shows the implementation evidence explorer
- admin ThingSpeak Sync shows the sent/received proof cards
- farmer login works
- verifier login works
- admin login works
- ThingSpeak import works
- Last Sync Result shows imported/skipped counts and stored measurement IDs
- DBMS Query Lab shows populated `soil_measurement` and `measurement_result` tables
- carbon calculation works
- verifier approval works

## 9. Public Demo Note

The published website is useful for visual sharing only.

It is not the proof version for:

- live database writes
- live ThingSpeak import
- real API workflow persistence
- end-to-end verifier approval storage
