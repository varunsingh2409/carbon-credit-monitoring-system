# Setup, Verification, And Publish Commands

This file is the command reference for the local full-stack app.

It is mainly for:

- local setup
- local reset
- local testing
- local presentation verification

The public demo rebuild is included at the end because it is secondary.

## 1. Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL
- PowerShell

## 2. Backend Setup

Run from the project root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Minimum backend values:

```env
SECRET_KEY=change_this_to_a_long_random_secret_key
DATABASE_URL=postgresql+psycopg2://carbon_app_user:your_password@localhost:5432/carbon_credit_db
```

ThingSpeak values:

```env
THINGSPEAK_CHANNEL_ID=3313997
THINGSPEAK_SENSOR_ID=THINGSPEAK-3313997
THINGSPEAK_DEFAULT_DEPTH_CM=10.0
THINGSPEAK_IMPORT_RESULTS=5
```

Run migrations:

```powershell
alembic upgrade head
```

Start backend:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Useful backend URLs:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/api/implementation/evidence`
- `http://127.0.0.1:8000/api/implementation/artifacts/seed-demo-sql`

Faculty deliverable files:

- `DBMS_EVALUATION_RUBRIC_README.md`
- `scripts/bootstrap_db.py`
- `scripts/seed_demo.sql`
- `deliverables/CNDC_SECURITY_AND_AUTHENTICITY_NOTE.md`
- `deliverables/CNDC_OSI_MODEL_MAPPING.md`
- `deliverables/SOIL_CARBON_ER_DIAGRAM.md`
- `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`
- `deliverables/r_analysis/soil_carbon_analysis.R`
- `deliverables/CARBON_CREDIT_ANALYTICAL_REPORT.md`

## 3. Frontend Setup

Run from `frontend`:

```powershell
npm install
Copy-Item .env.example .env
```

Expected frontend `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start frontend:

```powershell
npm run dev
```

## 4. Demo Reset

Run before every local presentation:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -f '.\scripts\seed_demo.sql'
```

This resets:

- demo users
- farm and season data
- seeded measurements
- historical verification state

## 5. ThingSpeak Demo Sender

Use this to push fresh external records before import:

```powershell
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

Field mapping:

- `field1` -> `Nitrogen`
- `field2` -> `Phosphorus`
- `field3` -> `Potassium`
- `field4` -> `Moisture`
- `field5` -> `Organic_Carbon`
- `field6` -> `depth_cm`

## 6. Local Quality Checks

Backend tests:

```powershell
.\venv\Scripts\python.exe -m pytest -q
```

Frontend lint:

```powershell
cd frontend
npm run lint
```

Frontend build:

```powershell
cd frontend
npm run build
```

## 7. Local Presentation Verification

Use this checklist before the actual presentation:

- backend `/health` returns `{"status":"ok"}`
- backend `/docs` opens
- backend `/api/implementation/evidence` returns CNDC flow and table details, with optional supporting analytics if needed
- admin support panel opens the implementation artifact links for the live bootstrap and seed SQL
- `DBMS_EVALUATION_RUBRIC_README.md` is open if the faculty evaluates using the DBMS rubric
- frontend opens at `http://localhost:5173`
- landing page shows the implementation evidence explorer and presents CNDC/DBMS as the main story
- admin ThingSpeak Sync shows sent-to-ThingSpeak and received-by-backend proof cards
- farmer login works
- verifier login works
- admin login works
- ThingSpeak import works
- Last Sync Result shows imported/skipped counts and stored measurement IDs
- DBMS Query Lab shows `soil_measurement` and `measurement_result` row counts after import
- carbon calculation works
- verifier approval works

## 8. Fastest Local Startup

Backend terminal:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend terminal:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run dev
```

Reset terminal:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f '.\scripts\seed_demo.sql'
```

ThingSpeak sender terminal:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

## 9. Public Demo Rebuild

This is only for the limited public website.

Build the frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Copy the build into `docs`:

```powershell
cd ..
Remove-Item .\docs\assets -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item .\frontend\dist\* .\docs -Recurse -Force
Copy-Item .\docs\index.html .\docs\404.html -Force
if (-not (Test-Path .\docs\.nojekyll)) { New-Item .\docs\.nojekyll -ItemType File | Out-Null }
```

The published build also carries the static implementation-artifact copies from `frontend\public\implementation-artifacts`, so the demo website can open the same files without a live backend.

Commit and push:

```powershell
git add docs
git commit -m "Refresh GitHub Pages demo build"
git push
```
