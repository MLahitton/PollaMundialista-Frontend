import type { StageTypeValue } from "@/features/stages/types/stage-types";

/**
 * Nombres humanos en español para los StageType que emite el backend.
 * El backend devuelve los nombres en inglés ("Round of 32", "Semi-final"),
 * asi que la traduccion vive acá, en la capa de presentacion.
 */
const STAGE_LABELS: Record<StageTypeValue, string> = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos de final",
  ROUND_OF_16: "Octavos de final",
  QUARTER_FINAL: "Cuartos de final",
  SEMI_FINAL: "Semifinales",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
  OTHER: "Otros partidos",
};

/**
 * Marca la etapa como eliminacion directa. Es la misma condicion que hace
 * que el formulario habilite "¿Quien clasifica?": el backend rechaza
 * predictedQualifiedTeamId en GROUP_STAGE.
 */
function isKnockoutStage(type: StageTypeValue): boolean {
  return type !== "GROUP_STAGE" && type !== "OTHER";
}

function stageLabel(type: StageTypeValue, fallbackName: string): string {
  return type === "OTHER" ? fallbackName : STAGE_LABELS[type];
}

type StageHeaderProps = {
  fallbackName: string;
  matchCount: number;
  position: number;
  total: number;
  type: StageTypeValue;
};

export function StageHeader({
  fallbackName,
  matchCount,
  position,
  total,
  type,
}: StageHeaderProps) {
  const knockout = isKnockoutStage(type);
  // La final cierra el recorrido: apenas un punto mas de jerarquia, sin adornos.
  const isFinal = type === "FINAL";

  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span
          className={`text-xs font-bold tabular-nums ${
            isFinal ? "text-[var(--accent-ink)]" : "text-[var(--text-faint)]"
          }`}
        >
          {String(position).padStart(2, "0")}
          <span className="text-[var(--text-faint)]">/{total}</span>
        </span>

        <h2
          className={`font-extrabold tracking-tight text-[var(--text-primary)] ${
            isFinal ? "text-lg sm:text-xl" : "text-base sm:text-lg"
          }`}
        >
          {stageLabel(type, fallbackName)}
        </h2>

        <span className="text-xs font-semibold text-[var(--text-faint)]">
          {matchCount} {matchCount === 1 ? "partido" : "partidos"}
        </span>

        {/* Nota corta: dice que se pronostica en esta fase, y de paso explica
            por que "¿Quien clasifica?" solo aparece en eliminacion directa. */}
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold sm:ms-auto ${
            knockout
              ? "text-[var(--accent-ink)]"
              : "text-[var(--text-faint)]"
          }`}
        >
          {knockout ? (
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--globant-lime)]"
            />
          ) : null}
          {knockout ? "Marcador + quién clasifica" : "Solo marcador"}
        </span>
      </div>

      <span
        aria-hidden="true"
        className={`mt-2.5 block h-px ${
          isFinal
            ? "bg-[linear-gradient(90deg,var(--globant-lime)_0px,var(--globant-lime)_44px,var(--border)_84px)]"
            : "bg-[linear-gradient(90deg,var(--globant-lime)_0px,var(--globant-lime)_24px,var(--border)_60px)]"
        }`}
      />
    </header>
  );
}
