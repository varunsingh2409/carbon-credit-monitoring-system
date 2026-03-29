# Carbon Credit Monitoring System Full Demo Guide

This is the complete step-by-step demonstration guide for the Carbon Credit Monitoring System.

This guide is written so that even a non-technical presenter can follow it and demonstrate:

- frontend UI
- backend APIs
- role-based login
- ThingSpeak live data flow
- FastAPI ingestion
- database storage
- carbon calculation
- verifier approval
- final dashboard updates

If you only want the technical system explanation, read `README.md`.

## 1. What This Demo Proves

By the end of this guide, you will demonstrate the full flow:

1. ThingSpeak receives sensor-like soil data
2. The admin panel imports that ThingSpeak data into FastAPI
3. FastAPI validates and stores it in PostgreSQL
4. The farmer dashboard shows the newly imported measurements
5. The admin triggers carbon calculation
6. The verifier reviews and approves the carbon record
7. Farmer, verifier, and admin dashboards all update correctly

## 2. Project Paths Used In This Guide

Project root:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

Frontend folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend`

## 3. Prerequisites

Make sure the machine has:

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL
- PowerShell
- internet access for ThingSpeak

## 4. Important Files Used In The Demo

Backend entrypoint:

- [main.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/main.py)

Frontend app:

- [frontend/src/App.tsx](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/frontend/src/App.tsx)

Demo reset SQL:

- [scripts/seed_demo.sql](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/seed_demo.sql)

ThingSpeak demo sender:

- [scripts/thingspeak_demo_batch.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/thingspeak_demo_batch.py)

ThingSpeak reader:

- [scripts/thingspeak_reader.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/thingspeak_reader.py)

Optional custom sender:

- [scripts/thingspeak_sender.py](C:/Users/popul/Downloads/carbon_credit_backend/mnt/data/carbon_credit_backend/scripts/thingspeak_sender.py)

## 5. Credentials Used In The Demo

### Web app login credentials

- Farmer: `farmer1` / `FarmerDemo123!`
- Verifier: `verifier1` / `VerifierDemo123!`
- Admin: `admin` / `AdminDemo123!`
- Sensor API account: `sensor_api` / `SensorDemo123!`

### ThingSpeak credentials already configured in the project

- Channel ID: `3313997`
- Read API Key: `XLY9SEEHTH8W7VZ4`
- Write API Key: `N14MWJ8WKO8E1URT`

## 6. What ThingSpeak Fields Mean In This System

This is the mapping used by the application:

- `field1 -> Nitrogen`
- `field2 -> Phosphorus`
- `field3 -> Potassium`
- `field4 -> Moisture`
- `field5 -> Organic_Carbon`
- `field6 -> depth_cm`

Important note:

- `Organic_Carbon` is required for carbon calculation
- without `field5`, data can still be imported, but carbon calculation will not complete

That is why this guide uses `thingspeak_demo_batch.py`, which sends all required fields.

## 6A. One-Time ThingSpeak Channel Configuration

This step must be done once in ThingSpeak itself.

The current application expects the ThingSpeak channel to expose **6 fields**, not just 4.

Open the ThingSpeak account that owns channel `3313997`, then:

1. open channel `3313997`
2. go to `Channel Settings`
3. make sure these fields are enabled and named exactly like this:
   - `Field 1 = Nitrogen`
   - `Field 2 = Phosphorus`
   - `Field 3 = Potassium`
   - `Field 4 = Moisture`
   - `Field 5 = Organic_Carbon`
   - `Field 6 = Depth_cm`
4. save the channel settings

Why this is required:

- the Carbon Credit System can import 4-field data
- but carbon calculation requires `Organic_Carbon`
- without `Field 5`, the system will store measurements but will not be able to calculate carbon sequestration

Important:

- during live validation, the current channel was still returning only fields `1-4`
- so this one-time ThingSpeak channel settings step is required before the full calculation demo will work reliably

## 7. First-Time Installation

If this machine has never run the app before, do these steps once.

## Step 1: Open Terminal 1 And Install Backend Dependencies

Open PowerShell in:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

Run:

```powershell
C:\edb\languagepack\v3\Python-3.10\python.exe -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Step 2: Prepare Backend Environment File

Still in the project root:

```powershell
Copy-Item .env.example .env
```

This project already includes the ThingSpeak values in `.env`, but if needed, make sure these exist:

```env
THINGSPEAK_CHANNEL_ID=3313997
THINGSPEAK_READ_API_KEY=XLY9SEEHTH8W7VZ4
THINGSPEAK_WRITE_API_KEY=N14MWJ8WKO8E1URT
THINGSPEAK_SENSOR_ID=THINGSPEAK-3313997
THINGSPEAK_DEFAULT_DEPTH_CM=10.0
THINGSPEAK_IMPORT_RESULTS=5
```

## Step 3: Run Backend Database Migrations

From the project root:

```powershell
.\venv\Scripts\python.exe -m alembic upgrade head
```

## Step 4: Open Terminal 2 And Install Frontend Dependencies

Open PowerShell in:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend`

Run:

```powershell
npm install
Copy-Item .env.example .env
```

Frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:8000
```

## 8. How Many Terminals To Open For The Demo

For the smoothest live demo, open **4 terminals**.

### Terminal 1: Backend Server

Purpose:

- run FastAPI

Folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

### Terminal 2: Frontend Server

Purpose:

- run Vite frontend

Folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend`

### Terminal 3: Demo Reset / Database / Proof Commands

Purpose:

- reset demo data
- run optional SQL checks

Folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

### Terminal 4: ThingSpeak Demo Sender

Purpose:

- send 5 demo-ready records to ThingSpeak

Folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

## 9. Recommended Browser Windows

Open 3 browser sessions:

- normal browser window for farmer
- incognito/private window for verifier
- second incognito/private window or another browser for admin

This avoids repeated logout/login during the demo.

## 10. Demo Reset Before Every Presentation

Before every demo, run this from **Terminal 3**:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\seed_demo.sql'
```

This does all of the following:

- resets demo user passwords
- recreates or updates demo farmer/farms/seasons
- resets the live demo season `Monsoon 2026 Demo` to `active`
- deletes previous live demo measurements for that season
- recreates one historical verified record
- recreates one pending verification record
- ensures demo nutrients exist, including `Moisture`

## 11. Start The Backend

In **Terminal 1**, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check these URLs:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

Expected health response:

```json
{"status":"ok"}
```

## 12. Start The Frontend

In **Terminal 2**, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run dev
```

Open:

- `http://localhost:5173`

## 13. Optional ThingSpeak Monitor

If you want to show ThingSpeak entries arriving in real time, you can run the reader script in another terminal.

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_reader.py
```

This is optional, not required.

## 14. Best Demo Order

Use this exact order:

1. show landing page
2. log in as farmer
3. log in as verifier
4. log in as admin
5. send ThingSpeak demo batch
6. import ThingSpeak data from admin panel
7. refresh farmer dashboard
8. trigger carbon calculation from admin panel
9. approve as verifier
10. refresh farmer, verifier, and admin dashboards

## 15. Browser Demonstration Steps

## Step 1: Show The Landing Page

Open:

- `http://localhost:5173`

Show:

- hero section
- feature cards
- metrics
- learn more modal
- get started button

Suggested explanation:

- "This is the Carbon Credit Monitoring System for farmers, verifiers, and administrators."
- "The system combines IoT-style soil data, carbon calculation, and workflow verification."

## Step 2: Log In As Farmer

Use the farmer window.

Login values:

- Username: `farmer1`
- Password: `FarmerDemo123!`
- Role: `Farmer`

Expected redirect:

- `/farmer/dashboard`

Show:

- total farm stats
- farms and seasons
- carbon trend chart
- recent measurements table

What to say:

- "The farmer sees field performance and verification progress in one dashboard."

## Step 3: Log In As Verifier

Use the verifier window.

Login values:

- Username: `verifier1`
- Password: `VerifierDemo123!`
- Role: `Verifier`

Expected redirect:

- `/verifier/dashboard`

Show:

- pending tab
- history tab

What to say:

- "Verifiers review evidence before carbon claims are considered verified."

## Step 4: Log In As Admin

Use the admin window.

Login values:

- Username: `admin`
- Password: `AdminDemo123!`
- Role: `Admin`

Expected redirect:

- `/admin/panel`

Show:

- statistics
- monthly credits chart
- ThingSpeak sync card
- carbon calculation card
- user management modal

What to say:

- "Admins control the operational flow and can pull new ThingSpeak data into the system."

## 16. Send Live ThingSpeak Demo Data

This is the key step that makes the integration complete.

In **Terminal 4**, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

What this script does:

- sends 5 demo-ready entries to ThingSpeak
- includes:
  - Nitrogen
  - Phosphorus
  - Potassium
  - Moisture
  - Organic_Carbon
  - Depth
- waits 16 seconds between entries to respect ThingSpeak rate limits
- validates that ThingSpeak can read back `field5` and `field6`

How long it takes:

- about 1 minute 20 seconds

Expected output:

- each row prints a ThingSpeak entry id
- final message says the batch is complete
- then it checks whether `Organic_Carbon` and `Depth` are actually readable from the channel

If the script ends with a channel configuration error:

- go back to section `6A`
- enable `Field 5` and `Field 6` in ThingSpeak
- rerun the script

Important note:

- this is the **recommended** script for demos
- do not rely on the teammate’s old 4-field sender if you want carbon calculation to work
- that old version does not send `Organic_Carbon`

## 17. Import ThingSpeak Data Into FastAPI

Go to the **Admin Panel** in the browser.

In the season selector:

- choose `Green Valley Farm | Monsoon 2026 Demo`

Then:

1. click `Import ThingSpeak Data`

Expected result:

- success toast appears
- last sync result shows:
  - channel id
  - imported count
  - skipped count

Expected imported count:

- usually `5` if you just ran the demo batch script and reset the system first

What to say:

- "The admin is pulling real data from ThingSpeak into the FastAPI backend."
- "That data is validated, mapped, and stored in PostgreSQL."

## 18. Show The Imported Measurements On The Farmer Dashboard

Go back to the farmer browser window and refresh:

- `http://localhost:5173/farmer/dashboard`

Expected result:

- the recent measurements table now shows the ThingSpeak-imported records
- the live season is still active at this point
- measurements are now in the system, but carbon calculation has not yet been triggered

What to say:

- "The farmer sees the imported measurements almost immediately after the admin sync."

## 19. Trigger Carbon Calculation

Go back to the admin browser window.

In the `Trigger Carbon Calculation` section:

1. keep `Monsoon 2026 Demo` selected
2. click `Calculate Credits`

Expected result:

- success toast appears
- a new carbon sequestration record is created
- season moves from `active` to `completed`

## 20. Explain The Carbon Formula

The backend uses:

```text
estimated_carbon_credit = (net_carbon_increase * farm_area_hectares * 3.67) / 1000
```

Where:

- `net_carbon_increase = current_carbon - baseline_carbon`
- `farm_area_hectares` comes from the farm record
- `3.67` converts carbon to CO2 equivalent

What to say:

- "The system calculates season-level sequestration from imported soil data and farm context."
- "The formula is explicit and reviewable by the verifier."

## 21. Approve As Verifier

Go to the verifier browser window.

Refresh the verifier dashboard.

Expected result:

- a new pending verification appears for the imported/calculated season

Then:

1. click `Review Details`
2. inspect the farm information and measurement evidence
3. enter verifier comments
4. click `Approve`

Expected result:

- approval success toast
- sequestration status becomes verified
- verification history updates

What to say:

- "The verifier can see both the carbon summary and the underlying measurement evidence."

## 22. Final Refresh Checks

## Farmer

Refresh the farmer dashboard.

Expected result:

- the season now shows carbon data
- verification status is updated

## Verifier

Refresh the verifier dashboard.

Expected result:

- pending count decreases
- approved record appears in history

## Admin

Refresh the admin panel.

Expected result:

- credits issued update
- monthly chart can reflect new approved credit totals

## 23. Optional API Proof Commands

Use these if someone asks for technical proof.

## Check backend health

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health'
```

## Admin login

```powershell
$adminLogin = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/auth/login' `
  -ContentType 'application/json' `
  -Body '{"username":"admin","password":"AdminDemo123!"}'

$adminToken = $adminLogin.access_token
```

## Manual ThingSpeak sync via API

```powershell
$headers = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/admin/sync-thingspeak' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"season_id":4}'
```

## Manual carbon calculation via API

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/admin/trigger-carbon-calculation' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"season_id":4}'
```

## 24. Optional Database Proof Commands

## Show imported measurements

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT measurement_id, measurement_date, depth_cm, sensor_id FROM soil_measurement ORDER BY measurement_id DESC LIMIT 10;"
```

## Show measurement nutrients

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT sm.measurement_id, n.nutrient_name, mr.measured_value FROM soil_measurement sm JOIN measurement_result mr ON mr.measurement_id = sm.measurement_id JOIN nutrient n ON n.nutrient_id = mr.nutrient_id ORDER BY sm.measurement_id DESC LIMIT 30;"
```

## Show sequestration data

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT sequestration_id, season_id, baseline_carbon, current_carbon, net_carbon_increase, estimated_carbon_credit, status FROM carbon_sequestration ORDER BY sequestration_id DESC;"
```

## Show verification data

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT verification_id, sequestration_id, verifier_id, verification_status, approved_carbon_credit, verification_date FROM carbon_verification ORDER BY verification_id DESC;"
```

## 25. Common Problems And Fixes

## Problem: Backend does not start

Fix:

- make sure you ran:
  - `.\venv\Scripts\python.exe -m pip install -r requirements.txt`
- make sure PostgreSQL is running
- make sure `.env` contains a valid `DATABASE_URL`

## Problem: Frontend does not load

Fix:

- run `npm install`
- confirm `frontend\.env` contains `VITE_API_URL=http://localhost:8000`

## Problem: ThingSpeak import works but carbon calculation fails

Cause:

- the imported ThingSpeak data probably does not include `Organic_Carbon`
- or ThingSpeak channel field `5` is not enabled yet

Fix:

- complete the one-time ThingSpeak setup in section `6A`
- use `scripts/thingspeak_demo_batch.py`
- or use `scripts/thingspeak_sender.py` and manually send `field5 = Organic_Carbon`

## Problem: Imported count is zero

Possible causes:

- latest ThingSpeak entries were already imported
- the selected season is wrong
- ThingSpeak did not receive fresh rows

Fix:

1. rerun the demo reset SQL
2. run `thingspeak_demo_batch.py`
3. click `Import ThingSpeak Data` again

## Problem: Season is no longer active before import

Fix:

- rerun the demo reset SQL from section 10

## Problem: Admin panel sync fails

Fix:

- confirm internet access is available
- confirm ThingSpeak credentials in `.env`
- confirm backend is running

## 26. One-Line Demo Summary

If you need a closing sentence for the presentation:

"This system receives live field-style measurements through ThingSpeak, imports them into FastAPI, stores them in PostgreSQL, calculates carbon credits, routes them through verifier approval, and reflects the outcome in role-based dashboards for farmers, verifiers, and admins."
