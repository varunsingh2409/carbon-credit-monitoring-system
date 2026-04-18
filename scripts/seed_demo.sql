\echo Resetting Carbon Credit demo data...

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH desired_users AS (
    SELECT *
    FROM (
        VALUES
            ('admin', 'admin@carboncredit.com', 'admin', 'AdminDemo123!'),
            ('farmer1', 'farmer1@example.com', 'farmer', 'FarmerDemo123!'),
            ('verifier1', 'verifier1@example.com', 'verifier', 'VerifierDemo123!'),
            ('sensor_api', 'sensor@system.com', 'sensor', 'SensorDemo123!')
    ) AS values_table(username, email, role, plain_password)
),
prepared_users AS (
    SELECT
        username,
        email,
        role,
        crypt(plain_password, gen_salt('bf', 12)) AS password_hash
    FROM desired_users
)
INSERT INTO users (username, email, password_hash, role, is_active)
SELECT username, email, password_hash, role, TRUE
FROM prepared_users
ON CONFLICT (username) DO UPDATE
SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = TRUE;

INSERT INTO nutrient (nutrient_name, unit, optimal_range_min, optimal_range_max)
VALUES
    ('Nitrogen', 'ppm', 20.00, 50.00),
    ('Phosphorus', 'ppm', 15.00, 30.00),
    ('Potassium', 'ppm', 120.00, 250.00),
    ('Moisture', '%', 10.00, 80.00),
    ('Organic_Carbon', 'kg/ha', 500.00, 2000.00),
    ('pH', 'pH', 6.00, 7.50)
ON CONFLICT (nutrient_name) DO UPDATE
SET
    unit = EXCLUDED.unit,
    optimal_range_min = EXCLUDED.optimal_range_min,
    optimal_range_max = EXCLUDED.optimal_range_max;

DO $$
DECLARE
    demo_farmer_user_id integer;
    demo_verifier_user_id integer;
    demo_farmer_id integer;
    green_valley_farm_id integer;
    sunrise_acres_farm_id integer;
    verified_season_id integer;
    pending_season_id integer;
    live_demo_season_id integer;
    verified_sequestration_id integer;
    pending_sequestration_id integer;
BEGIN
    SELECT user_id INTO demo_farmer_user_id
    FROM users
    WHERE username = 'farmer1';

    SELECT user_id INTO demo_verifier_user_id
    FROM users
    WHERE username = 'verifier1';

    INSERT INTO farmer (user_id, first_name, last_name, phone, address, registration_date)
    VALUES (
        demo_farmer_user_id,
        'Ramesh',
        'Kumar',
        '+91-9876543210',
        'Demo Farm Cluster, Punjab, India',
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address
    RETURNING farmer_id INTO demo_farmer_id;

    SELECT farm_id INTO green_valley_farm_id
    FROM farm
    WHERE farmer_id = demo_farmer_id
      AND farm_name IN ('Punjab Mitti Farm', 'Green Valley Farm')
    ORDER BY
        CASE WHEN farm_name = 'Punjab Mitti Farm' THEN 0 ELSE 1 END,
        farm_id
    LIMIT 1;

    IF green_valley_farm_id IS NULL THEN
        INSERT INTO farm (
            farmer_id,
            farm_name,
            location,
            total_area_hectares,
            soil_type,
            baseline_carbon
        )
        VALUES (
            demo_farmer_id,
            'Punjab Mitti Farm',
            'Ludhiana, Punjab',
            50.00,
            'Loam',
            1000.00
        )
        RETURNING farm_id INTO green_valley_farm_id;
    ELSE
        UPDATE farm
        SET
            farm_name = 'Punjab Mitti Farm',
            location = 'Ludhiana, Punjab',
            total_area_hectares = 50.00,
            soil_type = 'Loam',
            baseline_carbon = 1000.00
        WHERE farm_id = green_valley_farm_id;
    END IF;

    SELECT farm_id INTO sunrise_acres_farm_id
    FROM farm
    WHERE farmer_id = demo_farmer_id
      AND farm_name IN ('Haryana Krishi Acres', 'Sunrise Acres')
    ORDER BY
        CASE WHEN farm_name = 'Haryana Krishi Acres' THEN 0 ELSE 1 END,
        farm_id
    LIMIT 1;

    IF sunrise_acres_farm_id IS NULL THEN
        INSERT INTO farm (
            farmer_id,
            farm_name,
            location,
            total_area_hectares,
            soil_type,
            baseline_carbon
        )
        VALUES (
            demo_farmer_id,
            'Haryana Krishi Acres',
            'Karnal, Haryana',
            35.00,
            'Sandy Loam',
            950.00
        )
        RETURNING farm_id INTO sunrise_acres_farm_id;
    ELSE
        UPDATE farm
        SET
            farm_name = 'Haryana Krishi Acres',
            location = 'Karnal, Haryana',
            total_area_hectares = 35.00,
            soil_type = 'Sandy Loam',
            baseline_carbon = 950.00
        WHERE farm_id = sunrise_acres_farm_id;
    END IF;

    SELECT season_id INTO verified_season_id
    FROM season
    WHERE farm_id = green_valley_farm_id
      AND season_name = 'Winter 2025'
    ORDER BY season_id
    LIMIT 1;

    IF verified_season_id IS NULL THEN
        INSERT INTO season (
            farm_id,
            season_name,
            start_date,
            end_date,
            crop_type,
            status
        )
        VALUES (
            green_valley_farm_id,
            'Winter 2025',
            DATE '2025-01-01',
            DATE '2025-03-31',
            'Wheat',
            'verified'
        )
        RETURNING season_id INTO verified_season_id;
    ELSE
        UPDATE season
        SET
            start_date = DATE '2025-01-01',
            end_date = DATE '2025-03-31',
            crop_type = 'Wheat',
            status = 'verified'
        WHERE season_id = verified_season_id;
    END IF;

    SELECT season_id INTO pending_season_id
    FROM season
    WHERE farm_id = sunrise_acres_farm_id
      AND season_name = 'Winter 2025'
    ORDER BY season_id
    LIMIT 1;

    IF pending_season_id IS NULL THEN
        INSERT INTO season (
            farm_id,
            season_name,
            start_date,
            end_date,
            crop_type,
            status
        )
        VALUES (
            sunrise_acres_farm_id,
            'Winter 2025',
            DATE '2025-01-01',
            DATE '2025-03-31',
            'Mustard',
            'completed'
        )
        RETURNING season_id INTO pending_season_id;
    ELSE
        UPDATE season
        SET
            start_date = DATE '2025-01-01',
            end_date = DATE '2025-03-31',
            crop_type = 'Mustard',
            status = 'completed'
        WHERE season_id = pending_season_id;
    END IF;

    UPDATE season
    SET
        crop_type = 'Rice',
        status = 'completed'
    WHERE farm_id = green_valley_farm_id
      AND season_name = 'Summer 2025';

    SELECT season_id INTO live_demo_season_id
    FROM season
    WHERE farm_id = green_valley_farm_id
      AND season_name = 'Monsoon 2026 Demo'
    ORDER BY season_id
    LIMIT 1;

    IF live_demo_season_id IS NULL THEN
        INSERT INTO season (
            farm_id,
            season_name,
            start_date,
            end_date,
            crop_type,
            status
        )
        VALUES (
            green_valley_farm_id,
            'Monsoon 2026 Demo',
            DATE '2026-07-01',
            DATE '2026-10-31',
            'Rice',
            'active'
        )
        RETURNING season_id INTO live_demo_season_id;
    ELSE
        UPDATE season
        SET
            start_date = DATE '2026-07-01',
            end_date = DATE '2026-10-31',
            crop_type = 'Rice',
            status = 'active'
        WHERE season_id = live_demo_season_id;
    END IF;

    DELETE FROM carbon_verification
    WHERE sequestration_id IN (
        SELECT sequestration_id
        FROM carbon_sequestration
        WHERE season_id = live_demo_season_id
    );

    DELETE FROM measurement_result
    WHERE measurement_id IN (
        SELECT measurement_id
        FROM soil_measurement
        WHERE season_id = live_demo_season_id
    );

    DELETE FROM soil_measurement
    WHERE season_id = live_demo_season_id;

    DELETE FROM carbon_sequestration
    WHERE season_id = live_demo_season_id;

    SELECT sequestration_id INTO verified_sequestration_id
    FROM carbon_sequestration
    WHERE season_id = verified_season_id
    LIMIT 1;

    IF verified_sequestration_id IS NULL THEN
        INSERT INTO carbon_sequestration (
            farm_id,
            season_id,
            calculation_date,
            baseline_carbon,
            current_carbon,
            net_carbon_increase,
            estimated_carbon_credit,
            status
        )
        VALUES (
            green_valley_farm_id,
            verified_season_id,
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            1000.00,
            1350.00,
            350.00,
            64.23,
            'verified'
        )
        RETURNING sequestration_id INTO verified_sequestration_id;
    ELSE
        UPDATE carbon_sequestration
        SET
            farm_id = green_valley_farm_id,
            calculation_date = CURRENT_TIMESTAMP - INTERVAL '15 days',
            baseline_carbon = 1000.00,
            current_carbon = 1350.00,
            net_carbon_increase = 350.00,
            estimated_carbon_credit = 64.23,
            status = 'verified'
        WHERE sequestration_id = verified_sequestration_id;
    END IF;

    INSERT INTO carbon_verification (
        sequestration_id,
        verifier_id,
        verification_date,
        verification_status,
        verifier_comments,
        approved_carbon_credit
    )
    VALUES (
        verified_sequestration_id,
        demo_verifier_user_id,
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        'approved',
        'Baseline demo verification seeded for the webapp showcase.',
        64.23
    )
    ON CONFLICT (sequestration_id) DO UPDATE
    SET
        verifier_id = EXCLUDED.verifier_id,
        verification_date = EXCLUDED.verification_date,
        verification_status = EXCLUDED.verification_status,
        verifier_comments = EXCLUDED.verifier_comments,
        approved_carbon_credit = EXCLUDED.approved_carbon_credit;

    SELECT sequestration_id INTO pending_sequestration_id
    FROM carbon_sequestration
    WHERE season_id = pending_season_id
    LIMIT 1;

    IF pending_sequestration_id IS NULL THEN
        INSERT INTO carbon_sequestration (
            farm_id,
            season_id,
            calculation_date,
            baseline_carbon,
            current_carbon,
            net_carbon_increase,
            estimated_carbon_credit,
            status
        )
        VALUES (
            sunrise_acres_farm_id,
            pending_season_id,
            CURRENT_TIMESTAMP - INTERVAL '5 days',
            950.00,
            1200.00,
            250.00,
            32.11,
            'pending'
        )
        RETURNING sequestration_id INTO pending_sequestration_id;
    ELSE
        UPDATE carbon_sequestration
        SET
            farm_id = sunrise_acres_farm_id,
            calculation_date = CURRENT_TIMESTAMP - INTERVAL '5 days',
            baseline_carbon = 950.00,
            current_carbon = 1200.00,
            net_carbon_increase = 250.00,
            estimated_carbon_credit = 32.11,
            status = 'pending'
        WHERE sequestration_id = pending_sequestration_id;
    END IF;

    DELETE FROM carbon_verification
    WHERE sequestration_id = pending_sequestration_id;

    UPDATE season
    SET status = 'verified'
    WHERE season_id = verified_season_id;

    UPDATE season
    SET status = 'completed'
    WHERE season_id = pending_season_id;

    UPDATE season
    SET status = 'active'
    WHERE season_id = live_demo_season_id;
END $$;

COMMIT;

\echo Demo data reset complete.
\echo Demo credentials:
\echo   farmer1 / FarmerDemo123!
\echo   verifier1 / VerifierDemo123!
\echo   admin / AdminDemo123!
\echo   sensor_api / SensorDemo123!
