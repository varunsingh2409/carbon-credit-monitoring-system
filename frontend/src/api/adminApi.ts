import { apiClient } from "@/api/axiosConfig";
import type {
  AdminStatistics,
  AdminUser,
  CarbonCalculationRequest,
  CarbonCalculationResponse,
  MonthlyCredit,
  SeasonOption,
  ThingSpeakSyncRequest,
  ThingSpeakSyncResponse,
  UserCreateInput
} from "@/types";

interface LegacySeasonResponse {
  season_id: number;
  farm_id: number;
  season_name: string;
  crop_type: string | null;
  status: string;
}

interface LegacyFarmResponse {
  farm_id: number;
  farm_name: string;
}

async function getStatistics() {
  const { data } = await apiClient.get<AdminStatistics>("/admin/statistics");
  return data;
}

async function getMonthlyCredits() {
  const { data } = await apiClient.get<MonthlyCredit[]>("/admin/monthly-credits");
  return data;
}

async function getSeasonOptions() {
  const [seasonResponse, farmResponse] = await Promise.all([
    apiClient.get<LegacySeasonResponse[]>("/v1/seasons"),
    apiClient.get<LegacyFarmResponse[]>("/v1/farms")
  ]);

  const farmMap = new Map(
    farmResponse.data.map((farm) => [farm.farm_id, farm.farm_name])
  );

  return seasonResponse.data.map(
    (season): SeasonOption => ({
      season_id: season.season_id,
      farm_id: season.farm_id,
      farm_name: farmMap.get(season.farm_id) ?? `Farm #${season.farm_id}`,
      season_name: season.season_name,
      crop_type: season.crop_type,
      status: season.status
    })
  );
}

async function triggerCarbonCalculation(payload: CarbonCalculationRequest) {
  const { data } = await apiClient.post<CarbonCalculationResponse>(
    "/admin/trigger-carbon-calculation",
    payload
  );
  return data;
}

async function getUsers() {
  const { data } = await apiClient.get<AdminUser[]>("/admin/users");
  return data;
}

async function createUser(payload: UserCreateInput) {
  const { data } = await apiClient.post<AdminUser>("/admin/users", payload);
  return data;
}

async function syncThingSpeak(payload: ThingSpeakSyncRequest) {
  const { data } = await apiClient.post<ThingSpeakSyncResponse>(
    "/admin/sync-thingspeak",
    payload
  );
  return data;
}

export const adminApi = {
  getStatistics,
  getMonthlyCredits,
  getSeasonOptions,
  triggerCarbonCalculation,
  getUsers,
  createUser,
  syncThingSpeak
};
