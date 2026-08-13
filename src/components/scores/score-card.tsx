import Link from "next/link";
import type { PredictionScoreResponse } from "@/features/scores/types/score-types";

type ScoreCardProps = {
  score: PredictionScoreResponse;
};

function scoreLabel(score: PredictionScoreResponse): string {
  if (score.exactScore) {
    return "Marcador exacto";
  }

  if (score.correctOutcome) {
    return "Resultado correcto";
  }

  return "Sin puntos";
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <article className="brand-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-[rgb(191_215_50_/_18%)] px-3 py-1 text-xs font-bold text-[var(--globant-dark)]">
            {scoreLabel(score)}
          </span>
          <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
            <p>
              Pronóstico{" "}
              <span className="font-extrabold text-[var(--globant-dark)]">
                {score.predictedHomeScore} - {score.predictedAwayScore}
              </span>
            </p>
            <p>
              Resultado{" "}
              <span className="font-extrabold text-[var(--globant-dark)]">
                {score.actualHomeScore} - {score.actualAwayScore}
              </span>
            </p>
          </div>
          {score.qualifiedTeamBonus > 0 ? (
            <p className="mt-2 text-sm font-bold text-[var(--success)]">
              +{score.qualifiedTeamBonus} por clasificado
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <p className="text-2xl font-extrabold text-[var(--globant-dark)]">
            +{score.totalPoints} pts
          </p>
          <Link className="btn-secondary px-4 py-2 text-sm" href={`/matches/${score.matchId}`}>
            Ver partido
          </Link>
        </div>
      </div>
    </article>
  );
}
