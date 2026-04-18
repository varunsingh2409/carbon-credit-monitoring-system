# Carbon Credit Monitoring System Local Demo Cheat Sheet

Use this during rehearsal or while presenting.

Full preparation guide:

[LOCAL_PRESENTATION_GUIDE.md](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/LOCAL_PRESENTATION_GUIDE.md)

DBMS rubric guide:

[DBMS_EVALUATION_RUBRIC_README.md](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/DBMS_EVALUATION_RUBRIC_README.md)

## 1. Use The Local App

Open:

`http://localhost:5173`

Do not use the GitHub Pages website for the full feature demonstration.

## 2. Credentials

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`

## 3. Terminal Setup

1. backend
2. frontend
3. reset and proof
4. ThingSpeak sender

## 4. Browser Setup

1. normal browser = farmer
2. incognito = verifier
3. second incognito or another browser = admin

## 5. Reset Demo First

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\seed_demo.sql'
```

## 6. Start Backend

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check:

`http://127.0.0.1:8000/health`

Expected:

```json
{"status":"ok"}
```

## 7. Start Frontend

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run dev
```

Then open:

`http://localhost:5173`

## 8. Best Demo Order

1. landing page
2. login page
3. farmer dashboard
4. verifier dashboard
5. admin panel
6. CNDC trace
7. DBMS query lab
8. optional supporting analytics panel only if needed
9. ThingSpeak sender
10. import data
11. show sent-to-ThingSpeak and received-by-backend proof
12. show database population verification and stored measurement IDs
13. refresh farmer dashboard
14. calculate carbon credits
15. approve as verifier
16. refresh all dashboards

## 9. ThingSpeak Sender

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

## 10. What To Say At Each Screen

### Opening

This system receives external soil-style data, validates it, stores it in PostgreSQL, calculates carbon-credit estimates, routes them through verifier approval, and shows the final result in role-based dashboards.

### Landing page

This screen introduces the project and presents CNDC and DBMS directly through the built-in evidence surfaces.

### Login

Different users should not have the same access, so the app uses role-based authentication and routing.

### Farmer

The farmer sees measurements, seasonal progress, and carbon outcomes.

### Verifier

The verifier reviews evidence before a carbon claim is accepted.

### Admin

The admin imports data, shows ThingSpeak sent/received proof, verifies database population, triggers calculation, monitors the platform, and uses the implementation control room plus the artifact links for bootstrap SQL support and faculty files.

### CNDC

CNDC is shown through ThingSpeak communication, FastAPI REST APIs, JSON exchange, JWT-protected workflows, and the visible flow-step explorer.

### DBMS

DBMS is shown through PostgreSQL tables, relationships, stored measurements, carbon records, verification history, and the queryable table explorer with constraints.

### Optional Supporting Analytics

This optional panel shows correlation, regression, hypothesis test, confidence interval, and report-readiness material only if broader project questions come up.

### ThingSpeak import

The admin is importing live external data into FastAPI and PostgreSQL. The website shows what was sent to ThingSpeak, what the backend received, how many rows were imported or skipped, and which measurement IDs were stored.

### Carbon calculation

The system is converting imported Organic Carbon data into an estimated carbon credit.

### Verifier approval

The verifier checks the evidence and then approves the record.

### Final state

All dashboards reflect the completed workflow end to end.

## 11. Strongest CNDC Points

1. ThingSpeak is the external communication source
2. FastAPI exposes REST endpoints
3. frontend and backend exchange JSON
4. JWT protects role-based routes
5. `/health` and `/docs` prove backend service
6. the website shows endpoints, payloads, and outcomes step by step

## 12. Strongest DBMS Points

1. PostgreSQL is the main database
2. the schema is relational and normalized to a practical 3NF shape
3. measurements and results are stored separately
4. carbon and verification records are persisted
5. admin counts come from live database queries
6. the Normalization Atlas explains the measurement decomposition
7. the website shows queries, row samples, constraints, and indexes
8. database population is verified through ThingSpeak imported counts and DBMS table row counts

Rubric order:

1. normalization
2. schema constraints
3. data population
4. SELECT, JOIN, GROUP BY, and nested queries
5. ERD and design-choice viva
6. implementation-knowledge viva

## 13. Carbon Formula

```text
estimated credit = (net carbon increase x farm area x 3.67) / 1000
```

## 14. Important Tables To Mention

1. `users`
2. `farm`
3. `season`
4. `soil_measurement`
5. `measurement_result`
6. `carbon_sequestration`
7. `carbon_verification`

## 15. Important Endpoints To Mention

1. `POST /api/auth/login`
2. `GET /api/implementation/evidence`
3. `POST /api/admin/sync-thingspeak`
4. `POST /api/admin/trigger-carbon-calculation`
5. `POST /api/verifier/approve/{id}`
6. `GET /health`
7. `GET /docs`

## 16. Do Not Demo These As Finished Features

1. forgot password
2. full user-management CRUD

## 17. Quick Answers

### Why CNDC?

Because the project demonstrates external communication, REST APIs, JSON exchange, secure client-server interaction, and a visible on-site CNDC trace.

### Why DBMS?

Because the project demonstrates normalized PostgreSQL tables, relationships, persistent records, workflow history, and a queryable DBMS explorer with constraints and rows.

### How do we prove data population?

Use the admin ThingSpeak Sync result and DBMS Query Lab. A fresh 5-row ThingSpeak batch can create 5 `soil_measurement` rows and 25 `measurement_result` rows because each measurement stores 5 nutrient values separately.

### What is the core workflow?

ThingSpeak -> FastAPI -> PostgreSQL -> carbon calculation -> verifier approval -> dashboards.

### Where are the faculty deliverables?

Inside `deliverables\` in the project root.

## 18. Quick Fixes

### Login fails

Run the reset SQL again.

### Backend fails

Check PostgreSQL and rerun backend.

### Frontend fails

Rerun `npm run dev`.

### Calculation fails

Run `thingspeak_demo_batch.py` again so `Organic_Carbon` is present.

### Wrong site opened

Close it and reopen `http://localhost:5173`.

## 19. Closing Line

This project demonstrates a complete carbon-credit workflow from external communication to stored database records and verified outcomes, with clear relevance to both CNDC and DBMS.
