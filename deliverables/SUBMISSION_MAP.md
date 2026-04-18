# Submission Map

This folder maps the faculty deliverables to the implemented system and its supporting artifacts.

## Included Deliverables

- `CNDC_SECURITY_AND_AUTHENTICITY_NOTE.md`
  - Explains the secure sensor-network flow, data transmission design, and authenticity controls used for carbon-credit reporting.
- `SOIL_CARBON_ER_DIAGRAM.md`
  - Contains the ER diagram for soil, land, carbon, and certification-related entities.
- `DBMS_NORMALIZATION_AND_FUNCTIONAL_DEPENDENCIES.md`
  - Explains normalization status, functional dependencies, candidate keys, and the controlled audit-snapshot design for carbon calculation output.
- `../scripts/formal_schema_constraints.sql`
  - Applies formal PostgreSQL check constraints and supporting indexes for existing local databases.
- `CNDC_OSI_MODEL_MAPPING.md`
  - Maps the working communication flow to the OSI model, including ThingSpeak, FastAPI REST APIs, JWT continuity, TCP/IP, and PostgreSQL communication.
- `r_analysis/soil_carbon_measurements.csv`
  - Snapshot dataset for inferential analysis.
- `r_analysis/soil_carbon_analysis.R`
  - R script for correlation, regression, hypothesis testing, and credit-estimate confidence support.
- `CARBON_CREDIT_ANALYTICAL_REPORT.md`
  - Faculty-facing report that ties CNDC, DBMS, inferential statistics, and verifier review into one final submission.

## System Alignment

- CNDC:
  - Implemented through ThingSpeak ingestion, REST APIs, HTTPS communication, JWT-protected routes, and auditable workflow messages.
- DBMS:
  - Implemented through normalized PostgreSQL tables, functional dependencies, formal constraints, composite indexes, and verification history.
- Inferential Statistics:
  - Implemented through live in-app statistical evaluation and the accompanying R deliverables in `r_analysis/`.
- Integrated Submission:
  - Implemented through the app’s delivery-alignment section and the analytical report in this folder.
