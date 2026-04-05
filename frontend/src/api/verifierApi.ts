import { apiClient } from "@/api/axiosConfig";
import { isPublishedDemoMode } from "@/demo/demoMode";
import { demoBackend } from "@/demo/mockBackend";
import type {
  CarbonSequestrationRecord,
  PendingVerification,
  RejectVerificationPayload,
  SequestrationDetail,
  VerificationActionPayload,
  VerificationActionResponse,
  VerificationHistoryItem
} from "@/types";

const normalizeHistoryStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
    case "verified":
      return "verified";
    case "rejected":
      return "rejected";
    default:
      return status.toLowerCase();
  }
};

async function getPendingVerifications() {
  if (isPublishedDemoMode) {
    return demoBackend.getPendingVerifications();
  }

  const { data } = await apiClient.get<PendingVerification[]>("/verifier/pending-verifications");
  return data;
}

async function getSequestrationDetail(sequestrationId: number) {
  if (isPublishedDemoMode) {
    return demoBackend.getSequestrationDetail(sequestrationId);
  }

  const { data } = await apiClient.get<SequestrationDetail>(
    `/verifier/sequestration/${sequestrationId}`
  );
  return data;
}

async function getVerificationHistory() {
  if (isPublishedDemoMode) {
    return demoBackend.getVerificationHistory();
  }

  const { data } = await apiClient.get<CarbonSequestrationRecord[]>("/v1/sequestration");
  const historicalRecords = data.filter(
    (record) => record.status.toLowerCase() !== "pending"
  );

  const detailResults = await Promise.allSettled(
    historicalRecords.map((record) => getSequestrationDetail(record.sequestration_id))
  );

  return detailResults
    .map((result, index): VerificationHistoryItem | null => {
      if (result.status === "fulfilled") {
        const detail = result.value;
        return {
          sequestration_id: detail.sequestration_id,
          farm_name: detail.farm_name,
          farmer_name: detail.farmer_name,
          season_name: detail.season_name,
          approved_or_estimated_credit:
            detail.verification?.approved_carbon_credit ??
            detail.estimated_carbon_credit,
          status: normalizeHistoryStatus(
            detail.verification?.verification_status ?? detail.status
          ),
          calculation_date: detail.calculation_date
        };
      }

      const record = historicalRecords[index];
      if (!record) {
        return null;
      }

      return {
        sequestration_id: record.sequestration_id,
        farm_name: `Farm #${record.farm_id}`,
        farmer_name: "Unavailable",
        season_name: `Season #${record.season_id}`,
        approved_or_estimated_credit: record.estimated_carbon_credit,
        status: normalizeHistoryStatus(record.status),
        calculation_date: record.calculation_date
      };
    })
    .filter((item): item is VerificationHistoryItem => item !== null)
    .sort(
      (left, right) =>
        new Date(right.calculation_date).getTime() -
        new Date(left.calculation_date).getTime()
    );
}

async function approveSequestration(
  sequestrationId: number,
  payload: VerificationActionPayload
) {
  if (isPublishedDemoMode) {
    return demoBackend.approveSequestration(sequestrationId, payload);
  }

  const { data } = await apiClient.post<VerificationActionResponse>(
    `/verifier/approve/${sequestrationId}`,
    payload
  );
  return data;
}

async function rejectSequestration(
  sequestrationId: number,
  payload: RejectVerificationPayload
) {
  if (isPublishedDemoMode) {
    return demoBackend.rejectSequestration(sequestrationId, payload);
  }

  const { data } = await apiClient.post<VerificationActionResponse>(
    `/verifier/reject/${sequestrationId}`,
    payload
  );
  return data;
}

export const verifierApi = {
  getPendingVerifications,
  getSequestrationDetail,
  getVerificationHistory,
  approveSequestration,
  rejectSequestration
};
