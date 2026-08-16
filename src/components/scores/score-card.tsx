import Link from "next/link";
import type { PredictionScoreResponse } from "@/features/scores/types/score-types";

type ScoreCardProps = {
  score: PredictionScoreResponse;
};

function outcomeTag(score: PredictionScoreResponse): {
  label: string;
  className: string;
} {
  if (score.exactScore) {
    return {
      label: "Marcador exacto",
      className:
        "inline-flex items-center rounded-full border border-[rgba(191,215,50,0.6)] bg-[var(--lime-soft)] px-3 py-1 text-xs font-black text-[var(--accent-ink)]",
    };
  }

  if (score.correctOutcome) {
    return {
      label: "Resultado correcto",
      className:
        "inline-flex items-center rounded-full border border-[rgba(34,197,94,0.3)] bg-[var(--success-soft)] px-3 py-1 text-xs font-black text-[var(--success)]",
    };
  }

  return {
    label: "Sin puntos",
    className:
      "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]",
  };
}

export function ScoreCard({ score }: ScoreCardProps) {
  const outcome = outcomeTag(score);

  return (
    <article className="brand-card p-6 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={outcome.className}>{outcome.label}</span>
            {score.correctQualifiedTeam ? (
              <span className="inline-flex items-center rounded-full border border-[rgba(34,197,94,0.3)] bg-[var(--success-soft)] px-3 py-1 text-xs font-black text-[var(--success)]">
                Clasificado acertado
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-[var(--text-secondary)]">
            <p>
              Pronóstico{" "}
              <span className="font-black text-[var(--text-primary)]">
                {score.predictedHomeScore} - {score.predictedAwayScore}
              </span>
            </p>
            <span className="hidden text-[var(--border-strong)] sm:inline">•</span>
            <p>
              Resultado{" "}
              <span className="font-black text-[var(--text-primary)]">
                {score.actualHomeScore} - {score.actualAwayScore}
              </span>
            </p>
            {score.qualifiedTeamBonus > 0 ? (
              <>
                <span className="hidden text-[var(--border-strong)] sm:inline">•</span>
                <p>
                  Bonus{" "}
                  <span className="font-black text-[var(--success)]">
                    +{score.qualifiedTeamBonus}
                  </span>
                </p>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <p className="text-3xl font-black text-[var(--text-primary)]">
            +{score.totalPoints}
          </p>
          <Link
            className="btn-secondary px-4 py-1.5 text-xs font-bold"
            href={`/matches/${score.matchId}`}
          >
            Ver partido
          </Link>
        </div>
      </div>
    </article>
  );
}
