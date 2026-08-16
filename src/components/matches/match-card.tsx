import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TeamCrest } from "@/components/matches/team-crest";
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
  const home = teamLabel(match.homeTeamName, match.homeTeamCode);
  const away = teamLabel(match.awayTeamName, match.awayTeamCode);
  const showResult =
    match.resultVisible && match.homeScore !== null && match.awayScore !== null;

  return (
    <article className="brand-card brand-card-link p-5">
      {/* Fila de contexto */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="tag">{formatTime(match.startsAt)}</span>
        <StatusBadge status={match.status} />
        {prediction ? (
          <span className="tag tag-mint">Pronosticado</span>
        ) : match.predictionsOpen ? (
          <span className="tag tag-lime">Sin pronóstico</span>
        ) : null}
      </div>

      {/* Enfrentamiento */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left">
          <TeamCrest
            code={match.homeTeamCode}
            logoUrl={match.homeTeamLogoUrl}
            name={home}
          />
          <span className="line-clamp-2 text-sm font-extrabold leading-tight text-[var(--text-primary)] sm:text-base">
            {home}
          </span>
        </div>

        <div className="shrink-0 text-center">
          {showResult ? (
            <p className="text-[clamp(1.6rem,1.2rem+1vw,2.2rem)] font-black leading-none tracking-tight text-[var(--text-primary)]">
              {match.homeScore}
              <span className="mx-1.5 text-[var(--success)]">-</span>
              {match.awayScore}
            </p>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] text-xs font-black text-[var(--success)]">
              VS
            </div>
          )}
          {showResult &&
          match.homePenaltyScore !== null &&
          match.awayPenaltyScore !== null ? (
            <p className="mt-1.5 label-caps">
              Pen. {match.homePenaltyScore}-{match.awayPenaltyScore}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row-reverse sm:gap-3 sm:text-right">
          <TeamCrest
            code={match.awayTeamCode}
            logoUrl={match.awayTeamLogoUrl}
            name={away}
          />
          <span className="line-clamp-2 text-sm font-extrabold leading-tight text-[var(--text-primary)] sm:text-base">
            {away}
          </span>
        </div>
      </div>

      {/* Pronóstico y acción */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        {prediction ? (
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Tu pronóstico{" "}
            <span className="font-black text-[var(--success)]">
              {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
            </span>
          </p>
        ) : (
          <p className="text-sm text-[var(--text-faint)]">
            Todavía no pronosticaste este partido
          </p>
        )}

        {match.predictionsOpen ? (
          <Link
            className="btn-primary px-4 py-2 text-sm"
            href={`/matches/${match.id}`}
          >
            {prediction ? "Editar" : "Pronosticar"}
          </Link>
        ) : (
          <Link
            className="btn-secondary px-4 py-2 text-sm"
            href={`/matches/${match.id}`}
          >
            Ver detalle
          </Link>
        )}
      </div>
    </article>
  );
}
