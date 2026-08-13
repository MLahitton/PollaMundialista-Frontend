"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { ScoreCard } from "@/components/scores/score-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ApiError } from "@/lib/api/api-client";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMyScores } from "@/features/scores/api/scores-api";
import type { PredictionScoreResponse } from "@/features/scores/types/score-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

export default function ScoresPage() {
  const router = useRouter();
  const { accessToken, authenticated, loading, logout } = useAuthContext();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [scores, setScores] = useState<PredictionScoreResponse[]>([]);
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

    async function loadScores() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        const scoreResponses = await getMyScores(
          activeTournament.id,
          accessToken,
        );
        setScores(
          [...scoreResponses].sort(
            (first, second) =>
              new Date(second.scoredAt).getTime() -
              new Date(first.scoredAt).getTime(),
          ),
        );
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setError("No hay un torneo activo disponible.");
          return;
        }

        setError("No fue posible cargar tus puntos.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadScores();
  }, [accessToken, authenticated, loading, logout, router]);

  const summary = useMemo(
    () => ({
      totalPoints: scores.reduce((total, score) => total + score.totalPoints, 0),
      scoredPredictions: scores.length,
      exactScores: scores.filter((score) => score.exactScore).length,
      correctOutcomes: scores.filter((score) => score.correctOutcome).length,
      qualifiedBonuses: scores.reduce(
        (total, score) => total + score.qualifiedTeamBonus,
        0,
      ),
    }),
    [scores],
  );

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
            Mis puntos
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
            Detalle de tus partidos puntuados, con aciertos y bonus ya
            calculados por el backend.
          </p>
        </header>

        {pageLoading ? (
          <LoadingState label="Cargando tus puntos..." />
        ) : null}

        {error ? (
          <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!pageLoading && !error ? (
          <>
            <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="Puntos acumulados" value={summary.totalPoints} />
              <MetricCard
                label="Partidos puntuados"
                tone="mint"
                value={summary.scoredPredictions}
              />
              <MetricCard label="Exactos" value={summary.exactScores} />
              <MetricCard
                label="Resultados correctos"
                tone="dark"
                value={summary.correctOutcomes}
              />
              <MetricCard label="Bonus" tone="mint" value={summary.qualifiedBonuses} />
            </section>

            {scores.length === 0 ? (
              <EmptyState title="Todavía no tenés partidos puntuados." />
            ) : (
              <div className="grid gap-3">
                {scores.map((score) => (
                  <ScoreCard key={score.id} score={score} />
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
