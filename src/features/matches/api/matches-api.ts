import { apiClient } from "@/lib/api/api-client";
import type { MatchResponse } from "@/features/matches/types/match-types";

export function getUpcomingMatches(
  tournamentId: string,
): Promise<MatchResponse[]> {
  const query = new URLSearchParams({ tournamentId });

  return apiClient<MatchResponse[]>(`/api/v1/matches/upcoming?${query}`);
}

export function getMatch(matchId: string): Promise<MatchResponse> {
  return apiClient<MatchResponse>(`/api/v1/matches/${matchId}`);
}
