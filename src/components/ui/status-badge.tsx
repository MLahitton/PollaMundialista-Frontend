import type { MatchResponse } from "@/features/matches/types/match-types";

const statusLabels: Record<MatchResponse["status"], string> = {
  OPEN_FOR_PREDICTIONS: "Abierto",
  PREDICTION_CLOSED: "Cerrado",
  IN_PROGRESS: "En juego",
  FINISHED: "Finalizado",
  SCORED: "Puntuado",
  POSTPONED: "Pospuesto",
  CANCELLED: "Cancelado",
};

const statusClasses: Record<MatchResponse["status"], string> = {
  OPEN_FOR_PREDICTIONS: "tag tag-lime",
  PREDICTION_CLOSED: "tag",
  IN_PROGRESS: "tag tag-mint",
  FINISHED: "tag",
  SCORED: "tag tag-lime",
  POSTPONED:
    "tag border-[rgba(217,119,6,0.35)] bg-[rgba(240,197,72,0.16)] text-[var(--warning)]",
  CANCELLED: "tag tag-danger",
};

type StatusBadgeProps = {
  status: MatchResponse["status"];
};

export function statusLabel(status: MatchResponse["status"]): string {
  return statusLabels[status];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const live = status === "IN_PROGRESS";

  return (
    <span className={statusClasses[status]}>
      {live ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--globant-mint)]"
        />
      ) : null}
      {statusLabels[status]}
    </span>
  );
}
