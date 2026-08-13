import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MatchResponse } from "@/features/matches/types/match-types";
import type { PredictionResponse } from "@/features/predictions/types/prediction-types";

function teamLabel(name: string | null, code: string | null): string {
  return name ?? code ?? "Por definir";
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type MatchCardProps = {
  match: MatchResponse;
  prediction?: PredictionResponse;
};

export function MatchCard({ match, prediction }: MatchCardProps) {
  const actionLabel = prediction ? "Editar" : "Pronosticar";

  return (
    <article className="brand-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--globant-dark)]">
            {formatTime(match.startsAt)}
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--globant-dark)]">
            {teamLabel(match.homeTeamName, match.homeTeamCode)} vs{" "}
            {teamLabel(match.awayTeamName, match.awayTeamCode)}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={match.status} />
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                match.predictionsOpen
                  ? "bg-[rgb(56_239_160_/_16%)] text-[var(--globant-dark)]"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
              }`}
            >
              {match.predictionsOpen ? "Abierto" : "No editable"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {match.resultVisible &&
          match.homeScore !== null &&
          match.awayScore !== null ? (
            <p className="text-2xl font-extrabold text-[var(--globant-dark)]">
              {match.homeScore} - {match.awayScore}
            </p>
          ) : null}

          {prediction ? (
            <p className="brand-pill px-3 py-1 text-sm text-[var(--text-secondary)]">
              Tu pronóstico{" "}
              <span className="font-bold text-[var(--globant-dark)]">
                {prediction.predictedHomeScore} -{" "}
                {prediction.predictedAwayScore}
              </span>
            </p>
          ) : null}

          {match.predictionsOpen ? (
            <Link
              className="btn-primary px-4 py-2 text-center text-sm"
              href={`/matches/${match.id}`}
            >
              {actionLabel}
            </Link>
          ) : (
            <span className="text-sm font-bold text-[var(--text-secondary)]">
              Pronóstico cerrado
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
