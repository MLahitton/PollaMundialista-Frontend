export type UpsertPredictionRequest = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedQualifiedTeamId: string | null;
};

export type PredictionResponse = {
  id: string;
  participantId: string;
  matchId: string;
  tournamentId: string;
  stageId: string;
  groupId: string | null;
  homeTeamId: string | null;
  homeTeamName: string | null;
  awayTeamId: string | null;
  awayTeamName: string | null;
  startsAt: string;
  predictionClosesAt: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedQualifiedTeamId: string | null;
  submittedAt: string;
  updatedAt: string | null;
  lockedAt: string | null;
  editable: boolean;
  locked: boolean;
};
