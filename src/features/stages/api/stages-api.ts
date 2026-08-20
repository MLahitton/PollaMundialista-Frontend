import { apiClient } from "@/lib/api/api-client";
import type { StageResponse } from "@/features/stages/types/stage-types";

export function getStagesByTournament(
  tournamentId: string,
): Promise<StageResponse[]> {
  const query = new URLSearchParams({ tournamentId });

  return apiClient<StageResponse[]>(`/api/v1/stages?${query}`);
}
