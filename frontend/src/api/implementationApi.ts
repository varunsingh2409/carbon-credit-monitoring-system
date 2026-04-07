import { apiClient } from "@/api/axiosConfig";
import { isPublishedDemoMode } from "@/demo/demoMode";
import { demoBackend } from "@/demo/mockBackend";
import type { AdminImplementationSummary } from "@/types";

async function getEvidence() {
  if (isPublishedDemoMode) {
    return demoBackend.getImplementationSummary();
  }

  const { data } = await apiClient.get<AdminImplementationSummary>(
    "/implementation/evidence"
  );
  return data;
}

export const implementationApi = {
  getEvidence
};
