import { apiClient } from "@/lib/api/api-client";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

export function getActiveTournament(): Promise<TournamentResponse> {
  return apiClient<TournamentResponse>("/api/v1/tournaments/active");
}
