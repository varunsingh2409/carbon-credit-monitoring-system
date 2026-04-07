# CNDC Security And Data Authenticity Note

## Objective

The platform is designed to support soil-health monitoring and carbon-credit reporting using secure, traceable, and verifiable communication flows.

## Sensor-Network And Transmission Design

1. Field observations are captured through a sensor-facing sender or scripted batch process.
2. Measurements are transmitted to ThingSpeak over HTTPS using structured field payloads.
3. An authenticated admin user triggers import through the FastAPI backend.
4. The backend validates the inbound mapping and writes normalized records into PostgreSQL.
5. Farmer, verifier, and admin dashboards consume the resulting state through JWT-protected REST endpoints.

## Security Controls

- HTTPS transport is used for cloud and application communication.
- ThingSpeak channel authorization limits who can publish measurement payloads.
- JWT bearer tokens protect application routes such as import, calculation, and verification.
- Role separation ensures that:
  - admin imports data and triggers analysis
  - verifier approves or rejects credits
  - farmer views only their resulting status

## Authenticity And Auditability

- Measurement records are timestamped and linked to farm-season context.
- Duplicate imports are constrained through relational uniqueness rules.
- Verification decisions are stored with verifier identity, comments, and timestamps.
- Carbon-credit values are not treated as UI-only outputs; they are persisted in auditable tables.

## Carbon-Credit Reporting Value

This design supports carbon-credit reporting because it preserves:

- source of data
- route of transmission
- role-based authorization
- stored evidence
- verifier approval history

That combination makes the platform suitable for demonstrating secure CNDC-based reporting rather than only basic sensor visualization.
