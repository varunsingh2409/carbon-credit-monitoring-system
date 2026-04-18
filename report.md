# Carbon Credit Monitoring System - Project Report

## 1. Project Overview

The Carbon Credit Monitoring System is a full-stack academic project built to demonstrate how soil-health data can be collected from an external IoT-style source, transmitted to a backend service, stored in a relational database, converted into a carbon-credit estimate, and finally reviewed by a verifier before becoming a trusted result.

The final product is not only a frontend mockup. It includes a React frontend, a FastAPI backend, a PostgreSQL database, ThingSpeak integration, JWT-based authentication, role-based dashboards, carbon calculation logic, verifier approval flow, and in-app technical proof for CNDC and DBMS evaluation.

The main project focus is:

- CNDC: external communication, REST APIs, JSON exchange, protected client-server workflow, and OSI-layer explanation.
- DBMS: normalized PostgreSQL schema, constraints, functional dependencies, seeded data, query demonstration, and persistent workflow history.
- Carbon-credit workflow: field-style measurement intake, carbon calculation, verifier review, and dashboard reporting.

## 2. Problem Statement

Carbon-credit systems require reliable data collection, clean storage, traceable calculations, and verification before claims can be trusted. A simple dashboard alone is not enough because the system must prove where data comes from, how it is stored, and how final carbon outcomes are generated.

This project addresses that gap by building a working prototype where soil-related readings are sent through ThingSpeak, imported into a backend, stored in PostgreSQL, processed into a carbon-credit estimate, and verified by a separate verifier role. The design supports both technical demonstration and viva explanation because the app exposes its CNDC and DBMS evidence directly.

## 3. Project Objectives

The main objectives completed so far are:

- Build a working full-stack application for carbon-credit monitoring.
- Integrate an external data platform using ThingSpeak.
- Implement a secure backend using FastAPI and JWT authentication.
- Store all core records in PostgreSQL using relational tables.
- Design a normalized schema for users, farmers, farms, seasons, measurements, nutrient results, carbon sequestration, and verification.
- Add role-based dashboards for farmer, verifier, and admin users.
- Implement carbon-credit calculation using Organic Carbon and farm data.
- Add a verifier approval workflow so carbon records are reviewed before final acceptance.
- Provide in-app CNDC and DBMS proof through an implementation evidence panel.
- Create supporting documentation for DBMS normalization, CNDC OSI mapping, local demonstration, and faculty rubric evaluation.

## 4. How The Project Was Built Up

### 4.1 Initial System Direction

The project started with the idea of creating a carbon-credit monitoring platform rather than a simple static website. The chosen workflow was:

```text
external soil data -> backend validation -> PostgreSQL storage -> carbon calculation -> verifier approval -> dashboard reporting
```

This direction was useful because it naturally connected CNDC and DBMS. CNDC is visible in the external communication and API flow, while DBMS is visible in persistent relational storage and queryable workflow history.

### 4.2 Backend Foundation

The backend was built using FastAPI. It provides REST endpoints for authentication, farmer dashboard data, verifier workflow, admin operations, ThingSpeak import, carbon calculation, implementation evidence, and artifact access.

Important backend capabilities completed:

- Login and current-user APIs.
- JWT-protected role-based routes.
- Admin statistics and workflow controls.
- ThingSpeak import endpoint.
- Carbon calculation endpoint.
- Verifier approval and rejection endpoints.
- Public implementation evidence endpoint.
- Artifact routes for opening seed, bootstrap, and deliverable files from the app.

### 4.3 Database Foundation

PostgreSQL was selected as the main DBMS because the project needed proper relational storage, constraints, and query demonstration. SQLAlchemy models define the main schema, and Alembic/bootstrap support is available for setup.

The main database tables are:

- `users`
- `farmer`
- `farm`
- `season`
- `nutrient`
- `soil_measurement`
- `measurement_result`
- `carbon_sequestration`
- `carbon_verification`

The strongest DBMS design decision is the split between `soil_measurement`, `measurement_result`, and `nutrient`. Instead of storing one wide measurement table with repeated nutrient columns, the schema stores a measurement event separately from nutrient values and nutrient metadata. This supports normalization, cleaner functional dependencies, and easier future expansion.

### 4.4 ThingSpeak And CNDC Integration

ThingSpeak was added as the external sensor-style data source. A demo sender script can push soil readings to ThingSpeak, and the admin panel can import those readings into the backend.

The current ThingSpeak field mapping is:

```text
field1 -> Nitrogen
field2 -> Phosphorus
field3 -> Potassium
field4 -> Moisture
field5 -> Organic_Carbon
field6 -> depth_cm
```

This proves the system is not only manually entering values into the database. Data can originate outside the app, travel over HTTP, reach the backend as JSON, be validated, and then become relational PostgreSQL records.

### 4.5 Frontend Dashboards

The frontend was built with React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, and Axios. The UI includes separate paths for different users so the system can demonstrate role separation.

Completed frontend areas:

- Landing page with technical project framing.
- Login page.
- Farmer dashboard.
- Verifier dashboard and review flow.
- Admin panel.
- ThingSpeak sync controls.
- Carbon calculation controls.
- Implementation evidence panel.
- CNDC trace explorer.
- DBMS query lab.
- Normalization Atlas.
- Artifact links for database and faculty deliverables.

### 4.6 Carbon Calculation And Verification Workflow

The project includes carbon calculation logic that uses Organic Carbon and farm-related information to estimate carbon-credit output. The result is stored in `carbon_sequestration`.

The verifier workflow was added to make the system more realistic. A carbon record should not automatically become final just because it was calculated. A verifier reviews the evidence and either approves or rejects the record. The decision is stored in `carbon_verification`, which gives the project a clear audit trail.

### 4.7 Faculty Evidence And Documentation

A major improvement was adding direct evidence for CNDC and DBMS rather than expecting faculty to infer it from the app. The project now includes:

- DBMS Query Lab with table samples, constraints, indexes, and row counts.
- Normalization Atlas explaining 1NF, 2NF, and 3NF through the measurement design.
- CNDC trace explorer showing communication flow, endpoints, payloads, and outcomes.
- DBMS normalization and functional-dependency document.
- CNDC OSI model mapping document.
- Local presentation guide and cheat sheet.
- DBMS faculty rubric mapping readme.

This helps convert the app from a general dashboard into a subject-aligned academic submission.

## 5. Final Product

The final product is a complete local full-stack system.

The final user-facing workflow is:

1. Soil-style readings are sent to ThingSpeak.
2. Admin imports ThingSpeak data into the selected farm season.
3. Backend validates and maps the incoming fields.
4. PostgreSQL stores the measurement event and nutrient results.
5. Admin triggers carbon-credit calculation.
6. The calculation result is stored as a carbon sequestration record.
7. Verifier reviews the carbon record and approves or rejects it.
8. Farmer, verifier, and admin dashboards reflect the final workflow state.

The final product proves:

- External data ingestion through ThingSpeak.
- REST API communication through FastAPI.
- JSON-based client-server exchange.
- JWT-protected role separation.
- Normalized relational storage in PostgreSQL.
- Persistent carbon and verification records.
- Queryable technical proof in the website.
- A presentation-ready workflow from external data to verified carbon output.

## 6. DBMS Work Completed

The DBMS part of the project is one of the strongest areas. It includes:

- PostgreSQL as the main database.
- SQLAlchemy-based schema models.
- Normalized tables for users, farms, seasons, measurements, nutrients, carbon records, and verification records.
- Primary keys and foreign keys across the workflow.
- Unique constraints for usernames, emails, nutrients, duplicate measurement imports, one carbon record per season, and one verification decision per carbon record.
- Formal check constraints for valid roles, username/email format, non-empty labels, valid dates, positive depth, coordinate ranges, positive farm area, nutrient value domains, carbon snapshot consistency, and valid carbon/verification status.
- Composite indexes for common lookup paths such as role plus active status, farm plus season status, measurement timelines, sequestration queues, and verifier decision history.
- An idempotent schema-hardening SQL file at `scripts/formal_schema_constraints.sql` for applying the formal constraints and indexes to an existing PostgreSQL database.
- Seed data through `scripts/seed_demo.sql`.
- Live measurement data through ThingSpeak import.
- Query demonstration support through the DBMS Query Lab and `DBMS_EVALUATION_RUBRIC_README.md`.

The schema can be explained as a practical 3NF design, with several BCNF-style determinants. The only important controlled denormalization is the storage of derived carbon values in `carbon_sequestration`, which is intentional because verification needs an audit snapshot of the calculated result.

## 7. CNDC Work Completed

The CNDC part is demonstrated through real communication rather than only theory.

Completed CNDC features:

- ThingSpeak as an external data platform.
- HTTP-based data transfer.
- FastAPI REST endpoints.
- JSON request and response payloads.
- JWT-based authentication.
- Role-based route protection.
- Backend health endpoint.
- Swagger API documentation.
- CNDC trace explorer inside the app.
- OSI model mapping in `deliverables/CNDC_OSI_MODEL_MAPPING.md`.

HTTP and REST were selected intentionally because the workflow is event-based. Login, import, calculation, approval, and dashboard refresh are all request-response operations. MQTT or WebSockets could be used in a production IoT system, but they would add infrastructure that is not necessary for this academic CNDC and DBMS scope.

## 8. Data And Demonstration Readiness

The project includes both resettable seed data and live import data.

Seed data includes:

- Admin, farmer, verifier, and sensor users.
- Nutrient lookup records.
- Farmer profile and farm records.
- Multiple seasons.
- Historical carbon sequestration and verification examples.

ThingSpeak import adds:

- `soil_measurement` rows.
- `measurement_result` rows.
- Organic Carbon values used for carbon calculation.

One normal ThingSpeak demo batch sends 5 entries. With 5 nutrient fields per entry, this can create up to 5 measurement rows and 25 nutrient-result rows when the entries are new. This supports the DBMS rubric requirement for relevant populated data without turning the normalized schema into an artificial flat table.

## 9. Testing And Verification Done

The project has been tested through:

- Local backend startup checks.
- Frontend startup and build checks during earlier app verification.
- Login checks for farmer, verifier, and admin users.
- ThingSpeak demo batch upload.
- Admin ThingSpeak import.
- Carbon calculation.
- Verifier approval workflow.
- Dashboard refresh after workflow completion.
- GitHub Pages static demo rebuild in earlier work.
- Documentation diff checks for the latest README/report additions.

The correct presentation version remains the local full-stack app. The GitHub Pages version is useful for visual sharing, but it cannot prove real backend, database, or ThingSpeak behavior by itself.

## 10. Scope Boundaries And Justification

Some items may appear as limitations, but they are intentional scope decisions for this version.

HTTP is used as the main transmission method because the system is built around request-response workflows. It is simple, testable, and directly supports REST API demonstration.

ThingSpeak is used as the primary external platform because it gives a clear IoT-style data source without requiring a custom broker or hardware setup. The backend still performs validation, field mapping, duplicate handling, and database insertion.

The system is built as an academic prototype, not a production-scale national carbon registry. Real-world scaling can be added later through cloud deployment, background workers, queue-based ingestion, monitoring, caching, and load testing.

Cryptographic validation is not part of the current core implementation, but practical verification already exists through role-based access, verifier approval, stored verification history, database constraints, and carbon calculation audit snapshots. Hashing, signatures, or blockchain-style traceability can be future enhancements if the project is extended.

## 11. Future Enhancements

Possible future improvements include:

- Add MQTT support for continuous IoT sensor streaming.
- Add digital signatures or hash verification for sensor payloads.
- Add a larger real-world soil dataset for stronger statistical confidence.
- Add more scientific carbon coefficients for region-specific calculations.
- Add real-time charts if continuous streaming becomes required.
- Add full admin CRUD for user management.
- Add forgot-password and email notification features.
- Add deployment hardening for production use.

These are future improvements, not blockers for the current academic submission.

## 12. Important Files In The Project

Use these files during preparation and viva:

- `README.md`: main project overview.
- `DEMO_README.md`: local demo flow.
- `INSTALL_DEPENDENCIES.md`: setup, reset, test, and rebuild commands.
- `LOCAL_PRESENTATION_GUIDE.md`: full presentation guide.
- `LOCAL_PRESENTATION_CHEATSHEET.md`: short rehearsal guide.
- `DBMS_EVALUATION_RUBRIC_README.md`: DBMS faculty rubric mapping.
- `scripts/seed_demo.sql`: real demo seed file.
- `scripts/formal_schema_constraints.sql`: formal constraints and supporting indexes for existing PostgreSQL databases.
- `scripts/thingspeak_demo_batch.py`: ThingSpeak demo sender.
- `scripts/bootstrap_db.py`: database bootstrap support.
- `deliverables/DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`: DBMS normalization proof.
- `deliverables/CNDC_OSI_MODEL_MAPPING.md`: CNDC OSI model explanation.
- `deliverables/SOIL_CARBON_ER_DIAGRAM.md`: ERD explanation.
- `deliverables/CARBON_CREDIT_ANALYTICAL_REPORT.md`: analytical report.

## 13. Final Conclusion

So far, the project has been built from a basic idea into a complete subject-aligned full-stack product. It now demonstrates external data communication, backend validation, normalized relational storage, carbon-credit calculation, verifier-controlled approval, and role-based dashboards.

The final product is ready to be presented as a working academic prototype for CNDC and DBMS evaluation. Its strongest point is that the technical proof is visible both in the running app and in the supporting documentation. The local app should be used for the final presentation because it proves the complete chain:

```text
ThingSpeak -> FastAPI -> PostgreSQL -> carbon calculation -> verifier approval -> dashboards
```

This makes the project more than a static website. It is a complete workflow system with communication, database design, calculation, verification, and presentation-ready evidence.
