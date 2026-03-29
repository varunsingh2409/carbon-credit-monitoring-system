export type UserRole = "farmer" | "verifier" | "admin" | "sensor";
export type StatusBadgeValue =
  | "verified"
  | "pending"
  | "active"
  | "completed"
  | "rejected";

export interface User {
  user_id: number;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  created_at?: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface NutrientMeasurement {
  nutrient_name: string;
  measured_value: number;
  unit?: string;
}

export interface Measurement {
  measurement_id: number;
  measurement_date: string;
  depth_cm: number;
  latitude: number | null;
  longitude: number | null;
  sensor_id: string | null;
  nutrients?: NutrientMeasurement[];
}

export interface CarbonVerification {
  verification_id: number;
  verifier_id: number | null;
  verification_date: string;
  verification_status: string;
  verifier_comments: string | null;
  approved_carbon_credit: number | null;
}

export interface SeasonCarbonData {
  baseline_carbon: number;
  current_carbon: number;
  net_increase: number;
  estimated_credit: number;
  verification_status: string;
}

export interface Season {
  season_id: number;
  season_name: string;
  start_date: string;
  end_date: string;
  crop_type: string | null;
  status: StatusBadgeValue;
  carbon_data?: SeasonCarbonData | null;
}

export interface Farm {
  farm_id: number;
  farm_name: string;
  location: string;
  total_area_hectares: number;
  soil_type: string | null;
  baseline_carbon: number;
  seasons?: Season[];
}

export interface FarmerDashboardStats {
  totalFarms: number;
  activeSeasons: number;
  pendingVerifications: number;
  totalCredits: number;
}

export type FarmerSeasonCarbonData = SeasonCarbonData;
export type FarmerSeasonDashboard = Season;

export interface FarmerFarmDashboard extends Farm {
  seasons: FarmerSeasonDashboard[];
}

export interface RecentMeasurement {
  date: string;
  farm: string;
  depth: number;
  organicCarbon: number | null;
  nitrogen: number | null;
}

export interface FarmerDashboardResponse {
  farmer_id: number;
  stats: FarmerDashboardStats;
  farms: FarmerFarmDashboard[];
  recentMeasurements: RecentMeasurement[];
}

export interface CarbonSequestration {
  sequestration_id: number;
  farm_id: number;
  season_id: number;
  baseline_carbon: number;
  current_carbon: number;
  net_carbon_increase: number;
  estimated_carbon_credit: number;
  status: string;
  calculation_date: string;
  verification?: CarbonVerification | null;
}

export type CarbonSequestrationRecord = CarbonSequestration;

export interface PendingVerification {
  sequestration_id: number;
  farm_name: string;
  farmer_name: string;
  season_name: string;
  location: string;
  area_hectares: number;
  baseline_carbon: number;
  current_carbon: number;
  net_carbon_increase: number;
  estimated_carbon_credit: number;
  calculation_date: string;
  measurement_count: number;
}

export interface VerificationHistoryItem {
  sequestration_id: number;
  farm_name: string;
  farmer_name: string;
  season_name: string;
  approved_or_estimated_credit: number;
  status: string;
  calculation_date: string;
}

export type VerificationMeasurementNutrient = NutrientMeasurement;

export interface VerificationMeasurementDetail
  extends Omit<Measurement, "nutrients"> {
  nutrients: VerificationMeasurementNutrient[];
}

export type VerificationRecordInfo = CarbonVerification;

export interface SequestrationDetail extends CarbonSequestration {
  farm_name: string;
  farmer_name: string;
  season_name: string;
  location: string;
  area_hectares: number;
  measurement_count: number;
  measurements: VerificationMeasurementDetail[];
  verification: VerificationRecordInfo | null;
}

export interface VerificationActionPayload {
  approved_carbon_credit: number;
  verifier_comments: string;
}

export interface RejectVerificationPayload {
  verifier_comments: string;
}

export interface VerificationActionResponse {
  message: string;
  sequestration_id: number;
  verification_id: number;
  status: string;
}

export interface AdminStatistics {
  total_farms: number;
  total_farmers: number;
  total_seasons: number;
  pending_verifications: number;
  total_carbon_credits_issued: number;
  active_seasons: number;
}

export interface MonthlyCredit {
  month: string;
  credits: number;
}

export interface SeasonOption {
  season_id: number;
  farm_id: number;
  farm_name: string;
  season_name: string;
  crop_type: string | null;
  status: string;
}

export interface AdminUser extends User {
  email: string;
  status: string;
  created_at: string;
}

export interface CarbonCalculationRequest {
  season_id: number;
}

export interface CarbonCalculationResponse extends CarbonSequestration {
  flag?: string | null;
  manual_review?: boolean | null;
  review_reason?: string | null;
}

export interface ThingSpeakSyncRequest {
  season_id: number;
  results?: number;
  sensor_id?: string;
  default_depth_cm?: number;
}

export interface ThingSpeakSkippedEntry {
  entry_id: number | null;
  reason: string;
}

export interface ThingSpeakSyncResponse {
  channel_id: number;
  imported_count: number;
  skipped_count: number;
  imported_measurement_ids: number[];
  skipped_entries: ThingSpeakSkippedEntry[];
  message: string;
}
