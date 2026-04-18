# DBMS Normalization And Functional Dependencies

This note explains what the project has achieved from a DBMS point of view, with special focus on normalization and functional dependencies.

## 1. Current DBMS Achievement

The project uses PostgreSQL as the persistent database and SQLAlchemy models to create the schema. The live schema separates the carbon-credit workflow into focused relations:

- `users`
- `farmer`
- `farm`
- `season`
- `nutrient`
- `soil_measurement`
- `measurement_result`
- `carbon_sequestration`
- `carbon_verification`

This means the application does not store the workflow as one large flat table. User accounts, farmer profiles, farm details, crop seasons, measurement events, nutrient values, carbon calculations, and verifier decisions are stored in separate relations and connected through primary keys and foreign keys.

## 2. Why The Schema Is Normalized

The schema follows the main normalization goals:

- Repeated nutrient columns are removed from `soil_measurement`; each nutrient value is stored as a row in `measurement_result`.
- Nutrient metadata such as name, unit, and optimal range is stored once in `nutrient`.
- Farmer profile data is separated from login data in `users`.
- Season information is separated from farm information.
- Carbon calculation records are separated from verifier decision records.
- Verification history is linked back to one sequestration record instead of being mixed into measurement or farm tables.

This reduces update anomalies, insertion anomalies, and deletion anomalies. For example, changing the unit of a nutrient only requires one update in `nutrient`, not updates across every measurement row.

## 3. Functional Dependencies In The Live Schema

The most important functional dependencies are:

| Relation | Functional dependency | Meaning |
| --- | --- | --- |
| `users` | `user_id -> username, email, password_hash, role, created_at, is_active` | The user primary key determines all account attributes. |
| `users` | `username -> user_id, email, password_hash, role, created_at, is_active` | `username` is unique, so it can identify a user. |
| `users` | `email -> user_id, username, password_hash, role, created_at, is_active` | `email` is unique, so it can identify a user. |
| `farmer` | `farmer_id -> user_id, first_name, last_name, phone, address, registration_date` | The farmer primary key determines the farmer profile. |
| `farmer` | `user_id -> farmer_id, first_name, last_name, phone, address, registration_date` | A linked farmer user has one farmer profile. |
| `farm` | `farm_id -> farmer_id, farm_name, location, total_area_hectares, soil_type, baseline_carbon, created_at` | The farm primary key determines farm attributes. |
| `season` | `season_id -> farm_id, season_name, start_date, end_date, crop_type, status` | The season primary key determines season attributes. |
| `nutrient` | `nutrient_id -> nutrient_name, unit, optimal_range_min, optimal_range_max` | The nutrient primary key determines nutrient metadata. |
| `nutrient` | `nutrient_name -> nutrient_id, unit, optimal_range_min, optimal_range_max` | `nutrient_name` is unique, so it can identify nutrient metadata. |
| `soil_measurement` | `measurement_id -> farm_id, season_id, measurement_date, depth_cm, latitude, longitude, sensor_id` | The measurement primary key determines the measurement event. |
| `soil_measurement` | `farm_id, season_id, measurement_date, depth_cm -> measurement_id, latitude, longitude, sensor_id` | The unique measurement constraint prevents duplicate imports for the same farm-season timestamp and depth. |
| `measurement_result` | `measurement_id, nutrient_id -> measured_value` | The composite key determines exactly one nutrient reading for a measurement. |
| `carbon_sequestration` | `sequestration_id -> farm_id, season_id, calculation_date, baseline_carbon, current_carbon, net_carbon_increase, estimated_carbon_credit, status` | The sequestration primary key determines the carbon calculation snapshot. |
| `carbon_sequestration` | `season_id -> sequestration_id, farm_id, calculation_date, baseline_carbon, current_carbon, net_carbon_increase, estimated_carbon_credit, status` | `season_id` is unique in this table, so one season has at most one sequestration record. |
| `carbon_verification` | `verification_id -> sequestration_id, verifier_id, verification_date, verification_status, verifier_comments, approved_carbon_credit` | The verification primary key determines the verifier decision. |
| `carbon_verification` | `sequestration_id -> verification_id, verifier_id, verification_date, verification_status, verifier_comments, approved_carbon_credit` | `sequestration_id` is unique in this table, so one carbon record has at most one verification decision. |

## 4. First Normal Form

The schema satisfies First Normal Form because:

- Every table has atomic column values.
- There are no repeating groups such as `nitrogen_1`, `nitrogen_2`, or `phosphorus_1`.
- Multi-valued measurement data is handled by rows in `measurement_result`.
- Each row can be identified by a primary key or composite primary key.

Example:

Instead of storing all nutrient readings directly in `soil_measurement`, the schema stores:

- one row in `soil_measurement` for the measurement event
- one row per nutrient in `measurement_result`

This is cleaner and supports any number of nutrients without changing the measurement table structure.

## 5. Second Normal Form

The schema satisfies Second Normal Form because non-key attributes depend on the whole key.

The main table where this matters is `measurement_result`, which has a composite primary key:

```text
(measurement_id, nutrient_id)
```

The value `measured_value` depends on both columns together:

```text
(measurement_id, nutrient_id) -> measured_value
```

It does not depend only on `measurement_id`, because one measurement can contain multiple nutrient readings. It also does not depend only on `nutrient_id`, because the same nutrient appears in many measurements with different values.

Nutrient details such as unit and optimal range are not stored in `measurement_result`; they are stored in `nutrient`. This avoids partial dependency.

## 6. Third Normal Form

The schema satisfies Third Normal Form for the core operational data because transitive dependencies are removed:

- `users` stores account and role data only.
- `farmer` stores farmer profile data only.
- `farm` stores farm data and references the farmer.
- `season` stores season data and references the farm.
- `nutrient` stores nutrient metadata only.
- `soil_measurement` stores the measurement event only.
- `measurement_result` stores nutrient values only.
- `carbon_sequestration` stores carbon calculation output only.
- `carbon_verification` stores verifier decision output only.

Example:

The unit for `Nitrogen` is not stored repeatedly beside every nitrogen reading. The dependency is:

```text
nutrient_id -> unit
```

So the unit belongs in `nutrient`, not in `measurement_result`.

## 7. Practical BCNF View

Most relations also follow the practical idea behind Boyce-Codd Normal Form because the determinants are primary keys or unique keys:

- `username` and `email` are unique in `users`.
- `nutrient_name` is unique in `nutrient`.
- `(farm_id, season_id, measurement_date, depth_cm)` is unique in `soil_measurement`.
- `(measurement_id, nutrient_id)` is the primary key in `measurement_result`.
- `season_id` is unique in `carbon_sequestration`.
- `sequestration_id` is unique in `carbon_verification`.

One important design note:

`carbon_sequestration` stores derived values such as `net_carbon_increase` and `estimated_carbon_credit`. These values could be recalculated, but they are intentionally persisted as an audit snapshot of the calculation result at the time it was produced. This is a controlled reporting decision, not an accidental normalization mistake.

## 8. Integrity Constraints Already Implemented

The project also supports DBMS quality through:

- primary keys on all major tables
- foreign keys between users, farmers, farms, seasons, measurements, carbon records, and verification records
- unique constraints for user identity, nutrients, duplicate measurement imports, one sequestration per season, and one verification per sequestration
- formal check constraints for valid user roles, username and email format, non-empty names and labels, season dates and status, measurement depth, coordinate ranges, nutrient values, farm area, carbon snapshot consistency, and verification status-credit consistency
- indexes for common lookup fields such as username, role, active role filters, season status, farm-season status, farm-season measurements, season-date measurements, carbon status queues, and verifier decision history

The project also includes `scripts/formal_schema_constraints.sql`, an idempotent PostgreSQL script that applies these formal constraints and supporting indexes to an existing local database.

## 9. Viva-Ready Summary

The DBMS part is not just storage. It demonstrates a normalized relational design with clear functional dependencies. The strongest example is the split between `soil_measurement`, `measurement_result`, and `nutrient`, because it removes repeating nutrient fields and stores each nutrient reading as a row linked to a measurement event and a nutrient definition. The workflow is traceable from user to farmer, farm, season, measurement, calculation, and verifier approval.
