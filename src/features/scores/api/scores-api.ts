import { apiClient } from "@/lib/api/api-client";
import type { PredictionScoreResponse } from "@/features/scores/types/score-types";

export function getMyScores(
  tournamentId: string | undefined,
  accessToken: string,
): Promise<PredictionScoreResponse[]> {
  const query = tournamentId
    ? `?${new URLSearchParams({ tournamentId })}`
    : "";

  return apiClient<PredictionScoreResponse[]>(`/api/v1/me/scores${query}`, {
    accessToken,
  });
}
