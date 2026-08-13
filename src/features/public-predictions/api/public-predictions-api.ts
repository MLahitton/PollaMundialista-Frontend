import { apiClient } from "@/lib/api/api-client";
import type { PublicPredictionResponse } from "@/features/public-predictions/types/public-prediction-types";

export function getPublicPredictionsByMatch(
  matchId: string,
  accessToken: string,
): Promise<PublicPredictionResponse[]> {
  return apiClient<PublicPredictionResponse[]>(
    `/api/v1/me/public-predictions/matches/${matchId}`,
    { accessToken },
  );
}

export function getParticipantPredictionForMatch(
  matchId: string,
  targetParticipantId: string,
  accessToken: string,
): Promise<PublicPredictionResponse> {
  return apiClient<PublicPredictionResponse>(
    `/api/v1/me/public-predictions/matches/${matchId}/participants/${targetParticipantId}`,
    { accessToken },
  );
}
