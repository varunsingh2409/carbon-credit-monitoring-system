# Soil Carbon ER Diagram

The live schema stores land, soil, carbon, and certification workflow data through the following relational model.

```mermaid
erDiagram
    USERS ||--o| FARMER : "owns profile"
    FARMER ||--o{ FARM : "manages"
    FARM ||--o{ SEASON : "contains"
    FARM ||--o{ SOIL_MEASUREMENT : "records"
    SEASON ||--o{ SOIL_MEASUREMENT : "scopes"
    SOIL_MEASUREMENT ||--o{ MEASUREMENT_RESULT : "has"
    NUTRIENT ||--o{ MEASUREMENT_RESULT : "classifies"
    FARM ||--o{ CARBON_SEQUESTRATION : "produces"
    SEASON ||--o| CARBON_SEQUESTRATION : "summarizes"
    CARBON_SEQUESTRATION ||--o| CARBON_VERIFICATION : "reviewed by"
    USERS ||--o{ CARBON_VERIFICATION : "verifier"

    USERS {
        int user_id PK
        string username
        string email
        string role
        bool is_active
    }

    FARMER {
        int farmer_id PK
        int user_id FK
        string first_name
        string last_name
        string phone
    }

    FARM {
        int farm_id PK
        int farmer_id FK
        string farm_name
        string location
        decimal total_area_hectares
        decimal baseline_carbon
    }

    SEASON {
        int season_id PK
        int farm_id FK
        string season_name
        date start_date
        date end_date
        string crop_type
        string status
    }

    NUTRIENT {
        int nutrient_id PK
        string nutrient_name
        string unit
    }

    SOIL_MEASUREMENT {
        int measurement_id PK
        int farm_id FK
        int season_id FK
        datetime measurement_date
        decimal depth_cm
        string sensor_id
    }

    MEASUREMENT_RESULT {
        int measurement_id PK, FK
        int nutrient_id PK, FK
        decimal measured_value
    }

    CARBON_SEQUESTRATION {
        int sequestration_id PK
        int farm_id FK
        int season_id FK
        decimal baseline_carbon
        decimal current_carbon
        decimal net_carbon_increase
        decimal estimated_carbon_credit
        string status
    }

    CARBON_VERIFICATION {
        int verification_id PK
        int sequestration_id FK
        int verifier_id FK
        datetime verification_date
        string verification_status
        decimal approved_carbon_credit
    }
```

## Certification Note

The certification state is stored through the combination of:

- `carbon_sequestration`
- `carbon_verification`
- linked season, farm, and measurement evidence

This means the reportable certification record is traceable back to both field measurements and verifier action.
