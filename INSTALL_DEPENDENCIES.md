# Setup, Build, And Publish Commands

This file contains the practical commands used to install, run, test, and rebuild the Carbon Credit Monitoring System.

It covers:

- backend setup
- frontend setup
- local demo reset
- quality checks
- GitHub Pages rebuild steps

## 1. Prerequisites

Install these on the machine first:

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- PostgreSQL
- PowerShell

## 2. Backend Setup

Run these commands from the project root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `.env` with the correct values for your machine.

Minimum backend values:

```env
SECRET_KEY=change_this_to_a_long_random_secret_key
DATABASE_URL=postgresql+psycopg2://carbon_app_user:your_password@localhost:5432/carbon_credit_db
```

ThingSpeak values used by the project:

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

Start the backend:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Useful backend URLs:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## 3. Frontend Setup

Run these commands from the `frontend` folder:

```powershell
npm install
Copy-Item .env.example .env
```

Expected frontend `.env` value:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```powershell
npm run dev
```

## 4. Demo Reset Command

Use this before local presentations:

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
- demo farm and season data
- pending and historical verification records
- the active ThingSpeak demo season

## 5. ThingSpeak Demo Command

Use this to send fresh demo-ready entries:

```powershell
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

ThingSpeak field mapping:

- `field1` -> `Nitrogen`
- `field2` -> `Phosphorus`
- `field3` -> `Potassium`
- `field4` -> `Moisture`
- `field5` -> `Organic_Carbon`
- `field6` -> `depth_cm`

## 6. Quality Checks

Run backend tests from the project root:

```powershell
.\venv\Scripts\python.exe -m pytest -q
```

Run frontend lint from the `frontend` folder:

```powershell
npm run lint
```

Run frontend production build from the `frontend` folder:

```powershell
npm run build
```

## 7. Rebuild The GitHub Pages Demo

The published site is served from the repository `docs/` folder.

### Step 1: build the latest frontend

From the `frontend` folder:

```powershell
npm run lint
npm run build
```

### Step 2: copy the fresh build into `docs`

From the project root:

```powershell
Remove-Item .\docs\assets -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item .\frontend\dist\* .\docs -Recurse -Force
Copy-Item .\docs\index.html .\docs\404.html -Force
if (-not (Test-Path .\docs\.nojekyll)) { New-Item .\docs\.nojekyll -ItemType File | Out-Null }
```

### Step 3: commit and push the updated `docs/` files

```powershell
git add docs
git commit -m "Refresh GitHub Pages demo build"
git push
```

Important note:

- the current repository publishes GitHub Pages from `main /docs`
- if work is done on another branch first, the branch must be merged before the public site updates

## 8. Fastest Complete Local Startup

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

Demo reset terminal:

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

## 9. Quick Verification Checklist

After setup:

- backend root opens
- backend `/health` returns `{"status":"ok"}`
- backend `/docs` opens
- frontend opens at `http://localhost:5173`
- login works with demo accounts
- admin panel loads
- verifier dashboard loads
- farmer dashboard loads

## 10. Recommended Reading

- `README.md` for project overview and architecture
- `DEMO_README.md` for presentation order and talking points
