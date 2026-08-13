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
  OPEN_FOR_PREDICTIONS:
    "border-[var(--globant-lime)] bg-[rgb(191_215_50_/_18%)] text-[var(--globant-dark)]",
  PREDICTION_CLOSED:
    "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--globant-dark)]",
  IN_PROGRESS:
    "border-[var(--globant-mint)] bg-[rgb(56_239_160_/_16%)] text-[var(--globant-dark)]",
  FINISHED:
    "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text-secondary)]",
  SCORED:
    "border-[var(--globant-lime)] bg-[rgb(191_215_50_/_18%)] text-[var(--globant-dark)]",
  POSTPONED: "border-amber-300 bg-amber-50 text-amber-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

type StatusBadgeProps = {
  status: MatchResponse["status"];
};

export function statusLabel(status: MatchResponse["status"]): string {
  return statusLabels[status];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
