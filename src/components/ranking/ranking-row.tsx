import { UserAvatar } from "@/components/ui/user-avatar";
import type { RankingEntryResponse } from "@/features/ranking/types/ranking-types";

type RankingRowProps = {
  entry: RankingEntryResponse;
  label?: string;
};

/** Acento del podio: oro, plata y bronce para las tres primeras posiciones. */
function podiumClass(position: number): string {
  if (position > 3) {
    return "podium";
  }

  return `podium podium--${position}`;
}

export function RankingRow({ entry, label }: RankingRowProps) {
  return (
    <article
      className={`brand-card grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 sm:grid-cols-[64px_1fr_repeat(3,minmax(64px,84px))] sm:gap-5 transition-all duration-200 ${
        entry.currentParticipant
          ? "border-[rgba(191,215,50,0.8)] bg-[var(--lime-soft)] shadow-sm"
          : "hover:border-[var(--border-strong)]"
      }`}
    >
      <span
        className={`h-11 w-11 text-base sm:h-12 sm:w-12 sm:text-lg ${podiumClass(
          entry.position,
        )}`}
      >
        {entry.position}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          highlighted={entry.currentParticipant}
          imageUrl={entry.profileImageUrl}
          name={entry.displayName}
        />
        <div className="min-w-0">
          {label ? <p className="eyebrow mb-0.5">{label}</p> : null}
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-extrabold text-[var(--text-primary)]">
              {entry.displayName}
            </h3>
            {entry.currentParticipant && !label ? (
              <span className="tag tag-lime shrink-0 px-2 py-0.5 text-[0.62rem]">
                Vos
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-faint)] sm:hidden">
            {entry.exactScores} exactos · {entry.correctOutcomes} resultados
          </p>
          <p className="mt-0.5 hidden text-xs text-[var(--text-faint)] sm:block">
            {entry.scoredPredictions} pronósticos puntuados
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-black leading-none tabular-nums text-[var(--accent-ink)]">
          {entry.totalPoints}
        </p>
        <p className="mt-1 label-caps">
          Puntos
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-lg font-extrabold tabular-nums text-[var(--text-primary)]">
          {entry.exactScores}
        </p>
        <p className="mt-1 label-caps">
          Exactos
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-lg font-extrabold tabular-nums text-[var(--text-primary)]">
          {entry.correctOutcomes}
        </p>
        <p className="mt-1 label-caps">
          Resultados
        </p>
      </div>
    </article>
  );
}
