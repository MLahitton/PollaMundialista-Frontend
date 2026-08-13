export type RankingEntryResponse = {
  participantId: string;
  displayName: string;
  profileImageUrl: string | null;
  position: number;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  qualifiedTeamBonuses: number;
  scoredPredictions: number;
  currentParticipant: boolean;
};

export type TournamentRankingResponse = {
  tournamentId: string;
  asOf: string;
  top10: RankingEntryResponse[];
  currentParticipant: RankingEntryResponse;
  rankedParticipants: number;
};
