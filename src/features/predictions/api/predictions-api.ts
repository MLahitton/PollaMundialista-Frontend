import { ApiError, apiClient } from "@/lib/api/api-client";
import type {
  PredictionResponse,
  UpsertPredictionRequest,
} from "@/features/predictions/types/prediction-types";

export async function getMyPredictionByMatch(
  matchId: string,
  accessToken: string,
): Promise<PredictionResponse | null> {
  try {
    return await apiClient<PredictionResponse>(
      `/api/v1/me/predictions/matches/${matchId}`,
      { accessToken },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function getMyPredictions(
  tournamentId: string | undefined,
  accessToken: string,
): Promise<PredictionResponse[]> {
  const query = tournamentId
    ? `?${new URLSearchParams({ tournamentId })}`
    : "";

  return apiClient<PredictionResponse[]>(`/api/v1/me/predictions${query}`, {
    accessToken,
  });
}

export function upsertMyPrediction(
  matchId: string,
  request: UpsertPredictionRequest,
  accessToken: string,
): Promise<PredictionResponse> {
  return apiClient<PredictionResponse>(
    `/api/v1/me/predictions/matches/${matchId}`,
    {
      method: "PUT",
      body: request,
      accessToken,
    },
  );
}
