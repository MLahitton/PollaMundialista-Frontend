import type { RankingEntryResponse } from "@/features/ranking/types/ranking-types";

type RankingRowProps = {
  entry: RankingEntryResponse;
  label?: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function RankingRow({ entry, label }: RankingRowProps) {
  return (
    <article
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--radius-md)] border p-4 sm:grid-cols-[72px_1fr_90px_90px_120px] ${
        entry.currentParticipant
          ? "border-[var(--globant-lime)] bg-[rgb(191_215_50_/_12%)]"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <div className="text-xl font-extrabold text-[var(--globant-dark)]">
        #{entry.position}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {entry.profileImageUrl ? (
          <img
            alt={`Avatar de ${entry.displayName}`}
            className="h-10 w-10 rounded-full border border-[var(--border)]"
            referrerPolicy="no-referrer"
            src={entry.profileImageUrl}
          />
        ) : (
          <div
            aria-label={`Iniciales de ${entry.displayName}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-extrabold text-[var(--globant-dark)]"
          >
            {initials(entry.displayName)}
          </div>
        )}
        <div className="min-w-0">
          {label ? <p className="eyebrow">{label}</p> : null}
          <h2 className="truncate font-bold text-[var(--globant-dark)]">
            {entry.displayName}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] sm:hidden">
            Exactos {entry.exactScores} · Outcomes {entry.correctOutcomes}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-extrabold text-[var(--globant-dark)]">
          {entry.totalPoints}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">pts</p>
      </div>
      <div className="hidden text-right text-sm font-bold text-[var(--globant-dark)] sm:block">
        {entry.exactScores}
      </div>
      <div className="hidden text-right text-sm font-bold text-[var(--globant-dark)] sm:block">
        {entry.correctOutcomes}
      </div>
    </article>
  );
}
