import type { MatchResponse } from "@/features/matches/types/match-types";
import type { PublicPredictionResponse } from "@/features/public-predictions/types/public-prediction-types";

type PublicPredictionCardProps = {
  prediction: PublicPredictionResponse;
  match: MatchResponse;
  currentParticipantId: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function qualifiedTeamName(
  prediction: PublicPredictionResponse,
  match: MatchResponse,
): string | null {
  if (!prediction.predictedQualifiedTeamId) {
    return null;
  }

  if (prediction.predictedQualifiedTeamId === match.homeTeamId) {
    return match.homeTeamName ?? match.homeTeamCode ?? null;
  }

  if (prediction.predictedQualifiedTeamId === match.awayTeamId) {
    return match.awayTeamName ?? match.awayTeamCode ?? null;
  }

  return null;
}

export function PublicPredictionCard({
  prediction,
  match,
  currentParticipantId,
}: PublicPredictionCardProps) {
  const isCurrentParticipant = prediction.participantId === currentParticipantId;
  const classifiedTeam = qualifiedTeamName(prediction, match);

  return (
    <article className="brand-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {prediction.participantProfileImageUrl ? (
            <img
              alt={`Avatar de ${prediction.participantDisplayName}`}
              className="h-10 w-10 rounded-full border border-[var(--border)]"
              referrerPolicy="no-referrer"
              src={prediction.participantProfileImageUrl}
            />
          ) : (
            <div
              aria-label={`Iniciales de ${prediction.participantDisplayName}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-extrabold text-[var(--globant-dark)]"
            >
              {initials(prediction.participantDisplayName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-bold text-[var(--globant-dark)]">
                {prediction.participantDisplayName}
              </h3>
              {isCurrentParticipant ? (
                <span className="rounded-full bg-[var(--globant-lime)] px-2 py-1 text-xs font-extrabold text-[var(--globant-dark)]">
                  Tú
                </span>
              ) : null}
            </div>
            {classifiedTeam ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Clasifica:{" "}
                <span className="font-bold text-[var(--globant-dark)]">
                  {classifiedTeam}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <p className="shrink-0 text-3xl font-extrabold text-[var(--globant-dark)]">
          {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
        </p>
      </div>
    </article>
  );
}
