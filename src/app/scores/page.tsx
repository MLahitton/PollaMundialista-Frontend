"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/navigation/app-layout";
import { ScoreCard } from "@/components/scores/score-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  ConnectionNotice,
  SessionFallback,
} from "@/components/ui/connection-notice";
import { ApiError, NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMyScores } from "@/features/scores/api/scores-api";
import type { PredictionScoreResponse } from "@/features/scores/types/score-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

export default function ScoresPage() {
  const router = useRouter();
  const { accessToken, authenticated, hasStoredSession, loading, logout } =
    useAuthContext();
  const { offline, reportNetworkError, reportSuccess, retryNonce } =
    useConnection();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [scores, setScores] = useState<PredictionScoreResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authenticated && !hasStoredSession) {
      router.replace("/login");
    }
  }, [authenticated, hasStoredSession, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    const token = accessToken;

    async function loadScores() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        const scoreResponses = await getMyScores(
          activeTournament.id,
          token,
        );
        setScores(
          [...scoreResponses].sort(
            (first, second) =>
              new Date(second.scoredAt).getTime() -
              new Date(first.scoredAt).getTime(),
          ),
        );
        reportSuccess();
      } catch (loadError) {
        if (loadError instanceof NetworkError) {
          reportNetworkError();
          return;
        }

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
  }, [
    accessToken,
    authenticated,
    loading,
    logout,
    reportNetworkError,
    reportSuccess,
    retryNonce,
    router,
  ]);

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
    return <SessionFallback />;
  }

  return (
    <AppLayout>
      <div className="app-stack">
        <PageHeader
          description="Detalle de tus partidos puntuados, con aciertos y bonus ya calculados por el backend."
          eyebrow={tournament?.name ? tournament.name.toUpperCase() : "WORLD CUP 2026"}
          title="Mis puntos"
        />

        {pageLoading ? (
          <LoadingState label="Cargando tus puntos..." rows={4} />
        ) : null}

        {offline ? <ConnectionNotice /> : null}

        {error && !offline ? <p className="app-alert">{error}</p> : null}

        {!pageLoading && !error && !offline ? (
          <>
            {/* Fila de 5 Tarjetas de Métricas idénticas al diseño adjunto */}
            <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div className="brand-card p-5 transition-all hover:shadow-sm">
                <div className="mb-4 h-1.5 w-8 rounded-full bg-[var(--globant-lime)]" />
                <p className="label-caps">
                  PUNTOS ACUMULADOS
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">
                  {summary.totalPoints}
                </p>
              </div>

              <div className="brand-card p-5 transition-all hover:shadow-sm">
                <div className="mb-4 h-1.5 w-8 rounded-full bg-[var(--globant-mint)]" />
                <p className="label-caps">
                  PARTIDOS PUNTUADOS
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">
                  {summary.scoredPredictions}
                </p>
              </div>

              <div className="brand-card p-5 transition-all hover:shadow-sm">
                <div className="mb-4 h-1.5 w-8 rounded-full bg-[var(--globant-lime)]" />
                <p className="label-caps">
                  EXACTOS
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">
                  {summary.exactScores}
                </p>
              </div>

              <div className="brand-card p-5 transition-all hover:shadow-sm">
                <div className="mb-4 h-1.5 w-8 rounded-full bg-[var(--text-primary)]" />
                <p className="label-caps">
                  RESULTADOS CORRECTOS
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">
                  {summary.correctOutcomes}
                </p>
              </div>

              <div className="brand-card p-5 transition-all hover:shadow-sm">
                <div className="mb-4 h-1.5 w-8 rounded-full bg-[var(--globant-mint)]" />
                <p className="label-caps">
                  BONUS
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">
                  {summary.qualifiedBonuses}
                </p>
              </div>
            </section>

            {scores.length === 0 ? (
              <EmptyState
                action={
                  <Link
                    className="btn-accent px-5 py-2.5 text-sm"
                    href="/matches"
                  >
                    Ir al fixture
                  </Link>
                }
                description="En cuanto se puntúe un partido que hayas pronosticado vas a ver acá el detalle de tus aciertos."
                title="Todavía no tenés partidos puntuados"
              />
            ) : (
              <section className="grid gap-3">
                {scores.map((score) => (
                  <ScoreCard key={score.id} score={score} />
                ))}
              </section>
            )}
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
