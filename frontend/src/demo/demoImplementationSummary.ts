import type { AdminImplementationSummary } from "@/types";

export const demoImplementationSummary: AdminImplementationSummary = {
  thingspeak_base_url: "https://api.thingspeak.com",
  thingspeak_channel_id: 2789421,
  health_endpoint: "/health",
  docs_endpoint: "/docs",
  api_touchpoints: [
    "/api/auth/login",
    "/api/farmer/dashboard",
    "/api/admin/sync-thingspeak",
    "/api/admin/trigger-carbon-calculation",
    "/api/verifier/approve/{id}"
  ],
  network_flow: [
    "Communication starts from a sender node such as a field sensor, admin client, or verifier client.",
    "Messages travel over the Internet using HTTPS and application-layer HTTP requests.",
    "The system exchanges structured data as ThingSpeak form fields and JSON request-response bodies.",
    "Security is enforced with channel write authorization and JWT bearer tokens on protected APIs.",
    "Validated messages are persisted in PostgreSQL, making the communication outcome queryable and auditable."
  ],
  dbms_highlights: [
    "The schema is normalized across users, farmers, farms, seasons, measurements, carbon records, and verification history.",
    "Check constraints protect season status, measurement depth, farm area, and verification states.",
    "Unique constraints prevent duplicate season-level sequestration rows and duplicate measurement imports.",
    "Indexes support fast filtering by role, season status, measurement date, and sequestration status.",
    "Row previews, exact constraint definitions, and live query results are available directly inside the website."
  ],
  database_entities: [
    { label: "Users", table_name: "users", count: 3 },
    { label: "Farmers", table_name: "farmer", count: 1 },
    { label: "Farms", table_name: "farm", count: 1 },
    { label: "Seasons", table_name: "season", count: 3 },
    { label: "Nutrients", table_name: "nutrient", count: 6 },
    { label: "Soil Measurements", table_name: "soil_measurement", count: 5 },
    { label: "Measurement Results", table_name: "measurement_result", count: 15 },
    { label: "Carbon Sequestration", table_name: "carbon_sequestration", count: 2 },
    { label: "Carbon Verification", table_name: "carbon_verification", count: 1 }
  ],
  cndc_flow: [
    {
      step: 1,
      title: "External Soil Feed Arrives",
      source: "Field sensor or scripted batch sender",
      destination: "ThingSpeak channel",
      subject_focus: "IoT uplink and source-to-cloud data transmission",
      protocol: "HTTP form write",
      method: "POST",
      endpoint: "https://api.thingspeak.com/update",
      transport_stack: "HTTPS -> HTTP POST -> TCP/IP -> Internet",
      data_format: "ThingSpeak field payload (field1-field6)",
      security: "ThingSpeak channel write key authorizes ingestion",
      payload: {
        field1: 32.4,
        field2: 18.1,
        field3: 142.6,
        field4: 26.3,
        field5: 1680,
        field6: 20
      },
      response_payload: {
        entry_id: 1842,
        status: 200
      },
      stored_tables: [],
      outcome:
        "ThingSpeak stores a channel feed that becomes the external communication source for the carbon-credit workflow.",
      cndc_reason:
        "This step demonstrates sender, receiver, protocol, and structured data transfer across a public network before the application processes anything.",
      evidence_points: [
        "Proves CNDC with real network ingress before the web app touches the data.",
        "Routes external field data through a public IoT-style service before platform import."
      ]
    },
    {
      step: 2,
      title: "Admin Requests Import",
      source: "Admin panel",
      destination: "FastAPI backend",
      subject_focus: "Client-server request/response with protected REST API",
      protocol: "HTTPS JSON",
      method: "POST",
      endpoint: "/api/admin/sync-thingspeak",
      transport_stack: "HTTPS -> JSON REST -> FastAPI service",
      data_format: "JSON request body and JSON import summary",
      security: "JWT bearer token with admin role validation",
      payload: { season_id: 302, results: 5 },
      response_payload: {
        channel_id: 2789421,
        imported_count: 5,
        skipped_count: 0
      },
      stored_tables: ["soil_measurement", "measurement_result", "nutrient"],
      outcome:
        "FastAPI reads ThingSpeak over HTTP, validates mappings, and writes normalized rows into measurement tables.",
      cndc_reason:
        "This step proves authenticated browser-to-server communication and shows that one network request can trigger cloud retrieval plus multiple database writes.",
      evidence_points: [
        "JWT protects the endpoint so only admins can trigger import.",
        "A single request fans out into multiple relational inserts."
      ]
    },
    {
      step: 3,
      title: "Dashboards Read Database State",
      source: "React dashboards",
      destination: "FastAPI REST APIs",
      subject_focus: "Application-layer REST retrieval for role-based dashboards",
      protocol: "HTTPS JSON",
      method: "GET",
      endpoint: "/api/farmer/dashboard",
      transport_stack: "HTTPS -> HTTP GET -> JSON response",
      data_format: "JSON response body consumed by React",
      security: "JWT bearer token with role-based route checks",
      payload: null,
      response_payload: {
        active_seasons: 1,
        pending_verifications: 1,
        recentMeasurements: 5
      },
      stored_tables: ["farm", "season", "soil_measurement", "measurement_result"],
      outcome:
        "Farmer and verifier screens render current measurements and workflow status from live database-backed responses.",
      cndc_reason:
        "This step demonstrates classic request-response communication where stored data is serialized into API messages and then rendered in the client.",
      evidence_points: [
        "Shows client-server communication beyond the landing page.",
        "Confirms the DBMS layer drives real UI state."
      ]
    },
    {
      step: 4,
      title: "Carbon Calculation Is Triggered",
      source: "Admin panel",
      destination: "Carbon calculation service",
      subject_focus: "Service orchestration between UI request and backend computation",
      protocol: "HTTPS JSON",
      method: "POST",
      endpoint: "/api/admin/trigger-carbon-calculation",
      transport_stack: "HTTPS -> JSON REST -> calculation service -> PostgreSQL",
      data_format: "JSON request body and calculated result payload",
      security: "JWT bearer token with admin authorization",
      payload: { season_id: 302 },
      response_payload: {
        sequestration_id: 9001,
        estimated_carbon_credit: 2.07,
        status: "pending"
      },
      stored_tables: ["carbon_sequestration", "season"],
      outcome:
        "The backend calculates carbon-credit estimates from organic-carbon evidence and persists a single season-level sequestration record.",
      cndc_reason:
        "This step shows remote-service invocation: the browser sends a command, the backend processes data, and a persistent result is returned and stored.",
      evidence_points: [
        "Ties analytical logic directly to relational state transitions.",
        "Creates a verifier-ready work item backed by persistent workflow state."
      ]
    },
    {
      step: 5,
      title: "Verifier Approves Or Rejects",
      source: "Verifier dashboard",
      destination: "Verification workflow",
      subject_focus: "Role-based approval message with auditable acknowledgement",
      protocol: "HTTPS JSON",
      method: "POST",
      endpoint: "/api/verifier/approve/{id}",
      transport_stack: "HTTPS -> JSON REST -> verification workflow -> PostgreSQL",
      data_format: "JSON decision payload and confirmation response",
      security: "JWT bearer token with verifier authorization",
      payload: {
        approved_carbon_credit: 2.07,
        verifier_comments: "Measurement trail and farm area align with the reported credit."
      },
      response_payload: {
        verification_id: 7002,
        status: "verified",
        message: "Verification approved"
      },
      stored_tables: ["carbon_verification", "carbon_sequestration", "season"],
      outcome:
        "A protected approval call stores the decision permanently and updates the overall workflow status for downstream dashboards.",
      cndc_reason:
        "This step demonstrates human-in-the-loop communication where an authenticated message produces an acknowledgement and permanent workflow history.",
      evidence_points: [
        "Makes the human-governance step visible in CNDC and DBMS terms.",
        "Stores auditable workflow history in the verification records."
      ]
    }
  ],
  inferential_summary: {
    dataset_rows: 5,
    season_count: 2,
    correlations: [
      {
        nutrient_name: "Moisture",
        sample_size: 5,
        coefficient: 0.9993,
        direction: "positive",
        interpretation: "Strong positive association with organic carbon."
      },
      {
        nutrient_name: "Nitrogen",
        sample_size: 5,
        coefficient: 0.998,
        direction: "positive",
        interpretation: "Strong positive association with organic carbon."
      }
    ],
    regression: {
      predictor: "Moisture",
      response: "Organic Carbon",
      sample_size: 5,
      intercept: 0.3256,
      slope: 0.0976,
      r_squared: 0.9986,
      interpretation:
        "Each one-unit increase in Moisture is associated with a 0.0976 unit change in organic carbon in this dataset."
    },
    hypothesis_test: {
      test_name: "Exact permutation test on seasonal organic-carbon means",
      null_hypothesis:
        "There is no difference in mean organic carbon between the baseline and comparison season.",
      alternative_hypothesis:
        "The comparison season has a different mean organic carbon than the baseline season.",
      baseline_label: "Rabi 2025 Baseline",
      comparison_label: "Monsoon 2026 Demo",
      baseline_mean: 2.94,
      comparison_mean: 3.4733,
      p_value: 0.1,
      conclusion:
        "The comparison season mean is 0.5333 units above the baseline mean, but the result is not statistically significant at the 5% level because the demo sample is still small."
    },
    confidence_interval: {
      metric: "Estimated credit for Monsoon 2026 Demo",
      confidence_level: 0.95,
      estimate: 2.07,
      lower_bound: 1.89,
      upper_bound: 2.24,
      interpretation:
        "Bootstrap interval derived from the season's organic-carbon observations and the same sequestration logic used by the platform."
    },
    limitations: [
      "The current sample is still small, so the seasonal difference does not cross the 5% significance threshold.",
      "This is still an academic demo-sized dataset; confidence improves as more long-term measurements arrive."
    ]
  },
  certification_report: {
    title: "Carbon Credit Readiness Report",
    readiness: "Ready for verifier review",
    summary:
      "The platform combines secure CNDC ingestion, relational auditability, inferential statistics, and a verifier-facing workflow to support carbon-credit reporting.",
    report_sections: [
      "Secure sensor-network and CNDC authenticity design",
      "DBMS audit trail and certification-ready schema",
      "Inferential statistics on nutrients and organic carbon",
      "Carbon credit estimate with confidence interval",
      "Verifier decision and certification note"
    ],
    key_findings: [
      "5 measurement events across 2 seasons are included in the inferential layer.",
      "Moisture shows a positive correlation of 0.9993 with organic carbon.",
      "The strongest regression explains 99.86% of the observed organic-carbon variance.",
      "The seasonal hypothesis test produced p = 0.1, with mean organic carbon rising from 2.94 to 3.4733.",
      "The 95% bootstrap interval for the credit estimate is 1.89 to 2.24."
    ]
  },
  deliverable_statuses: [
    {
      title: "Secure sensor-network and data transmission design",
      status: "Implemented",
      evidence:
        "ThingSpeak ingestion, authenticated REST import, and visible CNDC transport/security flow are built into the app."
    },
    {
      title: "CNDC security and data authenticity note",
      status: "Implemented",
      evidence:
        "JWT-protected routes, ThingSpeak channel authorization, and auditable network steps are documented and surfaced in the interface."
    },
    {
      title: "ER diagram for soil, land, carbon, and certification data",
      status: "Implemented",
      evidence:
        "The relational design is documented as a faculty-facing ER deliverable and mirrored by the live PostgreSQL schema."
    },
    {
      title: "SQL database with long-term data handling",
      status: "Implemented",
      evidence:
        "Normalized PostgreSQL tables, constraints, indexes, and season-linked measurement history support long-term storage and traceability."
    },
    {
      title: "R analysis correlating nutrients and carbon sequestration",
      status: "Implemented",
      evidence:
        "A deliverable-ready R script and dataset snapshot accompany the live inferential-statistics section in the app."
    },
    {
      title: "Carbon credit-ready analytical report",
      status: "Implemented",
      evidence:
        "The platform includes an integrated certification-readiness summary and a faculty-facing analytical report artifact."
    }
  ],
  table_details: [
    {
      label: "Users",
      table_name: "users",
      purpose: "Authentication accounts, role assignment, and active-session eligibility.",
      query:
        "SELECT user_id, username, role, is_active, created_at FROM users ORDER BY user_id ASC LIMIT 8;",
      row_count: 3,
      columns: [
        { name: "user_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "username", data_type: "VARCHAR(50)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "email", data_type: "VARCHAR(100)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "password_hash", data_type: "VARCHAR(255)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "role", data_type: "VARCHAR(20)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "created_at", data_type: "DATETIME", nullable: false, is_primary_key: false, foreign_key: null, default_value: "CURRENT_TIMESTAMP" },
        { name: "is_active", data_type: "BOOLEAN", nullable: false, is_primary_key: false, foreign_key: null, default_value: "true" }
      ],
      constraints: [
        { name: "pk_users", kind: "PRIMARY KEY", definition: "PRIMARY KEY (user_id)" },
        { name: "ck_users_role", kind: "CHECK", definition: "role IN ('farmer', 'verifier', 'admin', 'sensor')" },
        { name: "users_username_key", kind: "UNIQUE", definition: "UNIQUE (username)" },
        { name: "users_email_key", kind: "UNIQUE", definition: "UNIQUE (email)" }
      ],
      indexes: [
        { name: "idx_users_role", columns: ["role"], unique: false },
        { name: "idx_users_username", columns: ["username"], unique: false }
      ],
      preview_rows: [
        { user_id: 1, username: "admin", role: "admin", is_active: true, created_at: "2026-01-05T09:00:00.000Z" },
        { user_id: 2, username: "verifier1", role: "verifier", is_active: true, created_at: "2026-01-07T10:00:00.000Z" },
        { user_id: 3, username: "farmer1", role: "farmer", is_active: true, created_at: "2026-01-08T08:30:00.000Z" }
      ]
    },
    {
      label: "Farmers",
      table_name: "farmer",
      purpose: "Field-operator profiles linked one-to-one with authenticated farmer accounts.",
      query:
        "SELECT farmer_id, user_id, first_name, last_name, registration_date FROM farmer ORDER BY farmer_id ASC LIMIT 8;",
      row_count: 1,
      columns: [
        { name: "farmer_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "user_id", data_type: "INTEGER", nullable: true, is_primary_key: false, foreign_key: "users.user_id", default_value: null },
        { name: "first_name", data_type: "VARCHAR(50)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "last_name", data_type: "VARCHAR(50)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "phone", data_type: "VARCHAR(15)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "address", data_type: "TEXT", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "registration_date", data_type: "DATE", nullable: false, is_primary_key: false, foreign_key: null, default_value: "CURRENT_DATE" }
      ],
      constraints: [
        { name: "pk_farmer", kind: "PRIMARY KEY", definition: "PRIMARY KEY (farmer_id)" },
        { name: "farmer_user_id_key", kind: "UNIQUE", definition: "UNIQUE (user_id)" },
        { name: "farmer_user_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE" }
      ],
      indexes: [],
      preview_rows: [
        { farmer_id: 1, user_id: 3, first_name: "Green", last_name: "Valley", registration_date: "2026-01-08" }
      ]
    },
    {
      label: "Farms",
      table_name: "farm",
      purpose: "Farm identity, location, area, and baseline carbon used during credit calculation.",
      query:
        "SELECT farm_id, farmer_id, farm_name, location, total_area_hectares, baseline_carbon FROM farm ORDER BY farm_id ASC LIMIT 8;",
      row_count: 1,
      columns: [
        { name: "farm_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "farmer_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "farmer.farmer_id", default_value: null },
        { name: "farm_name", data_type: "VARCHAR(100)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "location", data_type: "VARCHAR(255)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "total_area_hectares", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "soil_type", data_type: "VARCHAR(50)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "baseline_carbon", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: "0.00" }
      ],
      constraints: [
        { name: "pk_farm", kind: "PRIMARY KEY", definition: "PRIMARY KEY (farm_id)" },
        { name: "ck_farm_total_area_hectares_positive", kind: "CHECK", definition: "total_area_hectares > 0" },
        { name: "farm_farmer_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (farmer_id) REFERENCES farmer (farmer_id) ON DELETE CASCADE" }
      ],
      indexes: [{ name: "idx_farm_farmer_id", columns: ["farmer_id"], unique: false }],
      preview_rows: [
        { farm_id: 101, farmer_id: 1, farm_name: "Green Valley Farm", location: "Ludhiana, Punjab", total_area_hectares: 24.5, baseline_carbon: 142.4 }
      ]
    },
    {
      label: "Seasons",
      table_name: "season",
      purpose: "Crop-cycle windows that anchor every measurement batch, calculation run, and verification state.",
      query:
        "SELECT season_id, farm_id, season_name, crop_type, status, start_date, end_date FROM season ORDER BY season_id ASC LIMIT 8;",
      row_count: 3,
      columns: [
        { name: "season_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "farm_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "farm.farm_id", default_value: null },
        { name: "season_name", data_type: "VARCHAR(50)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "start_date", data_type: "DATE", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "end_date", data_type: "DATE", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "crop_type", data_type: "VARCHAR(50)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "status", data_type: "VARCHAR(20)", nullable: false, is_primary_key: false, foreign_key: null, default_value: "active" }
      ],
      constraints: [
        { name: "pk_season", kind: "PRIMARY KEY", definition: "PRIMARY KEY (season_id)" },
        { name: "chk_season_dates", kind: "CHECK", definition: "end_date > start_date" },
        { name: "ck_season_status", kind: "CHECK", definition: "status IN ('active', 'completed', 'verified')" },
        { name: "season_farm_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (farm_id) REFERENCES farm (farm_id) ON DELETE CASCADE" }
      ],
      indexes: [
        { name: "idx_season_farm_id", columns: ["farm_id"], unique: false },
        { name: "idx_season_status", columns: ["status"], unique: false }
      ],
      preview_rows: [
        { season_id: 301, farm_id: 101, season_name: "Rabi 2025 Baseline", crop_type: "Wheat", status: "verified", start_date: "2025-10-01", end_date: "2026-01-15" },
        { season_id: 302, farm_id: 101, season_name: "Monsoon 2026 Demo", crop_type: "Rice", status: "completed", start_date: "2026-02-01", end_date: "2026-05-30" },
        { season_id: 303, farm_id: 101, season_name: "Summer 2026 Pilot", crop_type: "Maize", status: "active", start_date: "2026-03-15", end_date: "2026-06-20" }
      ]
    },
    {
      label: "Nutrients",
      table_name: "nutrient",
      purpose: "Lookup catalog for measurable parameters and their expected operating ranges.",
      query:
        "SELECT nutrient_id, nutrient_name, unit, optimal_range_min, optimal_range_max FROM nutrient ORDER BY nutrient_id ASC LIMIT 8;",
      row_count: 6,
      columns: [
        { name: "nutrient_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "nutrient_name", data_type: "VARCHAR(50)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "unit", data_type: "VARCHAR(20)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "optimal_range_min", data_type: "NUMERIC(8, 2)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "optimal_range_max", data_type: "NUMERIC(8, 2)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null }
      ],
      constraints: [
        { name: "pk_nutrient", kind: "PRIMARY KEY", definition: "PRIMARY KEY (nutrient_id)" },
        { name: "nutrient_nutrient_name_key", kind: "UNIQUE", definition: "UNIQUE (nutrient_name)" }
      ],
      indexes: [],
      preview_rows: [
        { nutrient_id: 1, nutrient_name: "Nitrogen", unit: "ppm", optimal_range_min: 20, optimal_range_max: 50 },
        { nutrient_id: 2, nutrient_name: "Phosphorus", unit: "ppm", optimal_range_min: 15, optimal_range_max: 30 },
        { nutrient_id: 3, nutrient_name: "Potassium", unit: "ppm", optimal_range_min: 120, optimal_range_max: 250 },
        { nutrient_id: 4, nutrient_name: "Moisture", unit: "%", optimal_range_min: 10, optimal_range_max: 80 },
        { nutrient_id: 5, nutrient_name: "Organic_Carbon", unit: "kg/ha", optimal_range_min: 500, optimal_range_max: 2000 },
        { nutrient_id: 6, nutrient_name: "pH", unit: "pH", optimal_range_min: 6, optimal_range_max: 7.5 }
      ]
    },
    {
      label: "Soil Measurements",
      table_name: "soil_measurement",
      purpose: "Measurement events imported or submitted for a farm-season pair, with timestamp and depth.",
      query:
        "SELECT measurement_id, farm_id, season_id, measurement_date, depth_cm, sensor_id FROM soil_measurement ORDER BY measurement_id DESC LIMIT 8;",
      row_count: 5,
      columns: [
        { name: "measurement_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "farm_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "farm.farm_id", default_value: null },
        { name: "season_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "season.season_id", default_value: null },
        { name: "measurement_date", data_type: "DATETIME", nullable: false, is_primary_key: false, foreign_key: null, default_value: "CURRENT_TIMESTAMP" },
        { name: "depth_cm", data_type: "NUMERIC(5, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "latitude", data_type: "NUMERIC(10, 7)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "longitude", data_type: "NUMERIC(10, 7)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "sensor_id", data_type: "VARCHAR(50)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null }
      ],
      constraints: [
        { name: "pk_soil_measurement", kind: "PRIMARY KEY", definition: "PRIMARY KEY (measurement_id)" },
        { name: "ck_soil_measurement_depth_positive", kind: "CHECK", definition: "depth_cm > 0" },
        { name: "uq_soil_measurement", kind: "UNIQUE", definition: "UNIQUE (farm_id, season_id, measurement_date, depth_cm)" },
        { name: "soil_measurement_farm_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (farm_id) REFERENCES farm (farm_id) ON DELETE CASCADE" },
        { name: "soil_measurement_season_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (season_id) REFERENCES season (season_id) ON DELETE CASCADE" }
      ],
      indexes: [
        { name: "idx_soil_measurement_date", columns: ["measurement_date"], unique: false },
        { name: "idx_soil_measurement_farm_season", columns: ["farm_id", "season_id"], unique: false }
      ],
      preview_rows: [
        { measurement_id: 30203, farm_id: 101, season_id: 302, measurement_date: "2026-04-02T09:00:00.000Z", depth_cm: 20, sensor_id: "TS-GREEN-01" },
        { measurement_id: 30202, farm_id: 101, season_id: 302, measurement_date: "2026-03-28T08:45:00.000Z", depth_cm: 20, sensor_id: "TS-GREEN-01" },
        { measurement_id: 30201, farm_id: 101, season_id: 302, measurement_date: "2026-03-24T08:35:00.000Z", depth_cm: 20, sensor_id: "TS-GREEN-01" },
        { measurement_id: 30102, farm_id: 101, season_id: 301, measurement_date: "2026-01-06T09:10:00.000Z", depth_cm: 20, sensor_id: "TS-GREEN-01" },
        { measurement_id: 30101, farm_id: 101, season_id: 301, measurement_date: "2025-12-18T08:40:00.000Z", depth_cm: 20, sensor_id: "TS-GREEN-01" }
      ]
    },
    {
      label: "Measurement Results",
      table_name: "measurement_result",
      purpose: "Bridge table that stores individual nutrient values for each measurement event.",
      query:
        "SELECT measurement_id, nutrient_id, measured_value FROM measurement_result ORDER BY measurement_id DESC LIMIT 8;",
      row_count: 15,
      columns: [
        { name: "measurement_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: "soil_measurement.measurement_id", default_value: null },
        { name: "nutrient_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: "nutrient.nutrient_id", default_value: null },
        { name: "measured_value", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null }
      ],
      constraints: [
        { name: "pk_measurement_result", kind: "PRIMARY KEY", definition: "PRIMARY KEY (measurement_id, nutrient_id)" },
        { name: "measurement_result_measurement_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (measurement_id) REFERENCES soil_measurement (measurement_id) ON DELETE CASCADE" },
        { name: "measurement_result_nutrient_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (nutrient_id) REFERENCES nutrient (nutrient_id) ON DELETE RESTRICT" }
      ],
      indexes: [{ name: "idx_measurement_result_nutrient_id", columns: ["nutrient_id"], unique: false }],
      preview_rows: [
        { measurement_id: 30203, nutrient_id: 1, measured_value: 218 },
        { measurement_id: 30203, nutrient_id: 4, measured_value: 33.1 },
        { measurement_id: 30203, nutrient_id: 5, measured_value: 3.55 },
        { measurement_id: 30202, nutrient_id: 1, measured_value: 214 },
        { measurement_id: 30202, nutrient_id: 4, measured_value: 32.2 },
        { measurement_id: 30202, nutrient_id: 5, measured_value: 3.46 },
        { measurement_id: 30201, nutrient_id: 1, measured_value: 211 },
        { measurement_id: 30201, nutrient_id: 5, measured_value: 3.41 }
      ]
    },
    {
      label: "Carbon Sequestration",
      table_name: "carbon_sequestration",
      purpose: "Calculated carbon-credit records produced from verified seasonal organic-carbon evidence.",
      query:
        "SELECT sequestration_id, farm_id, season_id, estimated_carbon_credit, status, calculation_date FROM carbon_sequestration ORDER BY sequestration_id DESC LIMIT 8;",
      row_count: 2,
      columns: [
        { name: "sequestration_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "farm_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "farm.farm_id", default_value: null },
        { name: "season_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "season.season_id", default_value: null },
        { name: "baseline_carbon", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "current_carbon", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "net_carbon_increase", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "estimated_carbon_credit", data_type: "NUMERIC(10, 2)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "status", data_type: "VARCHAR(20)", nullable: false, is_primary_key: false, foreign_key: null, default_value: "pending" },
        { name: "calculation_date", data_type: "DATETIME", nullable: false, is_primary_key: false, foreign_key: null, default_value: "CURRENT_TIMESTAMP" }
      ],
      constraints: [
        { name: "pk_carbon_sequestration", kind: "PRIMARY KEY", definition: "PRIMARY KEY (sequestration_id)" },
        { name: "ck_carbon_sequestration_status", kind: "CHECK", definition: "status IN ('pending', 'verified', 'rejected')" },
        { name: "carbon_sequestration_season_id_key", kind: "UNIQUE", definition: "UNIQUE (season_id)" },
        { name: "carbon_sequestration_farm_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (farm_id) REFERENCES farm (farm_id) ON DELETE CASCADE" },
        { name: "carbon_sequestration_season_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (season_id) REFERENCES season (season_id) ON DELETE CASCADE" }
      ],
      indexes: [
        { name: "idx_carbon_sequestration_farm_id", columns: ["farm_id"], unique: false },
        { name: "idx_carbon_sequestration_status", columns: ["status"], unique: false }
      ],
      preview_rows: [
        { sequestration_id: 9002, farm_id: 101, season_id: 301, estimated_carbon_credit: 1.6, status: "verified", calculation_date: "2026-01-18T09:15:00.000Z" },
        { sequestration_id: 9001, farm_id: 101, season_id: 302, estimated_carbon_credit: 2.07, status: "pending", calculation_date: "2026-04-03T10:30:00.000Z" }
      ]
    },
    {
      label: "Carbon Verification",
      table_name: "carbon_verification",
      purpose: "Verifier approvals or rejections, including approved credits and timestamped comments.",
      query:
        "SELECT verification_id, sequestration_id, verifier_id, verification_status, approved_carbon_credit, verification_date FROM carbon_verification ORDER BY verification_id DESC LIMIT 8;",
      row_count: 1,
      columns: [
        { name: "verification_id", data_type: "INTEGER", nullable: false, is_primary_key: true, foreign_key: null, default_value: null },
        { name: "sequestration_id", data_type: "INTEGER", nullable: false, is_primary_key: false, foreign_key: "carbon_sequestration.sequestration_id", default_value: null },
        { name: "verifier_id", data_type: "INTEGER", nullable: true, is_primary_key: false, foreign_key: "users.user_id", default_value: null },
        { name: "verification_date", data_type: "DATETIME", nullable: false, is_primary_key: false, foreign_key: null, default_value: "CURRENT_TIMESTAMP" },
        { name: "verification_status", data_type: "VARCHAR(20)", nullable: false, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "verifier_comments", data_type: "TEXT", nullable: true, is_primary_key: false, foreign_key: null, default_value: null },
        { name: "approved_carbon_credit", data_type: "NUMERIC(10, 2)", nullable: true, is_primary_key: false, foreign_key: null, default_value: null }
      ],
      constraints: [
        { name: "pk_carbon_verification", kind: "PRIMARY KEY", definition: "PRIMARY KEY (verification_id)" },
        { name: "ck_carbon_verification_status", kind: "CHECK", definition: "verification_status IN ('approved', 'rejected')" },
        { name: "carbon_verification_sequestration_id_key", kind: "UNIQUE", definition: "UNIQUE (sequestration_id)" },
        { name: "carbon_verification_sequestration_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (sequestration_id) REFERENCES carbon_sequestration (sequestration_id) ON DELETE CASCADE" },
        { name: "carbon_verification_verifier_id_fkey", kind: "FOREIGN KEY", definition: "FOREIGN KEY (verifier_id) REFERENCES users (user_id) ON DELETE SET NULL" }
      ],
      indexes: [{ name: "idx_carbon_verification_verifier_id", columns: ["verifier_id"], unique: false }],
      preview_rows: [
        { verification_id: 7001, sequestration_id: 9002, verifier_id: 2, verification_status: "approved", approved_carbon_credit: 1.6, verification_date: "2026-01-19T11:00:00.000Z" }
      ]
    }
  ]
};
