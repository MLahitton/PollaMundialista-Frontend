import { UserAvatar } from "@/components/ui/user-avatar";
import type { MatchResponse } from "@/features/matches/types/match-types";
import type { PublicPredictionResponse } from "@/features/public-predictions/types/public-prediction-types";

type PublicPredictionCardProps = {
  prediction: PublicPredictionResponse;
  match: MatchResponse;
  currentParticipantId: string;
};

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
    <article
      className={`brand-card p-4 ${
        isCurrentParticipant
          ? "border-[rgba(191,215,50,0.8)] bg-[var(--lime-soft)]"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            highlighted={isCurrentParticipant}
            imageUrl={prediction.participantProfileImageUrl}
            name={prediction.participantDisplayName}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-extrabold text-[var(--text-primary)]">
                {prediction.participantDisplayName}
              </h3>
              {isCurrentParticipant ? (
                <span className="tag tag-lime shrink-0 px-2 py-0.5">Tú</span>
              ) : null}
            </div>
            {classifiedTeam ? (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Clasifica:{" "}
                <span className="font-extrabold text-[var(--success)]">
                  {classifiedTeam}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <p className="shrink-0 text-2xl font-black tabular-nums text-[var(--text-primary)]">
          {prediction.predictedHomeScore}
          <span className="mx-1 text-[var(--text-faint)]">-</span>
          {prediction.predictedAwayScore}
        </p>
      </div>
    </article>
  );
}
