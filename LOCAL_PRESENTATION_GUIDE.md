# Carbon Credit Monitoring System Local Demonstration Guide

This is the complete local preparation guide for presenting the project smoothly.

Use this guide if you want to:

1. understand every important feature
2. start the project locally
3. demonstrate the whole workflow in the correct order
4. explain the project specifically for CNDC and DBMS evaluation
5. mention the optional supporting analytics layer only if asked
6. answer common questions confidently

Important:

- this guide is for the real local full-stack app
- use `http://localhost:5173`
- do not use the GitHub Pages demo for the full feature presentation
- the local app uses the real FastAPI backend and the real PostgreSQL database

## 1. How To Use This Guide

Use the guide in this order:

1. read sections 2 to 8 to understand the project
2. follow sections 9 to 15 to prepare the machine
3. use sections 16 to 23 during the live demonstration
4. use sections 24 to 29 for CNDC and DBMS explanation
5. use sections 30 to 33 for viva-style questions and backup proof

If you are in a hurry:

1. read section 16 for the demo order
2. keep `DBMS_EVALUATION_RUBRIC_README.md` open if the DBMS faculty follows the rubric
3. read section 24 for CNDC talking points
4. read section 25 for DBMS talking points
5. keep the optional supporting analytics panel as backup material only
6. keep section 33 open for emergency fixes

## 2. Project In One Minute

### What the project does

This project is a carbon credit monitoring workflow system.

In simple words:

1. field-style soil data is sent to ThingSpeak
2. the admin imports that data into the backend
3. FastAPI validates and stores it in PostgreSQL
4. the backend calculates a carbon-credit estimate
5. the verifier reviews the evidence
6. the result appears in farmer, verifier, and admin dashboards

### One-line summary

> This system connects external soil-data intake, backend validation, database storage, carbon calculation, verifier approval, and role-based dashboards into one complete workflow.

### Two-line summary for evaluation

> The project demonstrates CNDC through HTTP communication, REST APIs, JSON-based client-server interaction, and ThingSpeak integration. It demonstrates DBMS through PostgreSQL tables, relationships, stored workflow records, and persistent verification history. Supporting analytics is available in the app, but it should remain secondary to the CNDC and DBMS explanation.

## 3. What Is Fully Working Locally

These features are ready and safe to demonstrate:

1. landing page
2. login page
3. farmer login and farmer dashboard
4. verifier login and verifier dashboard
5. verifier detail review page
6. admin login and admin panel
7. ThingSpeak import
8. carbon calculation
9. verifier approval
10. dashboard updates after approval
11. backend root page
12. backend health endpoint
13. backend Swagger docs
14. PostgreSQL persistence
15. CNDC trace explorer inside the app
16. DBMS query lab inside the app
17. optional supporting analytics and submission panel inside the app
18. implementation artifact links for the live bootstrap, seed SQL, and faculty files

## 4. What Exists But Should Not Be Presented As Fully Finished

These parts exist in the UI, but are still placeholders or partial extensions:

1. `Forgot password`
2. full user-management CRUD

If someone clicks one of these, say:

> These are extension points already placed in the interface. The core end-to-end carbon workflow is complete, and these convenience features can be added next.

## 5. Roles In The System

### Farmer

What the farmer does:

1. views farm and season progress
2. sees recent measurements
3. sees carbon-related outcomes

Why this role matters:

- proves the system is useful to the field user

### Verifier

What the verifier does:

1. sees pending claims
2. opens the evidence page
3. approves or rejects a sequestration record

Why this role matters:

- adds trust, review, and accountability

### Admin

What the admin does:

1. monitors platform statistics
2. imports ThingSpeak data
3. triggers carbon calculation
4. views users and system activity
5. explains CNDC and DBMS implementation through the implementation control room

Why this role matters:

- shows the operational control center of the system

## 6. Credentials

### Farmer

- Username: `farmer1`
- Password: `FarmerDemo123!`

### Verifier

- Username: `verifier1`
- Password: `VerifierDemo123!`

### Admin

- Username: `admin`
- Password: `AdminDemo123!`

### Sensor/API

- Username: `sensor_api`
- Password: `SensorDemo123!`

Note:

- the `sensor_api` account is for API or integration use
- it is not a normal dashboard account

## 7. URLs And Paths

### URLs

Frontend:

- `http://localhost:5173`

Backend root:

- `http://127.0.0.1:8000`

Backend health:

- `http://127.0.0.1:8000/health`

Backend docs:

- `http://127.0.0.1:8000/docs`

### Important local paths

Project root:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend`

Frontend folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend`

Database reset file:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\seed_demo.sql`

Database bootstrap file:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\bootstrap_db.py`

Formal constraints and indexes file:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\formal_schema_constraints.sql`

ThingSpeak demo sender:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\thingspeak_demo_batch.py`

Faculty deliverables folder:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\deliverables`

DBMS rubric mapping readme:

`C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\DBMS_EVALUATION_RUBRIC_README.md`

## 8. Architecture In Simple Words

### Frontend

The frontend is the visible website the user operates.

It shows:

1. landing page
2. login page
3. farmer dashboard
4. verifier dashboard
5. admin panel

### Backend

The backend is the brain of the project.

It does:

1. authentication
2. validation
3. ThingSpeak integration
4. carbon calculation
5. verification workflow logic

### Database

The database is where permanent records are stored.

It stores:

1. users
2. farms
3. seasons
4. measurements
5. nutrient results
6. sequestration results
7. verification decisions

### External integration

ThingSpeak acts as the incoming field-data source.

## 9. Preparation Timeline

### One day before

1. read sections 16 to 25 once
2. rehearse the full flow one time
3. confirm login works for all three roles
4. confirm ThingSpeak fields are still configured

### One hour before

1. start the machine
2. connect charger
3. check Wi-Fi
4. open this guide
5. run the reset command
6. start backend and frontend

### Ten minutes before

1. open all browser windows
2. log in with all three roles
3. keep the admin panel ready
4. keep the ThingSpeak sender terminal ready
5. confirm `http://127.0.0.1:8000/health` returns `ok`

## 10. Browser Setup

Use 3 browser sessions:

1. normal browser window for farmer
2. incognito/private window for verifier
3. second incognito window or another browser for admin

Why this helps:

1. each role stays logged in separately
2. the demo is faster
3. role separation becomes easier to understand

## 11. Terminal Setup

Open 4 PowerShell windows.

### Terminal 1

Use for backend.

### Terminal 2

Use for frontend.

### Terminal 3

Use for reset and optional proof commands.

### Terminal 4

Use for the ThingSpeak sender.

## 12. If PostgreSQL Is Not Running

If the backend does not start, PostgreSQL may be stopped.

Try this:

1. open Windows `Services`
2. find `PostgreSQL` or `postgresql-x64-16`
3. click `Start`

## 13. One-Time Setup If Needed

If this machine already ran the project before, you can usually skip this section.

### Backend setup

Run in the project root:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

If `.env` is missing:

```powershell
Copy-Item .env.example .env
```

### Frontend setup

Run in the frontend folder:

```powershell
npm install
Copy-Item .env.example .env
```

The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:8000
```

## 14. ThingSpeak Mapping

The app expects this ThingSpeak mapping:

1. `field1 = Nitrogen`
2. `field2 = Phosphorus`
3. `field3 = Potassium`
4. `field4 = Moisture`
5. `field5 = Organic_Carbon`
6. `field6 = depth_cm`

Why this matters:

1. `Organic_Carbon` is needed for carbon calculation
2. `depth_cm` makes the measurement complete and realistic

## 15. Startup Commands

### Reset the demo first

In Terminal 3, run:

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\seed_demo.sql'

& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -f 'C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\scripts\formal_schema_constraints.sql'
```

What this does:

1. restores demo users
2. resets the main demo season
3. restores clean verification records
4. removes old live-demo measurement noise
5. applies formal DBMS constraints and supporting indexes on existing databases

### Start backend

In Terminal 1, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check:

1. `http://127.0.0.1:8000`
2. `http://127.0.0.1:8000/health`
3. `http://127.0.0.1:8000/docs`

Expected:

```json
{"status":"ok"}
```

### Start frontend

In Terminal 2, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend\frontend
npm run dev
```

Open:

- `http://localhost:5173`

Important check:

- the login page should not show `GitHub Pages Demo Mode`

## 16. Correct Demonstration Order

Use this order exactly:

1. landing page
2. login page
3. farmer dashboard
4. verifier dashboard
5. admin panel
6. implementation control room
7. ThingSpeak sender
8. ThingSpeak import
9. farmer refresh
10. carbon calculation
11. verifier detail and approval
12. final dashboard refresh
13. backend docs and API/DB proof if asked

This order is best because it moves from introduction -> users -> technical implementation -> live workflow -> proof.

## 17. Opening Script

Use this opening:

> This is the Carbon Credit Monitoring System. It is designed for farmers, verifiers, and administrators. The system receives soil-style data from an external source, validates and stores it, calculates carbon-credit estimates, routes them through verification, and then shows the outcome in role-based dashboards.

If the judges focus on subjects, add this:

> It is especially relevant for CNDC because it demonstrates communication through ThingSpeak, REST APIs, JSON, and protected client-server interaction. It is relevant for DBMS because it uses PostgreSQL tables, relationships, persistent records, and workflow history.

## 18. Feature-By-Feature Demonstration Guide

### Feature 1: Landing page

What to click:

1. open `http://localhost:5173`
2. show the hero section
3. scroll to `Queryable proof for CNDC and DBMS`
4. show the `CNDC Trace`
5. switch between the flow steps
6. show the `DBMS Query Lab`
7. switch table tabs and point to the query, rows, and constraints
8. click `Open Workspaces`

What to say:

> This landing page introduces the system and presents the technical implementation directly. It shows CNDC through a visible network trace and DBMS through queryable tables, rows, constraints, and indexes.

Why it matters for CNDC:

1. the page explains the external communication flow
2. it exposes real endpoints, payloads, and workflow outcomes

Why it matters for DBMS:

1. it introduces persistent records and workflow storage
2. it exposes real table contents, constraints, and relational structure

### Feature 2: Login page

What to do:

1. point to the login form
2. explain that each role sees a different workspace

What to say:

> The login page is the entry point to role-based access. Different users should not have the same permissions, so the system routes each role to the correct dashboard.

CNDC relevance:

1. frontend sends login credentials to the backend over HTTP
2. backend returns a JWT-based response

DBMS relevance:

1. users are stored in the database
2. authentication depends on persistent user records

### Feature 3: Farmer dashboard

Log in with:

- `farmer1 / FarmerDemo123!`

Show:

1. statistics cards
2. farm and season blocks
3. carbon trend chart
4. recent measurements table

What to say:

> The farmer dashboard is built for visibility. The farmer can monitor measurements, season progress, and carbon outcomes without dealing with backend operations.

CNDC relevance:

1. dashboard data is fetched from backend APIs
2. the frontend displays live server responses

DBMS relevance:

1. these values come from stored farm, season, and measurement records
2. the chart and tables depend on relational queries

### Feature 4: Verifier dashboard

Log in with:

- `verifier1 / VerifierDemo123!`

Show:

1. pending tab
2. history tab
3. overall workflow separation from the farmer role

What to say:

> The verifier dashboard adds trust to the system. Carbon claims should not become valid automatically. A verifier reviews the evidence before acceptance.

CNDC relevance:

1. verifier data is served through protected routes
2. the client and server exchange role-specific data

DBMS relevance:

1. pending and history data are stored records
2. approvals and past decisions are persisted in verification tables

### Feature 5: Admin panel

Log in with:

- `admin / AdminDemo123!`

Show:

1. statistics cards
2. monthly credits chart
3. ThingSpeak sync section
4. sent-to-ThingSpeak and received-by-backend proof cards
5. database population verification after import
6. Trigger Carbon Calculation section
7. implementation control room
8. CNDC trace
9. DBMS query lab
10. User Management modal
11. implementation artifact links for bootstrap, seed SQL, and deliverables
12. System Status

What to say:

> The admin panel is the operational control center. It shows platform health, triggers workflows, includes the same technical evidence explorer as the landing page, and opens the real bootstrap, seed, and deliverable files directly when faculty asks for implementation artifacts.

CNDC relevance:

1. shows network flow and API touchpoints
2. references ThingSpeak, REST APIs, docs, and health routes

DBMS relevance:

1. shows live counts from PostgreSQL
2. proves stored entities and relational persistence

### Feature 6: CNDC Trace

What to point at:

1. ThingSpeak base URL
2. channel ID
3. step selector
4. active endpoint
5. payload sample
6. stored tables and outcome

What to say:

> This section is the strongest CNDC proof inside the app. It shows the external communication path, the exact endpoint used in each step, the payload shape, and the outcome of that request.

Best one-line CNDC explanation:

> ThingSpeak sends data over HTTP, FastAPI exposes REST endpoints, the frontend consumes JSON responses, and JWT protects role-specific communication.

### Feature 7: DBMS Query Lab

What to point at:

1. the table selector
2. the SQL query shown on screen
3. the row sample
4. the column definitions
5. the constraint list
6. the indexes

Also point at:

1. row counts
2. foreign keys
3. uniqueness and check constraints
4. formal domain constraints for identity formats, non-empty labels, coordinates, positive values, and carbon snapshot consistency
5. composite indexes such as role+active, farm+status, season+date, status+date, and verification status+date

What to say:

> This section is the strongest DBMS proof inside the app. It shows exact read-only table queries, returned rows, column structure, formal constraints, and indexes for the live schema.

Best one-line DBMS explanation:

> PostgreSQL stores normalized entities with relationships and persistent workflow history, which is exactly what a DBMS project should demonstrate.

### Feature 8: ThingSpeak sender

In Terminal 4, run:

```powershell
cd C:\Users\popul\Downloads\carbon_credit_backend\mnt\data\carbon_credit_backend
.\venv\Scripts\python.exe .\scripts\thingspeak_demo_batch.py
```

What the script sends:

1. Nitrogen
2. Phosphorus
3. Potassium
4. Moisture
5. Organic Carbon
6. Depth

What to say:

> I am sending live sensor-style data into ThingSpeak. This proves the workflow starts outside the web application and comes from an external communication source.

CNDC relevance:

1. external HTTP-based communication
2. sensor-style integration

DBMS relevance:

1. this data will soon become stored relational records

### Feature 9: ThingSpeak import

In the admin panel:

1. choose `Green Valley Farm | Monsoon 2026 Demo`
2. click `Import ThingSpeak Data`

Expected result:

1. success toast
2. last sync result
3. imported count
4. skipped count if duplicates were already imported
5. stored measurement IDs
6. database population verification card

What to say:

> The admin is importing the ThingSpeak data into the FastAPI backend. The backend validates the data, maps the fields, and stores the measurements in PostgreSQL.

Point at the website proof:

1. `Sent To ThingSpeak` shows the 5 demo rows sent by the terminal script.
2. `Received By Backend` explains that FastAPI reads the latest ThingSpeak channel entries.
3. `Last Sync Result` shows imported count, skipped count, channel id, and stored measurement IDs.
4. `Database Population Verification` explains the expected database effect.

Database population proof:

1. one accepted ThingSpeak entry becomes one `soil_measurement` row
2. one accepted ThingSpeak entry becomes up to five `measurement_result` rows
3. a full fresh batch can add 5 measurement rows and 25 nutrient-result rows
4. skipped entries mean duplicate protection worked, not that the import failed

CNDC relevance:

1. backend pulls external data over HTTP
2. the API endpoint processes and returns structured data

DBMS relevance:

1. imported values become stored measurement rows
2. the workflow is database-backed
3. normalized nutrient values are stored in `measurement_result`

### Feature 10: Farmer refresh after import

Go back to the farmer dashboard and refresh.

Show:

1. recent measurements include the imported records

What to say:

> The imported data appears in the farmer dashboard. This shows the connection between external communication, backend storage, and frontend display.

### Feature 11: Carbon calculation

In the admin panel:

1. keep the same season selected
2. click `Calculate Credits`

What to say:

> The backend uses Organic Carbon data and farm information to calculate a carbon-credit estimate for the season.

Explain the formula:

```text
estimated credit = (net carbon increase x farm area x 3.67) / 1000
```

CNDC relevance:

1. calculation is triggered through an API request
2. the result is returned to the frontend as a structured response

DBMS relevance:

1. the calculated result is stored in `carbon_sequestration`
2. the season workflow state changes in the database

### Feature 12: Verifier detail and approval

Go to verifier:

1. refresh the page
2. open the new pending item
3. show the details
4. enter a short comment
5. click `Approve`

What to say:

> The verifier reviews both the carbon summary and the underlying measurement evidence before approving the claim. This makes the workflow auditable and trustworthy.

CNDC relevance:

1. verifier operations use protected API endpoints
2. approval is sent as a client-server action

DBMS relevance:

1. approval creates or updates verification records
2. the decision is permanently stored

### Feature 13: Final dashboard refresh

Refresh:

1. farmer dashboard
2. verifier dashboard
3. admin panel

Show:

1. farmer status
2. verifier history
3. admin stats

What to say:

> Now all three roles reflect the completed workflow. The farmer sees the outcome, the verifier sees the decision history, and the admin sees the operational result.

This is your strongest end-to-end proof.

## 19. What Each Major Screen Teaches You

### Landing page teaches

1. project purpose
2. user roles
3. CNDC and DBMS framing

### Login page teaches

1. role-based access
2. protected workflows

### Farmer dashboard teaches

1. user-facing value
2. measurement visibility
3. stored result display

### Verifier dashboard teaches

1. workflow governance
2. trust and review

### Admin panel teaches

1. platform control
2. live operational data
3. CNDC and DBMS evidence

### Backend docs teaches

1. the API surface is real
2. the backend is not just assumed

### Database proof teaches

1. records are truly stored
2. the project has real DBMS implementation

## 20. Smooth Presentation Tips

1. do not rush the login screens
2. always explain why a role exists
3. use the admin panel to connect the technical story to the workflow
4. when importing ThingSpeak data, pause and explain the flow slowly
5. after approval, always refresh all dashboards
6. if time is short, prioritize admin + verifier + farmer final state

## 21. The Best 8 To 10 Minute Demo Flow

1. opening explanation
2. landing page
3. farmer dashboard
4. verifier dashboard
5. admin panel
6. CNDC trace
7. DBMS query lab
8. ThingSpeak sender
9. import
10. calculation
11. verifier approval
12. final refresh
13. closing line

## 22. The Best 3 Minute Demo Flow

If time is short:

1. open admin panel
2. point to the implementation control room
3. import ThingSpeak data
4. calculate carbon credits
5. approve as verifier
6. show farmer dashboard

Use this summary:

> The app receives external data, stores it in PostgreSQL, calculates carbon credits, routes the result through verifier approval, and then shows the final result to the farmer.

## 23. Closing Script

Use this closing:

> This project demonstrates a complete carbon-credit workflow from external communication to stored database records and verified outcomes. It is relevant for CNDC because it uses ThingSpeak, REST APIs, JSON, and protected communication. It is relevant for DBMS because it uses PostgreSQL, relational tables, persistent records, and workflow history.

## 24. CNDC Talking Points

Use these points during evaluation:

1. ThingSpeak is the external communication source
2. data travels over HTTP
3. FastAPI exposes REST endpoints
4. frontend and backend exchange JSON payloads
5. JWT protects role-based communication
6. `/health` and `/docs` prove live backend service
7. dashboard data is fetched from APIs, not hardcoded

### One-line CNDC answer

> CNDC is demonstrated through external HTTP communication, REST API design, JSON exchange, and secure client-server workflows.

## 25. DBMS Talking Points

Use these points during evaluation:

1. PostgreSQL is the main database
2. the schema is relational and normalized to a practical 3NF shape
3. users, farms, seasons, measurements, results, sequestration, and verification are stored separately
4. foreign keys connect the workflow
5. approvals and calculations are permanently stored
6. admin counts come from live database queries
7. the Normalization Atlas explains `soil_measurement`, `measurement_result`, and `nutrient`
8. formal constraints protect identity formats, non-empty labels, coordinates, numeric domains, carbon snapshots, and verification decisions
9. composite indexes support the query paths used by dashboards and viva demonstrations
10. the system demonstrates both data storage and workflow persistence

### One-line DBMS answer

> DBMS is demonstrated through a relational PostgreSQL schema, connected tables, persistent workflow records, and database-driven dashboards.

For the faculty rubric, use this exact order:

1. Normalisation: show the Normalization Atlas and explain practical 3NF.
2. Schema constraints: show table constraints and indexes in the DBMS Query Lab.
3. Data population: show `scripts\seed_demo.sql`, run ThingSpeak import, and show row counts.
4. Query demonstration: explain SELECT, JOIN, GROUP BY, and nested query examples from `DBMS_EVALUATION_RUBRIC_README.md`.
5. Conceptual viva: explain the ERD flow and why one flat table would create anomalies.
6. Implementation viva: point to `app\models`, `scripts\seed_demo.sql`, ThingSpeak service, carbon calculator, and the evidence panel.

For formal constraints and indexes, say:

> The schema uses primary keys and foreign keys for relationships, unique constraints for identity and one-to-one workflow records, check constraints for valid formats and numeric domains, and composite indexes for dashboard query paths such as role filtering, season status, measurement timelines, and verifier history.

For database population verification, show:

1. admin ThingSpeak Sync sent/received cards
2. Last Sync Result imported and skipped counts
3. stored measurement IDs after import
4. DBMS Query Lab `soil_measurement` row count
5. DBMS Query Lab `measurement_result` row count
6. optional raw SQL row-count query from section 32

## 26. Feature-To-CNDC Map

### Landing page

- introduces communication flow

### Login

- client-server authentication

### Farmer dashboard

- API-driven data display

### Verifier dashboard

- protected role-based communication

### Admin sync

- external HTTP integration with ThingSpeak

### Carbon calculation

- API-triggered backend processing

### Verification approval

- secure client-server update action

### Health and docs

- service visibility and API discoverability

## 27. Feature-To-DBMS Map

### Login

- user records stored in database

### Farmer dashboard

- farm, season, and measurement tables

### Verifier dashboard

- verification history tables

### Admin statistics

- database aggregate queries

### ThingSpeak import

- measurement rows inserted into database

### Carbon calculation

- sequestration row created and stored

### Approval

- verification row stored and season status recorded in the workflow

### Monthly chart

- database-backed summary output

## 28. Important Database Tables To Mention

Say these names slowly if asked:

1. `users`
2. `farmer`
3. `farm`
4. `season`
5. `nutrient`
6. `soil_measurement`
7. `measurement_result`
8. `carbon_sequestration`
9. `carbon_verification`

Simple explanation:

1. `users` stores accounts
2. `farmer` stores farmer profile data
3. `farm` stores land-unit information
4. `season` stores crop-cycle records
5. `soil_measurement` stores a measurement event
6. `measurement_result` stores nutrient values linked to one measurement
7. `carbon_sequestration` stores carbon-credit calculations
8. `carbon_verification` stores verifier decisions

## 29. Important API Endpoints To Mention

These are good API examples:

1. `POST /api/auth/login`
2. `GET /api/admin/statistics`
3. `GET /api/implementation/evidence`
4. `POST /api/admin/sync-thingspeak`
5. `POST /api/admin/trigger-carbon-calculation`
6. `GET /api/verifier/pending-verifications`
7. `POST /api/verifier/approve/{id}`
8. `GET /health`
9. `GET /docs`

## 30. Likely Viva Questions And Answers

### Question: Why is this project relevant for CNDC?

Answer:

> It is relevant for CNDC because it demonstrates external communication through ThingSpeak, REST API communication between frontend and backend, JSON-based data exchange, and secure role-based client-server interaction using JWT.

### Question: Why is this project relevant for DBMS?

Answer:

> It is relevant for DBMS because it uses PostgreSQL to store normalized relational entities such as users, farms, seasons, measurements, carbon records, and verification history. The dashboards and workflow depend on those stored records.

### Question: Where is the database visible in the app?

Answer:

> The database is visible through the DBMS implementation section in the admin panel, through statistics and counts, through measurement records on the farmer dashboard, and through stored verification history on the verifier dashboard.

### Question: Where is networking visible in the app?

Answer:

> Networking is visible through ThingSpeak integration, login requests, dashboard API calls, admin sync and calculation actions, verifier approval actions, and the health and docs endpoints.

### Question: What happens after ThingSpeak sends data?

Answer:

> The admin imports the latest channel data, the backend validates and maps it, PostgreSQL stores it, carbon calculation is triggered, the verifier reviews the result, and the dashboards update.

### Question: Why not calculate and approve automatically?

Answer:

> Automatic calculation is fine, but approval should not be automatic because a verifier is needed to review evidence and maintain trust and accountability.

### Question: Which field is most important for calculation?

Answer:

> `Organic_Carbon` is the most important field because it is required for carbon-credit calculation.

## 31. Optional Technical Proof Commands

Use these only if asked.

### Health check

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health'
```

### Admin login through API

```powershell
$adminLogin = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/auth/login' `
  -ContentType 'application/json' `
  -Body '{"username":"admin","password":"AdminDemo123!"}'

$adminToken = $adminLogin.access_token
```

### Manual ThingSpeak sync

```powershell
$headers = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/admin/sync-thingspeak' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"season_id":4}'
```

### Manual carbon calculation

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/admin/trigger-carbon-calculation' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"season_id":4}'
```

## 32. Optional Database Proof Commands

### Show database population counts

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT 'users' AS table_name, COUNT(*) AS rows FROM users UNION ALL SELECT 'farmer', COUNT(*) FROM farmer UNION ALL SELECT 'farm', COUNT(*) FROM farm UNION ALL SELECT 'season', COUNT(*) FROM season UNION ALL SELECT 'nutrient', COUNT(*) FROM nutrient UNION ALL SELECT 'soil_measurement', COUNT(*) FROM soil_measurement UNION ALL SELECT 'measurement_result', COUNT(*) FROM measurement_result UNION ALL SELECT 'carbon_sequestration', COUNT(*) FROM carbon_sequestration UNION ALL SELECT 'carbon_verification', COUNT(*) FROM carbon_verification;"
```

What to say:

> This verifies that the demo is populated across normalized relational tables. After a fresh ThingSpeak import, the key proof is that `soil_measurement` has measurement events and `measurement_result` has the nutrient values linked to those events.

### Show measurements

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT measurement_id, measurement_date, depth_cm, sensor_id FROM soil_measurement ORDER BY measurement_id DESC LIMIT 10;"
```

### Show sequestration records

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT sequestration_id, season_id, baseline_carbon, current_carbon, net_carbon_increase, estimated_carbon_credit, status FROM carbon_sequestration ORDER BY sequestration_id DESC;"
```

### Show verification records

```powershell
$env:PGPASSWORD='Masterbeast'
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' `
  -h localhost `
  -U carbon_app_user `
  -d carbon_credit_db `
  -c "SELECT verification_id, sequestration_id, verifier_id, verification_status, approved_carbon_credit, verification_date FROM carbon_verification ORDER BY verification_id DESC;"
```

## 33. Common Problems And Quick Fixes

### Problem: backend does not start

Fix:

1. make sure PostgreSQL is running
2. make sure backend dependencies are installed
3. make sure `.env` exists

### Problem: frontend does not open

Fix:

1. run `npm install` if needed
2. confirm `frontend\.env` contains `VITE_API_URL=http://localhost:8000`
3. rerun `npm run dev`

### Problem: login fails

Fix:

1. rerun the reset SQL from section 15
2. refresh the browser

### Problem: ThingSpeak import works but carbon calculation fails

Cause:

- `Organic_Carbon` may be missing from imported rows

Fix:

1. run `thingspeak_demo_batch.py`
2. rerun the import
3. rerun the calculation

### Problem: data looks old

Fix:

1. refresh the page
2. rerun the reset SQL

### Problem: login page shows GitHub Pages demo mode

Cause:

- you opened the published site instead of the local site

Fix:

1. close that tab
2. open `http://localhost:5173`

## 34. Final Confidence Checklist

Before you start presenting, confirm:

1. PostgreSQL is running
2. demo reset completed
3. backend is running
4. frontend is running
5. farmer login works
6. verifier login works
7. admin login works
8. ThingSpeak sender is ready
9. all browser windows are open
10. laptop is charging
11. internet is stable

If all of these are true, you are ready.
