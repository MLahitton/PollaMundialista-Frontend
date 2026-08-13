import { apiClient } from "@/lib/api/api-client";
import type { TournamentRankingResponse } from "@/features/ranking/types/ranking-types";

export function getMyTournamentRanking(
  tournamentId: string,
  accessToken: string,
): Promise<TournamentRankingResponse> {
  return apiClient<TournamentRankingResponse>(
    `/api/v1/me/rankings/tournaments/${tournamentId}`,
    { accessToken },
  );
}
