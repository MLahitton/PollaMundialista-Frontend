export type MatchViewStatus =
  | "OPEN_FOR_PREDICTIONS"
  | "PREDICTION_CLOSED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "SCORED"
  | "POSTPONED"
  | "CANCELLED";

export type MatchResponse = {
  id: string;
  tournamentId: string;
  stageId: string;
  groupId: string | null;
  externalId: string;
  homeTeamId: string | null;
  homeTeamName: string | null;
  homeTeamCode: string | null;
  homeTeamLogoUrl: string | null;
  awayTeamId: string | null;
  awayTeamName: string | null;
  awayTeamCode: string | null;
  awayTeamLogoUrl: string | null;
  startsAt: string;
  predictionClosesAt: string;
  status: MatchViewStatus;
  predictionsOpen: boolean;
  predictionsClosed: boolean;
  resultVisible: boolean;
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  qualifiedTeamId: string | null;
  resultConfirmedAt: string | null;
  scoredAt: string | null;
};
