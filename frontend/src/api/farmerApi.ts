import { apiClient } from "@/api/axiosConfig";
import { isPublishedDemoMode } from "@/demo/demoMode";
import { demoBackend } from "@/demo/mockBackend";
import type { CarbonSequestrationRecord, FarmerDashboardResponse } from "@/types";

export const farmerApi = {
  async getDashboard() {
    if (isPublishedDemoMode) {
      return demoBackend.getFarmerDashboard();
    }

    const { data } = await apiClient.get<FarmerDashboardResponse>("/farmer/dashboard");
    return data;
  },

  async getCarbonReports(farmId: number) {
    if (isPublishedDemoMode) {
      return demoBackend.getCarbonReports(farmId);
    }

    const { data } = await apiClient.get<CarbonSequestrationRecord[]>(
      `/farmer/carbon-reports?farm_id=${farmId}`
    );
    return data;
  }
};
