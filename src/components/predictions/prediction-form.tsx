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

      {/* Solo en eliminacion directa: el backend rechaza con 400 cualquier
          predictedQualifiedTeamId en partidos de fase de grupos. */}
      {isKnockout ? (
        <fieldset className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] p-4">
          <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-ink)]">
            ¿Quién clasifica?
          </legend>
          <p className="text-sm leading-5 text-[var(--text-secondary)]">
            Suma 1 punto extra si el partido se define por penales.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[match.homeTeamId, match.awayTeamId].map((teamId, index) => {
              const label =
                index === 0
                  ? teamName(match.homeTeamName, match.homeTeamCode)
                  : teamName(match.awayTeamName, match.awayTeamCode);
              const selected = teamId !== null && qualifiedTeamId === teamId;
              // Un cruce todavia sin rival definido no se puede pronosticar.
              const disabled = teamId === null;

              return (
                <label
                  className={`flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-bold transition-all ${
                    disabled
                      ? "cursor-not-allowed border-[var(--border)] bg-[var(--surface)] text-[var(--text-faint)]"
                      : selected
                        ? "cursor-pointer border-[var(--globant-lime)] bg-[var(--lime-soft)] text-[var(--text-primary)] shadow-[0_0_0_3px_rgba(191,215,50,0.25)]"
                        : "cursor-pointer border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--globant-lime)] hover:bg-[var(--surface-hover)]"
                  }`}
                  key={`${teamId ?? index}`}
                >
                  <input
                    checked={selected}
                    className="h-4 w-4 shrink-0 accent-[var(--globant-lime)]"
                    disabled={disabled}
                    name="qualifiedTeamId"
                    onChange={() => setQualifiedTeamId(teamId)}
                    type="radio"
                  />
                  <span className="truncate">{label}</span>
                </label>
              );
            })}
          </div>
          {/* text-xs! lleva !important a proposito: la regla `button { font: inherit }`
              de globals.css no esta en una capa y por eso gana a las utilidades de
              Tailwind. Sin el, el chip renderiza a 16px igual que el CTA principal. */}
          <button
            className="btn-secondary mt-3 px-3 py-1.5 text-xs!"
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
