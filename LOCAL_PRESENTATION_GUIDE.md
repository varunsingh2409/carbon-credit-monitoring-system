# Local Presentation Guide

Use this for the main demonstration. It runs the real frontend, FastAPI backend, PostgreSQL database, and ThingSpeak flow.

Core chain:

```text
ThingSpeak -> FastAPI -> PostgreSQL -> carbon calculation -> verifier approval -> dashboards
```

## 1. Logins And URLs

| Role | Username | Password |
| --- | --- | --- |
| Farmer | `farmer1` | `FarmerDemo123!` |
| Verifier | `verifier1` | `VerifierDemo123!` |
| Admin | `admin` | `AdminDemo123!` |

| Page | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend health | `http://127.0.0.1:8000/health` |
| Swagger docs | `http://127.0.0.1:8000/docs` |

Use separate browser sessions for farmer, verifier, and admin.

## 2. Start The App

Project root:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
```

Reset database and apply formal constraints/indexes:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\seed_demo.sql'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h localhost -U carbon_app_user -d carbon_credit_db -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\formal_schema_constraints.sql'
```

Start backend:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Check:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health'
```

Expected:

```json
{"status":"ok"}
```

Start frontend:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run dev
```

Open `http://localhost:5173`.

## 3. ThingSpeak Sender

Run before clicking admin import:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

ThingSpeak field mapping:

| Field | Value | Unit |
| --- | --- | --- |
| `field1` | Nitrogen | `ppm` |
| `field2` | Phosphorus | `ppm` |
| `field3` | Potassium | `ppm` |
| `field4` | Moisture | `%` |
| `field5` | Organic Carbon | `kg/ha` |
| `field6` | Depth | `cm` |

## 4. Main Demo Order

| Step | Show | Meaning |
| --- | --- | --- |
| 1 | Landing page | Complete carbon-credit workflow overview. |
| 2 | Login page | Role-based access starts here. |
| 3 | Farmer dashboard | Farmer sees stored farm, season, measurement, and carbon data. |
| 4 | Verifier dashboard | Verifier reviews claims before approval. |
| 5 | Admin dashboard | Admin controls import, database proof, and calculation. |
| 6 | Run ThingSpeak sender | External sensor-style data is sent first. |
| 7 | Admin `Import ThingSpeak Data` | FastAPI fetches ThingSpeak data and stores it in PostgreSQL. |
| 8 | Sync result and DBMS Query Lab | Imported counts, stored IDs, rows, constraints, and indexes prove database population. |
| 9 | Normalization Atlas | Shows practical 3NF: measurement event, nutrient values, nutrient metadata, carbon result, verification result. |
| 10 | Admin `Calculate Credits` | Organic carbon values become a carbon-credit estimate. |
| 11 | Verifier approves claim | Approval is written into verification history. |
| 12 | Refresh all dashboards | Farmer, verifier, and admin all read the final stored state. |

Opening line:

> This project converts soil data into a verified carbon-credit workflow using ThingSpeak, FastAPI, PostgreSQL, and role-based dashboards.

Closing line:

> CNDC is shown through ThingSpeak, HTTP, REST APIs, JSON, and JWT-based role access. DBMS is shown through normalized PostgreSQL tables, constraints, indexes, populated rows, carbon records, and verification history.

## 5. DBMS Points To Mention

| Rubric need | Website proof |
| --- | --- |
| Normalization | Normalization Atlas |
| Schema and constraints | DBMS Query Lab constraints/indexes |
| Data population | Admin sync result, row counts, stored measurement IDs |
| Query demonstration | DBMS Query Lab SQL samples |
| Conceptual clarity | Explain separated entities and relationships |
| Implementation knowledge | Seed SQL, formal constraints SQL, backend models, evidence panel |

Important tables:

```text
users, farmer, farm, season, nutrient, soil_measurement,
measurement_result, carbon_sequestration, carbon_verification
```

Short DBMS explanation:

> The schema avoids one flat table. `soil_measurement` stores the event, `measurement_result` stores nutrient values, `nutrient` stores units/metadata, and carbon/verification tables store workflow outcomes.

## 6. CNDC Points To Mention

| Concept | Project proof |
| --- | --- |
| External communication | ThingSpeak channel |
| HTTP transport | ThingSpeak and FastAPI requests |
| REST API | Swagger docs and backend routes |
| JSON exchange | Frontend receives backend responses |
| Security | JWT role login |
| Client-server design | Dashboards call protected backend APIs |

Short CNDC explanation:

> ThingSpeak is the external data channel, FastAPI is the REST API layer, the frontend consumes JSON, and JWT protects role-specific actions.

## 7. Formula And Units

```text
estimated credit = (net carbon increase x farm area x 3.67) / 1000
```

| Value | Unit |
| --- | --- |
| N/P/K | `ppm` |
| Moisture | `%` |
| Depth | `cm` |
| Farm area | `ha` |
| Carbon snapshot | `kg/ha` |
| Carbon credit | `tCO2e` |

## 8. Quick Fixes

| Problem | Fix |
| --- | --- |
| `pydantic_core` backend error | Use the existing Python 3.10 venv or rebuild venv with Python 3.10. |
| Backend database error | Start PostgreSQL from Windows Services. |
| Login fails | Rerun `scripts\seed_demo.sql`. |
| Frontend shows demo mode | Open `http://localhost:5173`, not GitHub Pages. |
| ThingSpeak sender DNS error | Check internet and rerun the sender. |
| Import says skipped | Duplicate protection worked; reset DB or send fresh rows. |

Final check:

```text
PostgreSQL running, backend health ok, frontend open, all role logins working,
ThingSpeak sender ready, admin import working, verifier approval ready.
```
