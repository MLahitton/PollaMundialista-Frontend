"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/navigation/app-layout";
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
  const { accessToken, authenticated, hasStoredSession, loading, logout } =
    useAuthContext();
  const { offline, reportNetworkError, reportSuccess, retryNonce } =
    useConnection();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
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

    async function loadPredictions() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        setPredictions(await getMyPredictions(activeTournament.id, token));
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

        setError("No fue posible cargar tus pronosticos.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadPredictions();
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
    return <SessionFallback />;
  }

  const editableCount = predictions.filter((item) => item.editable).length;

  return (
    <AppLayout>
      <div className="app-stack">
        <PageHeader
          aside={
            !pageLoading && predictions.length > 0 ? (
              <div className="flex gap-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-center">
                  <p className="text-2xl font-black leading-none text-[var(--text-primary)]">
                    {predictions.length}
                  </p>
                  <p className="mt-2 label-caps">
                    Registrados
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[rgba(56,239,160,0.35)] bg-[rgba(56,239,160,0.12)] px-5 py-4 text-center">
                  <p className="text-2xl font-black leading-none text-[var(--success)]">
                    {editableCount}
                  </p>
                  <p className="mt-2 label-caps">
                    Editables
                  </p>
                </div>
              </div>
            ) : null
          }
          description="Tu selección de marcadores para el torneo activo, lista para editar mientras la ventana siga abierta."
          eyebrow={tournament?.name ?? "Torneo activo"}
          title="Mis pronósticos"
        />

        {pageLoading ? <LoadingState label="Cargando pronósticos..." /> : null}

        {offline ? <ConnectionNotice /> : null}

        {error && !offline ? <p className="app-alert">{error}</p> : null}

        {!pageLoading && !error && !offline && predictions.length === 0 ? (
          <EmptyState
            action={
              <Link className="btn-accent px-5 py-2.5 text-sm" href="/matches">
                Ir al fixture
              </Link>
            }
            description="Cargá tu primer marcador desde el fixture y empezá a sumar puntos en la polla."
            title="Todavía no tenés pronósticos"
          />
        ) : null}

        <div className="grid gap-10">
          {Array.from(predictionsByDate.entries()).map(
            ([date, datePredictions]) => (
              <section key={date}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--accent-ink)]">
                    {date}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[linear-gradient(90deg,rgba(191,215,50,0.55)_0%,var(--border)_100%)]"
                  />
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {datePredictions.map((prediction) => (
                    <article
                      className="brand-card brand-card-link p-5"
                      key={prediction.id}
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="tag">
                          {formatDateTime(prediction.startsAt)}
                        </span>
                        <span
                          className={
                            prediction.locked ? "tag" : "tag tag-mint"
                          }
                        >
                          {prediction.locked ? "Cerrado" : "Editable"}
                        </span>
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <p className="line-clamp-2 text-sm font-extrabold leading-tight text-[var(--text-primary)] sm:text-base">
                          {prediction.homeTeamName ?? "Local"}
                        </p>
                        <p className="shrink-0 text-[clamp(1.6rem,1.2rem+1vw,2.2rem)] font-black leading-none tabular-nums text-[var(--success)]">
                          {prediction.predictedHomeScore}
                          <span className="mx-1.5 text-[var(--text-faint)]">
                            -
                          </span>
                          {prediction.predictedAwayScore}
                        </p>
                        <p className="line-clamp-2 text-right text-sm font-extrabold leading-tight text-[var(--text-primary)] sm:text-base">
                          {prediction.awayTeamName ?? "Visitante"}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                        <p className="text-xs text-[var(--text-faint)]">
                          Cierra: {formatDateTime(prediction.predictionClosesAt)}
                        </p>
                        <Link
                          className={
                            prediction.editable
                              ? "btn-primary px-4 py-2 text-sm"
                              : "btn-secondary px-4 py-2 text-sm"
                          }
                          href={`/matches/${prediction.matchId}`}
                        >
                          {prediction.editable ? "Editar" : "Ver partido"}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      </div>
    </AppLayout>
  );
}
