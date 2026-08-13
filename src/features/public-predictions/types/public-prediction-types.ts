export type PublicPredictionResponse = {
  predictionId: string;
  participantId: string;
  participantDisplayName: string;
  participantProfileImageUrl: string | null;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedQualifiedTeamId: string | null;
  submittedAt: string;
  updatedAt: string;
};
