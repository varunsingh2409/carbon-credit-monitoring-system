-- Formal DBMS constraints and indexes for the Carbon Credit Monitoring System.
-- This script is idempotent and can be applied to an existing PostgreSQL demo database.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_users_username_format') THEN
        ALTER TABLE users
        ADD CONSTRAINT ck_users_username_format
        CHECK (username ~ '^[A-Za-z0-9_.-]{3,50}$');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_users_email_format') THEN
        ALTER TABLE users
        ADD CONSTRAINT ck_users_email_format
        CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_users_password_hash_non_empty') THEN
        ALTER TABLE users
        ADD CONSTRAINT ck_users_password_hash_non_empty
        CHECK (length(trim(password_hash)) >= 20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farmer_first_name_non_empty') THEN
        ALTER TABLE farmer
        ADD CONSTRAINT ck_farmer_first_name_non_empty
        CHECK (length(trim(first_name)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farmer_last_name_non_empty') THEN
        ALTER TABLE farmer
        ADD CONSTRAINT ck_farmer_last_name_non_empty
        CHECK (length(trim(last_name)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farmer_phone_format') THEN
        ALTER TABLE farmer
        ADD CONSTRAINT ck_farmer_phone_format
        CHECK (phone IS NULL OR phone ~ '^[0-9+() -]{7,15}$');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farm_name_non_empty') THEN
        ALTER TABLE farm
        ADD CONSTRAINT ck_farm_name_non_empty
        CHECK (length(trim(farm_name)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farm_location_non_empty') THEN
        ALTER TABLE farm
        ADD CONSTRAINT ck_farm_location_non_empty
        CHECK (length(trim(location)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farm_baseline_carbon_non_negative') THEN
        ALTER TABLE farm
        ADD CONSTRAINT ck_farm_baseline_carbon_non_negative
        CHECK (baseline_carbon >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_farm_soil_type_non_empty') THEN
        ALTER TABLE farm
        ADD CONSTRAINT ck_farm_soil_type_non_empty
        CHECK (soil_type IS NULL OR length(trim(soil_type)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_season_name_non_empty') THEN
        ALTER TABLE season
        ADD CONSTRAINT ck_season_name_non_empty
        CHECK (length(trim(season_name)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_season_crop_type_non_empty') THEN
        ALTER TABLE season
        ADD CONSTRAINT ck_season_crop_type_non_empty
        CHECK (crop_type IS NULL OR length(trim(crop_type)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_nutrient_name_non_empty') THEN
        ALTER TABLE nutrient
        ADD CONSTRAINT ck_nutrient_name_non_empty
        CHECK (length(trim(nutrient_name)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_nutrient_unit_non_empty') THEN
        ALTER TABLE nutrient
        ADD CONSTRAINT ck_nutrient_unit_non_empty
        CHECK (length(trim(unit)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_nutrient_optimal_range_order') THEN
        ALTER TABLE nutrient
        ADD CONSTRAINT ck_nutrient_optimal_range_order
        CHECK (
            (optimal_range_min IS NULL AND optimal_range_max IS NULL)
            OR (
                optimal_range_min IS NOT NULL
                AND optimal_range_max IS NOT NULL
                AND optimal_range_min <= optimal_range_max
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_soil_measurement_latitude_range') THEN
        ALTER TABLE soil_measurement
        ADD CONSTRAINT ck_soil_measurement_latitude_range
        CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_soil_measurement_longitude_range') THEN
        ALTER TABLE soil_measurement
        ADD CONSTRAINT ck_soil_measurement_longitude_range
        CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_soil_measurement_sensor_id_non_empty') THEN
        ALTER TABLE soil_measurement
        ADD CONSTRAINT ck_soil_measurement_sensor_id_non_empty
        CHECK (sensor_id IS NULL OR length(trim(sensor_id)) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_measurement_result_value_non_negative') THEN
        ALTER TABLE measurement_result
        ADD CONSTRAINT ck_measurement_result_value_non_negative
        CHECK (measured_value >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_sequestration_baseline_non_negative') THEN
        ALTER TABLE carbon_sequestration
        ADD CONSTRAINT ck_carbon_sequestration_baseline_non_negative
        CHECK (baseline_carbon >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_sequestration_current_non_negative') THEN
        ALTER TABLE carbon_sequestration
        ADD CONSTRAINT ck_carbon_sequestration_current_non_negative
        CHECK (current_carbon >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_sequestration_credit_non_negative') THEN
        ALTER TABLE carbon_sequestration
        ADD CONSTRAINT ck_carbon_sequestration_credit_non_negative
        CHECK (estimated_carbon_credit >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_sequestration_net_matches_snapshot') THEN
        ALTER TABLE carbon_sequestration
        ADD CONSTRAINT ck_carbon_sequestration_net_matches_snapshot
        CHECK (net_carbon_increase = current_carbon - baseline_carbon);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_verification_comments_non_empty') THEN
        ALTER TABLE carbon_verification
        ADD CONSTRAINT ck_carbon_verification_comments_non_empty
        CHECK (verifier_comments IS NOT NULL AND length(trim(verifier_comments)) > 0);
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'carbon_verification'
          AND column_name = 'verifier_comments'
          AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE carbon_verification
        ALTER COLUMN verifier_comments SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_carbon_verification_credit_matches_status') THEN
        ALTER TABLE carbon_verification
        ADD CONSTRAINT ck_carbon_verification_credit_matches_status
        CHECK (
            (
                verification_status = 'approved'
                AND approved_carbon_credit IS NOT NULL
                AND approved_carbon_credit >= 0
            )
            OR (
                verification_status = 'rejected'
                AND approved_carbon_credit IS NULL
            )
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role_active
    ON users (role, is_active);

CREATE INDEX IF NOT EXISTS idx_farm_location
    ON farm (location);

CREATE INDEX IF NOT EXISTS idx_season_farm_status
    ON season (farm_id, status);

CREATE INDEX IF NOT EXISTS idx_soil_measurement_season_date
    ON soil_measurement (season_id, measurement_date);

CREATE INDEX IF NOT EXISTS idx_carbon_sequestration_status_date
    ON carbon_sequestration (status, calculation_date);

CREATE INDEX IF NOT EXISTS idx_carbon_verification_status_date
    ON carbon_verification (verification_status, verification_date);
