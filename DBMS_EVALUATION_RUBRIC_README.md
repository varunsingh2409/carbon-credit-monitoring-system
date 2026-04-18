# DBMS Evaluation Rubric Readme

Use this file when the DBMS faculty follows the rubric shown in class. It maps each marking point to what the project already demonstrates, what to open during the viva, and the safest explanation to give.

Primary demonstration path:

1. Use the local full-stack app at `http://localhost:5173`.
2. Log in as `admin` with `admin / AdminDemo123!`.
3. Open the implementation control room and DBMS Query Lab.
4. Show the Normalization Atlas before showing the raw table samples.
5. Open `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md` if the faculty asks for the written proof.
6. Use `scripts/seed_demo.sql` for data population proof and ThingSpeak import for live measurement rows.

Important precision:

- The schema is created from SQLAlchemy models and the bootstrap path, not from a separate handwritten schema dump.
- The real seed file used for the local app demo is `scripts/seed_demo.sql`.
- The formal schema-hardening script is `scripts/formal_schema_constraints.sql`.
- The database design should be explained as a practical 3NF design, with several BCNF-style determinants and one intentional audit snapshot in `carbon_sequestration`.
- The public GitHub Pages site is useful for visual walkthroughs, but the local app is the correct proof for live PostgreSQL, API, and ThingSpeak behavior.

## 1. Normalisation To Highest Suitable Form - 1.5 Marks

What to show:

- In the app: Admin panel -> implementation control room -> DBMS Query Lab -> Normalization Atlas.
- In the files: `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`.
- In the schema: `soil_measurement`, `measurement_result`, and `nutrient`.

Best explanation:

> The core operational schema is normalized up to 3NF, and many relations also satisfy the practical idea of BCNF because their determinants are primary keys or unique keys. The strongest example is measurement storage. We do not store one wide row with repeated nutrient columns. A measurement event is stored in `soil_measurement`, each nutrient value is stored in `measurement_result`, and nutrient metadata is stored once in `nutrient`.

Why 1NF is satisfied:

- Every column stores atomic values.
- Measurement values are not stored as repeating groups.
- Each nutrient reading is represented as one row in `measurement_result`.

Why 2NF is satisfied:

- `measurement_result` uses the composite key `(measurement_id, nutrient_id)`.
- `measured_value` depends on the full composite key.
- Nutrient unit and optimal range do not depend on the full measurement-result key, so they are stored in `nutrient`.

Why 3NF is satisfied:

- Nutrient metadata depends on `nutrient_id`, not on measurement rows.
- Farm data, season data, measurement events, carbon calculations, and verifier decisions are separated into focused tables.
- Transitive metadata drift is avoided because lookup and workflow concepts are not repeated in every measurement row.

Controlled design choice:

> `carbon_sequestration` stores derived values such as `net_carbon_increase` and `estimated_carbon_credit`. This is intentional because it preserves an audit snapshot of the calculation result at the time of verification. It is a reporting and certification decision, not accidental denormalization.

Functional dependency examples to say clearly:

```text
user_id -> username, email, role
nutrient_id -> nutrient_name, unit, optimal_range_min, optimal_range_max
(measurement_id, nutrient_id) -> measured_value
farm_id, season_id, measurement_date, depth_cm -> measurement_id
season_id -> sequestration_id, estimated_carbon_credit, status
sequestration_id -> verification_id, verifier_id, verification_status
```

## 2. SQL Schema Design And Constraints - 1.5 Marks

What to show:

- In the app: DBMS Query Lab table selector, selected table schema, constraint list, and index list.
- In the files: `app/models/`, `scripts/bootstrap_db.py`, `scripts/formal_schema_constraints.sql`, and `scripts/seed_demo.sql`.
- In backend docs if asked: `http://127.0.0.1:8000/docs`.

Best explanation:

> The database is not a flat spreadsheet. It uses typed relational tables with primary keys, foreign keys, unique constraints, formal check constraints, and indexes. These constraints protect the workflow from invalid roles, invalid identity formats, empty labels, invalid coordinates, invalid numeric ranges, duplicate measurement imports, inconsistent carbon snapshots, duplicate carbon records for the same season, and inconsistent verification decisions.

Main relationship chain:

```text
users -> farmer -> farm -> season -> soil_measurement -> measurement_result -> nutrient
farm -> carbon_sequestration -> carbon_verification
users -> carbon_verification as verifier
```

Important constraints:

- `users.username` and `users.email` are unique.
- `users.role` is checked against `farmer`, `verifier`, `admin`, and `sensor`.
- `users.username`, `users.email`, and `users.password_hash` have format or non-empty checks.
- `farmer.user_id` is unique for one farmer profile per linked user.
- `farmer.first_name`, `farmer.last_name`, and optional `phone` are checked for valid values.
- `farm.farm_name`, `farm.location`, `soil_type`, `total_area_hectares`, and `baseline_carbon` have domain checks.
- `farm.total_area_hectares > 0` prevents invalid land area.
- `season.end_date > season.start_date` prevents impossible seasons.
- `season.status` is checked against `active`, `completed`, and `verified`.
- `season.season_name` and optional `crop_type` cannot be blank.
- `nutrient.nutrient_name` is unique.
- `nutrient.unit` cannot be blank, and optimal ranges must be either fully absent or ordered as minimum <= maximum.
- `soil_measurement.depth_cm > 0` prevents invalid sampling depth.
- `soil_measurement.latitude` and `soil_measurement.longitude` are checked against valid coordinate ranges.
- `soil_measurement` has a uniqueness rule on `(farm_id, season_id, measurement_date, depth_cm)` to reduce duplicate imports.
- `measurement_result` uses `(measurement_id, nutrient_id)` as the composite primary key.
- `measurement_result.measured_value >= 0` prevents invalid nutrient readings.
- `carbon_sequestration.season_id` is unique so one season has one current sequestration record.
- `carbon_sequestration` enforces non-negative baseline/current/credit values and checks that `net_carbon_increase = current_carbon - baseline_carbon`.
- `carbon_verification.sequestration_id` is unique so one sequestration record has one current verification decision.
- Carbon and verification status values are protected through check constraints.
- `carbon_verification` enforces non-empty verifier comments and makes approved/rejected credit values consistent with the decision.

Indexes to mention:

- `idx_users_username` and `idx_users_role` support login and role filtering.
- `idx_users_role_active` supports active account checks by role.
- `idx_season_status` supports dashboard filtering.
- `idx_season_farm_status` supports farm-specific season status lookups.
- `idx_soil_measurement_farm_season` and `idx_soil_measurement_date` support measurement lookups.
- `idx_soil_measurement_season_date` supports season timeline and latest-measurement queries.
- `idx_carbon_sequestration_status` supports pending/verified workflow filtering.
- `idx_carbon_sequestration_status_date` supports status queues ordered by calculation time.
- `idx_carbon_verification_verifier_id` supports verifier history lookup.
- `idx_carbon_verification_status_date` supports approved/rejected history timelines.

## 3. Data Population - 1 Mark

What to show:

- The seed file: `scripts/seed_demo.sql`.
- The ThingSpeak sender: `scripts/thingspeak_demo_batch.py`.
- The admin workflow: ThingSpeak Sync -> Sent To ThingSpeak -> Received By Backend -> Import ThingSpeak Data -> Database Population Verification.
- The DBMS Query Lab table counts for `soil_measurement` and `measurement_result`.

Best explanation:

> The database is populated with realistic demo records for users, nutrients, farmer profile, farms, seasons, carbon sequestration, and verification. Then the ThingSpeak import adds live measurement events and nutrient result rows. This keeps the demo data relevant instead of adding unrelated filler rows.

What the seed covers:

- Admin, farmer, verifier, and sensor users.
- Nutrient lookup records.
- Farmer profile and farm records.
- Multiple seasons including the live `Monsoon 2026 Demo` season.
- Existing carbon sequestration and verification examples for history.

What ThingSpeak import adds:

- `soil_measurement` rows for external sensor-style readings.
- `measurement_result` rows for nutrient values linked to those measurements.
- Data that can be used for carbon calculation through `Organic_Carbon`.
- One normal demo batch sends 5 ThingSpeak entries. With 5 nutrient fields per entry, that produces up to 5 `soil_measurement` rows and 25 `measurement_result` rows when the entries are new.

Website proof to point at:

- `Sent To ThingSpeak` shows the 5 demo rows posted by `scripts/thingspeak_demo_batch.py`.
- `Received By Backend` explains that the backend reads the latest 5 ThingSpeak entries and maps the fields.
- `Last Sync Result` shows the channel id, imported count, skipped count, and stored measurement ids.
- `Database Population Verification` shows the expected effect on `soil_measurement` and `measurement_result`.

Row-count query for proof:

```sql
SELECT 'users' AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'farmer', COUNT(*) FROM farmer
UNION ALL SELECT 'farm', COUNT(*) FROM farm
UNION ALL SELECT 'season', COUNT(*) FROM season
UNION ALL SELECT 'nutrient', COUNT(*) FROM nutrient
UNION ALL SELECT 'soil_measurement', COUNT(*) FROM soil_measurement
UNION ALL SELECT 'measurement_result', COUNT(*) FROM measurement_result
UNION ALL SELECT 'carbon_sequestration', COUNT(*) FROM carbon_sequestration
UNION ALL SELECT 'carbon_verification', COUNT(*) FROM carbon_verification;
```

Safe viva wording:

> The seed gives a stable base dataset, and the live ThingSpeak import adds the measurement and nutrient-result rows. For the rubric's 20 to 30+ row expectation, I would show the 5 imported measurement events and the 25 nutrient-result rows created from one normal ThingSpeak batch when those entries are new, because the project is normalized across related tables instead of stored as one artificial flat table.

If duplicate entries are skipped:

> The system is still behaving correctly. The duplicate ThingSpeak entries are not inserted again because the database has duplicate-protection on the measurement event. For a clean population proof, reset the demo database, send a fresh ThingSpeak batch, import it, and then compare the DBMS Query Lab row counts.

## 4. Query Demonstration - 2 Marks

What to show:

- DBMS Query Lab for read-only table queries and returned rows.
- Backend Swagger docs if the faculty asks for API-level proof.
- PowerShell or `psql` only if the faculty specifically wants raw SQL execution.

SELECT example:

```sql
SELECT farm_id, farm_name, location, total_area_hectares, baseline_carbon
FROM farm
ORDER BY farm_id;
```

JOIN example:

```sql
SELECT
  f.farm_name,
  s.season_name,
  sm.measurement_date,
  n.nutrient_name,
  mr.measured_value,
  n.unit
FROM farm f
JOIN season s ON s.farm_id = f.farm_id
JOIN soil_measurement sm ON sm.farm_id = f.farm_id AND sm.season_id = s.season_id
JOIN measurement_result mr ON mr.measurement_id = sm.measurement_id
JOIN nutrient n ON n.nutrient_id = mr.nutrient_id
ORDER BY sm.measurement_date DESC, n.nutrient_name
LIMIT 20;
```

GROUP BY example:

```sql
SELECT
  s.season_name,
  n.nutrient_name,
  COUNT(*) AS reading_count,
  ROUND(AVG(mr.measured_value), 2) AS average_value
FROM season s
JOIN soil_measurement sm ON sm.season_id = s.season_id
JOIN measurement_result mr ON mr.measurement_id = sm.measurement_id
JOIN nutrient n ON n.nutrient_id = mr.nutrient_id
GROUP BY s.season_name, n.nutrient_name
ORDER BY s.season_name, n.nutrient_name;
```

Nested query example:

```sql
SELECT
  f.farm_name,
  s.season_name,
  cs.estimated_carbon_credit,
  cs.status
FROM carbon_sequestration cs
JOIN farm f ON f.farm_id = cs.farm_id
JOIN season s ON s.season_id = cs.season_id
WHERE cs.estimated_carbon_credit >= (
  SELECT AVG(estimated_carbon_credit)
  FROM carbon_sequestration
)
ORDER BY cs.estimated_carbon_credit DESC;
```

Best explanation:

> The SELECT query shows base table retrieval. The JOIN query proves relationships between farm, season, measurement, nutrient result, and nutrient metadata. The GROUP BY query aggregates measurement values by season and nutrient. The nested query compares carbon credits against the database average to show subquery use.

## 5. Viva - Conceptual Clarity - 2 Marks

What to explain first:

- The system stores the carbon-credit workflow, not just login data.
- The ERD idea is user -> farmer -> farm -> season -> measurement -> result -> nutrient, with carbon sequestration and verification attached to farm and season.
- Measurements are decomposed to avoid repeated nutrient columns.
- Constraints are used to protect data quality and relationship correctness.
- The query examples are connected to real app features.

Best viva answer:

> I designed the DBMS around the workflow. A farmer owns farms, a farm has seasons, a season has soil measurements, each measurement has nutrient results, and carbon sequestration plus verification store the final workflow outcome. The normalized split reduces anomalies, while constraints preserve valid roles, valid statuses, valid dates, valid depths, and uniqueness where duplicate rows would create wrong results.

If asked why the ERD is not one table:

> A single table would repeat farmer, farm, season, nutrient, and verification information for every measurement. That would create update anomalies and make the workflow harder to verify. The relational design keeps each concept in its own table and connects them through keys.

If asked why carbon values are stored:

> The carbon result is derived, but it is stored as a point-in-time audit snapshot because verification needs a stable record of what was approved or rejected.

## 6. Viva - Originality And Implementation Knowledge - 2 Marks

What to show:

- `app/models/` for schema models.
- `scripts/bootstrap_db.py` for database bootstrap support.
- `scripts/formal_schema_constraints.sql` for idempotent formal constraints and indexes on existing databases.
- `scripts/seed_demo.sql` for the actual demo seed.
- `app/services/thingspeak_service.py` for external import.
- `app/services/carbon_calculator.py` for carbon calculation.
- `app/services/implementation_service.py` for DBMS/CNDC evidence data.
- `frontend/src/components/ImplementationEvidencePanel.tsx` for the visible DBMS Query Lab and Normalization Atlas.

Best explanation:

> The implementation is original in how it connects the subjects. CNDC is not separate from DBMS here. ThingSpeak provides external HTTP data, FastAPI validates and imports it, PostgreSQL stores it in normalized tables, carbon calculation creates a sequestration record, and verifier approval stores the decision. The admin evidence screen exposes the same implementation details instead of hiding them.

Implementation challenges to mention:

- Keeping the database normalized while still preserving auditable calculation snapshots.
- Preventing duplicate measurement imports with a uniqueness constraint.
- Mapping ThingSpeak fields to nutrient records cleanly.
- Keeping role-based dashboards consistent after calculation and verification.
- Making the faculty evidence visible without making the public landing page look like a change log.

Good closing answer:

> The project is not just a UI mockup. It has a real backend, a real PostgreSQL schema, live data import, stored carbon calculations, verifier decisions, and a DBMS evidence surface that can be inspected during viva.

## Best 6 Minute DBMS Demo Order

1. Open local app and log in as admin.
2. Open the DBMS Query Lab.
3. Show Normalization Atlas first.
4. Show `soil_measurement`, `measurement_result`, and `nutrient` table tabs.
5. Point to constraints and indexes in the selected table panel.
6. Open `scripts/seed_demo.sql` from the admin artifact links or file explorer.
7. Run or mention ThingSpeak import and show measurement/result row counts.
8. Explain one SELECT, one JOIN, one GROUP BY, and one nested query.
9. Show `carbon_sequestration` and `carbon_verification` as final workflow tables.
10. Close with the audit-snapshot explanation.

## Quick Rubric Checklist

Before the DBMS teacher evaluates, make sure you can show:

- Normalization choice: practical 3NF with BCNF-style determinants.
- Schema constraints: primary keys, foreign keys, unique constraints, check constraints, and indexes.
- Data population: seed file plus ThingSpeak-imported measurement/result rows.
- Query demonstration: SELECT, JOIN, GROUP BY, and nested query.
- Conceptual clarity: ERD flow and anomaly reduction.
- Implementation knowledge: where schema, seed, import, calculation, and evidence UI are implemented.
