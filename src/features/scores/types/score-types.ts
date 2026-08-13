export type PredictionScoreResponse = {
  id: string;
  predictionId: string;
  participantId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
  predictedQualifiedTeamId: string | null;
  actualQualifiedTeamId: string | null;
  basePoints: number;
  qualifiedTeamBonus: number;
  totalPoints: number;
  exactScore: boolean;
  correctOutcome: boolean;
  correctQualifiedTeam: boolean;
  scoredAt: string;
};
