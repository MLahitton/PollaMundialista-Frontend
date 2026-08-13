"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiError } from "@/lib/api/api-client";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMyPredictions } from "@/features/predictions/api/predictions-api";
import type { PredictionResponse } from "@/features/predictions/types/prediction-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function dateKey(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export default function PredictionsPage() {
  const router = useRouter();
  const { accessToken, authenticated, loading, logout } = useAuthContext();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    async function loadPredictions() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        setPredictions(await getMyPredictions(activeTournament.id, accessToken));
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        setError("No fue posible cargar tus pronosticos.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadPredictions();
  }, [accessToken, authenticated, loading, logout, router]);

  const predictionsByDate = useMemo(() => {
    return predictions.reduce<Map<string, PredictionResponse[]>>(
      (groups, prediction) => {
        const key = dateKey(prediction.startsAt);
        const current = groups.get(key) ?? [];
        groups.set(key, [...current, prediction]);
        return groups;
      },
      new Map(),
    );
  }, [predictions]);

  if (loading || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-[var(--text-secondary)]">
          Preparando tu sesión...
        </p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AuthenticatedNav />
      <section className="app-container">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            {tournament?.name ?? "Torneo activo"}
          </p>
          <h1 className="text-4xl font-extrabold text-[var(--globant-dark)]">
            Mis pronósticos
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
            Tu selección de marcadores para el torneo activo, lista para editar
            mientras la ventana siga abierta.
          </p>
        </header>

        {pageLoading ? (
          <LoadingState label="Cargando pronósticos..." />
        ) : null}

        {error ? (
          <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!pageLoading && !error && predictions.length === 0 ? (
          <EmptyState title="Todavía no tenés pronósticos." />
        ) : null}

        <div className="grid gap-8">
          {Array.from(predictionsByDate.entries()).map(
            ([date, datePredictions]) => (
              <section key={date}>
                <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[var(--globant-dark)]">
                  {date}
                </h2>
                <div className="grid gap-3">
                  {datePredictions.map((prediction) => (
                    <article className="brand-card p-5" key={prediction.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--globant-dark)]">
                    {formatDateTime(prediction.startsAt)}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold text-[var(--globant-dark)]">
                    {prediction.homeTeamName ?? "Local"} vs{" "}
                    {prediction.awayTeamName ?? "Visitante"}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Pronóstico{" "}
                    <span className="font-extrabold text-[var(--globant-dark)]">
                      {prediction.predictedHomeScore} -{" "}
                      {prediction.predictedAwayScore}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      prediction.locked
                        ? "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
                        : "bg-[rgb(56_239_160_/_16%)] text-[var(--globant-dark)]"
                    }`}
                  >
                    {prediction.locked ? "Cerrado" : "Editable"}
                  </span>
                  {prediction.editable ? (
                    <Link
                      className="btn-primary px-4 py-2 text-sm"
                      href={`/matches/${prediction.matchId}`}
                    >
                      Editar
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
