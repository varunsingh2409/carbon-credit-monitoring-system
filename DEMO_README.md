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

This is the main presentation flow. The local app is the proof version because it uses the real backend, real PostgreSQL database, and live ThingSpeak import.

| Step | Do this | This means | Say this |
| --- | --- | --- | --- |
| 1 | Reset the demo database with `seed_demo.sql` and `formal_schema_constraints.sql`. | The database starts from a clean, known state with formal constraints and indexes applied. | "The demo begins from a controlled PostgreSQL state, so the records shown later are explainable." |
| 2 | Start FastAPI on `http://127.0.0.1:8000`. | The backend service is live and ready to accept API requests. | "FastAPI is the server layer that validates requests, integrates ThingSpeak, and writes to PostgreSQL." |
| 3 | Start the frontend on `http://localhost:5173`. | The browser UI is separate from the backend and communicates through APIs. | "The frontend is not static during the local demo; it talks to the backend." |
| 4 | Open `/health` and `/docs` if a backend proof is needed. | The API surface is visible and testable. | "`/health` proves the backend is running, and `/docs` exposes the available REST endpoints." |
| 5 | Open the landing page and scroll to implementation evidence. | The app contains its own CNDC and DBMS proof surface. | "The project evidence is inside the website: network trace, tables, constraints, indexes, and artifacts." |
| 6 | Show farmer dashboard. | Stored farm, season, measurement, and credit data are visible to the field user. | "The farmer view proves that database records become useful user-facing information." |
| 7 | Show verifier dashboard. | Carbon claims are reviewed before being accepted. | "The verifier is the trust layer that converts a calculated claim into an approved or rejected decision." |
| 8 | Show admin panel. | Admin controls the live workflow and the implementation proof. | "The admin panel is where ThingSpeak import, database population, calculation, and evidence inspection come together." |
| 9 | Run `thingspeak_demo_batch.py`. | External sensor-style data is transmitted to ThingSpeak. | "This is the CNDC starting point: data is sent through an external HTTP-based platform." |
| 10 | Click `Import ThingSpeak Data`. | FastAPI reads the external feed, validates fields, and inserts normalized PostgreSQL rows. | "One ThingSpeak entry becomes one `soil_measurement` row and up to five `measurement_result` rows." |
| 11 | Show `Last Sync Result`, stored measurement IDs, and DBMS Query Lab. | Database population is proven from the website. | "The app shows imported/skipped counts, stored IDs, and real table rows, so the data path is verifiable." |
| 12 | Show the Normalization Atlas. | The measurement schema is normalized instead of being one wide repeated table. | "`soil_measurement` stores the event, `measurement_result` stores nutrient values, and `nutrient` stores units and ranges." |
| 13 | Click `Calculate Credits`. | Stored organic-carbon data becomes a carbon-credit claim. | "The backend calculates `tCO2e` from net carbon increase in `kg/ha`, farm area in `ha`, and the 3.67 conversion factor." |
| 14 | Approve the claim as verifier. | The decision is stored as workflow history. | "Verifier approval writes into `carbon_verification`, making the final claim auditable." |
| 15 | Refresh farmer, verifier, and admin views. | Persistence is proven because all roles read the updated state from the same backend and database. | "The final state appears across roles because it is stored in PostgreSQL, not only shown temporarily." |

## 3. Recommended Presentation Order

### Opening

Do:

- open the landing page
- show the title, role story, and implementation evidence section

This means:

- the project is a complete workflow, not only a dashboard
- the technical proof is visible inside the product

Say:

> This platform connects soil-data intake, carbon calculation, and verifier approval into one workflow. The same website also exposes CNDC and DBMS evidence, so the implementation can be inspected while the app is running.

### Role Demonstration

Do:

- show farmer dashboard first
- show verifier dashboard second
- show admin panel third

This means:

- farmer shows the user-facing result
- verifier shows governance and trust
- admin shows control and technical proof

Say:

> The three roles are intentionally separate. The farmer receives results, the verifier reviews claims, and the admin controls import, calculation, and implementation evidence.

### CNDC Demonstration

Do:

- show the CNDC trace on the landing page or admin panel
- run the ThingSpeak sender
- import ThingSpeak data from admin

This means:

- the system communicates with an external data platform
- the frontend and backend communicate through REST APIs
- structured data moves through HTTP and JSON

Say:

> CNDC is demonstrated through ThingSpeak communication, FastAPI REST endpoints, JSON payloads, JWT-protected role routes, and visible request/response evidence inside the app.

### DBMS Demonstration

Do:

- show DBMS Query Lab
- show the Normalization Atlas
- show constraints and indexes
- show row counts after ThingSpeak import

This means:

- PostgreSQL is storing normalized persistent records
- the schema is protected by primary keys, foreign keys, unique rules, check constraints, and indexes
- imported data can be verified by actual table rows

Say:

> DBMS is demonstrated through a normalized PostgreSQL schema. A measurement event is stored separately from nutrient values, and nutrient units are stored in the nutrient lookup table. This avoids repeated columns and supports clear functional dependencies.

### Calculation And Verification

Do:

- click `Calculate Credits`
- open verifier detail
- show imported measurement evidence
- approve with comments

This means:

- stored organic-carbon data becomes a `carbon_sequestration` claim
- the verifier decision becomes a `carbon_verification` record

Say:

> The calculation uses net carbon increase in `kg/ha`, farm area in `ha`, and the 3.67 conversion factor to estimate `tCO2e`. The verifier then approves or rejects that claim, creating a permanent decision history.

### Final Proof

Do:

- refresh farmer dashboard
- refresh verifier history
- refresh admin statistics/evidence

This means:

- the final state is persisted and visible across roles

Say:

> The workflow is complete: external ThingSpeak data became database records, the records became a carbon-credit claim, the claim was verified, and all roles now show the updated state.

### Measurement Units To Mention

- Nitrogen, Phosphorus, and Potassium use `ppm`.
- Moisture uses `%`.
- Soil depth uses `cm`.
- Farm area uses `ha`.
- Organic carbon and carbon snapshots use `kg/ha`.
- Final carbon credit uses `tCO2e`.

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

Evaluation deliverable files:

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
