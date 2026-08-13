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
    <form className="brand-card p-5" onSubmit={handleSubmit}>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <label className="flex flex-col gap-2 text-sm font-bold text-[var(--globant-dark)]">
          <span className="truncate">
            {teamName(match.homeTeamName, match.homeTeamCode)}
          </span>
          <input
            className="h-16 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white px-3 text-center text-3xl font-extrabold text-[var(--globant-dark)]"
            min={0}
            onChange={(event) => setHomeScore(event.target.value)}
            step={1}
            type="number"
            value={homeScore}
          />
        </label>

        <span className="hidden pb-4 text-2xl font-bold text-[var(--text-secondary)] sm:block">
          -
        </span>

        <label className="flex flex-col gap-2 text-sm font-bold text-[var(--globant-dark)]">
          <span className="truncate">
            {teamName(match.awayTeamName, match.awayTeamCode)}
          </span>
          <input
            className="h-16 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white px-3 text-center text-3xl font-extrabold text-[var(--globant-dark)]"
            min={0}
            onChange={(event) => setAwayScore(event.target.value)}
            step={1}
            type="number"
            value={awayScore}
          />
        </label>
      </div>

      {isKnockout ? (
        <fieldset className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-bold text-[var(--globant-dark)]">
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
                  className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-semibold ${
                    selected
                      ? "border-[var(--globant-lime)] bg-[rgb(191_215_50_/_18%)]"
                      : "border-[var(--border)] bg-white"
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
            className="mt-3 text-sm font-bold text-[var(--text-secondary)] underline"
            onClick={() => setQualifiedTeamId(null)}
            type="button"
          >
            Dejar sin seleccionar
          </button>
        </fieldset>
      ) : null}

      {validationError ? (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {validationError}
        </p>
      ) : null}

      <button
        className="btn-primary mt-5 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit}
        type="submit"
      >
        {saving ? "Guardando..." : "Guardar pronóstico"}
      </button>
    </form>
  );
}
