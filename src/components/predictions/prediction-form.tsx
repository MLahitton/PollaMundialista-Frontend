"use client";

import { FormEvent, useMemo, useState } from "react";
import type { MatchResponse } from "@/features/matches/types/match-types";
import type {
  PredictionResponse,
  UpsertPredictionRequest,
} from "@/features/predictions/types/prediction-types";

type PredictionFormProps = {
  match: MatchResponse;
  prediction: PredictionResponse | null;
  saving: boolean;
  onSubmit: (request: UpsertPredictionRequest) => Promise<void>;
};

function initialScore(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

function teamName(name: string | null, code: string | null): string {
  return name ?? code ?? "Por definir";
}

export function PredictionForm({
  match,
  prediction,
  saving,
  onSubmit,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(
    initialScore(prediction?.predictedHomeScore),
  );
  const [awayScore, setAwayScore] = useState(
    initialScore(prediction?.predictedAwayScore),
  );
  const [qualifiedTeamId, setQualifiedTeamId] = useState<string | null>(
    prediction?.predictedQualifiedTeamId ?? null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const isKnockout = match.groupId === null;
  const canSubmit = useMemo(
    () => homeScore !== "" && awayScore !== "" && !saving,
    [awayScore, homeScore, saving],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const predictedHomeScore = Number(homeScore);
    const predictedAwayScore = Number(awayScore);

    if (
      !Number.isInteger(predictedHomeScore) ||
      !Number.isInteger(predictedAwayScore) ||
      predictedHomeScore < 0 ||
      predictedAwayScore < 0
    ) {
      setValidationError("Ingresá marcadores enteros iguales o mayores a 0.");
      return;
    }

    await onSubmit({
      predictedHomeScore,
      predictedAwayScore,
      predictedQualifiedTeamId: isKnockout ? qualifiedTeamId : null,
    });
  }

  return (
    <form className="brand-card p-6" onSubmit={handleSubmit}>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <label className="flex flex-col gap-2.5 text-sm font-extrabold text-[var(--text-primary)]">
          <span className="truncate">
            {teamName(match.homeTeamName, match.homeTeamCode)}
          </span>
          <input
            className="h-16 rounded-[var(--radius-md)] field-input px-3 text-center text-3xl font-black text-[var(--text-primary)]"
            min={0}
            onChange={(event) => setHomeScore(event.target.value)}
            step={1}
            type="number"
            value={homeScore}
          />
        </label>

        <span className="hidden pb-4 text-2xl font-black text-[var(--text-faint)] sm:block">
          -
        </span>

        <label className="flex flex-col gap-2.5 text-sm font-extrabold text-[var(--text-primary)]">
          <span className="truncate">
            {teamName(match.awayTeamName, match.awayTeamCode)}
          </span>
          <input
            className="h-16 rounded-[var(--radius-md)] field-input px-3 text-center text-3xl font-black text-[var(--text-primary)]"
            min={0}
            onChange={(event) => setAwayScore(event.target.value)}
            step={1}
            type="number"
            value={awayScore}
          />
        </label>
      </div>

      {isKnockout ? (
        <fieldset className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] p-4 bg-[rgba(0,0,0,0.2)]">
          <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-ink)]">
            ¿Quién clasifica?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[match.homeTeamId, match.awayTeamId].map((teamId, index) => {
              const label =
                index === 0
                  ? teamName(match.homeTeamName, match.homeTeamCode)
                  : teamName(match.awayTeamName, match.awayTeamCode);
              const selected = teamId !== null && qualifiedTeamId === teamId;

              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-bold transition-all ${
                    selected
                      ? "border-[var(--globant-lime)] bg-[var(--lime-soft)] text-[var(--text-primary)] shadow-[0_0_12px_rgba(191,215,50,0.2)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                  key={`${teamId ?? index}`}
                >
                  <input
                    checked={selected}
                    disabled={teamId === null}
                    name="qualifiedTeamId"
                    onChange={() => setQualifiedTeamId(teamId)}
                    type="radio"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          <button
            className="mt-3 text-xs font-bold text-[var(--text-faint)] hover:text-[var(--text-primary)] underline"
            onClick={() => setQualifiedTeamId(null)}
            type="button"
          >
            Dejar sin seleccionar
          </button>
        </fieldset>
      ) : null}

      {validationError ? (
        <p className="app-alert mt-4">
          {validationError}
        </p>
      ) : null}

      <button
        className="btn-accent mt-6 w-full sm:w-auto px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit}
        type="submit"
      >
        {saving ? "Guardando..." : "Guardar pronóstico"}
      </button>
    </form>
  );
}
