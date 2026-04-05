import type {
  AdminStatistics,
  AdminUser,
  CarbonCalculationResponse,
  CarbonSequestrationRecord,
  FarmerDashboardResponse,
  FarmerFarmDashboard,
  MonthlyCredit,
  PendingVerification,
  RejectVerificationPayload,
  SequestrationDetail,
  ThingSpeakSyncRequest,
  ThingSpeakSyncResponse,
  TokenResponse,
  User,
  UserCreateInput,
  UserRole,
  VerificationActionPayload,
  VerificationActionResponse,
  VerificationHistoryItem,
  VerificationMeasurementDetail
} from "@/types";

const DEMO_STATE_STORAGE_KEY = "carbon-credit-demo-state";
const DEMO_TOKEN_PREFIX = "demo:";
const TOKEN_STORAGE_KEY = "carbon-credit-token";
const DEMO_CHANNEL_ID = 2789421;
const DEMO_DELAY_MS = 180;

type DemoRole = Extract<UserRole, "admin" | "farmer" | "verifier">;

type DemoRecord = Omit<SequestrationDetail, "measurement_count" | "measurements">;

interface DemoState {
  farm: FarmerFarmDashboard;
  monthlyCredits: MonthlyCredit[];
  nextSequestrationId: number;
  nextUserId: number;
  nextVerificationId: number;
  records: DemoRecord[];
  seasonMeasurements: Record<string, VerificationMeasurementDetail[]>;
  syncResponses: Record<string, ThingSpeakSyncResponse>;
  users: AdminUser[];
}

export const demoCredentialPresets: Record<
  DemoRole,
  { password: string; username: string }
> = {
  farmer: { username: "farmer1", password: "FarmerDemo123!" },
  verifier: { username: "verifier1", password: "VerifierDemo123!" },
  admin: { username: "admin", password: "AdminDemo123!" }
};

const demoCredentials: Record<string, string> = {
  admin: demoCredentialPresets.admin.password,
  verifier1: demoCredentialPresets.verifier.password,
  farmer1: demoCredentialPresets.farmer.password,
  sensor_api: "SensorDemo123!"
};

const initialUsers: AdminUser[] = [
  {
    user_id: 1,
    username: "admin",
    name: "Platform Admin",
    role: "admin",
    email: "admin@carbon-demo.local",
    status: "active",
    created_at: "2026-01-05T09:00:00.000Z"
  },
  {
    user_id: 2,
    username: "verifier1",
    name: "Ishita Verifier",
    role: "verifier",
    email: "verifier1@carbon-demo.local",
    status: "active",
    created_at: "2026-01-07T10:00:00.000Z"
  },
  {
    user_id: 3,
    username: "farmer1",
    name: "Green Valley Farmer",
    role: "farmer",
    email: "farmer1@carbon-demo.local",
    status: "active",
    created_at: "2026-01-08T08:30:00.000Z"
  }
];

const initialFarm: FarmerFarmDashboard = {
  farm_id: 101,
  farm_name: "Green Valley Farm",
  location: "Ludhiana, Punjab",
  total_area_hectares: 24.5,
  soil_type: "Loamy",
  baseline_carbon: 142.4,
  seasons: [
    {
      season_id: 302,
      season_name: "Monsoon 2026 Demo",
      start_date: "2026-02-01T00:00:00.000Z",
      end_date: "2026-05-30T00:00:00.000Z",
      crop_type: "Rice",
      status: "completed",
      carbon_data: {
        baseline_carbon: 142.4,
        current_carbon: 165.38,
        net_increase: 22.98,
        estimated_credit: 2.07,
        verification_status: "pending"
      }
    },
    {
      season_id: 301,
      season_name: "Rabi 2025 Baseline",
      start_date: "2025-10-01T00:00:00.000Z",
      end_date: "2026-01-15T00:00:00.000Z",
      crop_type: "Wheat",
      status: "verified",
      carbon_data: {
        baseline_carbon: 138.7,
        current_carbon: 156.9,
        net_increase: 18.2,
        estimated_credit: 1.6,
        verification_status: "approved"
      }
    },
    {
      season_id: 303,
      season_name: "Summer 2026 Pilot",
      start_date: "2026-03-15T00:00:00.000Z",
      end_date: "2026-06-20T00:00:00.000Z",
      crop_type: "Maize",
      status: "active",
      carbon_data: null
    }
  ]
};

const initialSeasonMeasurements: Record<string, VerificationMeasurementDetail[]> = {
  "301": [
    {
      measurement_id: 30101,
      measurement_date: "2025-12-18T08:40:00.000Z",
      depth_cm: 20,
      latitude: 30.901,
      longitude: 75.853,
      sensor_id: "TS-GREEN-01",
      nutrients: [
        { nutrient_name: "Nitrogen", measured_value: 189, unit: "kg/ha" },
        { nutrient_name: "Moisture", measured_value: 26.1, unit: "%" },
        { nutrient_name: "Organic Carbon", measured_value: 2.87, unit: "%" }
      ]
    },
    {
      measurement_id: 30102,
      measurement_date: "2026-01-06T09:10:00.000Z",
      depth_cm: 20,
      latitude: 30.901,
      longitude: 75.853,
      sensor_id: "TS-GREEN-01",
      nutrients: [
        { nutrient_name: "Nitrogen", measured_value: 193, unit: "kg/ha" },
        { nutrient_name: "Moisture", measured_value: 27.5, unit: "%" },
        { nutrient_name: "Organic Carbon", measured_value: 3.01, unit: "%" }
      ]
    }
  ],
  "302": [
    {
      measurement_id: 30201,
      measurement_date: "2026-03-24T08:35:00.000Z",
      depth_cm: 20,
      latitude: 30.901,
      longitude: 75.853,
      sensor_id: "TS-GREEN-01",
      nutrients: [
        { nutrient_name: "Nitrogen", measured_value: 211, unit: "kg/ha" },
        { nutrient_name: "Moisture", measured_value: 31.4, unit: "%" },
        { nutrient_name: "Organic Carbon", measured_value: 3.41, unit: "%" }
      ]
    },
    {
      measurement_id: 30202,
      measurement_date: "2026-03-28T08:45:00.000Z",
      depth_cm: 20,
      latitude: 30.901,
      longitude: 75.853,
      sensor_id: "TS-GREEN-01",
      nutrients: [
        { nutrient_name: "Nitrogen", measured_value: 214, unit: "kg/ha" },
        { nutrient_name: "Moisture", measured_value: 32.2, unit: "%" },
        { nutrient_name: "Organic Carbon", measured_value: 3.46, unit: "%" }
      ]
    },
    {
      measurement_id: 30203,
      measurement_date: "2026-04-02T09:00:00.000Z",
      depth_cm: 20,
      latitude: 30.901,
      longitude: 75.853,
      sensor_id: "TS-GREEN-01",
      nutrients: [
        { nutrient_name: "Nitrogen", measured_value: 218, unit: "kg/ha" },
        { nutrient_name: "Moisture", measured_value: 33.1, unit: "%" },
        { nutrient_name: "Organic Carbon", measured_value: 3.55, unit: "%" }
      ]
    }
  ],
  "303": []
};

const initialRecords: DemoRecord[] = [
  {
    sequestration_id: 9001,
    farm_id: 101,
    season_id: 302,
    farm_name: "Green Valley Farm",
    farmer_name: "Green Valley Farmer",
    season_name: "Monsoon 2026 Demo",
    location: "Ludhiana, Punjab",
    area_hectares: 24.5,
    baseline_carbon: 142.4,
    current_carbon: 165.38,
    net_carbon_increase: 22.98,
    estimated_carbon_credit: 2.07,
    status: "pending",
    calculation_date: "2026-04-03T10:30:00.000Z",
    verification: null
  },
  {
    sequestration_id: 9002,
    farm_id: 101,
    season_id: 301,
    farm_name: "Green Valley Farm",
    farmer_name: "Green Valley Farmer",
    season_name: "Rabi 2025 Baseline",
    location: "Ludhiana, Punjab",
    area_hectares: 24.5,
    baseline_carbon: 138.7,
    current_carbon: 156.9,
    net_carbon_increase: 18.2,
    estimated_carbon_credit: 1.6,
    status: "verified",
    calculation_date: "2026-01-18T09:15:00.000Z",
    verification: {
      verification_id: 7001,
      verifier_id: 2,
      verification_date: "2026-01-19T11:00:00.000Z",
      verification_status: "approved",
      verifier_comments: "Sampling depth and carbon trend matched the season evidence.",
      approved_carbon_credit: 1.6
    }
  }
];

const initialMonthlyCredits: MonthlyCredit[] = [
  { month: "Nov", credits: 0.76 },
  { month: "Dec", credits: 1.02 },
  { month: "Jan", credits: 1.6 },
  { month: "Feb", credits: 1.21 },
  { month: "Mar", credits: 1.08 },
  { month: "Apr", credits: 0 }
];

const initialSyncResponses: Record<string, ThingSpeakSyncResponse> = {
  "302": {
    channel_id: DEMO_CHANNEL_ID,
    imported_count: 3,
    skipped_count: 0,
    imported_measurement_ids: [30201, 30202, 30203],
    skipped_entries: [],
    message: "ThingSpeak demo data imported into Monsoon 2026 Demo."
  }
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const wait = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, DEMO_DELAY_MS);
  });

const buildError = (detail: string, status = 400) => ({
  response: { status, data: { detail } }
});

const getInitialState = (): DemoState => ({
  farm: clone(initialFarm),
  monthlyCredits: clone(initialMonthlyCredits),
  nextSequestrationId: 9003,
  nextUserId: 4,
  nextVerificationId: 7002,
  records: clone(initialRecords),
  seasonMeasurements: clone(initialSeasonMeasurements),
  syncResponses: clone(initialSyncResponses),
  users: clone(initialUsers)
});

const loadState = (): DemoState => {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  const rawState = window.localStorage.getItem(DEMO_STATE_STORAGE_KEY);
  if (!rawState) {
    const initialState = getInitialState();
    window.localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return JSON.parse(rawState) as DemoState;
  } catch {
    const resetState = getInitialState();
    window.localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(resetState));
    return resetState;
  }
};

const saveState = (state: DemoState) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(state));
  }
};

const toPublicUser = (user: AdminUser): User => ({
  user_id: user.user_id,
  username: user.username,
  name: user.name,
  role: user.role,
  email: user.email,
  created_at: user.created_at
});

const findUser = (state: DemoState, username: string) =>
  state.users.find((user) => user.username.toLowerCase() === username.toLowerCase());

const getCurrentUserFromToken = (state: DemoState) => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token?.startsWith(DEMO_TOKEN_PREFIX)) {
    return null;
  }

  return findUser(state, token.slice(DEMO_TOKEN_PREFIX.length)) ?? null;
};

const getSeason = (state: DemoState, seasonId: number) =>
  state.farm.seasons.find((season) => season.season_id === seasonId) ?? null;

const getOrganicCarbon = (measurement: VerificationMeasurementDetail) =>
  measurement.nutrients.find((item) => item.nutrient_name === "Organic Carbon")
    ?.measured_value ?? 0;

const getNitrogen = (measurement: VerificationMeasurementDetail) =>
  measurement.nutrients.find((item) => item.nutrient_name === "Nitrogen")
    ?.measured_value ?? 0;

const buildDetail = (state: DemoState, record: DemoRecord): SequestrationDetail => {
  const measurements = clone(state.seasonMeasurements[String(record.season_id)] ?? []);

  return {
    ...clone(record),
    measurement_count: measurements.length,
    measurements
  };
};

const buildFarmerDashboard = (state: DemoState): FarmerDashboardResponse => ({
  farmer_id: 3,
  stats: {
    totalFarms: 1,
    activeSeasons: state.farm.seasons.filter((season) => season.status === "active").length,
    pendingVerifications: state.records.filter((record) => record.status === "pending").length,
    totalCredits: Number(
      state.farm.seasons.reduce(
        (sum, season) => sum + (season.carbon_data?.estimated_credit ?? 0),
        0
      ).toFixed(2)
    )
  },
  farms: [clone(state.farm)],
  recentMeasurements: Object.values(state.seasonMeasurements)
    .flat()
    .map((measurement) => ({
      date: measurement.measurement_date,
      farm: state.farm.farm_name,
      depth: measurement.depth_cm,
      organicCarbon: getOrganicCarbon(measurement),
      nitrogen: getNitrogen(measurement)
    }))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 10)
});

const buildStatistics = (state: DemoState): AdminStatistics => ({
  total_farms: 1,
  total_farmers: 1,
  total_seasons: state.farm.seasons.length,
  pending_verifications: state.records.filter((record) => record.status === "pending").length,
  total_carbon_credits_issued: Number(
    state.monthlyCredits.reduce((sum, item) => sum + item.credits, 0).toFixed(2)
  ),
  active_seasons: state.farm.seasons.filter((season) => season.status === "active").length
});

const syncSeasonFromRecord = (state: DemoState, record: DemoRecord) => {
  const season = getSeason(state, record.season_id);
  if (!season) {
    return;
  }

  season.status =
    record.status === "pending"
      ? "completed"
      : record.status === "verified"
        ? "verified"
        : "rejected";
  season.carbon_data = {
    baseline_carbon: record.baseline_carbon,
    current_carbon: record.current_carbon,
    net_increase: record.net_carbon_increase,
    estimated_credit: record.verification?.approved_carbon_credit ?? record.estimated_carbon_credit,
    verification_status: record.verification?.verification_status ?? record.status
  };
};

const addCreditToCurrentMonth = (state: DemoState, credits: number) => {
  const currentMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date());
  const monthEntry = state.monthlyCredits.find((item) => item.month === currentMonth);

  if (monthEntry) {
    monthEntry.credits = Number((monthEntry.credits + credits).toFixed(2));
    return;
  }

  state.monthlyCredits.push({ month: currentMonth, credits: Number(credits.toFixed(2)) });
};

const createSyncedMeasurements = (): VerificationMeasurementDetail[] => [
  {
    measurement_id: 30301,
    measurement_date: "2026-04-04T07:50:00.000Z",
    depth_cm: 22,
    latitude: 30.901,
    longitude: 75.853,
    sensor_id: "TS-GREEN-01",
    nutrients: [
      { nutrient_name: "Nitrogen", measured_value: 172, unit: "kg/ha" },
      { nutrient_name: "Moisture", measured_value: 24.7, unit: "%" },
      { nutrient_name: "Organic Carbon", measured_value: 2.76, unit: "%" }
    ]
  },
  {
    measurement_id: 30302,
    measurement_date: "2026-04-04T08:20:00.000Z",
    depth_cm: 22,
    latitude: 30.901,
    longitude: 75.853,
    sensor_id: "TS-GREEN-01",
    nutrients: [
      { nutrient_name: "Nitrogen", measured_value: 176, unit: "kg/ha" },
      { nutrient_name: "Moisture", measured_value: 25.3, unit: "%" },
      { nutrient_name: "Organic Carbon", measured_value: 2.83, unit: "%" }
    ]
  },
  {
    measurement_id: 30303,
    measurement_date: "2026-04-04T08:55:00.000Z",
    depth_cm: 22,
    latitude: 30.901,
    longitude: 75.853,
    sensor_id: "TS-GREEN-01",
    nutrients: [
      { nutrient_name: "Nitrogen", measured_value: 181, unit: "kg/ha" },
      { nutrient_name: "Moisture", measured_value: 26.1, unit: "%" },
      { nutrient_name: "Organic Carbon", measured_value: 2.91, unit: "%" }
    ]
  }
];

export const demoBackend = {
  async login(username: string, password: string): Promise<TokenResponse> {
    await wait();
    const state = loadState();
    const user = findUser(state, username);

    if (!user || demoCredentials[user.username] !== password) {
      throw buildError("Invalid username or password", 401);
    }

    return {
      access_token: `${DEMO_TOKEN_PREFIX}${user.username}`,
      token_type: "bearer",
      user: toPublicUser(user)
    };
  },

  async register(userData: UserCreateInput): Promise<User> {
    await wait();
    const state = loadState();
    if (findUser(state, userData.username)) {
      throw buildError("Username already exists");
    }

    const newUser: AdminUser = {
      user_id: state.nextUserId,
      username: userData.username,
      name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() || userData.username,
      role: userData.role,
      email: userData.email,
      status: "active",
      created_at: new Date().toISOString()
    };

    state.nextUserId += 1;
    state.users.push(newUser);
    saveState(state);
    return toPublicUser(newUser);
  },

  async getCurrentUser(): Promise<User> {
    await wait();
    const state = loadState();
    const user = getCurrentUserFromToken(state);
    if (!user) {
      throw buildError("Authentication required", 401);
    }

    return toPublicUser(user);
  },

  async getFarmerDashboard(): Promise<FarmerDashboardResponse> {
    await wait();
    return buildFarmerDashboard(loadState());
  },

  async getCarbonReports(farmId: number): Promise<CarbonSequestrationRecord[]> {
    await wait();
    const state = loadState();
    return state.records
      .filter((record) => record.farm_id === farmId)
      .map((record) => ({
        sequestration_id: record.sequestration_id,
        farm_id: record.farm_id,
        season_id: record.season_id,
        baseline_carbon: record.baseline_carbon,
        current_carbon: record.current_carbon,
        net_carbon_increase: record.net_carbon_increase,
        estimated_carbon_credit: record.verification?.approved_carbon_credit ?? record.estimated_carbon_credit,
        status: record.status,
        calculation_date: record.calculation_date,
        verification: record.verification
      }));
  },

  async getPendingVerifications(): Promise<PendingVerification[]> {
    await wait();
    const state = loadState();
    return state.records
      .filter((record) => record.status === "pending")
      .map((record) => {
        const detail = buildDetail(state, record);
        return {
          sequestration_id: detail.sequestration_id,
          farm_name: detail.farm_name,
          farmer_name: detail.farmer_name,
          season_name: detail.season_name,
          location: detail.location,
          area_hectares: detail.area_hectares,
          baseline_carbon: detail.baseline_carbon,
          current_carbon: detail.current_carbon,
          net_carbon_increase: detail.net_carbon_increase,
          estimated_carbon_credit: detail.estimated_carbon_credit,
          calculation_date: detail.calculation_date,
          measurement_count: detail.measurement_count
        };
      });
  },

  async getSequestrationDetail(sequestrationId: number): Promise<SequestrationDetail> {
    await wait();
    const state = loadState();
    const record = state.records.find((item) => item.sequestration_id === sequestrationId);
    if (!record) {
      throw buildError("Sequestration record not found", 404);
    }

    return buildDetail(state, record);
  },

  async getVerificationHistory(): Promise<VerificationHistoryItem[]> {
    await wait();
    const state = loadState();
    return state.records
      .filter((record) => record.status !== "pending")
      .map((record) => ({
        sequestration_id: record.sequestration_id,
        farm_name: record.farm_name,
        farmer_name: record.farmer_name,
        season_name: record.season_name,
        approved_or_estimated_credit: record.verification?.approved_carbon_credit ?? record.estimated_carbon_credit,
        status: record.verification?.verification_status ?? record.status,
        calculation_date: record.calculation_date
      }));
  },

  async approveSequestration(
    sequestrationId: number,
    payload: VerificationActionPayload
  ): Promise<VerificationActionResponse> {
    await wait();
    const state = loadState();
    const record = state.records.find((item) => item.sequestration_id === sequestrationId);
    if (!record) {
      throw buildError("Sequestration record not found", 404);
    }

    record.status = "verified";
    record.verification = {
      verification_id: state.nextVerificationId,
      verifier_id: 2,
      verification_date: new Date().toISOString(),
      verification_status: "approved",
      verifier_comments: payload.verifier_comments,
      approved_carbon_credit: payload.approved_carbon_credit
    };

    state.nextVerificationId += 1;
    addCreditToCurrentMonth(state, payload.approved_carbon_credit);
    syncSeasonFromRecord(state, record);
    saveState(state);

    return {
      message: "Verification approved in demo mode",
      sequestration_id: record.sequestration_id,
      verification_id: record.verification.verification_id,
      status: "verified"
    };
  },

  async rejectSequestration(
    sequestrationId: number,
    payload: RejectVerificationPayload
  ): Promise<VerificationActionResponse> {
    await wait();
    const state = loadState();
    const record = state.records.find((item) => item.sequestration_id === sequestrationId);
    if (!record) {
      throw buildError("Sequestration record not found", 404);
    }

    record.status = "rejected";
    record.verification = {
      verification_id: state.nextVerificationId,
      verifier_id: 2,
      verification_date: new Date().toISOString(),
      verification_status: "rejected",
      verifier_comments: payload.verifier_comments,
      approved_carbon_credit: null
    };

    state.nextVerificationId += 1;
    syncSeasonFromRecord(state, record);
    saveState(state);

    return {
      message: "Verification rejected in demo mode",
      sequestration_id: record.sequestration_id,
      verification_id: record.verification.verification_id,
      status: "rejected"
    };
  },

  async getStatistics(): Promise<AdminStatistics> {
    await wait();
    return buildStatistics(loadState());
  },

  async getMonthlyCredits(): Promise<MonthlyCredit[]> {
    await wait();
    return clone(loadState().monthlyCredits);
  },

  async getSeasonOptions() {
    await wait();
    const state = loadState();
    return state.farm.seasons.map((season) => ({
      season_id: season.season_id,
      farm_id: state.farm.farm_id,
      farm_name: state.farm.farm_name,
      season_name: season.season_name,
      crop_type: season.crop_type,
      status: season.status
    }));
  },

  async getUsers(): Promise<AdminUser[]> {
    await wait();
    return clone(loadState().users);
  },

  async createUser(payload: UserCreateInput): Promise<AdminUser> {
    await wait();
    const state = loadState();
    if (findUser(state, payload.username)) {
      throw buildError("Username already exists");
    }

    const newUser: AdminUser = {
      user_id: state.nextUserId,
      username: payload.username,
      name: `${payload.first_name ?? ""} ${payload.last_name ?? ""}`.trim() || payload.username,
      role: payload.role,
      email: payload.email,
      status: "active",
      created_at: new Date().toISOString()
    };

    state.nextUserId += 1;
    state.users.push(newUser);
    saveState(state);
    return clone(newUser);
  },

  async syncThingSpeak(payload: ThingSpeakSyncRequest): Promise<ThingSpeakSyncResponse> {
    await wait();
    const state = loadState();
    const key = String(payload.season_id);
    if (state.syncResponses[key]) {
      return clone(state.syncResponses[key]);
    }

    state.seasonMeasurements[key] = createSyncedMeasurements();
    state.syncResponses[key] = {
      channel_id: DEMO_CHANNEL_ID,
      imported_count: state.seasonMeasurements[key].length,
      skipped_count: 0,
      imported_measurement_ids: state.seasonMeasurements[key].map((item) => item.measurement_id),
      skipped_entries: [],
      message: "ThingSpeak demo data imported into Summer 2026 Pilot."
    };
    saveState(state);

    return clone(state.syncResponses[key]);
  },

  async triggerCarbonCalculation(payload: {
    season_id: number;
  }): Promise<CarbonCalculationResponse> {
    await wait();
    const state = loadState();
    const existing = state.records.find((record) => record.season_id === payload.season_id);
    if (existing) {
      return {
        sequestration_id: existing.sequestration_id,
        farm_id: existing.farm_id,
        season_id: existing.season_id,
        baseline_carbon: existing.baseline_carbon,
        current_carbon: existing.current_carbon,
        net_carbon_increase: existing.net_carbon_increase,
        estimated_carbon_credit: existing.verification?.approved_carbon_credit ?? existing.estimated_carbon_credit,
        status: existing.status,
        calculation_date: existing.calculation_date,
        verification: existing.verification
      };
    }

    const season = getSeason(state, payload.season_id);
    const measurements = state.seasonMeasurements[String(payload.season_id)] ?? [];
    if (!season || measurements.length < 3) {
      throw buildError("Run ThingSpeak sync first so the demo season has enough measurements.");
    }

    const averageOrganicCarbon =
      measurements.reduce((sum, measurement) => sum + getOrganicCarbon(measurement), 0) /
      measurements.length;
    const currentCarbon = Number((state.farm.baseline_carbon + averageOrganicCarbon * 6.2).toFixed(2));
    const netIncrease = Number((currentCarbon - state.farm.baseline_carbon).toFixed(2));
    const estimatedCredit = Number(((netIncrease * state.farm.total_area_hectares * 3.67) / 1000).toFixed(2));

    const record: DemoRecord = {
      sequestration_id: state.nextSequestrationId,
      farm_id: state.farm.farm_id,
      season_id: season.season_id,
      farm_name: state.farm.farm_name,
      farmer_name: "Green Valley Farmer",
      season_name: season.season_name,
      location: state.farm.location,
      area_hectares: state.farm.total_area_hectares,
      baseline_carbon: state.farm.baseline_carbon,
      current_carbon: currentCarbon,
      net_carbon_increase: netIncrease,
      estimated_carbon_credit: estimatedCredit,
      status: "pending",
      calculation_date: new Date().toISOString(),
      verification: null
    };

    state.nextSequestrationId += 1;
    state.records.push(record);
    syncSeasonFromRecord(state, record);
    saveState(state);

    return {
      sequestration_id: record.sequestration_id,
      farm_id: record.farm_id,
      season_id: record.season_id,
      baseline_carbon: record.baseline_carbon,
      current_carbon: record.current_carbon,
      net_carbon_increase: record.net_carbon_increase,
      estimated_carbon_credit: record.estimated_carbon_credit,
      status: record.status,
      calculation_date: record.calculation_date,
      verification: null
    };
  }
};
