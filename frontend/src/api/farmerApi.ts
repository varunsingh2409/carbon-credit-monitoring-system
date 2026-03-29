import { apiClient } from "@/api/axiosConfig";
import type { CarbonSequestrationRecord, FarmerDashboardResponse } from "@/types";

export const farmerApi = {
  async getDashboard() {
    const { data } = await apiClient.get<FarmerDashboardResponse>("/farmer/dashboard");
    return data;
  },

  async getCarbonReports(farmId: number) {
    const { data } = await apiClient.get<CarbonSequestrationRecord[]>(
      `/farmer/carbon-reports?farm_id=${farmId}`
    );
    return data;
  }
};
